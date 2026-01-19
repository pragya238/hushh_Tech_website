/**
 * Hushh Studio - Veo 3.1 API Service
 * Handles video generation using Google's Veo 3.1 model
 */

import { GoogleGenAI } from '@google/genai';
import {
  VideoSettings,
  GeneratedVideo,
  GenerationProgress,
  MAX_POLLING_ATTEMPTS,
} from '../types';

// Polling interval in milliseconds
const POLLING_INTERVAL = 10000; // 10 seconds as per API docs

/**
 * VeoService - Handles all Veo 3.1 API operations
 */
export class VeoService {
  private ai: GoogleGenAI;
  private isInitialized: boolean = false;

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    if (!apiKey) {
      console.error('VITE_GEMINI_API_KEY not found in environment variables');
    }
    this.ai = new GoogleGenAI({ apiKey });
    this.isInitialized = !!apiKey;
  }

  /**
   * Check if service is properly initialized
   */
  public isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Generate video from text prompt
   */
  async generateVideoFromText(
    prompt: string,
    settings: VideoSettings,
    onProgress: (progress: GenerationProgress) => void
  ): Promise<GeneratedVideo> {
    if (!this.isInitialized) {
      throw new Error('VeoService not initialized. Check API key.');
    }

    onProgress({
      status: 'generating',
      progress: 5,
      message: 'Starting video generation...',
      pollingAttempts: 0,
    });

    try {
      // Start the video generation
      let operation = await this.ai.models.generateVideos({
        model: 'veo-3.1-generate-preview',
        prompt: prompt,
        config: {
          aspectRatio: settings.aspectRatio,
          resolution: settings.resolution,
        },
      });

      onProgress({
        status: 'polling',
        progress: 10,
        message: 'Video generation in progress...',
        pollingAttempts: 0,
        estimatedTimeRemaining: 120,
      });

      // Poll for completion
      let pollingAttempts = 0;
      while (!operation.done && pollingAttempts < MAX_POLLING_ATTEMPTS) {
        await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL));
        pollingAttempts++;

        // Update progress
        const progressPercent = Math.min(10 + (pollingAttempts / MAX_POLLING_ATTEMPTS) * 80, 90);
        const estimatedRemaining = Math.max(0, (MAX_POLLING_ATTEMPTS - pollingAttempts) * 10);

        onProgress({
          status: 'polling',
          progress: progressPercent,
          message: `Generating your video... (${pollingAttempts * 10}s elapsed)`,
          pollingAttempts,
          estimatedTimeRemaining: estimatedRemaining,
        });

        // Check operation status
        operation = await this.ai.operations.getVideosOperation({
          operation: operation,
        });
      }

      if (!operation.done) {
        throw new Error('Video generation timed out. Please try again.');
      }

      if ((operation as any).error) {
        throw new Error((operation as any).error.message || 'Video generation failed');
      }

      onProgress({
        status: 'completed',
        progress: 95,
        message: 'Preparing video...',
        pollingAttempts,
      });

      // Extract video URL
      const generatedVideos = operation.response?.generatedVideos;
      if (!generatedVideos || generatedVideos.length === 0) {
        throw new Error('No video was generated');
      }

      const videoFile = generatedVideos[0].video;
      const videoUrl = await this.getVideoDownloadUrl(videoFile);

      onProgress({
        status: 'completed',
        progress: 100,
        message: 'Video ready!',
        pollingAttempts,
      });

      return {
        id: crypto.randomUUID(),
        videoUrl,
        prompt,
        settings,
        createdAt: new Date(),
        duration: settings.duration,
      };
    } catch (error) {
      console.error('Video generation error:', error);
      onProgress({
        status: 'error',
        progress: 0,
        message: error instanceof Error ? error.message : 'Video generation failed',
        pollingAttempts: 0,
      });
      throw error;
    }
  }

  /**
   * Generate video from image (Image-to-Video)
   */
  async generateVideoFromImage(
    prompt: string,
    imageBase64: string,
    settings: VideoSettings,
    onProgress: (progress: GenerationProgress) => void
  ): Promise<GeneratedVideo> {
    if (!this.isInitialized) {
      throw new Error('VeoService not initialized. Check API key.');
    }

    onProgress({
      status: 'generating',
      progress: 5,
      message: 'Analyzing image and starting animation...',
      pollingAttempts: 0,
    });

    try {
      // Upload the image first
      const imageFile = await this.ai.files.upload({
        file: new Blob([Uint8Array.from(atob(imageBase64), c => c.charCodeAt(0))], { type: 'image/jpeg' }),
        config: { mimeType: 'image/jpeg' }
      });

      // Start video generation with image
      let operation = await this.ai.models.generateVideos({
        model: 'veo-3.1-generate-preview',
        prompt: prompt,
        image: imageFile,
        config: {
          aspectRatio: settings.aspectRatio,
          resolution: settings.resolution,
        },
      });

      onProgress({
        status: 'polling',
        progress: 15,
        message: 'Animating your image...',
        pollingAttempts: 0,
        estimatedTimeRemaining: 120,
      });

      // Poll for completion
      let pollingAttempts = 0;
      while (!operation.done && pollingAttempts < MAX_POLLING_ATTEMPTS) {
        await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL));
        pollingAttempts++;

        const progressPercent = Math.min(15 + (pollingAttempts / MAX_POLLING_ATTEMPTS) * 75, 90);

        onProgress({
          status: 'polling',
          progress: progressPercent,
          message: `Creating animation... (${pollingAttempts * 10}s elapsed)`,
          pollingAttempts,
          estimatedTimeRemaining: Math.max(0, (MAX_POLLING_ATTEMPTS - pollingAttempts) * 10),
        });

        operation = await this.ai.operations.getVideosOperation({
          operation: operation,
        });
      }

      if (!operation.done) {
        throw new Error('Image-to-video generation timed out.');
      }

      if ((operation as any).error) {
        throw new Error((operation as any).error.message || 'Image-to-video generation failed');
      }

      const generatedVideos = operation.response?.generatedVideos;
      if (!generatedVideos || generatedVideos.length === 0) {
        throw new Error('No video was generated from image');
      }

      const videoFile = generatedVideos[0].video;
      const videoUrl = await this.getVideoDownloadUrl(videoFile);

      onProgress({
        status: 'completed',
        progress: 100,
        message: 'Animation complete!',
        pollingAttempts,
      });

      return {
        id: crypto.randomUUID(),
        videoUrl,
        prompt,
        settings,
        createdAt: new Date(),
        duration: settings.duration,
      };
    } catch (error) {
      console.error('Image-to-video error:', error);
      onProgress({
        status: 'error',
        progress: 0,
        message: error instanceof Error ? error.message : 'Image animation failed',
        pollingAttempts: 0,
      });
      throw error;
    }
  }

  /**
   * Extend an existing video by 7 seconds
   */
  async extendVideo(
    videoUrl: string,
    prompt: string,
    settings: VideoSettings,
    onProgress: (progress: GenerationProgress) => void
  ): Promise<GeneratedVideo> {
    if (!this.isInitialized) {
      throw new Error('VeoService not initialized. Check API key.');
    }

    onProgress({
      status: 'generating',
      progress: 5,
      message: 'Preparing video extension...',
      pollingAttempts: 0,
    });

    try {
      // Fetch the video and upload it
      const videoBlob = await fetch(videoUrl).then(r => r.blob());
      const videoFile = await this.ai.files.upload({
        file: videoBlob,
        config: { mimeType: 'video/mp4' }
      });

      // Wait for file to be processed
      await new Promise((resolve) => setTimeout(resolve, 5000));

      // Start video extension
      let operation = await this.ai.models.generateVideos({
        model: 'veo-3.1-generate-preview',
        prompt: prompt,
        video: videoFile,
        config: {
          aspectRatio: settings.aspectRatio,
          resolution: settings.resolution,
        },
      });

      onProgress({
        status: 'polling',
        progress: 15,
        message: 'Extending video...',
        pollingAttempts: 0,
        estimatedTimeRemaining: 120,
      });

      // Poll for completion
      let pollingAttempts = 0;
      while (!operation.done && pollingAttempts < MAX_POLLING_ATTEMPTS) {
        await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL));
        pollingAttempts++;

        const progressPercent = Math.min(15 + (pollingAttempts / MAX_POLLING_ATTEMPTS) * 75, 90);

        onProgress({
          status: 'polling',
          progress: progressPercent,
          message: `Extending video... (${pollingAttempts * 10}s elapsed)`,
          pollingAttempts,
        });

        operation = await this.ai.operations.getVideosOperation({
          operation: operation,
        });
      }

      if (!operation.done) {
        throw new Error('Video extension timed out.');
      }

      if ((operation as any).error) {
        throw new Error((operation as any).error.message || 'Video extension failed');
      }

      const generatedVideos = operation.response?.generatedVideos;
      if (!generatedVideos || generatedVideos.length === 0) {
        throw new Error('No extended video was generated');
      }

      const extendedVideoFile = generatedVideos[0].video;
      const newVideoUrl = await this.getVideoDownloadUrl(extendedVideoFile);

      onProgress({
        status: 'completed',
        progress: 100,
        message: 'Video extended!',
        pollingAttempts,
      });

      return {
        id: crypto.randomUUID(),
        videoUrl: newVideoUrl,
        prompt,
        settings,
        createdAt: new Date(),
        duration: settings.duration + 7, // Extended by 7 seconds
      };
    } catch (error) {
      console.error('Video extension error:', error);
      onProgress({
        status: 'error',
        progress: 0,
        message: error instanceof Error ? error.message : 'Video extension failed',
        pollingAttempts: 0,
      });
      throw error;
    }
  }

  /**
   * Get downloadable URL for a generated video file
   */
  private async getVideoDownloadUrl(videoFile: any): Promise<string> {
    try {
      // If the video file has a URI, use it directly
      if (videoFile.uri) {
        return videoFile.uri;
      }

      // Fallback: if there's a direct URL
      if (videoFile.url) {
        return videoFile.url;
      }

      // Check for name property which might contain download info
      if (videoFile.name) {
        return `https://generativelanguage.googleapis.com/v1/${videoFile.name}:download`;
      }

      throw new Error('Could not extract video URL');
    } catch (error) {
      console.error('Error getting video URL:', error);
      // Return the URI as fallback
      return videoFile.uri || videoFile.url || '';
    }
  }

  /**
   * Cancel an ongoing operation (if supported)
   */
  async cancelOperation(operationName: string): Promise<void> {
    try {
      // Note: Cancellation support depends on API implementation
      console.log('Attempting to cancel operation:', operationName);
    } catch (error) {
      console.error('Failed to cancel operation:', error);
    }
  }
}

// Singleton instance
let veoServiceInstance: VeoService | null = null;

export const getVeoService = (): VeoService => {
  if (!veoServiceInstance) {
    veoServiceInstance = new VeoService();
  }
  return veoServiceInstance;
};

export default VeoService;

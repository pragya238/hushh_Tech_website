/**
 * Hushh Agents — Dedicated Login Page
 *
 * Self-contained login for Hushh Agents (separate from HushhTech main app).
 * After OAuth, redirects back to /hushh-agents — never to the main app home.
 * Uses same Supabase auth, but all flows stay within /hushh-agents/*.
 */
import { useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { FaApple } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../hooks/useAuth';
import HushhLogo from '../assets/Hushhogo.png';

const playfair = { fontFamily: "'Playfair Display', serif" };

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, isLoading, signIn, error } = useAuth();

  // Where to go after login (default: /hushh-agents)
  const redirectTo = searchParams.get('redirectTo') || '/hushh-agents';

  // If already logged in, redirect immediately
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, redirectTo]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gray-100" />
          <div className="w-32 h-4 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased flex flex-col">
      <div className="flex-grow flex flex-col lg:flex-row">

        {/* ═══ Left Panel — Branding (Desktop only) ═══ */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 via-gray-800 to-black p-12 flex-col justify-between">
          <Link to="/hushh-agents" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden backdrop-blur-sm">
              <img src={HushhLogo} alt="Hushh" className="w-8 h-8 object-contain" />
            </div>
            <span className="text-white text-xl font-medium" style={playfair}>
              Hushh Agents
            </span>
          </Link>

          <div className="space-y-8">
            <h1
              className="text-5xl xl:text-6xl text-white font-normal leading-tight"
              style={playfair}
            >
              Your Private
              <br />
              <span className="text-gray-400 italic">AI Companions</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-md leading-relaxed">
              Intelligent conversations in Hindi, English, and Tamil.
              Powered by advanced AI, designed for you.
            </p>

            {/* Feature List */}
            <div className="space-y-4 pt-4">
              {[
                { icon: 'chat', title: 'Natural Conversations', desc: 'Text chat that understands context' },
                { icon: 'mic', title: 'Voice Chat', desc: 'Speak naturally with Hushh', badge: 'Pro' },
                { icon: 'translate', title: 'Multi-lingual', desc: 'English, हिंदी, தமிழ் supported' },
              ].map((f) => (
                <div key={f.icon} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-xl">{f.icon}</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {f.title}
                      {f.badge && (
                        <span className="text-xs text-gray-500 ml-1">{f.badge}</span>
                      )}
                    </p>
                    <p className="text-gray-500 text-sm">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <span className="material-symbols-outlined text-base">shield</span>
            <span>Your data stays private and secure</span>
          </div>
        </div>

        {/* ═══ Right Panel — Login Form ═══ */}
        <main className="flex-grow lg:w-1/2 px-6 lg:px-12 xl:px-20 flex flex-col justify-center py-12 lg:py-0">
          <div className="max-w-md mx-auto w-full">

            {/* Logo — Mobile only */}
            <section className="flex justify-center pt-8 pb-6 lg:hidden">
              <Link to="/hushh-agents">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1400FF] to-blue-600 flex items-center justify-center overflow-hidden border border-black/5">
                  <img src={HushhLogo} alt="Hushh" className="w-10 h-10 object-contain" />
                </div>
              </Link>
            </section>

            {/* Title */}
            <section className="pb-8 lg:pb-10">
              <h1
                className="text-3xl lg:text-4xl leading-[1.1] font-normal text-black tracking-tight text-center lg:text-left"
                style={playfair}
              >
                Hushh Agents
              </h1>
              <p className="text-gray-500 text-sm lg:text-base font-light mt-3 text-center lg:text-left leading-relaxed">
                Sign in to access your AI agents, chat history, and preferences.
              </p>
            </section>

            {/* Error */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-red-600 text-sm text-center lg:text-left">{error}</p>
              </div>
            )}

            {/* Sign-in Buttons */}
            <section className="space-y-3 mb-8">
              <button
                onClick={() => signIn('apple')}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-black text-white rounded-2xl font-medium text-sm hover:bg-gray-900 transition-colors"
              >
                <FaApple className="text-xl" />
                <span>Continue with Apple</span>
              </button>

              <button
                onClick={() => signIn('google')}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white text-gray-900 rounded-2xl font-medium text-sm border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <FcGoogle className="text-xl" />
                <span>Continue with Google</span>
              </button>
            </section>

            {/* Features — Mobile only */}
            <section className="space-y-4 mb-8 lg:hidden">
              <h2 className="text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                What You Get
              </h2>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { icon: 'chat', label: 'Text Chat' },
                  { icon: 'mic', label: 'Voice (Pro)' },
                  { icon: 'translate', label: 'Multi-lingual' },
                ].map((f) => (
                  <div key={f.icon} className="p-3 rounded-xl bg-gray-50">
                    <div className="flex justify-center mb-2">
                      <span className="material-symbols-outlined text-xl text-gray-600">
                        {f.icon}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">{f.label}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Trust */}
            <section className="flex flex-col items-center lg:items-start gap-2 pt-4 pb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-gray-400">lock</span>
                <span className="text-xs text-gray-400 tracking-wide uppercase font-medium">
                  Private & Secure
                </span>
              </div>
            </section>

            {/* Back to agents link */}
            <div className="text-center lg:text-left mt-4">
              <Link
                to="/hushh-agents"
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors inline-flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Back to Hushh Agents
              </Link>
            </div>

            {/* Terms */}
            <p className="text-[11px] leading-[16px] text-gray-400 text-center lg:text-left font-light mt-6">
              By continuing, you agree to our{' '}
              <Link to="/terms" className="underline underline-offset-2 hover:text-gray-600">
                Terms
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="underline underline-offset-2 hover:text-gray-600">
                Privacy Policy
              </Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

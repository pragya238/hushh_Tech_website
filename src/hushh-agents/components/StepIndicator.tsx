/**
 * StepIndicator — Visual step number with connecting line
 *
 * Shows a numbered step with title and optional subtitle.
 * Used in the agents homepage to create a guided journey feel.
 */
import React from 'react';

interface StepIndicatorProps {
  /** Step number (1-4) */
  step: number;
  /** Step title */
  title: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Whether this step has a connecting line below */
  hasLine?: boolean;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
  step,
  title,
  subtitle,
  hasLine = true,
}) => {
  return (
    <div className="flex items-start gap-4 mb-1">
      {/* Step number circle + line */}
      <div className="flex flex-col items-center shrink-0">
        <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-[12px] font-bold">
          {step}
        </div>
        {hasLine && (
          <div className="w-px h-4 bg-gray-200 mt-1" />
        )}
      </div>

      {/* Text */}
      <div className="pt-0.5">
        <h2
          className="text-[18px] sm:text-[20px] font-semibold text-gray-900 leading-tight"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {title}
        </h2>
        {subtitle && (
          <p className="text-[12px] text-gray-400 font-light mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default StepIndicator;

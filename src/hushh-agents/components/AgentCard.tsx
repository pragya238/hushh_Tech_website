/**
 * AgentCard — Premium agent showcase card
 *
 * Replaces the old AgentNudge with a richer, more visual card.
 * Features gradient border, status indicator, hover animations,
 * and a clear visual hierarchy.
 */
import React, { useState } from 'react';

/** Status badge variants */
type AgentStatus = 'live' | 'online' | 'new' | 'soon' | 'beta';

interface AgentCardProps {
  /** Agent display name */
  title: string;
  /** Short category or label */
  subtitle: string;
  /** Brief description (1-2 lines) */
  description: string;
  /** Material Symbols icon name */
  icon: string;
  /** Accent color (hex) */
  color: string;
  /** Status badge */
  status: AgentStatus;
  /** Feature chips shown at bottom */
  chips?: string[];
  /** Click handler — navigates to agent */
  onClick: () => void;
  /** Optional: mark as featured/highlighted */
  featured?: boolean;
}

/** Status config — colors and labels */
const STATUS_CONFIG: Record<AgentStatus, { label: string; bg: string; text: string; dot: string }> = {
  live: { label: 'Live', bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500' },
  online: { label: 'Online', bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500' },
  new: { label: 'New', bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' },
  soon: { label: 'Soon', bg: 'bg-gray-100', text: 'text-gray-400', dot: 'bg-gray-300' },
  beta: { label: 'Beta', bg: 'bg-purple-50', text: 'text-purple-600', dot: 'bg-purple-500' },
};

const AgentCard: React.FC<AgentCardProps> = ({
  title,
  subtitle,
  description,
  icon,
  color,
  status,
  chips = [],
  onClick,
  featured = false,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const statusCfg = STATUS_CONFIG[status];
  const isDisabled = status === 'soon';

  return (
    <button
      onClick={isDisabled ? undefined : onClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      disabled={isDisabled}
      className={[
        'text-left w-full rounded-2xl transition-all duration-200 group relative overflow-hidden',
        isDisabled
          ? 'opacity-50 cursor-not-allowed'
          : 'cursor-pointer hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0',
        isPressed && !isDisabled ? 'scale-[0.98]' : '',
        featured
          ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-white border border-gray-700'
          : 'bg-white border border-gray-200/80 hover:border-gray-300',
      ].join(' ')}
      aria-label={`${title} — ${description}`}
    >
      {/* Subtle gradient overlay for featured cards */}
      {featured && (
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at top right, ${color}, transparent 70%)`,
          }}
        />
      )}

      <div className="relative p-5 sm:p-6">
        {/* Top row: icon + status */}
        <div className="flex items-start justify-between mb-4">
          {/* Icon container */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300"
            style={{
              backgroundColor: featured ? `${color}25` : `${color}10`,
            }}
          >
            <span
              className="material-symbols-outlined text-[24px]"
              style={{ color }}
            >
              {icon}
            </span>
          </div>

          {/* Status badge */}
          <span
            className={[
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider',
              featured ? 'bg-white/10 text-white/80' : `${statusCfg.bg} ${statusCfg.text}`,
            ].join(' ')}
          >
            <span
              className={[
                'w-1.5 h-1.5 rounded-full',
                featured ? 'bg-white/60' : statusCfg.dot,
                status === 'online' || status === 'live' ? 'animate-pulse' : '',
              ].join(' ')}
            />
            {statusCfg.label}
          </span>
        </div>

        {/* Title section */}
        <div className="mb-3">
          <p
            className={[
              'text-[10px] uppercase tracking-[0.15em] font-medium mb-0.5',
              featured ? 'text-white/40' : 'text-gray-400',
            ].join(' ')}
          >
            {subtitle}
          </p>
          <h3
            className={[
              'text-[17px] font-semibold leading-tight',
              featured ? 'text-white' : 'text-gray-900',
            ].join(' ')}
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {title}
          </h3>
        </div>

        {/* Description */}
        <p
          className={[
            'text-[12.5px] font-light leading-relaxed mb-4',
            featured ? 'text-white/60' : 'text-gray-500',
          ].join(' ')}
        >
          {description}
        </p>

        {/* Chips + Arrow */}
        <div className="flex items-end justify-between">
          <div className="flex flex-wrap gap-1.5">
            {chips.map((chip) => (
              <span
                key={chip}
                className={[
                  'px-2.5 py-1 rounded-lg text-[10px] font-medium',
                  featured
                    ? 'bg-white/10 text-white/50 border border-white/10'
                    : 'bg-gray-50 text-gray-500 border border-gray-100',
                ].join(' ')}
              >
                {chip}
              </span>
            ))}
          </div>

          {!isDisabled && (
            <span
              className={[
                'material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1 duration-200',
                featured ? 'text-white/30' : 'text-gray-300',
              ].join(' ')}
            >
              arrow_forward
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

export default AgentCard;

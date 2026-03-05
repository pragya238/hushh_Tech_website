/**
 * Kirkland Agents — Tinder-Style Swipe Experience
 *
 * Saturn editorial design. Framer Motion drag gestures.
 * Paginated feed (50/batch), optimistic writes, 3-card stack.
 * Bottom tab bar: Discover | Selected.
 */

import React, { useState, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useTransform, animate, PanInfo } from 'framer-motion';
import { useAgentSwipe, type SwipeAgent } from '../hooks/useAgentSwipe';
import AgentAvatar from '../components/AgentAvatar';

/* ── Fonts ── */
const serif = { fontFamily: "'Playfair Display', serif" };
const sans = { fontFamily: "'Inter', sans-serif" };

/* ── Colors (Saturn palette) ── */
const C = {
  primary: '#1A1A1B',
  accent: '#1400FF',
  gold: '#C1A050',
  textSub: '#8A8A8A',
  divider: '#E5E5E5',
  bg: '#FFFFFF',
  bgLight: '#F5F5F5',
  selectGreen: '#22C55E',
  rejectRed: '#EF4444',
};

/* ── Swipe physics ── */
const DRAG_THRESHOLD = 120;
const VELOCITY_THRESHOLD = 500;
const FLY_DISTANCE = 800;

/* ══════════════════════════════════════════
   DashedSection — crop-mark borders
   ══════════════════════════════════════════ */
const DashedSection = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <section
    className={`relative mx-3 sm:mx-6 my-1 ${className}`}
    style={{ border: `1px solid ${C.divider}` }}
  >
    {[
      'top-0 left-0 border-t border-l',
      'top-0 right-0 border-t border-r',
      'bottom-0 left-0 border-b border-l',
      'bottom-0 right-0 border-b border-r',
    ].map((pos) => (
      <div
        key={pos}
        className={`absolute w-4 h-4 pointer-events-none ${pos}`}
        style={{ borderColor: C.primary, borderWidth: '1px' }}
      />
    ))}
    {children}
  </section>
);

/* ══════════════════════════════════════════
   SwipeCard — Draggable agent card
   ══════════════════════════════════════════ */
interface SwipeCardProps {
  agent: SwipeAgent;
  isTop: boolean;
  stackIndex: number;
  onSwipeRight: (id: string) => void;
  onSwipeLeft: (id: string) => void;
  onTap: (id: string) => void;
}

const SwipeCard = memo(function SwipeCard({
  agent,
  isTop,
  stackIndex,
  onSwipeRight,
  onSwipeLeft,
  onTap,
}: SwipeCardProps) {
  const x = useMotionValue(0);

  /* Derived transforms from drag position */
  const rotate = useTransform(x, [-300, 0, 300], [-12, 0, 12]);
  const selectOpacity = useTransform(x, [0, DRAG_THRESHOLD], [0, 1]);
  const rejectOpacity = useTransform(x, [-DRAG_THRESHOLD, 0], [1, 0]);

  /* Stack depth offset */
  const scale = 1 - stackIndex * 0.04;
  const yOffset = stackIndex * 8;
  const zIndex = 10 - stackIndex;

  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      const absX = Math.abs(info.offset.x);
      const absVelocity = Math.abs(info.velocity.x);

      /* Tap detection: minimal drag */
      if (absX < 10) {
        onTap(agent.id);
        return;
      }

      /* Commit swipe if above threshold */
      if (absX >= DRAG_THRESHOLD || absVelocity >= VELOCITY_THRESHOLD) {
        const direction = info.offset.x > 0 ? 1 : -1;
        animate(x, direction * FLY_DISTANCE, {
          duration: 0.3,
          onComplete: () => {
            if (direction > 0) onSwipeRight(agent.id);
            else onSwipeLeft(agent.id);
          },
        });
      } else {
        /* Spring back */
        animate(x, 0, { type: 'spring', stiffness: 500, damping: 30 });
      }
    },
    [agent.id, onSwipeRight, onSwipeLeft, onTap, x]
  );

  /* Star rating display */
  const rating = agent.avg_rating || 0;
  const stars = '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
  const categories = (agent.categories || []).slice(0, 3).join(' · ');
  const bioSnippet = agent.bio ? (agent.bio.length > 100 ? agent.bio.slice(0, 100) + '…' : agent.bio) : null;

  return (
    <motion.div
      className="absolute inset-0 touch-none select-none"
      style={{
        x: isTop ? x : 0,
        rotate: isTop ? rotate : 0,
        scale,
        y: yOffset,
        zIndex,
        opacity: stackIndex > 2 ? 0 : 1 - stackIndex * 0.2,
      }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={isTop ? handleDragEnd : undefined}
    >
      <div
        className="w-full h-full rounded-none overflow-hidden flex flex-col"
        style={{ background: C.bg, border: `1px solid ${C.divider}` }}
      >
        {/* ── SELECT / PASS overlays ── */}
        {isTop && (
          <>
            <motion.div
              className="absolute top-6 left-6 z-20 px-4 py-2 rounded-sm border-2 font-bold text-lg"
              style={{
                opacity: selectOpacity,
                color: C.selectGreen,
                borderColor: C.selectGreen,
                ...sans,
                transform: 'rotate(-12deg)',
              }}
            >
              SELECT ✓
            </motion.div>
            <motion.div
              className="absolute top-6 right-6 z-20 px-4 py-2 rounded-sm border-2 font-bold text-lg"
              style={{
                opacity: rejectOpacity,
                color: C.rejectRed,
                borderColor: C.rejectRed,
                ...sans,
                transform: 'rotate(12deg)',
              }}
            >
              PASS ✕
            </motion.div>
          </>
        )}

        {/* ── Agent Photo ── */}
        <div
          className="relative w-full flex-shrink-0 flex items-center justify-center overflow-hidden"
          style={{ height: '52%', background: C.bgLight }}
        >
          {agent.photo_url ? (
            <img
              src={agent.photo_url}
              alt={agent.name}
              className="w-full h-full object-cover"
              loading={isTop ? 'eager' : 'lazy'}
              draggable={false}
            />
          ) : (
            <AgentAvatar name={agent.name} size="xl" />
          )}
        </div>

        {/* ── Card Content ── */}
        <div className="flex-1 px-5 py-4 flex flex-col gap-2 overflow-hidden">
          {/* Rating */}
          <div className="flex items-center gap-2">
            <span className="text-sm" style={{ color: C.gold }}>{stars}</span>
            <span className="text-xs" style={{ color: C.textSub, ...sans }}>
              {rating.toFixed(1)} · {agent.review_count} reviews
            </span>
          </div>

          {/* Name */}
          <h2
            className="text-2xl sm:text-3xl font-normal leading-tight truncate"
            style={{ ...serif, color: C.primary }}
          >
            {agent.name}
          </h2>

          {/* Categories */}
          {categories && (
            <p className="text-sm truncate" style={{ color: C.textSub, ...sans }}>
              {categories}
            </p>
          )}

          {/* Location */}
          {agent.city && (
            <p className="text-xs flex items-center gap-1" style={{ color: C.textSub, ...sans }}>
              <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>
                location_on
              </span>
              {agent.city}{agent.state ? `, ${agent.state}` : ''}{agent.zip ? ` ${agent.zip}` : ''}
            </p>
          )}

          {/* Bio */}
          {bioSnippet && (
            <p
              className="text-sm italic leading-relaxed line-clamp-2 mt-1"
              style={{ color: C.textSub, ...sans }}
            >
              "{bioSnippet}"
            </p>
          )}

          {/* Badges */}
          <div className="flex gap-2 mt-auto pt-2">
            <span
              className="text-[10px] px-3 py-1 tracking-wider uppercase font-medium"
              style={{ background: C.bgLight, color: C.accent, ...sans }}
            >
              🤖 MCP Enabled
            </span>
            {agent.years_in_business && (
              <span
                className="text-[10px] px-3 py-1 tracking-wider uppercase font-medium"
                style={{ background: C.bgLight, color: C.primary, ...sans }}
              >
                {agent.years_in_business}yr exp
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
});

/* ══════════════════════════════════════════
   SelectedAgentCard — Horizontal card
   ══════════════════════════════════════════ */
const SelectedAgentCard = memo(function SelectedAgentCard({
  agent,
  onTap,
  onRemove,
}: {
  agent: SwipeAgent;
  onTap: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const categories = (agent.categories || []).slice(0, 2).join(' · ');

  return (
    <div
      className="flex items-center gap-4 px-4 py-3 cursor-pointer transition-opacity hover:opacity-80"
      style={{ borderBottom: `1px solid ${C.divider}` }}
      onClick={() => onTap(agent.id)}
      role="button"
      tabIndex={0}
      aria-label={`View ${agent.name}`}
    >
      {/* Avatar */}
      <div className="w-14 h-14 flex-shrink-0 rounded-sm overflow-hidden" style={{ background: C.bgLight }}>
        {agent.photo_url ? (
          <img src={agent.photo_url} alt={agent.name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <AgentAvatar name={agent.name} size="md" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-normal truncate" style={{ ...serif, color: C.primary }}>
          {agent.name}
        </h3>
        <p className="text-xs truncate" style={{ color: C.textSub, ...sans }}>
          {categories}
          {agent.city ? ` · ${agent.city}` : ''}
        </p>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-xs" style={{ color: C.gold }}>
            {'★'.repeat(Math.round(agent.avg_rating || 0))}
          </span>
          <span className="text-[10px]" style={{ color: C.textSub }}>
            {(agent.avg_rating || 0).toFixed(1)}
          </span>
        </div>
      </div>

      {/* Remove button */}
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(agent.id); }}
        className="w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-red-50"
        aria-label="Remove agent"
      >
        <span className="material-symbols-outlined text-lg" style={{ color: C.rejectRed, fontVariationSettings: "'FILL' 0, 'wght' 300" }}>
          close
        </span>
      </button>
    </div>
  );
});

/* ══════════════════════════════════════════
   Main Page Component
   ══════════════════════════════════════════ */
export default function KirklandAgentsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'discover' | 'selected'>('discover');

  const {
    cards,
    selectedAgents,
    isLoading,
    isEmpty,
    swipeRight,
    swipeLeft,
    removeSelected,
    stats,
  } = useAgentSwipe();

  /* Navigate to agent detail */
  const handleTap = useCallback((id: string) => {
    navigate(`/hushh-agents/kirkland/${id}`);
  }, [navigate]);

  /* Button-triggered swipes (for accessibility + desktop) */
  const handleButtonReject = useCallback(() => {
    if (cards.length > 0) swipeLeft(cards[0].id);
  }, [cards, swipeLeft]);

  const handleButtonSelect = useCallback(() => {
    if (cards.length > 0) swipeRight(cards[0].id);
  }, [cards, swipeRight]);

  return (
    <div
      className="min-h-screen flex flex-col selection:bg-blue-100"
      style={{ background: C.bg, color: C.primary, ...sans }}
    >
      {/* ═══ Header ═══ */}
      <DashedSection>
        <header className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/hushh-agents')}
            className="flex items-center gap-2 hover:opacity-60 transition-opacity"
            aria-label="Back to Hushh Agents"
          >
            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>
              arrow_back
            </span>
            <span className="text-sm" style={{ color: C.textSub }}>Back</span>
          </button>

          <h1
            className="text-lg sm:text-xl tracking-wider font-normal"
            style={{ ...serif, color: C.primary }}
          >
            {activeTab === 'discover' ? 'DISCOVER' : `SELECTED (${stats.selected})`}
          </h1>

          <div className="w-16" /> {/* Spacer for centering */}
        </header>
      </DashedSection>

      {/* ═══ Content ═══ */}
      <DashedSection className="flex-1 flex flex-col">
        <div className="flex-1 flex flex-col items-center px-4 pt-4 pb-24">
          {activeTab === 'discover' ? (
            /* ── Discover View ── */
            <div className="w-full max-w-sm flex-1 flex flex-col items-center">
              {/* Card Stack */}
              <div
                className="relative w-full flex-1 max-h-[520px] min-h-[400px]"
                style={{ perspective: '1000px' }}
              >
                {isLoading ? (
                  /* Loading skeleton */
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gray-50 rounded-sm mx-auto mb-4 animate-pulse" />
                      <p className="text-sm" style={{ color: C.textSub }}>Loading agents...</p>
                    </div>
                  </div>
                ) : isEmpty && cards.length === 0 ? (
                  /* Empty state */
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center px-6">
                      <span
                        className="material-symbols-outlined text-5xl mb-4 block"
                        style={{ color: C.divider, fontVariationSettings: "'FILL' 0, 'wght' 200" }}
                      >
                        check_circle
                      </span>
                      <h2 className="text-2xl mb-2" style={serif}>All caught up!</h2>
                      <p className="text-sm mb-6" style={{ color: C.textSub }}>
                        You've discovered all {stats.total} agents.
                        Check your selected list!
                      </p>
                      <button
                        onClick={() => setActiveTab('selected')}
                        className="px-6 py-3 text-sm font-medium text-white"
                        style={{ background: C.accent }}
                      >
                        View Selected ({stats.selected})
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Card stack — only render top 3 */
                  cards.slice(0, 3).map((agent, i) => (
                    <SwipeCard
                      key={agent.id}
                      agent={agent}
                      isTop={i === 0}
                      stackIndex={i}
                      onSwipeRight={swipeRight}
                      onSwipeLeft={swipeLeft}
                      onTap={handleTap}
                    />
                  ))
                )}
              </div>

              {/* Action Buttons */}
              {cards.length > 0 && !isLoading && (
                <div className="flex items-center gap-6 py-5">
                  {/* Reject */}
                  <button
                    onClick={handleButtonReject}
                    className="w-16 h-16 rounded-full flex items-center justify-center transition-transform active:scale-90"
                    style={{ border: `2px solid ${C.rejectRed}` }}
                    aria-label="Pass"
                  >
                    <span className="material-symbols-outlined text-3xl" style={{ color: C.rejectRed }}>
                      close
                    </span>
                  </button>

                  {/* Select */}
                  <button
                    onClick={handleButtonSelect}
                    className="w-16 h-16 rounded-full flex items-center justify-center transition-transform active:scale-90"
                    style={{ border: `2px solid ${C.selectGreen}` }}
                    aria-label="Select"
                  >
                    <span className="material-symbols-outlined text-3xl" style={{ color: C.selectGreen }}>
                      favorite
                    </span>
                  </button>
                </div>
              )}

              {/* Progress */}
              {!isLoading && (
                <div className="w-full flex items-center gap-3 pb-2">
                  <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: C.divider }}>
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        background: C.accent,
                        width: stats.total > 0 ? `${(stats.swiped / stats.total) * 100}%` : '0%',
                      }}
                    />
                  </div>
                  <span className="text-[11px] flex-shrink-0" style={{ color: C.textSub }}>
                    {stats.swiped} / {stats.total}
                  </span>
                </div>
              )}
            </div>
          ) : (
            /* ── Selected View ── */
            <div className="w-full max-w-lg flex-1">
              {selectedAgents.length === 0 ? (
                <div className="flex-1 flex items-center justify-center py-20">
                  <div className="text-center">
                    <span
                      className="material-symbols-outlined text-5xl mb-4 block"
                      style={{ color: C.divider, fontVariationSettings: "'FILL' 0, 'wght' 200" }}
                    >
                      swipe_right
                    </span>
                    <h2 className="text-xl mb-2" style={serif}>No agents selected yet</h2>
                    <p className="text-sm mb-6" style={{ color: C.textSub }}>
                      Swipe right on agents you'd like to work with.
                    </p>
                    <button
                      onClick={() => setActiveTab('discover')}
                      className="px-6 py-3 text-sm font-medium text-white"
                      style={{ background: C.accent }}
                    >
                      Start Discovering
                    </button>
                  </div>
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: C.divider }}>
                  <div className="px-4 py-3">
                    <p
                      className="text-[11px] tracking-[0.25em] uppercase font-medium"
                      style={{ color: C.textSub }}
                    >
                      {selectedAgents.length} agent{selectedAgents.length !== 1 ? 's' : ''} selected
                    </p>
                  </div>
                  {selectedAgents.map((agent) => (
                    <SelectedAgentCard
                      key={agent.id}
                      agent={agent}
                      onTap={handleTap}
                      onRemove={removeSelected}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </DashedSection>

      {/* ═══ Bottom Tab Bar — Fixed ═══ */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 flex"
        style={{
          background: C.bg,
          borderTop: `1px solid ${C.divider}`,
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {/* Discover tab */}
        <button
          onClick={() => setActiveTab('discover')}
          className="flex-1 flex flex-col items-center gap-1 py-3 transition-opacity"
          style={{ opacity: activeTab === 'discover' ? 1 : 0.4 }}
          aria-label="Discover agents"
        >
          <span
            className="material-symbols-outlined text-xl"
            style={{
              color: activeTab === 'discover' ? C.accent : C.textSub,
              fontVariationSettings: activeTab === 'discover' ? "'FILL' 1, 'wght' 400" : "'FILL' 0, 'wght' 300",
            }}
          >
            style
          </span>
          <span
            className="text-[11px] font-medium"
            style={{ color: activeTab === 'discover' ? C.accent : C.textSub }}
          >
            Discover
          </span>
          {activeTab === 'discover' && (
            <div className="absolute top-0 left-1/4 right-3/4 h-0.5" style={{ background: C.accent }} />
          )}
        </button>

        {/* Selected tab */}
        <button
          onClick={() => setActiveTab('selected')}
          className="flex-1 flex flex-col items-center gap-1 py-3 transition-opacity relative"
          style={{ opacity: activeTab === 'selected' ? 1 : 0.4 }}
          aria-label={`Selected agents (${stats.selected})`}
        >
          <span
            className="material-symbols-outlined text-xl"
            style={{
              color: activeTab === 'selected' ? C.accent : C.textSub,
              fontVariationSettings: activeTab === 'selected' ? "'FILL' 1, 'wght' 400" : "'FILL' 0, 'wght' 300",
            }}
          >
            favorite
          </span>
          <span
            className="text-[11px] font-medium"
            style={{ color: activeTab === 'selected' ? C.accent : C.textSub }}
          >
            Selected
          </span>

          {/* Badge */}
          {stats.selected > 0 && (
            <span
              className="absolute top-2 right-1/4 w-5 h-5 flex items-center justify-center rounded-full text-[9px] font-bold text-white"
              style={{ background: C.selectGreen, transform: 'translate(50%, -25%)' }}
            >
              {stats.selected > 99 ? '99+' : stats.selected}
            </span>
          )}

          {activeTab === 'selected' && (
            <div className="absolute top-0 left-1/4 right-3/4 h-0.5" style={{ background: C.accent }} />
          )}
        </button>
      </div>
    </div>
  );
}

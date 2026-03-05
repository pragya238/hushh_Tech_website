/**
 * Agent Detail Page
 *
 * Luxury redesign matching HomePage/KirklandAgentsPage design system.
 * MCP endpoint + agent-specific chat + contact info.
 * Logic unchanged — only UI revamped + responsive.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

/* ── Font helpers ── */
const serif = { fontFamily: "'Playfair Display', serif" };
const sans = { fontFamily: "'Inter', sans-serif" };

/* ── Color palette ── */
const C = {
  primary: '#1A1A1B',
  accent: '#C1A050',
  textSub: '#6B7280',
  border: '#E5E7EB',
  bg: '#FFFFFF',
};

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || 'https://ibsisfnjxeowvdtvgzff.supabase.co',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

interface AgentFull {
  id: string;
  name: string;
  alias: string | null;
  phone: string | null;
  address1: string | null;
  address2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  avg_rating: number | null;
  review_count: number;
  categories: string[];
  is_closed: boolean;
  photo_url: string | null;
}

/** Format full address */
const formatAddress = (a: AgentFull): string => {
  const parts = [a.address1, a.address2, a.city, a.state, a.zip].filter(Boolean);
  return parts.join(', ') || 'Address not available';
};

/* ── Avatar initials ── */
const AVATAR_COLORS = ['#1e3a5f', '#1e40af', '#166534', '#7e22ce', '#374151', '#0f766e', '#9f1239', '#92400e'];
const AvatarInitials: React.FC<{ name: string; size?: 'md' | 'xl' }> = ({ name, size = 'md' }) => {
  const initials = name.split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const colorIdx = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length;
  const sizeClass = size === 'xl' ? 'w-20 h-20 text-2xl' : 'w-12 h-12 text-lg';
  return (
    <div
      className={`${sizeClass} rounded-2xl flex items-center justify-center text-white font-semibold shrink-0`}
      style={{ backgroundColor: AVATAR_COLORS[colorIdx] }}
    >
      {initials}
    </div>
  );
};

/* ── Rating text ── */
const RatingText: React.FC<{ rating: number | null; count: number }> = ({ rating, count }) => {
  if (!rating) return <span className="text-sm font-light" style={{ color: C.textSub }}>No rating yet</span>;
  return (
    <div className="flex items-center gap-1">
      <span className="text-sm font-semibold" style={{ color: C.primary }}>{rating.toFixed(1)}</span>
      <span className="text-amber-400 text-sm">★</span>
      {count > 0 && <span className="text-xs font-light" style={{ color: C.textSub }}>({count} review{count !== 1 ? 's' : ''})</span>}
    </div>
  );
};

/* ── Section label ── */
const SectionLabel = ({ children }: { children: string }) => (
  <p className="text-[10px] uppercase tracking-[0.2em] font-medium mb-3" style={{ color: C.textSub, ...sans }}>{children}</p>
);

/* ── Info row card ── */
const InfoRow: React.FC<{ icon: string; label: string; value: string; onClick?: () => void }> = ({ icon, label, value, onClick }) => (
  <button
    onClick={onClick}
    disabled={!onClick}
    className={`flex items-start gap-4 p-4 sm:p-5 rounded-2xl border w-full text-left transition-all ${onClick ? 'hover:shadow-sm active:scale-[0.99] cursor-pointer' : ''}`}
    style={{ borderColor: C.border, background: C.bg, ...sans }}
  >
    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#F9FAFB' }}>
      <span className="material-symbols-outlined text-lg" style={{ color: C.textSub }}>{icon}</span>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] uppercase tracking-[0.15em] font-medium" style={{ color: C.textSub }}>{label}</p>
      <p className="text-sm mt-0.5 break-words font-light leading-relaxed" style={{ color: C.primary }}>{value}</p>
    </div>
    {onClick && <span className="material-symbols-outlined text-sm shrink-0 mt-1" style={{ color: C.border }}>open_in_new</span>}
  </button>
);

/* ── MCP Endpoint row ── */
const McpEndpointRow: React.FC<{ agentId: string }> = ({ agentId }) => {
  const [copied, setCopied] = useState(false);
  const endpoint = `https://hushhtech.com/api/mcp/agents/${agentId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(endpoint);
    } catch {
      const el = document.createElement('textarea');
      el.value = endpoint;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl border" style={{ borderColor: C.border, background: C.bg, ...sans }}>
      <div className="flex items-center gap-2 mb-3">
        <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-semibold px-2 py-1 rounded-full uppercase tracking-wider">MCP</span>
        <span className="text-[10px] uppercase tracking-[0.15em] font-medium" style={{ color: C.textSub }}>Endpoint</span>
      </div>
      <div className="flex items-center gap-2">
        <code className="flex-1 text-[11px] bg-gray-50 px-3 py-2.5 rounded-lg font-mono break-all leading-relaxed" style={{ color: C.textSub }}>
          {endpoint}
        </code>
        <button
          onClick={handleCopy}
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors hover:bg-gray-100"
          style={{ background: '#F3F4F6' }}
          aria-label="Copy endpoint"
        >
          <span className="material-symbols-outlined text-sm" style={{ color: C.textSub }}>{copied ? 'check' : 'content_copy'}</span>
        </button>
      </div>
      <p className="text-[10px] font-light mt-2" style={{ color: C.textSub }}>Connect to this agent via MCP from any AI tool.</p>
    </div>
  );
};

const AgentDetailPage: React.FC = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const [agent, setAgent] = useState<AgentFull | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAgent = async () => {
      if (!agentId) return;
      setIsLoading(true);
      const { data, error } = await supabase.from('kirkland_agents').select('*').eq('id', agentId).single();
      if (!error && data) setAgent(data);
      setIsLoading(false);
    };
    fetchAgent();
  }, [agentId]);

  /* Loading */
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.bg, ...sans }}>
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 animate-pulse mx-auto mb-3" />
          <p className="text-sm font-light" style={{ color: C.textSub }}>Loading...</p>
        </div>
      </div>
    );
  }

  /* Not found */
  if (!agent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: C.bg, ...sans }}>
        <span className="material-symbols-outlined text-5xl mb-4" style={{ color: C.border }}>person_off</span>
        <p className="text-base font-light" style={{ color: C.textSub }}>Agent not found</p>
        <button onClick={() => navigate('/hushh-agents/kirkland')} className="mt-4 text-sm font-medium underline underline-offset-2" style={{ color: C.primary }}>
          Back to Directory
        </button>
      </div>
    );
  }

  const googleMapsUrl = agent.latitude && agent.longitude
    ? `https://www.google.com/maps?q=${agent.latitude},${agent.longitude}`
    : `https://www.google.com/maps/search/${encodeURIComponent(formatAddress(agent))}`;

  return (
    <div className="min-h-screen pb-12" style={{ background: C.bg, color: C.primary, ...sans }}>

      {/* ═══ Header ═══ */}
      <header className="px-4 sm:px-6 md:px-8 pt-8 sm:pt-10 pb-4 max-w-md sm:max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto">
        <button onClick={() => navigate('/hushh-agents/kirkland')} className="flex items-center gap-1 transition-opacity hover:opacity-70" style={{ color: C.textSub }}>
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          <span className="text-xs font-medium uppercase tracking-wider">Back to Directory</span>
        </button>
      </header>

      <main className="px-4 sm:px-6 md:px-8 max-w-md sm:max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto">

        {/* ═══ Profile Hero ═══ */}
        <section className="pt-6 pb-8 text-center md:text-left md:flex md:items-start md:gap-8">
          <div className="flex justify-center md:justify-start">
            <AvatarInitials name={agent.name} size="xl" />
          </div>
          <div className="mt-4 md:mt-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-semibold leading-tight" style={serif}>{agent.name}</h1>
            {agent.alias && <p className="text-xs font-light mt-1" style={{ color: C.textSub }}>@{agent.alias}</p>}

            {/* Badges */}
            <div className="flex items-center justify-center md:justify-start gap-2 mt-3">
              <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[9px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider">MCP Enabled</span>
              {agent.is_closed ? (
                <span className="flex items-center gap-1 px-3 py-1 bg-red-50 text-red-500 rounded-full text-[10px] font-medium uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full" /> Closed
                </span>
              ) : (
                <span className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-medium uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Open
                </span>
              )}
            </div>

            {/* Rating */}
            <div className="flex justify-center md:justify-start mt-3">
              <RatingText rating={agent.avg_rating} count={agent.review_count} />
            </div>
          </div>
        </section>

        {/* ═══ Two-column layout on desktop ═══ */}
        <div className="md:grid md:grid-cols-2 md:gap-8">

          {/* Left column */}
          <div>
            {/* Chat CTA */}
            <section className="pb-6">
              <SectionLabel>AI Assistant</SectionLabel>
              <button
                onClick={() => navigate(`/hushh-agents/kirkland/${agent.id}/chat`)}
                className="w-full flex items-center gap-4 p-4 sm:p-5 rounded-2xl border transition-all hover:shadow-sm active:scale-[0.99]"
                style={{ borderColor: '#d1fae5', background: '#ecfdf5' }}
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-lg text-emerald-600">smart_toy</span>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium" style={{ color: C.primary }}>Chat with {agent.name}</p>
                  <p className="text-xs font-light mt-0.5" style={{ color: C.textSub }}>Powered by Gemini · Hushh Intelligence</p>
                </div>
                <span className="material-symbols-outlined text-emerald-400 text-lg">arrow_forward</span>
              </button>
            </section>

            {/* MCP Endpoint */}
            <section className="pb-6">
              <SectionLabel>MCP & API</SectionLabel>
              <McpEndpointRow agentId={agent.id} />
            </section>

            {/* Categories */}
            {agent.categories?.length > 0 && (
              <section className="pb-6">
                <SectionLabel>Categories</SectionLabel>
                <div className="flex flex-wrap gap-2">
                  {agent.categories.map((cat) => (
                    <span key={cat} className="px-3 py-1.5 bg-gray-50 border text-[11px] rounded-full font-medium" style={{ borderColor: C.border, color: C.textSub }}>
                      {cat}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right column */}
          <div>
            {/* Contact Info */}
            <section className="pb-6">
              <SectionLabel>Contact Information</SectionLabel>
              <div className="space-y-3">
                {agent.phone && (
                  <InfoRow icon="call" label="Phone" value={agent.phone} onClick={() => window.open(`tel:${agent.phone}`, '_self')} />
                )}
                <InfoRow icon="location_on" label="Address" value={formatAddress(agent)} onClick={() => window.open(googleMapsUrl, '_blank')} />
                {agent.latitude && agent.longitude && (
                  <InfoRow icon="directions" label="Get Directions" value={`${agent.latitude.toFixed(4)}, ${agent.longitude.toFixed(4)}`} onClick={() => window.open(googleMapsUrl, '_blank')} />
                )}
              </div>
            </section>

            {/* Map Preview */}
            {agent.latitude && agent.longitude && (
              <section className="pb-6">
                <SectionLabel>Location</SectionLabel>
                <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="block rounded-2xl overflow-hidden border transition-shadow hover:shadow-sm" style={{ borderColor: C.border }}>
                  <img
                    src={`https://maps.googleapis.com/maps/api/staticmap?center=${agent.latitude},${agent.longitude}&zoom=14&size=600x200&markers=color:red%7C${agent.latitude},${agent.longitude}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}`}
                    alt={`Map of ${agent.name}`}
                    className="w-full h-[160px] object-cover bg-gray-50"
                    loading="lazy"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  <div className="p-3 flex items-center justify-between">
                    <span className="text-[11px] font-light" style={{ color: C.textSub }}>View on Google Maps</span>
                    <span className="material-symbols-outlined text-sm" style={{ color: C.border }}>open_in_new</span>
                  </div>
                </a>
              </section>
            )}
          </div>
        </div>

        {/* ═══ Action CTAs ═══ */}
        <div className="max-w-md mx-auto md:max-w-sm space-y-3 pt-4 pb-8">
          {agent.phone && (
            <button
              onClick={() => window.open(`tel:${agent.phone}`, '_self')}
              className="w-full py-4 rounded-2xl font-medium text-sm flex items-center justify-center gap-2 transition-transform active:scale-[0.99]"
              style={{ background: C.primary, color: '#FFFFFF' }}
            >
              <span className="material-symbols-outlined text-lg">call</span>
              Call Now
            </button>
          )}
          <button
            onClick={() => window.open(googleMapsUrl, '_blank')}
            className="w-full py-4 rounded-2xl font-medium text-sm flex items-center justify-center gap-2 border transition-transform active:scale-[0.99]"
            style={{ borderColor: C.border, color: C.primary, background: C.bg }}
          >
            <span className="material-symbols-outlined text-lg">directions</span>
            Get Directions
          </button>
        </div>
      </main>
    </div>
  );
};

export default AgentDetailPage;

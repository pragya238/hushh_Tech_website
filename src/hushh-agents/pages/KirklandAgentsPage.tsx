/**
 * Kirkland Agents — Directory Page
 *
 * Luxury redesign with Playfair Display + Inter fonts.
 * Category grid, search, rounded agent cards with MCP badges.
 * Logic unchanged — only UI revamped + responsive.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import AgentAvatar from '../components/AgentAvatar';

/* ── Font helpers ── */
const serif = { fontFamily: "'Playfair Display', serif" };
const sans = { fontFamily: "'Inter', sans-serif" };

/* ── Color palette (matches HomePage) ── */
const C = {
  primary: '#1A1A1B',
  accent: '#C1A050',
  textSub: '#6B7280',
  border: '#E5E7EB',
  surface: '#FDFDFD',
  bg: '#FFFFFF',
};

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || 'https://ibsisfnjxeowvdtvgzff.supabase.co',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

/* ── Major Category Definitions ── */
interface MajorCategory {
  key: string;
  label: string;
  icon: string;
  keywords: string[];
}

const MAJOR_CATEGORIES: MajorCategory[] = [
  { key: 'finance', label: 'Finance', icon: 'account_balance', keywords: ['financial', 'accountant', 'tax', 'bank', 'credit union', 'bookkeeping', 'payroll', 'mortgage', 'loan', 'wealth'] },
  { key: 'insurance', label: 'Insurance', icon: 'shield', keywords: ['insurance', 'life insurance', 'health insurance', 'auto insurance', 'property insurance', 'underwriting'] },
  { key: 'real-estate', label: 'Real Est', icon: 'real_estate_agent', keywords: ['real estate', 'property', 'realtor', 'housing', 'apartment', 'commercial real estate', 'land'] },
  { key: 'health', label: 'Health', icon: 'local_hospital', keywords: ['doctor', 'dentist', 'health', 'medical', 'chiropractic', 'optometrist', 'pharmacy', 'clinic', 'hospital', 'therapy', 'mental health', 'veterinar'] },
  { key: 'legal', label: 'Legal', icon: 'gavel', keywords: ['lawyer', 'legal', 'attorney', 'law firm', 'notary', 'immigration', 'divorce', 'criminal', 'estate planning'] },
  { key: 'technology', label: 'Tech', icon: 'code', keywords: ['it ', 'software', 'web design', 'technology', 'computer', 'internet', 'data', 'cloud', 'cyber', 'telecom'] },
  { key: 'home-services', label: 'Home', icon: 'home_repair_service', keywords: ['plumb', 'electric', 'contractor', 'landscap', 'roofing', 'paint', 'cleaning', 'handyman', 'hvac', 'pest', 'locksmith', 'moving'] },
  { key: 'food', label: 'Food', icon: 'restaurant', keywords: ['restaurant', 'cafe', 'coffee', 'bar', 'bakery', 'pizza', 'food', 'catering', 'grocery', 'deli', 'brewery'] },
  { key: 'auto', label: 'Auto', icon: 'directions_car', keywords: ['auto', 'car', 'vehicle', 'mechanic', 'tire', 'body shop', 'towing', 'oil change', 'transmission'] },
  { key: 'beauty', label: 'Beauty', icon: 'spa', keywords: ['salon', 'spa', 'massage', 'beauty', 'hair', 'nail', 'skin', 'barber', 'cosmetic', 'waxing'] },
];

/** Check if an agent matches a major category */
const agentMatchesMajor = (categories: string[], major: MajorCategory): boolean => {
  if (!categories?.length) return false;
  const joined = categories.join(' ').toLowerCase();
  return major.keywords.some((kw) => joined.includes(kw.toLowerCase()));
};

/** Agent type */
interface KirklandAgent {
  id: string;
  name: string;
  alias: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  avg_rating: number | null;
  review_count: number;
  categories: string[];
  is_closed: boolean;
  photo_url: string | null;
}

/* ── Rating display ── */
const RatingText: React.FC<{ rating: number | null; count: number }> = ({ rating, count }) => {
  if (!rating) return <span className="text-xs font-light" style={{ color: C.textSub }}>No rating{count > 0 ? ` (${count})` : ''}</span>;
  return (
    <span className="text-xs font-light" style={{ color: C.textSub }}>
      {rating.toFixed(1)} ★{count > 0 ? ` (${count})` : ''}
    </span>
  );
};

/* ── Avatar initials with color ── */
const AVATAR_COLORS = ['#1e3a5f', '#1e40af', '#166534', '#7e22ce', '#374151', '#0f766e', '#9f1239', '#92400e'];
const AvatarInitials: React.FC<{ name: string }> = ({ name }) => {
  const initials = name.split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const colorIdx = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length;
  return (
    <div
      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold text-lg shrink-0"
      style={{ backgroundColor: AVATAR_COLORS[colorIdx] }}
    >
      {initials}
    </div>
  );
};

/* ── Agent Card ── */
const AgentCard: React.FC<{ agent: KirklandAgent }> = ({ agent }) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(`/hushh-agents/kirkland/${agent.id}`)}
      className="w-full text-left border rounded-3xl p-5 shadow-sm flex flex-col relative group cursor-pointer transition-shadow hover:shadow-md active:scale-[0.99]"
      style={{ borderColor: C.border, background: C.bg, ...sans }}
      aria-label={`View ${agent.name}`}
    >
      <div className="flex items-start justify-between w-full">
        <div className="flex items-start gap-4">
          <AvatarInitials name={agent.name} />
          <div className="flex-1 min-w-0 pr-2">
            <h3 className="font-semibold text-lg leading-tight mb-1 truncate" style={{ ...serif, color: C.primary }}>
              {agent.name}
            </h3>
            {agent.city && (
              <div className="flex items-center text-xs mb-2" style={{ color: C.textSub }}>
                <span className="material-symbols-outlined text-[14px] mr-1">location_on</span>
                {agent.city}{agent.state ? `, ${agent.state}` : ''}
              </div>
            )}
            <RatingText rating={agent.avg_rating} count={agent.review_count} />
          </div>
        </div>
        <div className="flex items-center gap-2 mt-1 shrink-0">
          <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-semibold px-2 py-1 rounded-full uppercase tracking-wider">
            MCP
          </span>
          <span className="material-symbols-outlined text-lg transition-colors" style={{ color: C.border }}>
            chevron_right
          </span>
        </div>
      </div>
      {/* Category pills */}
      {agent.categories?.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {agent.categories.slice(0, 2).map((cat) => (
            <span key={cat} className="bg-gray-100 text-[11px] px-3 py-1.5 rounded-full font-medium" style={{ color: C.textSub }}>
              {cat}
            </span>
          ))}
          {agent.categories.length > 2 && (
            <span className="text-[11px] py-1.5 font-medium" style={{ color: C.textSub }}>+{agent.categories.length - 2}</span>
          )}
        </div>
      )}
    </button>
  );
};

const KirklandAgentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [agents, setAgents] = useState<KirklandAgent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMajor, setSelectedMajor] = useState<string | null>(null);

  /* Fetch agents from Supabase */
  useEffect(() => {
    const fetchAgents = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('kirkland_agents')
        .select('id, name, alias, phone, city, state, avg_rating, review_count, categories, is_closed, photo_url')
        .eq('is_closed', false)
        .order('avg_rating', { ascending: false, nullsFirst: false });
      if (!error && data) setAgents(data);
      setIsLoading(false);
    };
    fetchAgents();
  }, []);

  /* Category counts */
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    MAJOR_CATEGORIES.forEach((mc) => {
      counts[mc.key] = agents.filter((a) => agentMatchesMajor(a.categories, mc)).length;
    });
    return counts;
  }, [agents]);

  /* Filtered agents */
  const filteredAgents = useMemo(() => {
    let result = agents;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.city?.toLowerCase().includes(q) ||
        a.categories?.some(c => c.toLowerCase().includes(q))
      );
    }
    if (selectedMajor) {
      const major = MAJOR_CATEGORIES.find((m) => m.key === selectedMajor);
      if (major) result = result.filter((a) => agentMatchesMajor(a.categories, major));
    }
    return result;
  }, [agents, searchQuery, selectedMajor]);

  /* Loading state */
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.bg, ...sans }}>
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3 animate-pulse">
            <span className="material-symbols-outlined" style={{ color: C.textSub }}>location_city</span>
          </div>
          <p className="text-[13px] font-light" style={{ color: C.textSub }}>Loading agents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-10" style={{ background: C.bg, color: C.primary, ...sans }}>

      {/* ═══ Header / Title ═══ */}
      <header className="px-4 sm:px-6 md:px-8 pt-10 sm:pt-12 pb-6 max-w-md sm:max-w-lg md:max-w-3xl lg:max-w-5xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate('/hushh-agents')}
          className="flex items-center gap-1 mb-6 transition-opacity hover:opacity-70"
          style={{ color: C.textSub }}
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          <span className="text-xs font-medium uppercase tracking-wider">Back</span>
        </button>

        <p className="text-[10px] uppercase tracking-[0.2em] font-semibold mb-3" style={{ color: C.textSub }}>
          Agent Directory
        </p>
        <h1 className="leading-tight" style={serif}>
          <span className="text-4xl sm:text-5xl font-semibold block" style={{ color: C.primary }}>Kirkland</span>
          <span className="text-4xl sm:text-5xl italic font-normal block mt-1" style={{ color: C.textSub }}>Agents</span>
        </h1>
        <p className="mt-4 text-sm font-light" style={{ color: C.textSub, ...sans }}>
          {agents.length} agents with MCP endpoints. Filter by category.
        </p>
      </header>

      <main className="px-4 sm:px-6 md:px-8 max-w-md sm:max-w-lg md:max-w-3xl lg:max-w-5xl mx-auto">

        {/* ═══ Search ═══ */}
        <section className="mb-8">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-[20px]" style={{ color: C.textSub }}>search</span>
            </span>
            <input
              type="text"
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full py-3.5 pl-11 pr-4 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1"
              style={{
                background: C.bg,
                border: `1px solid ${C.border}`,
                color: C.primary,
                ...sans,
              }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2" aria-label="Clear search">
                <span className="material-symbols-outlined text-[18px]" style={{ color: C.textSub }}>close</span>
              </button>
            )}
          </div>
        </section>

        {/* ═══ Category Filter Grid ═══ */}
        <section className="mb-10">
          <p className="text-[10px] uppercase tracking-[0.15em] font-medium mb-4" style={{ color: C.textSub }}>
            Filter by Category
          </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3">
            {/* All button */}
            <button
              onClick={() => setSelectedMajor(null)}
              className="rounded-2xl p-3 sm:p-4 flex flex-col items-center justify-center aspect-square shadow-md transition-transform active:scale-95"
              style={{
                background: !selectedMajor ? C.primary : C.bg,
                color: !selectedMajor ? '#FFFFFF' : C.textSub,
                border: `1px solid ${!selectedMajor ? C.primary : C.border}`,
              }}
            >
              <span className="material-symbols-outlined mb-2 text-xl">apps</span>
              <span className="text-[10px] font-semibold tracking-wide uppercase mb-1">All</span>
              <span className="text-[10px] font-light" style={{ opacity: 0.7 }}>{agents.length}</span>
            </button>

            {MAJOR_CATEGORIES.map((mc) => {
              const count = categoryCounts[mc.key] || 0;
              if (count === 0) return null;
              const isActive = selectedMajor === mc.key;
              return (
                <button
                  key={mc.key}
                  onClick={() => setSelectedMajor(isActive ? null : mc.key)}
                  className="rounded-2xl p-3 sm:p-4 flex flex-col items-center justify-center aspect-square transition-all active:scale-95"
                  style={{
                    background: isActive ? C.primary : C.bg,
                    color: isActive ? '#FFFFFF' : C.textSub,
                    border: `1px solid ${isActive ? C.primary : C.border}`,
                  }}
                >
                  <span className="material-symbols-outlined mb-2 text-xl">{mc.icon}</span>
                  <span className="text-[10px] font-semibold tracking-wide uppercase mb-1 truncate w-full text-center">{mc.label}</span>
                  <span className="text-[10px] font-light" style={{ opacity: 0.7 }}>{count}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ═══ Agent List ═══ */}
        <section className="pb-8">
          <p className="text-[10px] uppercase tracking-[0.15em] font-medium mb-4" style={{ color: C.textSub }}>
            {searchQuery || selectedMajor
              ? `Results · ${filteredAgents.length}`
              : `All Agents · ${agents.length}`}
          </p>

          {filteredAgents.length === 0 ? (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-[40px] mb-3 block" style={{ color: C.border }}>search_off</span>
              <p className="text-[13px] font-light" style={{ color: C.textSub }}>No agents found</p>
              <p className="text-[11px] font-light mt-1" style={{ color: C.textSub }}>Try a different category or search</p>
            </div>
          ) : (
            <div className="space-y-4 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
              {filteredAgents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default KirklandAgentsPage;

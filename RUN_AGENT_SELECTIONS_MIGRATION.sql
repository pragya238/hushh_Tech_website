-- Run this in Supabase Dashboard SQL Editor
-- Creates user_agent_selections table for Tinder-style swipe experience

CREATE TABLE IF NOT EXISTS public.user_agent_selections (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id text NOT NULL REFERENCES public.kirkland_agents(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('selected', 'rejected')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, agent_id)
);

ALTER TABLE public.user_agent_selections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own selections"
  ON public.user_agent_selections FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_agent_sel_user_status
  ON public.user_agent_selections(user_id, status);

CREATE INDEX IF NOT EXISTS idx_user_agent_sel_agent
  ON public.user_agent_selections(agent_id);

CREATE OR REPLACE FUNCTION public.batch_agent_selections(
  p_user_id uuid,
  p_selections jsonb
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.user_agent_selections (user_id, agent_id, status)
  SELECT p_user_id, (item->>'agent_id')::text, (item->>'status')::text
  FROM jsonb_array_elements(p_selections) AS item
  ON CONFLICT (user_id, agent_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

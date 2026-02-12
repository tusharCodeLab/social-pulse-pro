
-- Add spam detection column to post_comments
ALTER TABLE public.post_comments 
ADD COLUMN IF NOT EXISTS is_spam boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS spam_reason text;

-- Create personal_trends table for trend detection
CREATE TABLE public.personal_trends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  trend_type text NOT NULL, -- 'content', 'engagement', 'audience', 'hashtag'
  title text NOT NULL,
  description text NOT NULL,
  direction text NOT NULL DEFAULT 'up', -- 'up', 'down', 'stable'
  confidence_score numeric DEFAULT 0,
  data_points jsonb DEFAULT '[]'::jsonb,
  platform text DEFAULT 'instagram',
  detected_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.personal_trends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own trends"
ON public.personal_trends FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own trends"
ON public.personal_trends FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trends"
ON public.personal_trends FOR DELETE
USING (auth.uid() = user_id);

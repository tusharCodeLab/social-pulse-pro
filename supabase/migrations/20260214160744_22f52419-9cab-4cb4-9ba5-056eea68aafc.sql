
-- Content Calendar table for AI-generated content plans
CREATE TABLE public.content_calendar (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  platform TEXT NOT NULL DEFAULT 'instagram',
  content_type TEXT NOT NULL DEFAULT 'post',
  title TEXT NOT NULL,
  caption TEXT,
  hashtags TEXT[],
  status TEXT NOT NULL DEFAULT 'draft',
  ai_score INTEGER,
  ai_reasoning TEXT,
  is_ai_generated BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.content_calendar ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own calendar items"
  ON public.content_calendar FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own calendar items"
  ON public.content_calendar FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendar items"
  ON public.content_calendar FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calendar items"
  ON public.content_calendar FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_content_calendar_updated_at
  BEFORE UPDATE ON public.content_calendar
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

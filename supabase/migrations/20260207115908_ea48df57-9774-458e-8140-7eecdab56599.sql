-- Add a unique constraint on post_comments for upsert to work
-- Using external comment ID approach would be better, but for now use content hash
ALTER TABLE public.post_comments 
ADD COLUMN IF NOT EXISTS external_comment_id TEXT;

-- Create unique index on user_id and external_comment_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_post_comments_external_id 
ON public.post_comments(user_id, external_comment_id) 
WHERE external_comment_id IS NOT NULL;
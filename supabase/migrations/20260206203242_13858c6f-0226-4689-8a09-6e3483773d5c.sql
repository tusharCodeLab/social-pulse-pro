-- Add unique constraint for posts upsert (user_id + external_post_id)
ALTER TABLE public.posts 
ADD CONSTRAINT posts_user_external_unique UNIQUE (user_id, external_post_id);

-- Add unique constraint for social_accounts upsert (user_id + platform)
ALTER TABLE public.social_accounts 
ADD CONSTRAINT social_accounts_user_platform_unique UNIQUE (user_id, platform);

-- Add unique constraint for comments to avoid duplicates
CREATE UNIQUE INDEX IF NOT EXISTS post_comments_unique_idx 
ON public.post_comments (user_id, post_id, md5(content));
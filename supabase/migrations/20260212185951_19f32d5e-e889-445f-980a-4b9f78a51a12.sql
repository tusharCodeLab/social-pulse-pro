-- Index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_social_accounts_user_platform ON public.social_accounts(user_id, platform);

-- Unique constraint for multi-profile support on instagram_tokens
CREATE UNIQUE INDEX IF NOT EXISTS uq_instagram_tokens_user_ig_user ON public.instagram_tokens(user_id, instagram_user_id);

-- Unique constraint for multi-profile social accounts (one row per handle per user per platform)
CREATE UNIQUE INDEX IF NOT EXISTS uq_social_accounts_user_platform_handle ON public.social_accounts(user_id, platform, account_handle);
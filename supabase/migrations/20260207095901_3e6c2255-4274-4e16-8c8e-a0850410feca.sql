-- Add unique constraints for upsert operations

-- Unique constraint for audience_metrics (user_id, platform, date)
ALTER TABLE public.audience_metrics 
DROP CONSTRAINT IF EXISTS audience_metrics_user_platform_date_unique;

ALTER TABLE public.audience_metrics 
ADD CONSTRAINT audience_metrics_user_platform_date_unique 
UNIQUE (user_id, platform, date);

-- Unique constraint for best_posting_times (user_id, platform, day_of_week, hour_of_day)
ALTER TABLE public.best_posting_times 
DROP CONSTRAINT IF EXISTS best_posting_times_user_platform_day_hour_unique;

ALTER TABLE public.best_posting_times 
ADD CONSTRAINT best_posting_times_user_platform_day_hour_unique 
UNIQUE (user_id, platform, day_of_week, hour_of_day);
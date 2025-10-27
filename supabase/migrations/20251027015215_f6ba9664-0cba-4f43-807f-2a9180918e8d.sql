-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create cron job to expire check-ins every minute
SELECT cron.schedule(
  'expire-checkins-job',
  '* * * * *', -- every minute
  $$
  SELECT
    net.http_post(
        url:='https://miaifxqtqpuxogpgjwty.supabase.co/functions/v1/expire-checkins',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pYWlmeHF0cXB1eG9ncGdqd3R5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0ODA5MTYsImV4cCI6MjA3NjA1NjkxNn0.G5CDR8yesVwchHDMFazqdcQzInsl9r7qkgPQJUVOQck"}'::jsonb,
        body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);
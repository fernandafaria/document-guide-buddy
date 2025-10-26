-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the expire-checkins function to run every 5 minutes
SELECT cron.schedule(
  'expire-old-checkins',
  '*/5 * * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://miaifxqtqpuxogpgjwty.supabase.co/functions/v1/expire-checkins',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pYWlmeHF0cXB1eG9ncGdqd3R5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0ODA5MTYsImV4cCI6MjA3NjA1NjkxNn0.G5CDR8yesVwchHDMFazqdcQzInsl9r7qkgPQJUVOQck"}'::jsonb,
      body := '{}'::jsonb
    ) as request_id;
  $$
);
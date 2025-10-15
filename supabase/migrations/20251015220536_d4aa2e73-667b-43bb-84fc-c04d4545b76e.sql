-- Enable realtime for messages table
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- Add realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Enable realtime for matches table
ALTER TABLE public.matches REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
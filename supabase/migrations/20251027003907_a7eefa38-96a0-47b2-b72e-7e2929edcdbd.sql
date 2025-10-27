-- Enable realtime for profiles table so check-ins/check-outs update instantly
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- Enable realtime for likes table so match status updates instantly
ALTER PUBLICATION supabase_realtime ADD TABLE public.likes;
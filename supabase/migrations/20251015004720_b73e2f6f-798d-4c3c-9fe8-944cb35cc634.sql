-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================
-- PROFILES TABLE (User Data)
-- ============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic Info
  email TEXT,
  phone_number TEXT,
  phone_verified BOOLEAN DEFAULT false,
  name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 18 AND age <= 99),
  gender TEXT NOT NULL CHECK (gender IN ('Masculino', 'Feminino', 'Não-binário', 'Outro')),
  intentions TEXT[] NOT NULL CHECK (array_length(intentions, 1) > 0),
  
  -- Photos (URLs from storage)
  photos TEXT[] DEFAULT '{}',
  
  -- Profile Details
  profession TEXT,
  education TEXT,
  city TEXT,
  state TEXT,
  languages TEXT[] DEFAULT '{}',
  alcohol TEXT CHECK (alcohol IN ('Não bebo', 'Socialmente', 'Frequentemente')),
  religion TEXT,
  zodiac_sign TEXT,
  musical_styles TEXT[] DEFAULT '{}',
  about_me TEXT,
  
  -- Check-in Data (stores current active check-in)
  current_check_in JSONB DEFAULT NULL,
  -- Structure: {
  --   location_id: text,
  --   location_name: text,
  --   latitude: number,
  --   longitude: number,
  --   checked_in_at: timestamp,
  --   expires_at: timestamp
  -- }
  
  -- Settings
  fcm_token TEXT,
  notifications_enabled BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- LOCATIONS TABLE
-- ============================================
CREATE TABLE public.locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id TEXT UNIQUE NOT NULL, -- Google Place ID
  name TEXT NOT NULL,
  address TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  active_users_count INTEGER DEFAULT 0,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for locations
CREATE POLICY "Locations are viewable by everyone"
  ON public.locations FOR SELECT
  USING (true);

CREATE POLICY "System can insert locations"
  ON public.locations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update locations"
  ON public.locations FOR UPDATE
  USING (true);

-- ============================================
-- LIKES TABLE
-- ============================================
CREATE TABLE public.likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_match BOOLEAN DEFAULT false,
  location_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(from_user_id, to_user_id)
);

-- Enable RLS
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for likes
CREATE POLICY "Users can view their own likes"
  ON public.likes FOR SELECT
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can create likes"
  ON public.likes FOR INSERT
  WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "System can update likes for matches"
  ON public.likes FOR UPDATE
  USING (true);

-- ============================================
-- MATCHES TABLE
-- ============================================
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  matched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  conversation_started BOOLEAN DEFAULT false,
  first_message_by UUID REFERENCES public.profiles(id),
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  location_id TEXT,
  
  UNIQUE(user1_id, user2_id)
);

-- Enable RLS
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- RLS Policies for matches
CREATE POLICY "Users can view their own matches"
  ON public.matches FOR SELECT
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "System can create matches"
  ON public.matches FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own matches"
  ON public.matches FOR UPDATE
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- ============================================
-- MESSAGES TABLE
-- ============================================
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT,
  type TEXT NOT NULL CHECK (type IN ('text', 'wave')) DEFAULT 'text',
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their matches"
  ON public.messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages in their matches"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own messages"
  ON public.messages FOR UPDATE
  USING (auth.uid() = receiver_id);

-- ============================================
-- STORAGE BUCKETS
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
CREATE POLICY "Anyone can view profile photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile-photos');

CREATE POLICY "Users can upload their own photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'profile-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own photos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'profile-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'profile-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, phone_number)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.phone
  );
  RETURN NEW;
END;
$$;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger for profiles updated_at
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- INDEXES
-- ============================================

-- Profiles indexes
CREATE INDEX idx_profiles_current_check_in ON public.profiles USING GIN (current_check_in);
CREATE INDEX idx_profiles_intentions ON public.profiles USING GIN (intentions);
CREATE INDEX idx_profiles_age ON public.profiles(age);
CREATE INDEX idx_profiles_gender ON public.profiles(gender);

-- Locations indexes
CREATE INDEX idx_locations_location_id ON public.locations(location_id);
CREATE INDEX idx_locations_active_users ON public.locations(active_users_count) WHERE active_users_count > 0;

-- Likes indexes
CREATE INDEX idx_likes_from_user ON public.likes(from_user_id);
CREATE INDEX idx_likes_to_user ON public.likes(to_user_id);
CREATE INDEX idx_likes_match ON public.likes(is_match) WHERE is_match = true;

-- Matches indexes
CREATE INDEX idx_matches_user1 ON public.matches(user1_id, last_activity DESC);
CREATE INDEX idx_matches_user2 ON public.matches(user2_id, last_activity DESC);

-- Messages indexes
CREATE INDEX idx_messages_match ON public.messages(match_id, sent_at DESC);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_messages_unread ON public.messages(receiver_id, read_at) WHERE read_at IS NULL;
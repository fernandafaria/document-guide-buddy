-- Drop trigger first, then function, then recreate with proper security
DROP TRIGGER IF EXISTS validate_match_before_insert ON matches;
DROP FUNCTION IF EXISTS check_match_has_both_likes() CASCADE;

-- Create function with proper security settings
CREATE OR REPLACE FUNCTION check_match_has_both_likes()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if both likes exist
  IF NOT EXISTS (
    SELECT 1 FROM likes 
    WHERE from_user_id = NEW.user1_id 
    AND to_user_id = NEW.user2_id
  ) THEN
    RAISE EXCEPTION 'Cannot create match: user1 has not liked user2';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM likes 
    WHERE from_user_id = NEW.user2_id 
    AND to_user_id = NEW.user1_id
  ) THEN
    RAISE EXCEPTION 'Cannot create match: user2 has not liked user1';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER validate_match_before_insert
  BEFORE INSERT ON matches
  FOR EACH ROW
  EXECUTE FUNCTION check_match_has_both_likes();
-- Remove matches that don't have both corresponding likes
DELETE FROM matches m
WHERE NOT EXISTS (
  SELECT 1 FROM likes l1
  WHERE l1.from_user_id = m.user1_id 
  AND l1.to_user_id = m.user2_id
)
OR NOT EXISTS (
  SELECT 1 FROM likes l2
  WHERE l2.from_user_id = m.user2_id 
  AND l2.to_user_id = m.user1_id
);

-- Create a function to validate matches
CREATE OR REPLACE FUNCTION check_match_has_both_likes()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Create trigger to validate matches on insert
DROP TRIGGER IF EXISTS validate_match_before_insert ON matches;
CREATE TRIGGER validate_match_before_insert
  BEFORE INSERT ON matches
  FOR EACH ROW
  EXECUTE FUNCTION check_match_has_both_likes();
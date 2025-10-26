-- Remove duplicate matches keeping only the oldest one for each user pair
DELETE FROM matches
WHERE id IN (
  SELECT m1.id
  FROM matches m1
  INNER JOIN matches m2 ON (
    (m1.user1_id = m2.user1_id AND m1.user2_id = m2.user2_id) OR
    (m1.user1_id = m2.user2_id AND m1.user2_id = m2.user1_id)
  )
  WHERE m1.id > m2.id
);

-- Add unique constraint to prevent duplicate matches between the same two users
CREATE UNIQUE INDEX unique_match_users 
ON matches (LEAST(user1_id, user2_id), GREATEST(user1_id, user2_id));
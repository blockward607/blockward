
-- Ensure class_invitations table has proper structure and constraints
ALTER TABLE class_invitations 
ALTER COLUMN invitation_token SET DEFAULT upper(substr(md5(random()::text), 1, 6));

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_class_invitations_token 
ON class_invitations(invitation_token) 
WHERE status = 'pending';

-- Update existing invitations to use 6-character uppercase codes
UPDATE class_invitations 
SET invitation_token = upper(substr(md5(random()::text), 1, 6))
WHERE length(invitation_token) != 6 OR invitation_token != upper(invitation_token);

-- Add a function to generate standardized codes
CREATE OR REPLACE FUNCTION generate_invitation_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Update the default to use the new function
ALTER TABLE class_invitations 
ALTER COLUMN invitation_token SET DEFAULT generate_invitation_code();

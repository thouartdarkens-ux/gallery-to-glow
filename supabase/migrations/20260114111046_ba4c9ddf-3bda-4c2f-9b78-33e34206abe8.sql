-- Function to update referrals_count for all users based on waitlist referral codes
CREATE OR REPLACE FUNCTION public.update_user_referrals_count()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE users u
  SET referrals_count = (
    SELECT COUNT(*)
    FROM waitlist w
    WHERE w.referral_code = u.reference_code
  )
  WHERE u.reference_code IS NOT NULL;
END;
$$;

-- Trigger function to automatically update referrals_count when a new waitlist entry is added
CREATE OR REPLACE FUNCTION public.trigger_update_referrals_on_waitlist_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.referral_code IS NOT NULL THEN
    UPDATE users
    SET referrals_count = referrals_count + 1
    WHERE reference_code = NEW.referral_code;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger on waitlist table
DROP TRIGGER IF EXISTS on_waitlist_insert_update_referrals ON waitlist;
CREATE TRIGGER on_waitlist_insert_update_referrals
  AFTER INSERT ON waitlist
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_update_referrals_on_waitlist_insert();
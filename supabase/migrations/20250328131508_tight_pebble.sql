/*
  # Add profile creation trigger

  1. Changes
    - Add trigger to automatically create profile records for new users
    - Set default values for all profile completion flags to false
    - Ensure profile_setup_complete is explicitly set to false

  2. Security
    - Maintains existing RLS policies
*/

-- Create the function that will create the profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    profile_setup_complete,
    assets_added,
    beneficiaries_chosen,
    last_wishes_documented,
    executor_chosen,
    will_reviewed,
    welcome_modal_shown
  ) VALUES (
    new.id,
    false,
    false,
    false,
    false,
    false,
    false,
    false
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
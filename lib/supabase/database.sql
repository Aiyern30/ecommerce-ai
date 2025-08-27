-- Drop existing functions first
DROP FUNCTION IF EXISTS promote_user_to_staff(TEXT, UUID, UUID);
DROP FUNCTION IF EXISTS demote_user_from_staff(UUID, UUID);

-- RPC function to promote user to staff by email or user ID
CREATE OR REPLACE FUNCTION promote_user_to_staff(
  admin_user_id UUID,
  user_email TEXT DEFAULT NULL,
  user_id UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id UUID;
  target_user_email TEXT;
  result JSON;
BEGIN
  -- Validate input - need either user_email or user_id
  IF user_email IS NULL AND user_id IS NULL THEN
    RETURN json_build_object('error', 'Either user_email or user_id is required');
  END IF;

  -- Find user by email or use provided user_id
  IF user_email IS NOT NULL THEN
    SELECT id, email INTO target_user_id, target_user_email
    FROM auth.users
    WHERE email = user_email;
  ELSE
    SELECT id, email INTO target_user_id, target_user_email
    FROM auth.users
    WHERE id = user_id;
  END IF;

  -- Check if user exists
  IF target_user_id IS NULL THEN
    RETURN json_build_object('error', 'User not found');
  END IF;

  -- Update the user's role to staff
  UPDATE auth.users
  SET 
    raw_app_meta_data = jsonb_set(
      jsonb_set(
        jsonb_set(
          COALESCE(raw_app_meta_data, '{}'::jsonb),
          '{role}',
          '"staff"'
        ),
        '{promoted_to_staff_at}',
        to_jsonb(NOW()::text)
      ),
      '{promoted_by}',
      to_jsonb(admin_user_id::text)
    ),
    raw_user_meta_data = jsonb_set(
      COALESCE(raw_user_meta_data, '{}'::jsonb),
      '{role}',
      '"staff"'
    ),
    updated_at = NOW()
  WHERE id = target_user_id;

  -- Return success
  RETURN json_build_object(
    'success', true,
    'user_id', target_user_id,
    'email', target_user_email,
    'new_role', 'staff',
    'promoted_at', NOW()::text,
    'promoted_by', admin_user_id::text
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('error', SQLERRM);
END;
$$;

-- RPC function to demote user from staff (revert to customer)
CREATE OR REPLACE FUNCTION demote_user_from_staff(
  admin_user_id UUID,
  user_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_email TEXT;
  result JSON;
BEGIN
  -- Check if user exists
  SELECT email INTO target_user_email
  FROM auth.users
  WHERE id = user_id;

  IF target_user_email IS NULL THEN
    RETURN json_build_object('error', 'User not found');
  END IF;

  -- Update the user's role back to customer
  UPDATE auth.users
  SET 
    raw_app_meta_data = jsonb_set(
      jsonb_set(
        jsonb_set(
          COALESCE(raw_app_meta_data, '{}'::jsonb),
          '{role}',
          '"customer"'
        ),
        '{demoted_from_staff_at}',
        to_jsonb(NOW()::text)
      ),
      '{demoted_by}',
      to_jsonb(admin_user_id::text)
    ),
    raw_user_meta_data = jsonb_set(
      COALESCE(raw_user_meta_data, '{}'::jsonb),
      '{role}',
      '"customer"'
    ),
    updated_at = NOW()
  WHERE id = user_id;

  -- Return success
  RETURN json_build_object(
    'success', true,
    'user_id', user_id,
    'email', target_user_email,
    'new_role', 'customer',
    'demoted_at', NOW()::text,
    'demoted_by', admin_user_id::text
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('error', SQLERRM);
END;
$$;

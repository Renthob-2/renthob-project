-- Helper: decide whether the current authenticated user can join a Realtime topic
CREATE OR REPLACE FUNCTION public.can_join_realtime_topic(topic text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  room_id_text text;
  room_uuid uuid;
BEGIN
  -- Must be authenticated
  IF uid IS NULL OR topic IS NULL OR length(topic) = 0 THEN
    RETURN false;
  END IF;

  -- Admins can join any topic (useful for ops/monitoring)
  IF public.has_role(uid, 'admin'::app_role) THEN
    RETURN true;
  END IF;

  -- Per-user channels: "user-<uuid>" or "user-notifications-<uuid>"
  IF topic = 'user-' || uid::text
     OR topic = 'user-notifications-' || uid::text THEN
    RETURN true;
  END IF;

  -- Chat room channels: "chat-room-<uuid>"
  IF topic LIKE 'chat-room-%' THEN
    room_id_text := substring(topic from 11); -- after "chat-room-"
    BEGIN
      room_uuid := room_id_text::uuid;
    EXCEPTION WHEN others THEN
      RETURN false;
    END;
    RETURN public.is_room_member(uid, room_uuid);
  END IF;

  -- Deny everything else by default
  RETURN false;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.can_join_realtime_topic(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_join_realtime_topic(text) TO authenticated;

-- Enable RLS on realtime.messages (the broker table for Broadcast/Presence)
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

-- Drop any prior versions of our policies so the migration is idempotent
DROP POLICY IF EXISTS "renthob_realtime_topic_read" ON realtime.messages;
DROP POLICY IF EXISTS "renthob_realtime_topic_write" ON realtime.messages;

-- Authorize SELECT (subscribe) on permitted topics only
CREATE POLICY "renthob_realtime_topic_read"
ON realtime.messages
FOR SELECT
TO authenticated
USING (public.can_join_realtime_topic(realtime.topic()));

-- Authorize INSERT (broadcast/presence send) on permitted topics only
CREATE POLICY "renthob_realtime_topic_write"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (public.can_join_realtime_topic(realtime.topic()));
-- Allow users to view profiles of other members in their shared chat rooms
CREATE POLICY "Users can view chat room member profiles"
ON public.profiles FOR SELECT TO authenticated
USING (
  user_id IN (
    SELECT crm2.user_id FROM chat_room_members crm1
    JOIN chat_room_members crm2 ON crm1.room_id = crm2.room_id
    WHERE crm1.user_id = auth.uid()
  )
);
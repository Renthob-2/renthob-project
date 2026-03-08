-- Chat rooms linked to properties
CREATE TABLE public.chat_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Chat room members with invite status
CREATE TABLE public.chat_room_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES public.chat_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  invited_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(room_id, user_id)
);

-- Chat room messages
CREATE TABLE public.chat_room_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES public.chat_rooms(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_room_messages ENABLE ROW LEVEL SECURITY;

-- Chat rooms: viewable by members (any status, so they can see pending invites)
CREATE POLICY "Members can view their rooms"
ON public.chat_rooms FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.chat_room_members
    WHERE chat_room_members.room_id = chat_rooms.id
    AND chat_room_members.user_id = auth.uid()
  )
);

-- Chat rooms: creators can also view
CREATE POLICY "Creators can view their rooms"
ON public.chat_rooms FOR SELECT TO authenticated
USING (created_by = auth.uid());

-- Chat rooms: landlords and agents can create
CREATE POLICY "Landlords and agents can create rooms"
ON public.chat_rooms FOR INSERT TO authenticated
WITH CHECK (
  created_by = auth.uid() AND
  (has_role(auth.uid(), 'landlord') OR has_role(auth.uid(), 'agent'))
);

-- Chat rooms: creators can delete
CREATE POLICY "Creators can delete rooms"
ON public.chat_rooms FOR DELETE TO authenticated
USING (created_by = auth.uid());

-- Members: users can see their own memberships
CREATE POLICY "Users can see their memberships"
ON public.chat_room_members FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Members: room members can see other members in approved rooms
CREATE POLICY "Approved members can see room members"
ON public.chat_room_members FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.chat_room_members AS my
    WHERE my.room_id = chat_room_members.room_id
    AND my.user_id = auth.uid()
    AND my.status = 'approved'
  )
);

-- Members: room creator can invite (insert)
CREATE POLICY "Room creator can invite members"
ON public.chat_room_members FOR INSERT TO authenticated
WITH CHECK (
  invited_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.chat_rooms
    WHERE chat_rooms.id = room_id
    AND chat_rooms.created_by = auth.uid()
  )
);

-- Members: users can update their own membership (accept/reject)
CREATE POLICY "Users can update their own membership"
ON public.chat_room_members FOR UPDATE TO authenticated
USING (user_id = auth.uid());

-- Messages: approved members can view messages
CREATE POLICY "Approved members can view messages"
ON public.chat_room_messages FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.chat_room_members
    WHERE chat_room_members.room_id = chat_room_messages.room_id
    AND chat_room_members.user_id = auth.uid()
    AND chat_room_members.status = 'approved'
  )
);

-- Messages: approved members can send messages
CREATE POLICY "Approved members can send messages"
ON public.chat_room_messages FOR INSERT TO authenticated
WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.chat_room_members
    WHERE chat_room_members.room_id = chat_room_messages.room_id
    AND chat_room_members.user_id = auth.uid()
    AND chat_room_members.status = 'approved'
  )
);

-- Enable realtime for chat room messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_room_messages;

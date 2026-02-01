-- Create messages table for tenant-landlord communication
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Senders can view messages they sent
CREATE POLICY "Users can view messages they sent"
ON public.messages
FOR SELECT
USING (auth.uid() = sender_id);

-- Recipients can view messages sent to them
CREATE POLICY "Users can view messages sent to them"
ON public.messages
FOR SELECT
USING (auth.uid() = recipient_id);

-- Authenticated users can send messages
CREATE POLICY "Authenticated users can send messages"
ON public.messages
FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- Recipients can update messages (mark as read)
CREATE POLICY "Recipients can update their messages"
ON public.messages
FOR UPDATE
USING (auth.uid() = recipient_id);

-- Users can delete messages they sent or received
CREATE POLICY "Users can delete their messages"
ON public.messages
FOR DELETE
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Create index for faster queries
CREATE INDEX idx_messages_recipient ON public.messages(recipient_id);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_messages_property ON public.messages(property_id);
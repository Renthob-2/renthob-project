
-- Add new property identity and lifestyle fields
ALTER TABLE public.properties 
  ADD COLUMN IF NOT EXISTS listing_purpose text NOT NULL DEFAULT 'rent',
  ADD COLUMN IF NOT EXISTS property_condition text NOT NULL DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS best_suited_for text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS work_from_home_friendly boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS car_dependent_area boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS walkable_area boolean DEFAULT false;

-- Create ID verification table
CREATE TABLE public.id_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  document_type text NOT NULL,
  document_url text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  submitted_at timestamp with time zone NOT NULL DEFAULT now(),
  reviewed_at timestamp with time zone,
  UNIQUE(user_id)
);

ALTER TABLE public.id_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can submit their own verification"
  ON public.id_verifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own verification"
  ON public.id_verifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending verification"
  ON public.id_verifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'pending');

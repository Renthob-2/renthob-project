-- Create property type enum
CREATE TYPE public.property_type AS ENUM ('apartment', 'house', 'duplex', 'studio', 'penthouse', 'villa', 'office', 'shop');

-- Create property status enum
CREATE TYPE public.property_status AS ENUM ('draft', 'pending', 'active', 'rented', 'inactive');

-- Create properties table
CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  property_type property_type NOT NULL DEFAULT 'apartment',
  status property_status NOT NULL DEFAULT 'draft',
  price NUMERIC(12, 2) NOT NULL,
  price_period TEXT NOT NULL DEFAULT 'year',
  location TEXT NOT NULL,
  address TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  bedrooms INTEGER NOT NULL DEFAULT 1,
  bathrooms INTEGER NOT NULL DEFAULT 1,
  square_feet INTEGER,
  amenities TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view active properties"
ON public.properties
FOR SELECT
USING (status = 'active');

CREATE POLICY "Owners can view all their properties"
ON public.properties
FOR SELECT
USING (auth.uid() = owner_id);

CREATE POLICY "Landlords and agents can create properties"
ON public.properties
FOR INSERT
WITH CHECK (
  auth.uid() = owner_id AND
  (public.has_role(auth.uid(), 'landlord') OR public.has_role(auth.uid(), 'agent'))
);

CREATE POLICY "Owners can update their properties"
ON public.properties
FOR UPDATE
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their properties"
ON public.properties
FOR DELETE
USING (auth.uid() = owner_id);

-- Add trigger for updated_at
CREATE TRIGGER update_properties_updated_at
BEFORE UPDATE ON public.properties
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for property images
INSERT INTO storage.buckets (id, name, public) VALUES ('property-images', 'property-images', true);

-- Storage policies for property images
CREATE POLICY "Anyone can view property images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'property-images');

CREATE POLICY "Authenticated users can upload property images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'property-images' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own property images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'property-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own property images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'property-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create tour_requests table
CREATE TABLE public.tour_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  landlord_id UUID NOT NULL,
  preferred_date DATE NOT NULL,
  preferred_time TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tour_requests ENABLE ROW LEVEL SECURITY;

-- Tenants can submit tour requests
CREATE POLICY "Tenants can submit tour requests"
ON public.tour_requests
FOR INSERT
WITH CHECK (auth.uid() = tenant_id);

-- Tenants can view their own tour requests
CREATE POLICY "Tenants can view their tour requests"
ON public.tour_requests
FOR SELECT
USING (auth.uid() = tenant_id);

-- Landlords can view tour requests for their properties
CREATE POLICY "Landlords can view tour requests"
ON public.tour_requests
FOR SELECT
USING (auth.uid() = landlord_id);

-- Landlords can update tour request status
CREATE POLICY "Landlords can update tour requests"
ON public.tour_requests
FOR UPDATE
USING (auth.uid() = landlord_id);

-- Timestamp trigger
CREATE TRIGGER update_tour_requests_updated_at
BEFORE UPDATE ON public.tour_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

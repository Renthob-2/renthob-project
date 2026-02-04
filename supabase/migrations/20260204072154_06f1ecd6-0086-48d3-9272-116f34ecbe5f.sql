-- Add display name preference and agency name to profiles table
ALTER TABLE public.profiles 
ADD COLUMN display_name_preference TEXT NOT NULL DEFAULT 'full_name' CHECK (display_name_preference IN ('full_name', 'first_initial')),
ADD COLUMN agency_name TEXT;

-- Create a table for rental applications
CREATE TABLE public.rental_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  applicant_id UUID NOT NULL,
  landlord_id UUID NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  employment_status TEXT NOT NULL,
  monthly_income TEXT,
  move_in_date DATE NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.rental_applications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for rental applications
CREATE POLICY "Applicants can view their own applications" 
ON public.rental_applications 
FOR SELECT 
USING (auth.uid() = applicant_id);

CREATE POLICY "Landlords can view applications for their properties" 
ON public.rental_applications 
FOR SELECT 
USING (auth.uid() = landlord_id);

CREATE POLICY "Authenticated users can submit applications" 
ON public.rental_applications 
FOR INSERT 
WITH CHECK (auth.uid() = applicant_id);

CREATE POLICY "Landlords can update application status" 
ON public.rental_applications 
FOR UPDATE 
USING (auth.uid() = landlord_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_rental_applications_updated_at
BEFORE UPDATE ON public.rental_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
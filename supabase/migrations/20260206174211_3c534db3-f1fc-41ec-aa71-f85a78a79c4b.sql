
-- Create tenant_profiles table for expanded profile data (lifestyle, income, budget, personality)
CREATE TABLE public.tenant_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  
  -- Lifestyle
  has_pets BOOLEAN DEFAULT false,
  pet_details TEXT,
  smoking BOOLEAN DEFAULT false,
  work_from_home TEXT DEFAULT 'no' CHECK (work_from_home IN ('no', 'sometimes', 'always')),
  exercise_frequency TEXT DEFAULT 'occasionally' CHECK (exercise_frequency IN ('never', 'occasionally', 'regularly', 'daily')),
  social_lifestyle TEXT DEFAULT 'moderate' CHECK (social_lifestyle IN ('quiet', 'moderate', 'social', 'very_social')),
  hobbies TEXT[],
  
  -- Income & Employment
  employment_type TEXT CHECK (employment_type IN ('employed', 'self_employed', 'freelancer', 'student', 'retired', 'unemployed')),
  employer_name TEXT,
  job_title TEXT,
  monthly_income_range TEXT CHECK (monthly_income_range IN ('below_100k', '100k_250k', '250k_500k', '500k_1m', '1m_2m', '2m_5m', 'above_5m')),
  income_stability TEXT DEFAULT 'stable' CHECK (income_stability IN ('variable', 'mostly_stable', 'stable', 'very_stable')),
  
  -- Budget
  max_monthly_rent NUMERIC,
  utilities_budget NUMERIC,
  willing_advance_months INTEGER DEFAULT 1,
  
  -- Personality & Living Style
  noise_tolerance TEXT DEFAULT 'moderate' CHECK (noise_tolerance IN ('very_low', 'low', 'moderate', 'high', 'very_high')),
  cleanliness_level TEXT DEFAULT 'clean' CHECK (cleanliness_level IN ('relaxed', 'average', 'clean', 'very_clean', 'spotless')),
  guest_frequency TEXT DEFAULT 'occasionally' CHECK (guest_frequency IN ('rarely', 'occasionally', 'often', 'frequently')),
  sleep_schedule TEXT DEFAULT 'normal' CHECK (sleep_schedule IN ('early_bird', 'normal', 'night_owl', 'irregular')),
  cooking_frequency TEXT DEFAULT 'regularly' CHECK (cooking_frequency IN ('rarely', 'sometimes', 'regularly', 'daily')),
  
  -- Location & Commute Preferences
  preferred_locations TEXT[],
  commute_method TEXT CHECK (commute_method IN ('car', 'public_transport', 'motorcycle', 'bicycle', 'walking', 'remote')),
  max_commute_minutes INTEGER,
  must_have_amenities TEXT[],
  
  -- About Me (free text for AI matching)
  about_me TEXT,
  ideal_neighborhood TEXT,
  dealbreakers TEXT,
  
  -- Profile completeness
  is_complete BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tenant_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Tenants can view their own profile"
  ON public.tenant_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Tenants can insert their own profile"
  ON public.tenant_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Tenants can update their own profile"
  ON public.tenant_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_tenant_profiles_updated_at
  BEFORE UPDATE ON public.tenant_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

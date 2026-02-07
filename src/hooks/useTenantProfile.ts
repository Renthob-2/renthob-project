import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface TenantProfile {
  id: string;
  user_id: string;
  has_pets: boolean;
  pet_details: string | null;
  smoking: boolean;
  work_from_home: string;
  exercise_frequency: string;
  social_lifestyle: string;
  hobbies: string[] | null;
  employment_type: string | null;
  employer_name: string | null;
  job_title: string | null;
  monthly_income_range: string | null;
  income_stability: string;
  max_monthly_rent: number | null;
  utilities_budget: number | null;
  willing_advance_months: number;
  noise_tolerance: string;
  cleanliness_level: string;
  guest_frequency: string;
  sleep_schedule: string;
  cooking_frequency: string;
  preferred_locations: string[] | null;
  commute_method: string | null;
  max_commute_minutes: number | null;
  must_have_amenities: string[] | null;
  about_me: string | null;
  ideal_neighborhood: string | null;
  dealbreakers: string | null;
  is_complete: boolean;
  created_at: string;
  updated_at: string;
}

// Fields that count towards profile completeness
const PROFILE_FIELDS: (keyof TenantProfile)[] = [
  "has_pets",
  "smoking",
  "work_from_home",
  "exercise_frequency",
  "social_lifestyle",
  "hobbies",
  "employment_type",
  "monthly_income_range",
  "income_stability",
  "max_monthly_rent",
  "utilities_budget",
  "willing_advance_months",
  "noise_tolerance",
  "cleanliness_level",
  "guest_frequency",
  "sleep_schedule",
  "cooking_frequency",
  "about_me",
  "ideal_neighborhood",
];

function calculateCompleteness(profile: TenantProfile | null): number {
  if (!profile) return 0;
  
  let filledCount = 0;
  for (const field of PROFILE_FIELDS) {
    const value = profile[field];
    if (value !== null && value !== undefined && value !== "" && 
        !(Array.isArray(value) && value.length === 0)) {
      filledCount++;
    }
  }
  
  return Math.round((filledCount / PROFILE_FIELDS.length) * 100);
}

export function useTenantProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ["tenant-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("tenant_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data as TenantProfile | null;
    },
    enabled: !!user,
  });

  const upsertProfile = useMutation({
    mutationFn: async (profileData: Partial<TenantProfile>) => {
      if (!user) throw new Error("Not authenticated");

      const existing = profileQuery.data;

      if (existing) {
        const { error } = await supabase
          .from("tenant_profiles")
          .update(profileData)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("tenant_profiles")
          .insert({ ...profileData, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-profile"] });
      toast.success("Profile updated successfully");
    },
    onError: (err) => {
      toast.error("Failed to save profile: " + (err as Error).message);
    },
  });

  const completenessPercentage = calculateCompleteness(profileQuery.data);

  return {
    tenantProfile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    isComplete: profileQuery.data?.is_complete ?? false,
    completenessPercentage,
    upsertProfile: upsertProfile.mutate,
    isSaving: upsertProfile.isPending,
  };
}

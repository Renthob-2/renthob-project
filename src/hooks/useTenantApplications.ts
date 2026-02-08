import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface TenantApplication {
  id: string;
  property_id: string;
  status: string;
  created_at: string;
  move_in_date: string;
  property?: {
    title: string;
    location: string;
    city: string;
  } | null;
}

export function useTenantApplications() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ["tenant-applications", user?.id],
    queryFn: async (): Promise<TenantApplication[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("rental_applications")
        .select("id, property_id, status, created_at, move_in_date")
        .eq("applicant_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Enrich with property info
      const enriched = await Promise.all(
        (data || []).map(async (app) => {
          const { data: property } = await supabase
            .from("properties")
            .select("title, location, city")
            .eq("id", app.property_id)
            .maybeSingle();

          return { ...app, property } as TenantApplication;
        })
      );

      return enriched;
    },
    enabled: !!user,
  });

  return {
    applications: query.data ?? [],
    isLoading: query.isLoading,
  };
}

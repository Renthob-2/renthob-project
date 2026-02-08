import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface TenantTourRequest {
  id: string;
  property_id: string;
  preferred_date: string;
  preferred_time: string;
  status: string;
  created_at: string;
  property?: {
    title: string;
    location: string;
  } | null;
}

export function useTenantTourRequests() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ["tenant-tour-requests", user?.id],
    queryFn: async (): Promise<TenantTourRequest[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("tour_requests")
        .select("id, property_id, preferred_date, preferred_time, status, created_at")
        .eq("tenant_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const enriched = await Promise.all(
        (data || []).map(async (req) => {
          const { data: property } = await supabase
            .from("properties")
            .select("title, location")
            .eq("id", req.property_id)
            .maybeSingle();

          return { ...req, property } as TenantTourRequest;
        })
      );

      return enriched;
    },
    enabled: !!user,
  });

  return {
    tourRequests: query.data ?? [],
    isLoading: query.isLoading,
  };
}

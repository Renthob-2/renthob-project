import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface TourRequest {
  id: string;
  property_id: string;
  tenant_id: string;
  landlord_id: string;
  preferred_date: string;
  preferred_time: string;
  message: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  property?: {
    title: string;
    location: string;
  } | null;
  tenant_profile?: {
    full_name: string | null;
    email: string | null;
    phone: string | null;
  } | null;
}

export function useTourRequests() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const tourRequestsQuery = useQuery({
    queryKey: ["tour-requests", user?.id],
    queryFn: async (): Promise<TourRequest[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("tour_requests")
        .select("*")
        .eq("landlord_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch related property and tenant profile data
      const enriched = await Promise.all(
        (data || []).map(async (req) => {
          const [{ data: property }, { data: profile }] = await Promise.all([
            supabase
              .from("properties")
              .select("title, location")
              .eq("id", req.property_id)
              .maybeSingle(),
            supabase
              .from("profiles")
              .select("full_name, email, phone")
              .eq("user_id", req.tenant_id)
              .maybeSingle(),
          ]);

          return {
            ...req,
            property,
            tenant_profile: profile,
          } as TourRequest;
        })
      );

      return enriched;
    },
    enabled: !!user,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      requestId,
      newStatus,
    }: {
      requestId: string;
      newStatus: string;
    }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("tour_requests")
        .update({ status: newStatus })
        .eq("id", requestId)
        .eq("landlord_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tour-requests"] });
    },
  });

  return {
    tourRequests: tourRequestsQuery.data ?? [],
    isLoading: tourRequestsQuery.isLoading,
    updateStatus: updateStatusMutation.mutate,
    isUpdating: updateStatusMutation.isPending,
  };
}

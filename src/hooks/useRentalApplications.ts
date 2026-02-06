import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface RentalApplication {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  employment_status: string;
  monthly_income: string | null;
  move_in_date: string;
  message: string | null;
  status: string;
  created_at: string;
  property_id: string;
  applicant_id: string;
  landlord_id: string;
  property?: {
    title: string;
    location: string;
  };
}

export function useRentalApplications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const applicationsQuery = useQuery({
    queryKey: ["rental-applications", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("rental_applications")
        .select(`
          *,
          property:properties(title, location)
        `)
        .eq("landlord_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as RentalApplication[];
    },
    enabled: !!user,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      applicationId,
      newStatus,
    }: {
      applicationId: string;
      newStatus: string;
    }) => {
      const { error } = await supabase
        .from("rental_applications")
        .update({ status: newStatus })
        .eq("id", applicationId);

      if (error) throw error;
    },
    onSuccess: (_, { newStatus }) => {
      queryClient.invalidateQueries({ queryKey: ["rental-applications"] });
      const label = newStatus === "approved" ? "approved" : newStatus === "rejected" ? "rejected" : "updated";
      toast.success(`Application ${label} successfully`);
    },
    onError: () => {
      toast.error("Failed to update application status");
    },
  });

  return {
    applications: applicationsQuery.data ?? [],
    isLoading: applicationsQuery.isLoading,
    error: applicationsQuery.error,
    updateStatus: updateStatusMutation.mutate,
    isUpdating: updateStatusMutation.isPending,
  };
}

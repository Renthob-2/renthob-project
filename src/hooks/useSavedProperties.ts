import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function useSavedProperties() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: savedPropertyIds = [], isLoading } = useQuery({
    queryKey: ["saved-properties", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("saved_properties")
        .select("property_id")
        .eq("user_id", user.id);
      if (error) throw error;
      return data.map((row) => row.property_id);
    },
    enabled: !!user,
  });

  const { data: savedPropertiesWithDetails = [], isLoading: isLoadingDetails } = useQuery({
    queryKey: ["saved-properties-details", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("saved_properties")
        .select("property_id, created_at, properties(id, title, location, city, state, price, price_period, images, bedrooms, bathrooms)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const saveProperty = useMutation({
    mutationFn: async (propertyId: string) => {
      if (!user) throw new Error("Must be logged in");
      const { error } = await supabase
        .from("saved_properties")
        .insert({ user_id: user.id, property_id: propertyId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-properties"] });
      queryClient.invalidateQueries({ queryKey: ["saved-properties-details"] });
      toast.success("Property saved!");
    },
    onError: () => toast.error("Failed to save property"),
  });

  const unsaveProperty = useMutation({
    mutationFn: async (propertyId: string) => {
      if (!user) throw new Error("Must be logged in");
      const { error } = await supabase
        .from("saved_properties")
        .delete()
        .eq("user_id", user.id)
        .eq("property_id", propertyId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-properties"] });
      queryClient.invalidateQueries({ queryKey: ["saved-properties-details"] });
      toast.info("Property removed from saved");
    },
    onError: () => toast.error("Failed to remove property"),
  });

  const toggleSave = (propertyId: string) => {
    if (!user) {
      toast.error("Please log in to save properties");
      return;
    }
    if (savedPropertyIds.includes(propertyId)) {
      unsaveProperty.mutate(propertyId);
    } else {
      saveProperty.mutate(propertyId);
    }
  };

  const isSaved = (propertyId: string) => savedPropertyIds.includes(propertyId);

  return {
    savedPropertyIds,
    savedPropertiesWithDetails,
    isLoading,
    isLoadingDetails,
    toggleSave,
    isSaved,
    savedCount: savedPropertyIds.length,
  };
}

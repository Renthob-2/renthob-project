import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import PropertyListingForm from "@/components/property/PropertyListingForm";
import { Loader2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Property = Database["public"]["Tables"]["properties"]["Row"];

export default function EditPropertyPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && user) {
      fetchProperty();
    }
  }, [id, user]);

  const fetchProperty = async () => {
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", id)
        .eq("owner_id", user?.id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast({
          title: "Property not found",
          description: "The property you're looking for doesn't exist or you don't have permission to edit it.",
          variant: "destructive",
        });
        navigate("/my-properties");
        return;
      }

      setProperty(data);
    } catch (error: any) {
      console.error("Error fetching property:", error);
      toast({
        title: "Error loading property",
        description: error.message,
        variant: "destructive",
      });
      navigate("/my-properties");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!property) {
    return null;
  }

  return <PropertyListingForm property={property} isEditing />;
}

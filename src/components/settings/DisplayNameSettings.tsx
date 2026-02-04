import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save } from "lucide-react";

type DisplayNamePreference = "full_name" | "first_initial";

export function DisplayNameSettings() {
  const { user, profile, role } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [displayNamePreference, setDisplayNamePreference] = useState<DisplayNamePreference>("full_name");
  const [agencyName, setAgencyName] = useState("");

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("display_name_preference, agency_name")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setDisplayNamePreference((data.display_name_preference as DisplayNamePreference) || "full_name");
        setAgencyName(data.agency_name || "");
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name_preference: displayNamePreference,
          agency_name: agencyName || null,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Settings saved",
        description: "Your display preferences have been updated.",
      });
    } catch (error: any) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save settings.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Format the display name preview
  const getDisplayNamePreview = () => {
    const fullName = profile?.full_name || "John Doe";
    if (displayNamePreference === "first_initial") {
      const parts = fullName.split(" ");
      if (parts.length > 1) {
        return `${parts[0]} ${parts[parts.length - 1][0]}.`;
      }
      return fullName;
    }
    return fullName;
  };

  if (role !== "landlord" && role !== "agent") {
    return null;
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Display Settings</CardTitle>
        <CardDescription>
          Choose how your name appears on listings and when messaging clients
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label className="text-base">Display Name Format</Label>
          <RadioGroup
            value={displayNamePreference}
            onValueChange={(value) => setDisplayNamePreference(value as DisplayNamePreference)}
            className="space-y-3"
          >
            <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
              <RadioGroupItem value="full_name" id="full_name" />
              <Label htmlFor="full_name" className="flex-1 cursor-pointer">
                <span className="font-medium">Full Name</span>
                <p className="text-sm text-muted-foreground">
                  Show your complete name (e.g., "{profile?.full_name || "John Doe"}")
                </p>
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
              <RadioGroupItem value="first_initial" id="first_initial" />
              <Label htmlFor="first_initial" className="flex-1 cursor-pointer">
                <span className="font-medium">First Name & Last Initial</span>
                <p className="text-sm text-muted-foreground">
                  Show first name with last initial (e.g., "{getDisplayNamePreview()}")
                </p>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {role === "agent" && (
          <div className="space-y-2">
            <Label htmlFor="agency_name">Agency Name</Label>
            <Input
              id="agency_name"
              placeholder="e.g., Prime Realty Nigeria"
              value={agencyName}
              onChange={(e) => setAgencyName(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Your agency name will appear above your name on property listings
            </p>
          </div>
        )}

        <div className="p-4 rounded-lg bg-muted/50 border">
          <p className="text-sm text-muted-foreground mb-1">Preview</p>
          <div className="space-y-1">
            {role === "agent" && agencyName && (
              <p className="text-sm font-medium text-primary">{agencyName}</p>
            )}
            <p className="font-medium">{getDisplayNamePreview()}</p>
            <p className="text-sm text-muted-foreground">
              {role === "agent" ? "Real Estate Agent" : "Property Owner"}
            </p>
          </div>
        </div>

        <Button onClick={handleSave} disabled={isSaving} className="w-full">
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface NotificationPreferences {
  new_application: boolean;
  application_status: boolean;
  new_tour_request: boolean;
  tour_status: boolean;
  commission_earned: boolean;
  withdrawal_status: boolean;
  sound_enabled: boolean;
  browser_notifications: boolean;
}

const defaults: NotificationPreferences = {
  new_application: true,
  application_status: true,
  new_tour_request: true,
  tour_status: true,
  commission_earned: true,
  withdrawal_status: true,
  sound_enabled: true,
  browser_notifications: true,
};

export function useNotificationPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchPreferences = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      const { id, user_id, created_at, updated_at, ...prefs } = data as any;
      setPreferences(prefs as NotificationPreferences);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const updatePreference = useCallback(
    async (key: keyof NotificationPreferences, value: boolean) => {
      if (!user) return;
      setSaving(true);
      setPreferences((prev) => ({ ...prev, [key]: value }));

      const { error } = await supabase
        .from("notification_preferences")
        .upsert(
          { user_id: user.id, [key]: value } as any,
          { onConflict: "user_id" }
        );

      if (error) {
        toast.error("Failed to save preference");
        setPreferences((prev) => ({ ...prev, [key]: !value }));
      }
      setSaving(false);
    },
    [user]
  );

  return { preferences, loading, saving, updatePreference };
}

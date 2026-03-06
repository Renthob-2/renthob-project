import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export function useAdminActions() {
  const { user } = useAuth();
  const { toast } = useToast();

  const logAction = async (action: string, targetType: string, targetId: string, details?: string) => {
    if (!user) return;
    await supabase.from("admin_activity_log").insert({
      admin_id: user.id,
      action,
      target_type: targetType,
      target_id: targetId,
      details,
    } as any);
  };

  const suspendUser = async (userId: string, reason: string, userName?: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_suspended: true, suspension_reason: reason } as any)
      .eq("user_id", userId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return false;
    }
    await logAction("suspend", "user", userId, `Suspended ${userName || userId}: ${reason}`);
    toast({ title: "User Suspended", description: `${userName || "User"} has been suspended.` });
    return true;
  };

  const unsuspendUser = async (userId: string, userName?: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_suspended: false, suspension_reason: null } as any)
      .eq("user_id", userId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return false;
    }
    await logAction("unsuspend", "user", userId, `Unsuspended ${userName || userId}`);
    toast({ title: "User Unsuspended", description: `${userName || "User"} has been unsuspended.` });
    return true;
  };

  return { suspendUser, unsuspendUser, logAction };
}

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, Loader2, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Requested = "landlord" | "agent";

interface RoleRequestRow {
  id: string;
  requested_role: Requested;
  status: string;
  review_note: string | null;
  created_at: string;
}

export function RoleRequestCard() {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const [pending, setPending] = useState<RoleRequestRow | null>(null);
  const [history, setHistory] = useState<RoleRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<Requested | null>(null);

  const load = useCallback(async () => {
    if (!user) {
      setPending(null);
      setHistory([]);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("role_requests")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    const rows = (data || []) as RoleRequestRow[];
    setPending(rows.find((r) => r.status === "pending") || null);
    setHistory(rows);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  // Hide for users who are already landlord / agent / admin
  if (role === "landlord" || role === "agent" || role === "admin") return null;

  const submit = async (requested: Requested) => {
    if (!user) return;
    setSubmitting(requested);
    const { error } = await supabase
      .from("role_requests")
      .insert({ user_id: user.id, requested_role: requested } as any);
    setSubmitting(null);
    if (error) {
      toast({ title: "Could not submit request", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Request submitted", description: "An admin will review your request shortly." });
    void load();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Request a Role Upgrade
        </CardTitle>
        <CardDescription>
          {role
            ? "Apply to become a Landlord or Agent. An admin will review your request."
            : "You don't have a role yet. Request one below to start using the platform."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : pending ? (
          <div className="rounded-lg border bg-muted/40 p-4 space-y-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
              <span className="font-medium capitalize">{pending.requested_role}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Submitted {new Date(pending.created_at).toLocaleDateString()}. Awaiting admin review.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
              onClick={() => submit("landlord")}
              disabled={submitting !== null}
            >
              {submitting === "landlord" ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Building2 className="h-5 w-5 text-primary" />
              )}
              <div className="text-center">
                <div className="font-medium">Become a Landlord</div>
                <div className="text-xs text-muted-foreground">List and manage properties</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
              onClick={() => submit("agent")}
              disabled={submitting !== null}
            >
              {submitting === "agent" ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Users className="h-5 w-5 text-primary" />
              )}
              <div className="text-center">
                <div className="font-medium">Become an Agent</div>
                <div className="text-xs text-muted-foreground">Help clients find homes</div>
              </div>
            </Button>
          </div>
        )}

        {history.filter((h) => h.status !== "pending").length > 0 && (
          <div className="space-y-2 pt-2">
            <p className="text-xs font-medium text-muted-foreground">Previous requests</p>
            {history
              .filter((h) => h.status !== "pending")
              .slice(0, 3)
              .map((h) => (
                <div key={h.id} className="flex items-center justify-between text-xs rounded-md border p-2">
                  <span className="capitalize">{h.requested_role}</span>
                  <Badge
                    className={
                      h.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }
                  >
                    {h.status}
                  </Badge>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

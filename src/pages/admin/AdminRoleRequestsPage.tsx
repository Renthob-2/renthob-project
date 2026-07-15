import { useCallback, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shield, Search, CheckCircle, X, Clock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAdminActions } from "@/hooks/useAdminActions";

interface RoleRequest {
  id: string;
  user_id: string;
  requested_role: string;
  status: string;
  review_note: string | null;
  created_at: string;
  reviewed_at: string | null;
  // joined from profiles
  full_name: string | null;
  email: string | null;
}

const statusBadge: Record<string, { class: string; label: string }> = {
  pending: { class: "bg-yellow-100 text-yellow-800", label: "Pending" },
  approved: { class: "bg-green-100 text-green-800", label: "Approved" },
  rejected: { class: "bg-red-100 text-red-800", label: "Rejected" },
};

const roleBadge: Record<string, string> = {
  landlord: "bg-green-100 text-green-800",
  agent: "bg-purple-100 text-purple-800",
};

export default function AdminRoleRequestsPage() {
  const { toast } = useToast();
  const { logAction } = useAdminActions();
  const [requests, setRequests] = useState<RoleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [rejectDialog, setRejectDialog] = useState<RoleRequest | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    // Fetch role requests
    const { data: reqData, error: reqError } = await supabase
      .from("role_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (reqError) {
      toast({ title: "Error", description: reqError.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    if (!reqData || reqData.length === 0) {
      setRequests([]);
      setLoading(false);
      return;
    }

    // Fetch associated profiles
    const userIds = [...new Set(reqData.map((r: any) => r.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name, email")
      .in("user_id", userIds);

    const profileMap = new Map(
      (profiles || []).map((p) => [p.user_id, p])
    );

    const merged = reqData.map((r: any) => ({
      ...r,
      full_name: profileMap.get(r.user_id)?.full_name || null,
      email: profileMap.get(r.user_id)?.email || null,
    }));

    setRequests(merged);
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    void fetchRequests();
  }, [fetchRequests]);

  const handleApprove = async (req: RoleRequest) => {
    setProcessing(req.id);
    const { error } = await supabase.rpc("approve_role_request", {
      request_id: req.id,
      admin_note: null,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      await logAction(
        "approve_role_request",
        "user",
        req.user_id,
        `Approved ${req.full_name || req.user_id} upgrade to ${req.requested_role}`
      );
      toast({
        title: "Role Approved",
        description: `${req.full_name || "User"} is now a ${req.requested_role}.`,
      });
      void fetchRequests();
    }
    setProcessing(null);
  };

  const handleReject = async () => {
    if (!rejectDialog) return;
    setProcessing(rejectDialog.id);
    const { error } = await supabase.rpc("reject_role_request", {
      request_id: rejectDialog.id,
      admin_note: rejectNote || null,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      await logAction(
        "reject_role_request",
        "user",
        rejectDialog.user_id,
        `Rejected ${rejectDialog.full_name || rejectDialog.user_id} request for ${rejectDialog.requested_role}: ${rejectNote || "No reason"}`
      );
      toast({
        title: "Request Rejected",
        description: `Role request from ${rejectDialog.full_name || "user"} was rejected.`,
      });
      fetchRequests();
    }
    setRejectDialog(null);
    setRejectNote("");
    setProcessing(null);
  };

  const filtered = requests.filter((r) => {
    const matchesSearch =
      !search ||
      r.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.email?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-1">Role Requests</h2>
        <p className="text-muted-foreground">
          Review and manage role upgrade requests from users
          {pendingCount > 0 && (
            <Badge className="ml-2 bg-yellow-100 text-yellow-800">{pendingCount} pending</Badge>
          )}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Role Upgrade Requests ({filtered.length})
          </CardTitle>
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {statusFilter === "pending" ? "No pending role requests." : "No role requests found."}
            </p>
          ) : (
            <div className="space-y-3">
              {filtered.map((req) => (
                <div
                  key={req.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/30 transition-colors gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-primary">
                        {req.full_name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2) || "U"}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{req.full_name || "No Name"}</p>
                      <p className="text-sm text-muted-foreground">{req.email || "No email"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={roleBadge[req.requested_role] || "bg-muted"}>
                      → {req.requested_role}
                    </Badge>
                    <Badge className={statusBadge[req.status]?.class || "bg-muted"}>
                      {statusBadge[req.status]?.label || req.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(req.created_at).toLocaleDateString()}
                    </span>

                    {req.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(req)}
                          disabled={processing === req.id}
                        >
                          {processing === req.id ? (
                            <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                          ) : (
                            <CheckCircle className="h-3.5 w-3.5 mr-1" />
                          )}
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setRejectDialog(req)}
                          disabled={processing === req.id}
                        >
                          <X className="h-3.5 w-3.5 mr-1" /> Reject
                        </Button>
                      </>
                    )}

                    {req.review_note && (
                      <span className="text-xs text-muted-foreground italic">
                        Note: {req.review_note}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={!!rejectDialog} onOpenChange={(open) => !open && setRejectDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Role Request</DialogTitle>
            <DialogDescription>
              Reject {rejectDialog?.full_name || "this user"}'s request to become a{" "}
              {rejectDialog?.requested_role}?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Reason (optional)</Label>
            <Textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="Reason for rejection..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Confirm Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

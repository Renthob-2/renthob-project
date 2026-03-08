import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { UserCheck, Search, Check, X, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminActions } from "@/hooks/useAdminActions";
import { useToast } from "@/hooks/use-toast";
import type { AdminDataContext } from "@/types/admin";

const roleBadgeClass: Record<string, string> = {
  tenant: "bg-blue-100 text-blue-800",
  landlord: "bg-green-100 text-green-800",
  agent: "bg-purple-100 text-purple-800",
  admin: "bg-red-100 text-red-800",
};

export default function AdminApprovalsPage() {
  const { users, refetch } = useOutletContext<AdminDataContext>();
  const { logAction } = useAdminActions();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [viewFilter, setViewFilter] = useState<"pending" | "all">("pending");
  const [rejectDialog, setRejectDialog] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const pendingUsers = users.filter(u => !(u as any).is_approved);
  const approvedUsers = users.filter(u => (u as any).is_approved);

  const displayUsers = viewFilter === "pending" ? pendingUsers : users;

  const filtered = displayUsers.filter(u => {
    const matchesSearch =
      !search ||
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleApprove = async (userId: string, name?: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_approved: true } as any)
      .eq("user_id", userId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    await logAction("approve_user", "user", userId, `Approved ${name || userId}`);
    toast({ title: "User Approved", description: `${name || "User"} has been approved.` });
    refetch();
  };

  const handleReject = async () => {
    if (!rejectDialog) return;
    const user = users.find(u => u.user_id === rejectDialog);
    // For now, rejecting just keeps them unapproved and suspends them
    const { error } = await supabase
      .from("profiles")
      .update({ is_suspended: true, suspension_reason: rejectReason || "Signup rejected" } as any)
      .eq("user_id", rejectDialog);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    await logAction("reject_user", "user", rejectDialog, `Rejected ${user?.full_name || rejectDialog}: ${rejectReason}`);
    toast({ title: "User Rejected", description: `${user?.full_name || "User"} has been rejected.` });
    setRejectDialog(null);
    setRejectReason("");
    refetch();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-1">User Approvals</h2>
        <p className="text-muted-foreground">Approve or reject new user signups</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setViewFilter("pending")}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Pending Approval</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingUsers.length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600 opacity-30" />
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setViewFilter("all")}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Approved Users</p>
                <p className="text-2xl font-bold text-green-600">{approvedUsers.length}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600 opacity-30" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Role" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="tenant">Tenant</SelectItem>
            <SelectItem value="landlord">Landlord</SelectItem>
            <SelectItem value="agent">Agent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* User List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary" />
            {viewFilter === "pending" ? "Pending Approvals" : "All Users"} ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {viewFilter === "pending" ? "No pending approvals — all caught up! 🎉" : "No users found."}
            </p>
          ) : (
            <div className="space-y-3">
              {filtered.map((user) => (
                <div key={user.user_id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/30 transition-colors gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-primary">
                        {user.full_name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U"}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{user.full_name || "No Name"}</p>
                        {!(user as any).is_approved && (
                          <Badge className="bg-yellow-100 text-yellow-800 text-[10px]">Pending</Badge>
                        )}
                        {user.is_suspended && (
                          <Badge variant="destructive" className="text-[10px]">Suspended</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{user.email || "No email"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={roleBadgeClass[user.role] || "bg-muted text-muted-foreground"}>
                      {user.role}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </span>
                    {!(user as any).is_approved && !user.is_suspended && (
                      <>
                        <Button size="sm" onClick={() => handleApprove(user.user_id, user.full_name || undefined)}>
                          <Check className="h-3.5 w-3.5 mr-1" /> Approve
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => setRejectDialog(user.user_id)}>
                          <X className="h-3.5 w-3.5 mr-1" /> Reject
                        </Button>
                      </>
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
            <DialogTitle>Reject User Signup</DialogTitle>
            <DialogDescription>
              This user will be suspended and unable to access the platform.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Reason (optional)</Label>
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject}>Confirm Reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

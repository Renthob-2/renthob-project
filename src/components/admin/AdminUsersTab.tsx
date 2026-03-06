import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Users, Search, Ban, CheckCircle } from "lucide-react";
import { useAdminActions } from "@/hooks/useAdminActions";
import type { AdminUser } from "@/hooks/useAdminData";

interface AdminUsersTabProps {
  users: AdminUser[];
  onRefresh: () => void;
}

const roleBadgeClass: Record<string, string> = {
  tenant: "bg-blue-100 text-blue-800",
  landlord: "bg-green-100 text-green-800",
  agent: "bg-purple-100 text-purple-800",
  admin: "bg-red-100 text-red-800",
};

export function AdminUsersTab({ users, onRefresh }: AdminUsersTabProps) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [suspendDialog, setSuspendDialog] = useState<AdminUser | null>(null);
  const [suspendReason, setSuspendReason] = useState("");
  const { suspendUser, unsuspendUser } = useAdminActions();

  const filtered = users.filter((u) => {
    const matchesSearch =
      !search ||
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleSuspend = async () => {
    if (!suspendDialog) return;
    const ok = await suspendUser(suspendDialog.user_id, suspendReason, suspendDialog.full_name || undefined);
    if (ok) {
      setSuspendDialog(null);
      setSuspendReason("");
      onRefresh();
    }
  };

  const handleUnsuspend = async (user: AdminUser) => {
    const ok = await unsuspendUser(user.user_id, user.full_name || undefined);
    if (ok) onRefresh();
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            User Management ({users.length})
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
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="tenant">Tenant</SelectItem>
                <SelectItem value="landlord">Landlord</SelectItem>
                <SelectItem value="agent">Agent</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No users found.</p>
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
                        {(user as any).is_suspended && (
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
                    {user.role !== "admin" && (
                      (user as any).is_suspended ? (
                        <Button variant="outline" size="sm" onClick={() => handleUnsuspend(user)}>
                          <CheckCircle className="h-3.5 w-3.5 mr-1" /> Unsuspend
                        </Button>
                      ) : (
                        <Button variant="destructive" size="sm" onClick={() => setSuspendDialog(user)}>
                          <Ban className="h-3.5 w-3.5 mr-1" /> Suspend
                        </Button>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!suspendDialog} onOpenChange={(open) => !open && setSuspendDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend User</DialogTitle>
            <DialogDescription>
              Suspend {suspendDialog?.full_name || "this user"}? They will not be able to access the platform.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Reason</Label>
            <Textarea
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              placeholder="Reason for suspension..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendDialog(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleSuspend} disabled={!suspendReason.trim()}>
              Confirm Suspend
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

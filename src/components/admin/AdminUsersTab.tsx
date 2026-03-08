import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Users, Search, Ban, CheckCircle, Send, Eye, UserCheck, X, ShieldAlert, ArrowUpDown } from "lucide-react";
import { useAdminActions } from "@/hooks/useAdminActions";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
  const { user } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Dialogs
  const [suspendDialog, setSuspendDialog] = useState<AdminUser | null>(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [messageDialog, setMessageDialog] = useState<AdminUser | null>(null);
  const [messageSubject, setMessageSubject] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [detailDialog, setDetailDialog] = useState<AdminUser | null>(null);
  const [roleDialog, setRoleDialog] = useState<AdminUser | null>(null);
  const [newRole, setNewRole] = useState("");

  const { suspendUser, unsuspendUser, logAction } = useAdminActions();

  const filtered = users.filter((u) => {
    const matchesSearch =
      !search ||
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "suspended" && u.is_suspended) ||
      (statusFilter === "pending" && !u.is_approved) ||
      (statusFilter === "active" && !u.is_suspended && u.is_approved);
    return matchesSearch && matchesRole && matchesStatus;
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

  const handleUnsuspend = async (u: AdminUser) => {
    const ok = await unsuspendUser(u.user_id, u.full_name || undefined);
    if (ok) onRefresh();
  };

  const handleApprove = async (u: AdminUser) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_approved: true } as any)
      .eq("user_id", u.user_id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    await logAction("approve_user", "user", u.user_id, `Approved ${u.full_name || u.user_id}`);
    toast({ title: "User Approved", description: `${u.full_name || "User"} has been approved.` });
    onRefresh();
  };

  const handleSendMessage = async () => {
    if (!messageDialog || !user || !messageSubject.trim() || !messageBody.trim()) return;
    const { error } = await supabase.from("messages").insert({
      sender_id: user.id,
      recipient_id: messageDialog.user_id,
      subject: messageSubject,
      message: messageBody,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    await logAction("send_message", "user", messageDialog.user_id, `Sent message to ${messageDialog.full_name || messageDialog.user_id}: ${messageSubject}`);
    toast({ title: "Message Sent", description: `Message sent to ${messageDialog.full_name || "user"}.` });
    setMessageDialog(null);
    setMessageSubject("");
    setMessageBody("");
  };

  const handleChangeRole = async () => {
    if (!roleDialog || !newRole) return;
    const { error } = await supabase
      .from("user_roles")
      .update({ role: newRole } as any)
      .eq("user_id", roleDialog.user_id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    await logAction("change_role", "user", roleDialog.user_id, `Changed ${roleDialog.full_name || roleDialog.user_id} role to ${newRole}`);
    toast({ title: "Role Updated", description: `${roleDialog.full_name || "User"} is now a ${newRole}.` });
    setRoleDialog(null);
    setNewRole("");
    onRefresh();
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No users found.</p>
          ) : (
            <div className="space-y-3">
              {filtered.map((u) => (
                <div key={u.user_id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/30 transition-colors gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-primary">
                        {u.full_name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U"}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium">{u.full_name || "No Name"}</p>
                        {u.is_suspended && (
                          <Badge variant="destructive" className="text-[10px]">Suspended</Badge>
                        )}
                        {!u.is_approved && (
                          <Badge className="bg-yellow-100 text-yellow-800 text-[10px]">Pending Approval</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{u.email || "No email"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={roleBadgeClass[u.role] || "bg-muted text-muted-foreground"}>
                      {u.role}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(u.created_at).toLocaleDateString()}
                    </span>

                    {/* View Details */}
                    <Button variant="outline" size="sm" onClick={() => setDetailDialog(u)}>
                      <Eye className="h-3.5 w-3.5 mr-1" /> View
                    </Button>

                    {/* Send Message */}
                    <Button variant="outline" size="sm" onClick={() => setMessageDialog(u)}>
                      <Send className="h-3.5 w-3.5 mr-1" /> Message
                    </Button>

                    {u.role !== "admin" && (
                      <>
                        {/* Approve if pending */}
                        {!u.is_approved && !u.is_suspended && (
                          <Button size="sm" onClick={() => handleApprove(u)}>
                            <UserCheck className="h-3.5 w-3.5 mr-1" /> Approve
                          </Button>
                        )}

                        {/* Change Role */}
                        <Button variant="outline" size="sm" onClick={() => { setRoleDialog(u); setNewRole(u.role); }}>
                          <ArrowUpDown className="h-3.5 w-3.5 mr-1" /> Role
                        </Button>

                        {/* Suspend / Unsuspend */}
                        {u.is_suspended ? (
                          <Button variant="outline" size="sm" onClick={() => handleUnsuspend(u)}>
                            <CheckCircle className="h-3.5 w-3.5 mr-1" /> Unsuspend
                          </Button>
                        ) : (
                          <Button variant="destructive" size="sm" onClick={() => setSuspendDialog(u)}>
                            <Ban className="h-3.5 w-3.5 mr-1" /> Suspend
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Suspend Dialog */}
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

      {/* Send Message Dialog */}
      <Dialog open={!!messageDialog} onOpenChange={(open) => !open && setMessageDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Direct Notification</DialogTitle>
            <DialogDescription>
              Send a direct message to {messageDialog?.full_name || "this user"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input
                value={messageSubject}
                onChange={(e) => setMessageSubject(e.target.value)}
                placeholder="Message subject..."
              />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                placeholder="Write your notification message..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMessageDialog(null)}>Cancel</Button>
            <Button onClick={handleSendMessage} disabled={!messageSubject.trim() || !messageBody.trim()}>
              <Send className="h-4 w-4 mr-1" /> Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Detail Dialog */}
      <Dialog open={!!detailDialog} onOpenChange={(open) => !open && setDetailDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {detailDialog && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">
                    {detailDialog.full_name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U"}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{detailDialog.full_name || "No Name"}</h3>
                  <p className="text-sm text-muted-foreground">{detailDialog.email || "No email"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Role</p>
                  <Badge className={roleBadgeClass[detailDialog.role] || "bg-muted"}>{detailDialog.role}</Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  {detailDialog.is_suspended ? (
                    <Badge variant="destructive">Suspended</Badge>
                  ) : !detailDialog.is_approved ? (
                    <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                  ) : (
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  )}
                </div>
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium">{detailDialog.phone || "N/A"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Joined</p>
                  <p className="font-medium">{new Date(detailDialog.created_at).toLocaleDateString()}</p>
                </div>
                {detailDialog.suspension_reason && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Suspension Reason</p>
                    <p className="font-medium text-destructive">{detailDialog.suspension_reason}</p>
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-2 flex-wrap">
                <Button size="sm" variant="outline" onClick={() => { setDetailDialog(null); setMessageDialog(detailDialog); }}>
                  <Send className="h-3.5 w-3.5 mr-1" /> Send Message
                </Button>
                {detailDialog.role !== "admin" && (
                  <>
                    {!detailDialog.is_approved && !detailDialog.is_suspended && (
                      <Button size="sm" onClick={() => { handleApprove(detailDialog); setDetailDialog(null); }}>
                        <UserCheck className="h-3.5 w-3.5 mr-1" /> Approve
                      </Button>
                    )}
                    {detailDialog.is_suspended ? (
                      <Button size="sm" variant="outline" onClick={() => { handleUnsuspend(detailDialog); setDetailDialog(null); }}>
                        <CheckCircle className="h-3.5 w-3.5 mr-1" /> Unsuspend
                      </Button>
                    ) : (
                      <Button size="sm" variant="destructive" onClick={() => { setDetailDialog(null); setSuspendDialog(detailDialog); }}>
                        <Ban className="h-3.5 w-3.5 mr-1" /> Suspend
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Change Role Dialog */}
      <Dialog open={!!roleDialog} onOpenChange={(open) => !open && setRoleDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Change role for {roleDialog?.full_name || "this user"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>New Role</Label>
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="tenant">Tenant</SelectItem>
                <SelectItem value="landlord">Landlord</SelectItem>
                <SelectItem value="agent">Agent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialog(null)}>Cancel</Button>
            <Button onClick={handleChangeRole} disabled={!newRole || newRole === roleDialog?.role}>
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

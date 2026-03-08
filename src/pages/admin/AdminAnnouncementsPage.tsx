import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Megaphone, Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useAdminActions } from "@/hooks/useAdminActions";

interface Announcement {
  id: string;
  admin_id: string;
  title: string;
  message: string;
  target_role: string;
  is_active: boolean;
  created_at: string;
}

export default function AdminAnnouncementsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { logAction } = useAdminActions();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", message: "", target_role: "all" });

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });
    setAnnouncements((data as Announcement[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAnnouncements(); }, [fetchAnnouncements]);

  const resetForm = () => {
    setForm({ title: "", message: "", target_role: "all" });
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!user || !form.title.trim() || !form.message.trim()) return;

    if (editingId) {
      const { error } = await supabase
        .from("announcements")
        .update({ title: form.title, message: form.message, target_role: form.target_role } as any)
        .eq("id", editingId);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        return;
      }
      await logAction("update_announcement", "announcement", editingId, `Updated: ${form.title}`);
      toast({ title: "Updated", description: "Announcement updated successfully." });
    } else {
      const { error } = await supabase
        .from("announcements")
        .insert({
          admin_id: user.id,
          title: form.title,
          message: form.message,
          target_role: form.target_role,
        } as any);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        return;
      }
      await logAction("create_announcement", "announcement", "new", `Created: ${form.title}`);
      toast({ title: "Published", description: "Announcement published successfully." });
    }

    resetForm();
    setDialogOpen(false);
    fetchAnnouncements();
  };

  const handleToggleActive = async (ann: Announcement) => {
    const { error } = await supabase
      .from("announcements")
      .update({ is_active: !ann.is_active } as any)
      .eq("id", ann.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: ann.is_active ? "Deactivated" : "Activated" });
    fetchAnnouncements();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    await logAction("delete_announcement", "announcement", id, "Deleted announcement");
    toast({ title: "Deleted", description: "Announcement deleted." });
    fetchAnnouncements();
  };

  const handleEdit = (ann: Announcement) => {
    setForm({ title: ann.title, message: ann.message, target_role: ann.target_role });
    setEditingId(ann.id);
    setDialogOpen(true);
  };

  const roleLabel = (role: string) => {
    switch (role) {
      case "all": return "Everyone";
      case "tenant": return "Tenants";
      case "landlord": return "Landlords";
      case "agent": return "Agents";
      default: return role;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-1">Announcements</h2>
          <p className="text-muted-foreground">Send announcements and notifications to users</p>
        </div>
        <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> New Announcement
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary" />
            All Announcements ({announcements.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : announcements.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No announcements yet. Create your first one!</p>
          ) : (
            <div className="space-y-4">
              {announcements.map((ann) => (
                <div key={ann.id} className={`p-4 rounded-lg border transition-colors ${ann.is_active ? "bg-card" : "bg-muted/50 opacity-60"}`}>
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{ann.title}</h4>
                        {ann.is_active ? (
                          <Badge className="bg-green-100 text-green-800 text-[10px]">Active</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px]">Inactive</Badge>
                        )}
                        <Badge variant="outline" className="text-[10px]">{roleLabel(ann.target_role)}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{ann.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Published {new Date(ann.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" onClick={() => handleToggleActive(ann)}>
                        {ann.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(ann)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(ann.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) { resetForm(); setDialogOpen(false); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Announcement" : "New Announcement"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Announcement title..."
              />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                value={form.message}
                onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}
                placeholder="Write your announcement..."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Target Audience</Label>
              <Select value={form.target_role} onValueChange={(v) => setForm(f => ({ ...f, target_role: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Everyone</SelectItem>
                  <SelectItem value="tenant">Tenants Only</SelectItem>
                  <SelectItem value="landlord">Landlords Only</SelectItem>
                  <SelectItem value="agent">Agents Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { resetForm(); setDialogOpen(false); }}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.title.trim() || !form.message.trim()}>
              {editingId ? "Update" : "Publish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2, Search, UserPlus, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useProperties } from "@/hooks/useProperties";
import { useChatRooms } from "@/hooks/useChatRooms";
import { toast } from "sonner";

export function CreateChatRoomDialog() {
  const { user } = useAuth();
  const { properties } = useProperties();
  const { createRoom, inviteMember } = useChatRooms();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"details" | "invite">("details");
  const [name, setName] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [creating, setCreating] = useState(false);
  const [createdRoomId, setCreatedRoomId] = useState<string | null>(null);

  // Invite state
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [invitedUsers, setInvitedUsers] = useState<Set<string>>(new Set());
  const [inviting, setInviting] = useState<string | null>(null);

  const resetState = () => {
    setStep("details");
    setName("");
    setPropertyId("");
    setCreatedRoomId(null);
    setSearchQuery("");
    setSearchResults([]);
    setInvitedUsers(new Set());
  };

  const handleCreate = async () => {
    if (!name.trim() || !propertyId) return;
    setCreating(true);
    try {
      const room = await createRoom(propertyId, name.trim());
      setCreatedRoomId(room.id);
      setStep("invite");
      toast.success("Chat room created!");
    } catch (err: any) {
      toast.error(err.message || "Failed to create room");
    } finally {
      setCreating(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, email, username")
        .or(`email.ilike.%${searchQuery.trim()}%,username.ilike.%${searchQuery.trim()}%,full_name.ilike.%${searchQuery.trim()}%`)
        .neq("user_id", user?.id || "")
        .limit(10);

      if (profiles) {
        const userIds = profiles.map(p => p.user_id);
        const { data: roles } = await supabase
          .from("user_roles")
          .select("user_id, role")
          .in("user_id", userIds);

        const roleMap = new Map((roles || []).map(r => [r.user_id, r.role]));
        setSearchResults(profiles.map(p => ({ ...p, role: roleMap.get(p.user_id) })));
      }
    } catch (err: any) {
      toast.error(err.message || "Search failed");
    } finally {
      setSearching(false);
    }
  };

  const handleInvite = async (userId: string) => {
    if (!createdRoomId) return;
    setInviting(userId);
    try {
      await inviteMember(createdRoomId, userId);
      setInvitedUsers(prev => new Set(prev).add(userId));
      toast.success("Invite sent! They'll need to accept before joining.");
    } catch (err: any) {
      if (err.message?.includes("duplicate") || err.code === "23505") {
        toast.info("User already invited");
      } else {
        toast.error(err.message || "Failed to invite");
      }
    } finally {
      setInviting(null);
    }
  };

  const roleBadgeClass: Record<string, string> = {
    tenant: "bg-blue-100 text-blue-700",
    landlord: "bg-green-100 text-green-700",
    agent: "bg-purple-100 text-purple-700",
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetState(); }}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Room
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        {step === "details" ? (
          <>
            <DialogHeader>
              <DialogTitle>Create Property Chat Room</DialogTitle>
              <DialogDescription>
                Create a group chat for a property. You can invite tenants, agents, and landlords.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Property</Label>
                <Select value={propertyId} onValueChange={setPropertyId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a property" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.title} — {p.location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Room Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Property Discussion"
                />
              </div>
              <Button onClick={handleCreate} disabled={creating || !name.trim() || !propertyId} className="w-full">
                {creating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating...</> : "Create Room"}
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Invite Members</DialogTitle>
              <DialogDescription>
                Search by name, email, or username. Invited users must accept before they can see or send messages.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="flex gap-2">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, email, or username..."
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1"
                />
                <Button onClick={handleSearch} disabled={searching} size="icon">
                  {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {searchResults.length === 0 && searchQuery && !searching && (
                  <p className="text-sm text-muted-foreground text-center py-4">No users found</p>
                )}
                {searchResults.map((r) => (
                  <div key={r.user_id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{r.full_name || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">
                          {r.username ? `@${r.username} · ` : ""}{r.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {r.role && (
                        <Badge className={roleBadgeClass[r.role] || ""}>{r.role}</Badge>
                      )}
                      {invitedUsers.has(r.user_id) ? (
                        <Badge variant="secondary">Invited</Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleInvite(r.user_id)}
                          disabled={inviting === r.user_id}
                        >
                          {inviting === r.user_id ? <Loader2 className="h-3 w-3 animate-spin" /> : <UserPlus className="h-3 w-3 mr-1" />}
                          Invite
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Button variant="outline" className="w-full" onClick={() => { setOpen(false); resetState(); }}>
                Done
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserPlus, Loader2, Search, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface FoundUser {
  user_id: string;
  full_name: string | null;
  email: string | null;
  role: string;
}

interface AddClientDialogProps {
  trigger?: React.ReactNode;
}

export function AddClientDialog({ trigger }: AddClientDialogProps) {
  const { user, role: currentUserRole } = useAuth();
  const [open, setOpen] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<FoundUser[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Agents search for landlords, landlords search for agents
  const targetRole = currentUserRole === "agent" ? "landlord" : "agent";
  const targetLabel = currentUserRole === "agent" ? "Landlord" : "Agent";

  const handleSearch = async () => {
    if (!searchEmail.trim()) {
      toast.error("Please enter an email to search.");
      return;
    }

    setSearching(true);
    setHasSearched(true);
    try {
      // Search profiles by email or username
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("user_id, full_name, email, username")
        .or(`email.ilike.%${searchEmail.trim()}%,username.ilike.%${searchEmail.trim()}%`);

      if (profileError) throw profileError;

      if (!profiles || profiles.length === 0) {
        setResults([]);
        setSearching(false);
        return;
      }

      // Check which of these users have the target role
      const userIds = profiles.map((p) => p.user_id);
      const { data: roles, error: roleError } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .in("user_id", userIds)
        .eq("role", targetRole);

      if (roleError) throw roleError;

      const matchedUserIds = new Set((roles || []).map((r) => r.user_id));
      const filtered: FoundUser[] = profiles
        .filter((p) => matchedUserIds.has(p.user_id) && p.user_id !== user?.id)
        .map((p) => ({ ...p, role: targetRole }));

      setResults(filtered);
    } catch (err: any) {
      toast.error(err.message || "Search failed");
    } finally {
      setSearching(false);
    }
  };

  const handleStartConversation = async (targetUser: FoundUser) => {
    if (!user) return;

    try {
      // Send an intro message to start the conversation
      const subject =
        currentUserRole === "agent"
          ? `Hello — I'm an agent on Renthob`
          : `Hello — I'm a landlord on Renthob`;
      const message =
        currentUserRole === "agent"
          ? `Hi ${targetUser.full_name || "there"}, I'd like to connect with you on Renthob. I'm an agent and would love to help manage your properties or work together.`
          : `Hi ${targetUser.full_name || "there"}, I'm a landlord on Renthob. I'd like to connect with you to help manage or list my properties.`;

      const { error } = await supabase.from("messages").insert({
        sender_id: user.id,
        recipient_id: targetUser.user_id,
        subject,
        message,
      });

      if (error) throw error;

      toast.success(`Connection request sent to ${targetUser.full_name || targetUser.email}`);
      setOpen(false);
      setSearchEmail("");
      setResults([]);
      setHasSearched(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to send connection request");
    }
  };

  const roleBadgeClass: Record<string, string> = {
    landlord: "bg-green-100 text-green-700",
    agent: "bg-purple-100 text-purple-700",
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) {
          setSearchEmail("");
          setResults([]);
          setHasSearched(false);
        }
      }}
    >
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="lg">
            <UserPlus className="h-5 w-5 mr-2" />
            Add Client
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Find a {targetLabel}</DialogTitle>
          <DialogDescription>
            Search by email to connect with {targetLabel === "Landlord" ? "landlords" : "agents"} on
            Renthob
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="flex gap-2">
            <div className="flex-1 space-y-2">
              <Label htmlFor="client-email">Email Address</Label>
              <Input
                id="client-email"
                type="email"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                placeholder={`Search ${targetLabel.toLowerCase()} by email...`}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
          </div>
          <Button onClick={handleSearch} disabled={searching || !searchEmail.trim()} className="w-full">
            {searching ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Search
              </>
            )}
          </Button>

          {/* Results */}
          {hasSearched && (
            <div className="space-y-2">
              {results.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No {targetLabel.toLowerCase()}s found with that email.
                </p>
              ) : (
                results.map((r) => (
                  <div
                    key={r.user_id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{r.full_name || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">{r.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={roleBadgeClass[r.role] || ""}>
                        {r.role.charAt(0).toUpperCase() + r.role.slice(1)}
                      </Badge>
                      <Button size="sm" onClick={() => handleStartConversation(r)}>
                        Connect
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PenSquare, Loader2, Search, Send, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useMessages } from "@/hooks/useMessages";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface FoundUser {
  user_id: string;
  full_name: string | null;
  email: string | null;
  username: string | null;
}

const roleBadgeClass: Record<string, string> = {
  tenant: "bg-blue-100 text-blue-700",
  landlord: "bg-green-100 text-green-700",
  agent: "bg-purple-100 text-purple-700",
  admin: "bg-red-100 text-red-700",
};

export function NewMessageDialog() {
  const { user } = useAuth();
  const { sendMessage } = useMessages();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"search" | "compose">("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<(FoundUser & { role?: string })[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedUser, setSelectedUser] = useState<(FoundUser & { role?: string }) | null>(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const resetState = () => {
    setStep("search");
    setSearchQuery("");
    setResults([]);
    setHasSearched(false);
    setSelectedUser(null);
    setSubject("");
    setMessage("");
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setHasSearched(true);

    try {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("user_id, full_name, email, username")
        .or(`email.ilike.%${searchQuery.trim()}%,full_name.ilike.%${searchQuery.trim()}%,username.ilike.%${searchQuery.trim()}%`)
        .neq("user_id", user?.id || "")
        .limit(10);

      if (error) throw error;

      if (!profiles || profiles.length === 0) {
        setResults([]);
        setSearching(false);
        return;
      }

      // Fetch roles for found users
      const userIds = profiles.map((p) => p.user_id);
      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .in("user_id", userIds);

      const roleMap = new Map((roles || []).map((r) => [r.user_id, r.role]));
      setResults(profiles.map((p) => ({ ...p, role: roleMap.get(p.user_id) || undefined })));
    } catch (err: any) {
      toast.error(err.message || "Search failed");
    } finally {
      setSearching(false);
    }
  };

  const handleSelectUser = (u: FoundUser & { role?: string }) => {
    setSelectedUser(u);
    setStep("compose");
  };

  const handleSend = async () => {
    if (!selectedUser || !subject.trim() || !message.trim()) {
      toast.error("Please fill in both subject and message.");
      return;
    }

    setSending(true);
    try {
      await sendMessage(selectedUser.user_id, subject.trim(), message.trim());
      toast.success(`Message sent to ${selectedUser.full_name || selectedUser.email}`);
      setOpen(false);
      resetState();
    } catch (err: any) {
      toast.error(err.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) resetState();
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <PenSquare className="h-4 w-4 mr-2" />
          New Message
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{step === "search" ? "New Message" : `Message ${selectedUser?.full_name || selectedUser?.email}`}</DialogTitle>
          <DialogDescription>
            {step === "search"
              ? "Search for a user by name or email"
              : "Compose your message"}
          </DialogDescription>
        </DialogHeader>

        {step === "search" ? (
          <div className="space-y-4 pt-2">
            <div className="flex gap-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, or username..."
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={searching || !searchQuery.trim()} size="icon">
                {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>

            {hasSearched && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {results.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No users found. Try a different search.
                  </p>
                ) : (
                  results.map((r) => (
                    <button
                      key={r.user_id}
                      onClick={() => handleSelectUser(r)}
                      className="flex items-center justify-between w-full p-3 rounded-lg border hover:bg-accent/50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{r.full_name || "Unknown"}</p>
                          <p className="text-xs text-muted-foreground">
                            {r.username ? `@${r.username} · ` : ""}{r.email}
                          </p>
                        </div>
                      </div>
                      {r.role && (
                        <Badge className={roleBadgeClass[r.role] || ""}>
                          {r.role.charAt(0).toUpperCase() + r.role.slice(1)}
                        </Badge>
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <button
              onClick={() => setStep("search")}
              className="text-sm text-primary hover:underline"
            >
              ← Change recipient
            </button>
            <div className="space-y-2">
              <Label htmlFor="new-subject">Subject</Label>
              <Input
                id="new-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter subject"
                disabled={sending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-message">Message</Label>
              <Textarea
                id="new-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message..."
                rows={5}
                disabled={sending}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setOpen(false); resetState(); }} disabled={sending}>
                Cancel
              </Button>
              <Button onClick={handleSend} disabled={sending || !subject.trim() || !message.trim()}>
                {sending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

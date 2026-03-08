import { useState, useEffect, useRef } from "react";
import { BackButton } from "@/components/BackButton";
import { Link } from "react-router-dom";
import { format, isToday, isYesterday } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useChatRooms, useChatRoomMessages } from "@/hooks/useChatRooms";
import { CreateChatRoomDialog } from "@/components/messaging/CreateChatRoomDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Home, Users, Send, Loader2, ArrowLeft, MessageSquare,
  CheckCircle, XCircle, Bell, UserPlus, Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

function formatChatTime(dateStr: string) {
  const d = new Date(dateStr);
  if (isToday(d)) return format(d, "h:mm a");
  if (isYesterday(d)) return `Yesterday, ${format(d, "h:mm a")}`;
  return format(d, "MMM d, h:mm a");
}

export default function ChatRoomsPage() {
  const { user, role } = useAuth();
  const { rooms, pendingInvites, loading, respondToInvite, inviteMember, refetch } = useChatRooms();
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const { messages: roomMessages, members, loading: msgLoading, sendMessage } = useChatRoomMessages(selectedRoomId);

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);
  const isCreator = selectedRoom?.created_by === user?.id;

  // Invite members state
  const [inviteSearch, setInviteSearch] = useState("");
  const [inviteResults, setInviteResults] = useState<any[]>([]);
  const [inviteSearching, setInviteSearching] = useState(false);
  const [invitingUser, setInvitingUser] = useState<string | null>(null);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [roomMessages.length, selectedRoomId]);

  const handleSend = async () => {
    if (!replyText.trim()) return;
    setSending(true);
    try {
      await sendMessage(replyText.trim());
      setReplyText("");
    } catch (err: any) {
      toast.error(err.message || "Failed to send");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleRespondInvite = async (membershipId: string, accept: boolean) => {
    try {
      await respondToInvite(membershipId, accept);
      toast.success(accept ? "You joined the chat room!" : "Invite declined");
    } catch (err: any) {
      toast.error(err.message || "Failed to respond");
    }
  };

  const handleInviteSearch = async () => {
    if (!inviteSearch.trim()) return;
    setInviteSearching(true);
    try {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, email, username")
        .or(`email.ilike.%${inviteSearch.trim()}%,username.ilike.%${inviteSearch.trim()}%,full_name.ilike.%${inviteSearch.trim()}%`)
        .neq("user_id", user?.id || "")
        .limit(10);
      setInviteResults(profiles || []);
    } catch { setInviteResults([]); }
    finally { setInviteSearching(false); }
  };

  const handleInviteUser = async (userId: string) => {
    if (!selectedRoomId) return;
    setInvitingUser(userId);
    try {
      await inviteMember(selectedRoomId, userId);
      toast.success("Invite sent!");
    } catch (err: any) {
      if (err.message?.includes("duplicate") || err.code === "23505") toast.info("Already invited");
      else toast.error(err.message || "Failed to invite");
    } finally { setInvitingUser(null); }
  };

  const getInitials = (name: string | null) =>
    (name || "U").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const canCreateRoom = role === "landlord" || role === "agent";
  const showMobile = !!selectedRoomId;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="bg-gradient-hero py-6 shrink-0">
        <div className="container">
          <BackButton />
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-1">
                Group Chats
                {pendingInvites.length > 0 && (
                  <Badge variant="destructive" className="ml-2 text-xs">{pendingInvites.length} invite{pendingInvites.length !== 1 ? "s" : ""}</Badge>
                )}
              </h1>
              <p className="text-sm text-muted-foreground">Property-based group conversations</p>
            </div>
            {canCreateRoom && <CreateChatRoomDialog />}
          </div>
        </div>
      </div>

      <div className="container py-4 flex-1 min-h-0">
        {/* Pending Invites Banner */}
        {pendingInvites.length > 0 && !selectedRoomId && (
          <div className="mb-4 space-y-2">
            {pendingInvites.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between p-4 rounded-xl border bg-accent/50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      <span className="text-foreground">{inv.inviter_profile?.full_name || "Someone"}</span>{" "}
                      invited you to join
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {inv.room?.name || "a chat room"}
                      {inv.room?.property && ` · ${(inv.room.property as any)?.title || ""}`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleRespondInvite(inv.id, true)}>
                    <CheckCircle className="h-4 w-4 mr-1" /> Accept
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleRespondInvite(inv.id, false)}>
                    <XCircle className="h-4 w-4 mr-1" /> Decline
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="border rounded-xl overflow-hidden flex h-[calc(100vh-260px)] bg-card">
          {/* Room List */}
          <div className={`w-full md:w-[320px] md:min-w-[280px] border-r flex flex-col ${showMobile ? "hidden md:flex" : "flex"}`}>
            <div className="p-3 border-b">
              <p className="text-sm font-medium text-muted-foreground">
                {rooms.length} room{rooms.length !== 1 ? "s" : ""}
              </p>
            </div>
            <ScrollArea className="flex-1">
              {loading ? (
                <div className="p-3 space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-3 p-3">
                      <Skeleton className="h-11 w-11 rounded-full" />
                      <div className="flex-1 space-y-2"><Skeleton className="h-4 w-2/3" /><Skeleton className="h-3 w-full" /></div>
                    </div>
                  ))}
                </div>
              ) : rooms.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                  <Users className="h-12 w-12 text-muted-foreground/30 mb-3" />
                  <p className="font-medium text-foreground mb-1">No group chats yet</p>
                  <p className="text-sm text-muted-foreground">
                    {canCreateRoom ? "Create a room for a property" : "You'll see rooms here when you're invited"}
                  </p>
                </div>
              ) : (
                rooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoomId(room.id)}
                    className={`w-full text-left p-3 flex items-start gap-3 hover:bg-accent/50 transition-colors border-b ${
                      selectedRoomId === room.id ? "bg-accent" : ""
                    }`}
                  >
                    <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{room.name}</p>
                      {room.property && (
                        <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                          <Home className="h-3 w-3" />
                          <span className="truncate">{room.property.title}</span>
                        </div>
                      )}
                    </div>
                  </button>
                ))
              )}
            </ScrollArea>
          </div>

          {/* Chat View */}
          <div className={`flex-1 flex flex-col ${!showMobile ? "hidden md:flex" : "flex"}`}>
            {selectedRoom ? (
              <>
                {/* Header */}
                <div className="p-4 border-b flex items-center gap-3 shrink-0">
                  <Button variant="ghost" size="icon" className="md:hidden shrink-0" onClick={() => setSelectedRoomId(null)}>
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{selectedRoom.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {members.filter(m => m.status === "approved").length} member{members.filter(m => m.status === "approved").length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  {isCreator && (
                    <Button variant="outline" size="sm" onClick={() => setShowInviteDialog(true)}>
                      <UserPlus className="h-4 w-4 mr-1" /> Invite
                    </Button>
                  )}
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-3 max-w-2xl mx-auto">
                    {msgLoading ? (
                      <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                    ) : roomMessages.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      roomMessages.map((msg) => {
                        const isMine = msg.sender_id === user?.id;
                        return (
                          <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[80%] ${isMine ? "" : "flex gap-2"}`}>
                              {!isMine && (
                                <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-1">
                                  <span className="text-[10px] font-semibold text-muted-foreground">
                                    {getInitials(msg.sender_profile?.full_name || null)}
                                  </span>
                                </div>
                              )}
                              <div className={`rounded-2xl px-4 py-2.5 ${
                                isMine
                                  ? "bg-primary text-primary-foreground rounded-br-md"
                                  : "bg-muted text-foreground rounded-bl-md"
                              }`}>
                                {!isMine && (
                                  <p className={`text-xs font-medium mb-0.5 ${isMine ? "text-primary-foreground/70" : "text-primary"}`}>
                                    {msg.sender_profile?.full_name || "Unknown"}
                                  </p>
                                )}
                                <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                                <p className={`text-[10px] mt-1 ${isMine ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                                  {formatChatTime(msg.created_at)}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={chatEndRef} />
                  </div>
                </ScrollArea>

                {/* Input */}
                <div className="p-3 border-t shrink-0">
                  <div className="flex gap-2 items-end max-w-2xl mx-auto">
                    <Textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type a message..."
                      className="min-h-[44px] max-h-[120px] resize-none"
                      rows={1}
                      disabled={sending}
                    />
                    <Button onClick={handleSend} disabled={sending || !replyText.trim()} size="icon" className="shrink-0 h-[44px] w-[44px]">
                      {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                <Users className="h-16 w-16 text-muted-foreground/20 mb-4" />
                <h3 className="font-semibold text-foreground mb-1">Select a chat room</h3>
                <p className="text-sm text-muted-foreground max-w-xs">Choose a room from the list to start chatting</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Invite Members Dialog */}
      <AlertDialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Invite Members</AlertDialogTitle>
            <AlertDialogDescription>
              Search by name, email, or username. They must accept before joining.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3 py-2">
            <div className="flex gap-2">
              <Input
                value={inviteSearch}
                onChange={(e) => setInviteSearch(e.target.value)}
                placeholder="Search users..."
                onKeyDown={(e) => e.key === "Enter" && handleInviteSearch()}
              />
              <Button onClick={handleInviteSearch} disabled={inviteSearching} size="icon">
                {inviteSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {inviteResults.map(r => {
                const alreadyMember = members.some(m => m.user_id === r.user_id);
                return (
                  <div key={r.user_id} className="flex items-center justify-between p-2 rounded-lg border">
                    <div>
                      <p className="text-sm font-medium">{r.full_name || "Unknown"}</p>
                      <p className="text-xs text-muted-foreground">{r.username ? `@${r.username} · ` : ""}{r.email}</p>
                    </div>
                    {alreadyMember ? (
                      <Badge variant="secondary" className="text-xs">Member</Badge>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => handleInviteUser(r.user_id)} disabled={invitingUser === r.user_id}>
                        {invitingUser === r.user_id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Invite"}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setInviteSearch(""); setInviteResults([]); }}>Done</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

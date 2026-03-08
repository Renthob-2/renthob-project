import { useState, useEffect, useRef, useMemo } from "react";
import { BackButton } from "@/components/BackButton";
import { NewMessageDialog } from "@/components/messaging/NewMessageDialog";
import { Link } from "react-router-dom";
import { formatDistanceToNow, format, isToday, isYesterday } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useMessages, Message } from "@/hooks/useMessages";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Inbox,
  Send,
  Home,
  User,
  Loader2,
  ArrowLeft,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";

interface Conversation {
  participantId: string;
  participantName: string;
  participantEmail: string | null;
  lastMessage: Message;
  unreadCount: number;
  messages: Message[];
}

function getConversationKey(msg: Message, userId: string): string {
  const otherId = msg.sender_id === userId ? msg.recipient_id : msg.sender_id;
  return otherId;
}

function formatMessageTime(dateStr: string) {
  const date = new Date(dateStr);
  if (isToday(date)) return format(date, "h:mm a");
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMM d");
}

function formatChatTimestamp(dateStr: string) {
  const date = new Date(dateStr);
  if (isToday(date)) return format(date, "h:mm a");
  if (isYesterday(date)) return `Yesterday, ${format(date, "h:mm a")}`;
  return format(date, "MMM d, h:mm a");
}

export default function MessagesPage() {
  const { user } = useAuth();
  const { messages, loading, markAsRead, sendMessage } = useMessages();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Group messages into conversations by the other participant
  const conversations = useMemo(() => {
    if (!user) return [];

    const convMap = new Map<string, Conversation>();

    for (const msg of messages) {
      const key = getConversationKey(msg, user.id);
      const isIncoming = msg.recipient_id === user.id;
      const otherProfile = isIncoming ? msg.sender_profile : msg.recipient_profile;

      if (!convMap.has(key)) {
        convMap.set(key, {
          participantId: key,
          participantName: otherProfile?.full_name || otherProfile?.email || "Unknown User",
          participantEmail: otherProfile?.email || null,
          lastMessage: msg,
          unreadCount: 0,
          messages: [],
        });
      }

      const conv = convMap.get(key)!;
      conv.messages.push(msg);

      // Update last message if newer
      if (new Date(msg.created_at) > new Date(conv.lastMessage.created_at)) {
        conv.lastMessage = msg;
        conv.participantName = otherProfile?.full_name || otherProfile?.email || "Unknown User";
        conv.participantEmail = otherProfile?.email || null;
      }

      if (isIncoming && !msg.is_read) {
        conv.unreadCount++;
      }
    }

    // Sort messages within each conversation (oldest first)
    for (const conv of convMap.values()) {
      conv.messages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    }

    // Sort conversations by last message (newest first)
    return Array.from(convMap.values()).sort(
      (a, b) => new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime()
    );
  }, [messages, user]);

  const selectedConversation = conversations.find((c) => c.participantId === selectedConversationId) || null;

  // Auto-scroll to bottom when conversation changes or new messages
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedConversation?.messages.length, selectedConversationId]);

  // Mark unread messages as read when opening a conversation
  useEffect(() => {
    if (!selectedConversation || !user) return;
    const unreadMessages = selectedConversation.messages.filter(
      (m) => m.recipient_id === user.id && !m.is_read
    );
    unreadMessages.forEach((m) => markAsRead(m.id).catch(console.error));
  }, [selectedConversationId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedConversation || !user) return;

    // Determine subject from last message in thread
    const lastMsg = selectedConversation.messages[selectedConversation.messages.length - 1];
    const subject = lastMsg.subject.startsWith("Re: ") ? lastMsg.subject : `Re: ${lastMsg.subject}`;

    setSending(true);
    try {
      await sendMessage(
        selectedConversation.participantId,
        subject,
        replyText.trim(),
        lastMsg.property_id || undefined
      );
      setReplyText("");
    } catch (err: any) {
      toast.error(err.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendReply();
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  // Mobile: show either list or chat
  const showChatOnMobile = !!selectedConversationId;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-gradient-hero py-6 shrink-0">
        <div className="container">
          <BackButton />
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-1">
                Messages
                {totalUnread > 0 && (
                  <Badge variant="destructive" className="ml-2 text-xs">
                    {totalUnread} new
                  </Badge>
                )}
              </h1>
              <p className="text-sm text-muted-foreground">
                Your conversations
              </p>
            </div>
            <NewMessageDialog />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container py-4 flex-1 min-h-0">
        <div className="border rounded-xl overflow-hidden flex h-[calc(100vh-220px)] bg-card">
          {/* Conversation List */}
          <div
            className={`w-full md:w-[360px] md:min-w-[300px] border-r flex flex-col ${
              showChatOnMobile ? "hidden md:flex" : "flex"
            }`}
          >
            <div className="p-3 border-b">
              <p className="text-sm font-medium text-muted-foreground">
                {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
              </p>
            </div>
            <ScrollArea className="flex-1">
              {loading ? (
                <div className="p-3 space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-3">
                      <Skeleton className="h-11 w-11 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                  <Inbox className="h-12 w-12 text-muted-foreground/30 mb-3" />
                  <p className="font-medium text-foreground mb-1">No conversations yet</p>
                  <p className="text-sm text-muted-foreground">
                    Start a conversation using the New Message button
                  </p>
                </div>
              ) : (
                <div>
                  {conversations.map((conv) => (
                    <button
                      key={conv.participantId}
                      onClick={() => setSelectedConversationId(conv.participantId)}
                      className={`w-full text-left p-3 flex items-start gap-3 hover:bg-accent/50 transition-colors border-b last:border-b-0 ${
                        selectedConversationId === conv.participantId
                          ? "bg-accent"
                          : ""
                      }`}
                    >
                      <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-semibold text-primary">
                          {getInitials(conv.participantName)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-sm truncate ${conv.unreadCount > 0 ? "font-bold text-foreground" : "font-medium text-foreground"}`}>
                            {conv.participantName}
                          </p>
                          <span className="text-xs text-muted-foreground shrink-0">
                            {formatMessageTime(conv.lastMessage.created_at)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2 mt-0.5">
                          <p className={`text-xs truncate ${conv.unreadCount > 0 ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                            {conv.lastMessage.sender_id === user?.id ? "You: " : ""}
                            {conv.lastMessage.message}
                          </p>
                          {conv.unreadCount > 0 && (
                            <Badge variant="default" className="h-5 min-w-[20px] px-1.5 text-xs shrink-0">
                              {conv.unreadCount}
                            </Badge>
                          )}
                        </div>
                        {conv.lastMessage.property && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <Home className="h-3 w-3" />
                            <span className="truncate">{conv.lastMessage.property.title}</span>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Chat View */}
          <div
            className={`flex-1 flex flex-col ${
              !showChatOnMobile ? "hidden md:flex" : "flex"
            }`}
          >
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b flex items-center gap-3 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden shrink-0"
                    onClick={() => setSelectedConversationId(null)}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-semibold text-primary">
                      {getInitials(selectedConversation.participantName)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">
                      {selectedConversation.participantName}
                    </p>
                    {selectedConversation.participantEmail && (
                      <p className="text-xs text-muted-foreground truncate">
                        {selectedConversation.participantEmail}
                      </p>
                    )}
                  </div>
                </div>

                {/* Chat Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4 max-w-2xl mx-auto">
                    {selectedConversation.messages.map((msg) => {
                      const isMine = msg.sender_id === user?.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                              isMine
                                ? "bg-primary text-primary-foreground rounded-br-md"
                                : "bg-muted text-foreground rounded-bl-md"
                            }`}
                          >
                            {/* Show property context if present */}
                            {msg.property && (
                              <Link
                                to={`/property/${msg.property_id}`}
                                className={`flex items-center gap-1 text-xs mb-1.5 ${
                                  isMine ? "text-primary-foreground/70" : "text-muted-foreground"
                                } hover:underline`}
                              >
                                <Home className="h-3 w-3" />
                                {msg.property.title}
                              </Link>
                            )}
                            <p className="text-sm whitespace-pre-wrap break-words">
                              {msg.message}
                            </p>
                            <p
                              className={`text-[10px] mt-1 ${
                                isMine ? "text-primary-foreground/60" : "text-muted-foreground"
                              }`}
                            >
                              {formatChatTimestamp(msg.created_at)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={chatEndRef} />
                  </div>
                </ScrollArea>

                {/* Reply Input */}
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
                    <Button
                      onClick={handleSendReply}
                      disabled={sending || !replyText.trim()}
                      size="icon"
                      className="shrink-0 h-[44px] w-[44px]"
                    >
                      {sending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                <MessageSquare className="h-16 w-16 text-muted-foreground/20 mb-4" />
                <h3 className="font-semibold text-foreground mb-1">
                  Select a conversation
                </h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Choose a conversation from the list or start a new one
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

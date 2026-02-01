import { useState } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useMessages, Message } from "@/hooks/useMessages";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Inbox,
  Send,
  Mail,
  MailOpen,
  Trash2,
  Home,
  User,
} from "lucide-react";
import { toast } from "sonner";

export default function MessagesPage() {
  const { user } = useAuth();
  const { messages, loading, markAsRead, deleteMessage } = useMessages();
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [tab, setTab] = useState<"inbox" | "sent">("inbox");

  const inboxMessages = messages.filter((m) => m.recipient_id === user?.id);
  const sentMessages = messages.filter((m) => m.sender_id === user?.id);

  const handleOpenMessage = async (message: Message) => {
    setSelectedMessage(message);
    if (message.recipient_id === user?.id && !message.is_read) {
      try {
        await markAsRead(message.id);
      } catch (error) {
        console.error("Error marking message as read:", error);
      }
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteMessage(messageId);
      setSelectedMessage(null);
      toast.success("Message deleted");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete message");
    }
  };

  const MessageCard = ({ message, isInbox }: { message: Message; isInbox: boolean }) => {
    const otherPerson = isInbox ? message.sender_profile : message.recipient_profile;
    const personName = otherPerson?.full_name || otherPerson?.email || "Unknown User";

    return (
      <Card
        className={`cursor-pointer transition-all hover:shadow-md ${
          isInbox && !message.is_read ? "border-primary bg-primary/5" : ""
        }`}
        onClick={() => handleOpenMessage(message)}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground truncate">{personName}</p>
                  {isInbox && !message.is_read && (
                    <Badge variant="default" className="text-xs">New</Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                </span>
              </div>
              <p className="font-medium text-sm text-foreground truncate">{message.subject}</p>
              <p className="text-sm text-muted-foreground truncate">{message.message}</p>
              {message.property && (
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                  <Home className="h-3 w-3" />
                  <span className="truncate">{message.property.title}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const MessageList = ({ messages, isInbox }: { messages: Message[]; isInbox: boolean }) => {
    if (loading) {
      return (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (messages.length === 0) {
      return (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            {isInbox ? (
              <Inbox className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            ) : (
              <Send className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            )}
            <h3 className="font-semibold text-foreground mb-1">
              {isInbox ? "No messages yet" : "No sent messages"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isInbox
                ? "Messages from landlords and agents will appear here"
                : "Messages you send will appear here"}
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-3">
        {messages.map((message) => (
          <MessageCard key={message.id} message={message} isInbox={isInbox} />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-hero py-8">
        <div className="container">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
            Messages
          </h1>
          <p className="text-muted-foreground">
            Manage your conversations with landlords and tenants
          </p>
        </div>
      </div>

      <div className="container py-8">
        <Tabs value={tab} onValueChange={(v) => setTab(v as "inbox" | "sent")}>
          <TabsList className="mb-6">
            <TabsTrigger value="inbox" className="gap-2">
              <Inbox className="h-4 w-4" />
              Inbox
              {inboxMessages.filter((m) => !m.is_read).length > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {inboxMessages.filter((m) => !m.is_read).length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sent" className="gap-2">
              <Send className="h-4 w-4" />
              Sent
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inbox">
            <MessageList messages={inboxMessages} isInbox={true} />
          </TabsContent>
          <TabsContent value="sent">
            <MessageList messages={sentMessages} isInbox={false} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Message Detail Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          {selectedMessage && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedMessage.subject}</DialogTitle>
                <DialogDescription>
                  {tab === "inbox" ? (
                    <>From: {selectedMessage.sender_profile?.full_name || selectedMessage.sender_profile?.email || "Unknown"}</>
                  ) : (
                    <>To: {selectedMessage.recipient_profile?.full_name || selectedMessage.recipient_profile?.email || "Unknown"}</>
                  )}
                  {" • "}
                  {formatDistanceToNow(new Date(selectedMessage.created_at), { addSuffix: true })}
                </DialogDescription>
              </DialogHeader>
              
              {selectedMessage.property && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-sm">
                  <Home className="h-4 w-4 text-muted-foreground" />
                  <span>Property: </span>
                  <Link
                    to={`/property/${selectedMessage.property_id}`}
                    className="text-primary hover:underline font-medium"
                  >
                    {selectedMessage.property.title}
                  </Link>
                </div>
              )}

              <Separator />

              <div className="py-4">
                <p className="text-foreground whitespace-pre-wrap">{selectedMessage.message}</p>
              </div>

              <div className="flex justify-end gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this message?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. The message will be permanently deleted.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteMessage(selectedMessage.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

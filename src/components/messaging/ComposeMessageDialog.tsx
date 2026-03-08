import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
import { Send, Loader2, MessageSquare } from "lucide-react";
import { useMessages } from "@/hooks/useMessages";
import { toast } from "sonner";

interface ComposeMessageDialogProps {
  recipientId: string;
  recipientName: string;
  propertyId?: string;
  propertyTitle?: string;
  defaultSubject?: string;
  trigger?: React.ReactNode;
}

export function ComposeMessageDialog({
  recipientId,
  recipientName,
  propertyId,
  propertyTitle,
  defaultSubject = "",
  trigger,
}: ComposeMessageDialogProps) {
  const { sendMessage } = useMessages();
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState(defaultSubject);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      toast.error("Please fill in both subject and message.");
      return;
    }

    setSending(true);
    try {
      await sendMessage(recipientId, subject.trim(), message.trim(), propertyId);
      toast.success(`Message sent to ${recipientName}`);
      setSubject(defaultSubject);
      setMessage("");
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setSubject(defaultSubject); setMessage(""); } }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <MessageSquare className="h-4 w-4 mr-2" />
            Message
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Send Message to {recipientName}</DialogTitle>
          <DialogDescription>
            {propertyTitle ? `Regarding: ${propertyTitle}` : "Send a direct message"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="msg-subject">Subject</Label>
            <Input
              id="msg-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter subject"
              disabled={sending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="msg-body">Message</Label>
            <Textarea
              id="msg-body"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message..."
              rows={5}
              disabled={sending}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={sending}>
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
                  Send Message
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

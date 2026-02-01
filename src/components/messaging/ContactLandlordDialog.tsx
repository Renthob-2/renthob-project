import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMessages } from "@/hooks/useMessages";
import { toast } from "sonner";

interface ContactLandlordDialogProps {
  propertyId: string;
  propertyTitle: string;
  landlordId: string;
  landlordName?: string;
  trigger?: React.ReactNode;
}

export function ContactLandlordDialog({
  propertyId,
  propertyTitle,
  landlordId,
  landlordName = "the landlord",
  trigger,
}: ContactLandlordDialogProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { sendMessage } = useMessages();
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [subject, setSubject] = useState(`Inquiry about: ${propertyTitle}`);
  const [message, setMessage] = useState("");

  const handleSend = async () => {
    if (!user) {
      toast.error("Please log in to send messages");
      navigate("/login");
      return;
    }

    if (!subject.trim() || !message.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setSending(true);
      await sendMessage(landlordId, subject, message, propertyId);
      toast.success("Message sent successfully!");
      setOpen(false);
      setMessage("");
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast.error(error.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && !user) {
      toast.error("Please log in to contact the landlord");
      navigate("/login");
      return;
    }
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" className="w-full" size="lg">
            <Mail className="h-4 w-4 mr-2" />
            Contact Landlord
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Contact {landlordName}</DialogTitle>
          <DialogDescription>
            Send a message about "{propertyTitle}"
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="What's your inquiry about?"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message here..."
              rows={5}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={sending}>
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Send Message
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

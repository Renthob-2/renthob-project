import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const TIME_SLOTS = [
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
  "4:30 PM",
  "5:00 PM",
];

interface ScheduleTourDialogProps {
  propertyId: string;
  propertyTitle: string;
  landlordId: string;
}

export function ScheduleTourDialog({
  propertyId,
  propertyTitle,
  landlordId,
}: ScheduleTourDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please log in to schedule a tour.");
      return;
    }
    if (!date || !time) {
      toast.error("Please select a date and time.");
      return;
    }

    try {
      setSubmitting(true);
      const { error } = await supabase.from("tour_requests").insert({
        property_id: propertyId,
        tenant_id: user.id,
        landlord_id: landlordId,
        preferred_date: format(date, "yyyy-MM-dd"),
        preferred_time: time,
        message: message.trim() || null,
      });

      if (error) throw error;

      toast.success("Tour request submitted! The property owner will respond soon.");
      setOpen(false);
      setDate(undefined);
      setTime("");
      setMessage("");
    } catch (err) {
      console.error("Error scheduling tour:", err);
      toast.error("Failed to submit tour request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full" size="lg">
          <Phone className="h-4 w-4 mr-2" />
          Schedule a Tour
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Schedule a Tour</DialogTitle>
          <DialogDescription>
            Request a viewing for <span className="font-medium text-foreground">{propertyTitle}</span>. The property owner will confirm your appointment.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Date Picker */}
          <div className="space-y-2">
            <Label>Preferred Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Slot */}
          <div className="space-y-2">
            <Label>Preferred Time</Label>
            <Select value={time} onValueChange={setTime}>
              <SelectTrigger>
                <SelectValue placeholder="Select a time slot" />
              </SelectTrigger>
              <SelectContent>
                {TIME_SLOTS.map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label>Message (optional)</Label>
            <Textarea
              placeholder="Any special requests or questions about the property..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || !date || !time}>
            {submitting ? "Submitting..." : "Request Tour"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

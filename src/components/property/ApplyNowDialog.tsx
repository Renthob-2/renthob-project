import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, FileCheck } from "lucide-react";

const formSchema = z.object({
  full_name: z.string().min(2, "Full name is required").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number is required").max(20),
  employment_status: z.enum(["employed", "self_employed", "student", "retired", "other"]),
  monthly_income: z.string().optional(),
  move_in_date: z.string().min(1, "Move-in date is required"),
  message: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ApplyNowDialogProps {
  propertyId: string;
  propertyTitle: string;
  landlordId: string;
}

export function ApplyNowDialog({ propertyId, propertyTitle, landlordId }: ApplyNowDialogProps) {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: profile?.full_name || "",
      email: profile?.email || user?.email || "",
      phone: profile?.phone || "",
      employment_status: "employed",
      monthly_income: "",
      move_in_date: "",
      message: "",
    },
  });

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && !user) {
      toast({
        title: "Login Required",
        description: "Please log in to apply for this property.",
        variant: "destructive",
      });
      navigate("/login", { state: { from: `/property/${propertyId}` } });
      return;
    }
    setOpen(newOpen);
  };

  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to apply for this property.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("rental_applications").insert({
        property_id: propertyId,
        applicant_id: user.id,
        landlord_id: landlordId,
        full_name: values.full_name,
        email: values.email,
        phone: values.phone,
        employment_status: values.employment_status,
        monthly_income: values.monthly_income || null,
        move_in_date: values.move_in_date,
        message: values.message || null,
      });

      if (error) throw error;

      toast({
        title: "Application Submitted!",
        description: "Your rental application has been sent to the property owner.",
      });
      
      setOpen(false);
      form.reset();
    } catch (error: any) {
      console.error("Error submitting application:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full" size="lg">
          <FileCheck className="h-4 w-4 mr-2" />
          Apply Now
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Apply for Property</DialogTitle>
          <DialogDescription>
            Submit your rental application for <span className="font-medium">{propertyTitle}</span>
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+234 800 000 0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="employment_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employment Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="employed">Employed</SelectItem>
                        <SelectItem value="self_employed">Self-Employed</SelectItem>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="retired">Retired</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="monthly_income"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Income (₦)</FormLabel>
                    <FormControl>
                      <Input placeholder="Optional" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="move_in_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Move-in Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Message (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell the landlord about yourself, why you're interested, etc."
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

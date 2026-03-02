import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShieldCheck, Upload, Loader2, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const DOCUMENT_TYPES = [
  { value: "nin", label: "National Identification Number (NIN)" },
  { value: "voters_card", label: "Voter's Card" },
  { value: "drivers_license", label: "Driver's License" },
  { value: "international_passport", label: "International Passport" },
];

interface VerificationStatus {
  status: "none" | "pending" | "verified" | "rejected";
  document_type?: string;
}

export function IDVerificationDialog() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [documentType, setDocumentType] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [verification, setVerification] = useState<VerificationStatus>({ status: "none" });

  useEffect(() => {
    if (!user) return;
    async function fetchStatus() {
      const { data } = await supabase
        .from("id_verifications")
        .select("status, document_type")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (data) {
        setVerification({ status: data.status as any, document_type: data.document_type });
      }
    }
    fetchStatus();
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (selected.size > 5 * 1024 * 1024) {
      toast.error("File must be less than 5MB");
      return;
    }
    if (!selected.type.startsWith("image/") && selected.type !== "application/pdf") {
      toast.error("Please upload an image or PDF file");
      return;
    }
    setFile(selected);
  };

  const handleSubmit = async () => {
    if (!user || !documentType || !file) {
      toast.error("Please select a document type and upload a file.");
      return;
    }

    try {
      setSubmitting(true);

      // Upload document
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/id-verification-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("property-images")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("property-images")
        .getPublicUrl(fileName);

      // Upsert verification record
      const { error } = await supabase
        .from("id_verifications")
        .upsert({
          user_id: user.id,
          document_type: documentType,
          document_url: publicUrl,
          status: "pending",
        }, { onConflict: "user_id" });

      if (error) throw error;

      setVerification({ status: "pending", document_type: documentType });
      toast.success("ID verification submitted! We'll review it shortly.");
      setOpen(false);
    } catch (err: any) {
      console.error("Verification error:", err);
      toast.error("Failed to submit verification. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadge = () => {
    switch (verification.status) {
      case "verified":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20"><CheckCircle2 className="h-3 w-3 mr-1" />Verified</Badge>;
      case "pending":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending Review</Badge>;
      case "rejected":
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">Not Verified</Badge>;
    }
  };

  return (
    <div className="flex items-center gap-3">
      {statusBadge()}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={verification.status === "verified"}
          >
            <ShieldCheck className="h-4 w-4 mr-2" />
            {verification.status === "none" || verification.status === "rejected" ? "Verify ID" : "View Status"}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>ID Verification</DialogTitle>
            <DialogDescription>
              Upload a valid government-issued ID to verify your identity. This helps build trust with {verification.status === "none" ? "other users" : "tenants and landlords"}.
            </DialogDescription>
          </DialogHeader>

          {verification.status === "pending" ? (
            <div className="py-6 text-center space-y-3">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">Your ID verification is currently under review. We'll notify you once it's approved.</p>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Document Type</Label>
                <Select value={documentType} onValueChange={setDocumentType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select ID type" />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_TYPES.map((doc) => (
                      <SelectItem key={doc.value} value={doc.value}>
                        {doc.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Upload Document</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                  {file ? (
                    <div className="space-y-1">
                      <CheckCircle2 className="h-6 w-6 text-primary mx-auto" />
                      <p className="text-sm font-medium">{file.name}</p>
                      <Button variant="ghost" size="sm" onClick={() => setFile(null)}>Change</Button>
                    </div>
                  ) : (
                    <label className="cursor-pointer space-y-2 block">
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                      <p className="text-sm text-muted-foreground">Click to upload image or PDF (max 5MB)</p>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
          )}

          {verification.status !== "pending" && (
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={submitting || !documentType || !file}>
                {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting...</> : "Submit for Verification"}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

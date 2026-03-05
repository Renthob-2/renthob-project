import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Check, X, ExternalLink } from "lucide-react";
import type { AdminVerification } from "@/hooks/useAdminData";

interface AdminVerificationsTabProps {
  verifications: AdminVerification[];
  onUpdateStatus: (id: string, status: string) => void;
}

const statusBadge: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  verified: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export function AdminVerificationsTab({ verifications, onUpdateStatus }: AdminVerificationsTabProps) {
  const pending = verifications.filter((v) => v.status === "pending");
  const reviewed = verifications.filter((v) => v.status !== "pending");

  return (
    <div className="space-y-6">
      {/* Pending Verifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-yellow-600" />
            Pending Verifications ({pending.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pending.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No pending verifications.</p>
          ) : (
            <div className="space-y-3">
              {pending.map((v) => (
                <div key={v.id} className="p-4 rounded-lg border bg-card">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{v.user_name}</p>
                      <p className="text-sm text-muted-foreground">{v.user_email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{v.document_type}</Badge>
                        <span className="text-xs text-muted-foreground">
                          Submitted {new Date(v.submitted_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <a href={v.document_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-1" /> View Doc
                        </a>
                      </Button>
                      <Button size="sm" variant="default" onClick={() => onUpdateStatus(v.id, "verified")}>
                        <Check className="h-4 w-4 mr-1" /> Approve
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => onUpdateStatus(v.id, "rejected")}>
                        <X className="h-4 w-4 mr-1" /> Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reviewed Verifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Reviewed ({reviewed.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reviewed.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No reviewed verifications yet.</p>
          ) : (
            <div className="space-y-3">
              {reviewed.map((v) => (
                <div key={v.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium text-sm">{v.user_name}</p>
                    <p className="text-xs text-muted-foreground">{v.document_type}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusBadge[v.status] || ""}>{v.status}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {v.reviewed_at ? new Date(v.reviewed_at).toLocaleDateString() : ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

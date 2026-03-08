import { useOutletContext } from "react-router-dom";
import { AdminVerificationsTab } from "@/components/admin/AdminVerificationsTab";
import type { AdminDataContext } from "@/types/admin";

export default function AdminVerificationsPage() {
  const { verifications, updateVerificationStatus } = useOutletContext<AdminDataContext>();
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-1">ID Verifications</h2>
        <p className="text-muted-foreground">Review and process identity verification requests</p>
      </div>
      <AdminVerificationsTab verifications={verifications} onUpdateStatus={updateVerificationStatus} />
    </div>
  );
}

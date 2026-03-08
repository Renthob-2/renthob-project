import { useOutletContext } from "react-router-dom";
import { AdminPropertiesTab } from "@/components/admin/AdminPropertiesTab";
import type { AdminDataContext } from "@/types/admin";

export default function AdminPropertiesPage() {
  const { properties, updatePropertyStatus } = useOutletContext<AdminDataContext>();
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-1">Property Management</h2>
        <p className="text-muted-foreground">Review and manage all property listings</p>
      </div>
      <AdminPropertiesTab properties={properties} onUpdateStatus={updatePropertyStatus} />
    </div>
  );
}

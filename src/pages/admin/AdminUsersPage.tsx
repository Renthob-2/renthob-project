import { useOutletContext } from "react-router-dom";
import { AdminUsersTab } from "@/components/admin/AdminUsersTab";
import type { AdminDataContext } from "@/types/admin";

export default function AdminUsersPage() {
  const { users, refetch } = useOutletContext<AdminDataContext>();
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-1">User Management</h2>
        <p className="text-muted-foreground">View and manage all platform users</p>
      </div>
      <AdminUsersTab users={users} onRefresh={refetch} />
    </div>
  );
}

import { AdminActivityLogTab } from "@/components/admin/AdminActivityLogTab";

export default function AdminActivityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-1">Activity Log</h2>
        <p className="text-muted-foreground">Track all admin actions and platform changes</p>
      </div>
      <AdminActivityLogTab />
    </div>
  );
}

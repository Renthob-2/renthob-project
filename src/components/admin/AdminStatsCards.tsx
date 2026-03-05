import { Card, CardContent } from "@/components/ui/card";
import { Users, Building2, ShieldCheck, FileText, Calendar, UserCheck, Home, Briefcase } from "lucide-react";
import type { AdminStats } from "@/hooks/useAdminData";

interface AdminStatsCardsProps {
  stats: AdminStats;
}

export function AdminStatsCards({ stats }: AdminStatsCardsProps) {
  const cards = [
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-primary" },
    { label: "Tenants", value: stats.totalTenants, icon: UserCheck, color: "text-blue-600" },
    { label: "Landlords", value: stats.totalLandlords, icon: Home, color: "text-green-600" },
    { label: "Agents", value: stats.totalAgents, icon: Briefcase, color: "text-purple-600" },
    { label: "Total Properties", value: stats.totalProperties, icon: Building2, color: "text-primary" },
    { label: "Active Listings", value: stats.activeProperties, icon: Building2, color: "text-green-600" },
    { label: "Pending Verifications", value: stats.pendingVerifications, icon: ShieldCheck, color: "text-yellow-600" },
    { label: "Pending Applications", value: stats.pendingApplications, icon: FileText, color: "text-orange-600" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{card.label}</p>
                <p className="text-2xl font-bold">{card.value}</p>
              </div>
              <card.icon className={`h-8 w-8 ${card.color} opacity-30`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

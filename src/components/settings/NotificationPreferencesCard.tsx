import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, Volume2, Globe, FileText, CalendarDays, DollarSign, Wallet } from "lucide-react";
import { useNotificationPreferences, type NotificationPreferences } from "@/hooks/useNotificationPreferences";
import { useAuth } from "@/contexts/AuthContext";

interface PrefItem {
  key: keyof NotificationPreferences;
  label: string;
  description: string;
  icon: React.ReactNode;
  roles?: string[];
}

const prefItems: PrefItem[] = [
  {
    key: "new_application",
    label: "New Applications",
    description: "When a tenant submits a rental application",
    icon: <FileText className="h-4 w-4" />,
    roles: ["landlord", "agent", "admin"],
  },
  {
    key: "application_status",
    label: "Application Updates",
    description: "When your application status changes",
    icon: <FileText className="h-4 w-4" />,
    roles: ["tenant"],
  },
  {
    key: "new_tour_request",
    label: "New Tour Requests",
    description: "When a tenant requests a property tour",
    icon: <CalendarDays className="h-4 w-4" />,
    roles: ["landlord", "agent", "admin"],
  },
  {
    key: "tour_status",
    label: "Tour Updates",
    description: "When your tour request is confirmed or declined",
    icon: <CalendarDays className="h-4 w-4" />,
    roles: ["tenant"],
  },
  {
    key: "commission_earned",
    label: "Commission Earned",
    description: "When you earn a new referral commission",
    icon: <DollarSign className="h-4 w-4" />,
    roles: ["affiliate"],
  },
  {
    key: "withdrawal_status",
    label: "Withdrawal Updates",
    description: "When your withdrawal is approved or rejected",
    icon: <Wallet className="h-4 w-4" />,
    roles: ["affiliate"],
  },
  {
    key: "sound_enabled",
    label: "Notification Sound",
    description: "Play a chime when a new notification arrives",
    icon: <Volume2 className="h-4 w-4" />,
  },
  {
    key: "browser_notifications",
    label: "Browser Notifications",
    description: "Show desktop push notifications",
    icon: <Globe className="h-4 w-4" />,
  },
];

export function NotificationPreferencesCard() {
  const { role } = useAuth();
  const { preferences, loading, updatePreference } = useNotificationPreferences();

  const visibleItems = prefItems.filter(
    (item) => !item.roles || (role && item.roles.includes(role))
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Notification Preferences
        </CardTitle>
        <CardDescription>Choose which notifications you want to receive</CardDescription>
      </CardHeader>
      <CardContent className="space-y-1">
        {visibleItems.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between py-3 px-1 rounded-lg hover:bg-accent/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="text-muted-foreground">{item.icon}</div>
              <div>
                <Label htmlFor={item.key} className="text-sm font-medium cursor-pointer">
                  {item.label}
                </Label>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            </div>
            <Switch
              id={item.key}
              checked={preferences[item.key]}
              onCheckedChange={(checked) => updatePreference(item.key, checked)}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

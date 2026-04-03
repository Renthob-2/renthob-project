import { useState } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCheck, Bell, ArrowLeft } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { Link } from "react-router-dom";
import { BackButton } from "@/components/BackButton";

const typeConfig: Record<string, { emoji: string; label: string }> = {
  commission_earned: { emoji: "💰", label: "Commission" },
  withdrawal_approved: { emoji: "✅", label: "Approved" },
  withdrawal_rejected: { emoji: "❌", label: "Rejected" },
};

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications();
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all"
    ? notifications
    : filter === "unread"
      ? notifications.filter((n) => !n.is_read)
      : notifications.filter((n) => n.type === filter);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BackButton />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
            <p className="text-sm text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            <CheckCheck className="h-4 w-4 mr-1" /> Mark all read
          </Button>
        )}
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="w-full justify-start flex-wrap h-auto gap-1">
          <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
          <TabsTrigger value="unread" className="text-xs">
            Unread
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-1 h-4 min-w-4 p-0 flex items-center justify-center text-[10px]">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="commission_earned" className="text-xs">💰 Commissions</TabsTrigger>
          <TabsTrigger value="withdrawal_approved" className="text-xs">✅ Approved</TabsTrigger>
          <TabsTrigger value="withdrawal_rejected" className="text-xs">❌ Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-4 space-y-2">
          {filtered.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Bell className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No notifications to show</p>
              </CardContent>
            </Card>
          ) : (
            filtered.map((n) => {
              const config = typeConfig[n.type] || { emoji: "🔔", label: n.type };
              return (
                <Card
                  key={n.id}
                  className={`cursor-pointer transition-colors hover:bg-muted/50 ${!n.is_read ? "border-primary/30 bg-primary/5" : ""}`}
                  onClick={() => !n.is_read && markAsRead(n.id)}
                >
                  <CardContent className="flex gap-4 py-4">
                    <span className="text-2xl mt-0.5">{config.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={`text-sm ${!n.is_read ? "font-semibold" : "font-medium"}`}>
                          {n.title}
                        </p>
                        {!n.is_read && (
                          <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{n.message}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">{config.label}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                        </span>
                        <span className="text-xs text-muted-foreground hidden sm:inline">
                          · {format(new Date(n.created_at), "MMM d, yyyy h:mm a")}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

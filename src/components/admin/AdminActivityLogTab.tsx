import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ClipboardList, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActivityLog {
  id: string;
  admin_id: string;
  action: string;
  target_type: string;
  target_id: string;
  details: string | null;
  created_at: string;
}

const actionColors: Record<string, string> = {
  suspend: "bg-red-100 text-red-800",
  unsuspend: "bg-green-100 text-green-800",
  approve: "bg-green-100 text-green-800",
  reject: "bg-red-100 text-red-800",
  update_status: "bg-blue-100 text-blue-800",
};

export function AdminActivityLogTab() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("admin_activity_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    setLogs((data as ActivityLog[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchLogs(); }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" />
          Activity Log
        </CardTitle>
        <Button variant="outline" size="sm" onClick={fetchLogs}>
          <RefreshCw className="h-4 w-4 mr-1" /> Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : logs.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No activity yet.</p>
        ) : (
          <ScrollArea className="h-[500px]">
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                  <Badge className={actionColors[log.action] || "bg-muted text-muted-foreground"}>
                    {log.action}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium capitalize">{log.target_type}</p>
                    <p className="text-sm text-muted-foreground truncate">{log.details || log.target_id}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

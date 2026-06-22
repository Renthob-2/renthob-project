import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { History, RefreshCw, Search, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AuditRow {
  id: string;
  event_type: string;
  actor_id: string | null;
  subject_user_id: string;
  old_role: string | null;
  new_role: string | null;
  requested_role: string | null;
  request_id: string | null;
  details: string | null;
  created_at: string;
}

interface ProfileLite {
  user_id: string;
  full_name: string | null;
  email: string | null;
}

const eventColors: Record<string, string> = {
  request_submitted: "bg-blue-100 text-blue-800",
  request_approved: "bg-green-100 text-green-800",
  request_rejected: "bg-red-100 text-red-800",
  role_assigned: "bg-purple-100 text-purple-800",
  role_changed: "bg-amber-100 text-amber-800",
  role_removed: "bg-zinc-200 text-zinc-800",
};

const eventLabels: Record<string, string> = {
  request_submitted: "Request submitted",
  request_approved: "Request approved",
  request_rejected: "Request rejected",
  role_assigned: "Role assigned",
  role_changed: "Role changed",
  role_removed: "Role removed",
};

export default function AdminRoleAuditPage() {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [profiles, setProfiles] = useState<Map<string, ProfileLite>>(new Map());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [targetUserFilter, setTargetUserFilter] = useState("");
  const [requestIdFilter, setRequestIdFilter] = useState("");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("role_audit_log" as any)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(300);
    const list = (data || []) as unknown as AuditRow[];
    setRows(list);

    const ids = Array.from(
      new Set(list.flatMap((r) => [r.actor_id, r.subject_user_id].filter(Boolean) as string[]))
    );
    if (ids.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .in("user_id", ids);
      const map = new Map<string, ProfileLite>();
      (profs || []).forEach((p) => map.set(p.user_id, p as ProfileLite));
      setProfiles(map);
    } else {
      setProfiles(new Map());
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const nameFor = (id: string | null) => {
    if (!id) return "System";
    const p = profiles.get(id);
    return p?.full_name || p?.email || id.slice(0, 8);
  };

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (eventFilter !== "all" && r.event_type !== eventFilter) return false;

      // Target user filter (subject name or email)
      if (targetUserFilter) {
        const tu = targetUserFilter.toLowerCase();
        const subject = nameFor(r.subject_user_id).toLowerCase();
        const subjectEmail = (profiles.get(r.subject_user_id)?.email || "").toLowerCase();
        if (!subject.includes(tu) && !subjectEmail.includes(tu)) return false;
      }

      // Request ID filter
      if (requestIdFilter) {
        const ri = requestIdFilter.toLowerCase();
        if (!r.request_id || !r.request_id.toLowerCase().includes(ri)) return false;
      }

      if (!search) return true;
      const q = search.toLowerCase();
      const actor = nameFor(r.actor_id).toLowerCase();
      const subject = nameFor(r.subject_user_id).toLowerCase();
      return (
        actor.includes(q) ||
        subject.includes(q) ||
        r.event_type.includes(q) ||
        (r.details || "").toLowerCase().includes(q) ||
        (r.new_role || "").includes(q) ||
        (r.old_role || "").includes(q) ||
        (r.requested_role || "").includes(q)
      );
    });
  }, [rows, search, eventFilter, profiles, targetUserFilter, requestIdFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-1">Role Audit Log</h2>
        <p className="text-muted-foreground">
          Every role request and admin role update, with timestamps and the acting user.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Events ({filtered.length})
            </CardTitle>
            <Button variant="outline" size="sm" onClick={load}>
              <RefreshCw className="h-4 w-4 mr-1" /> Refresh
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by user, role, details..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={eventFilter} onValueChange={setEventFilter}>
              <SelectTrigger className="w-[220px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All events</SelectItem>
                <SelectItem value="request_submitted">Request submitted</SelectItem>
                <SelectItem value="request_approved">Request approved</SelectItem>
                <SelectItem value="request_rejected">Request rejected</SelectItem>
                <SelectItem value="role_assigned">Role assigned</SelectItem>
                <SelectItem value="role_changed">Role changed</SelectItem>
                <SelectItem value="role_removed">Role removed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No audit events found.</p>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-3 pr-2">
                {filtered.map((r) => (
                  <div
                    key={r.id}
                    className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 p-3 rounded-lg border bg-card"
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <Badge className={eventColors[r.event_type] || "bg-muted text-muted-foreground"}>
                        {eventLabels[r.event_type] || r.event_type}
                      </Badge>
                      <div className="min-w-0 space-y-1">
                        <p className="text-sm">
                          <span className="font-medium">{nameFor(r.actor_id)}</span>
                          <span className="text-muted-foreground"> → </span>
                          <span className="font-medium">{nameFor(r.subject_user_id)}</span>
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                          {r.old_role && (
                            <span>
                              from <Badge variant="outline" className="font-mono">{r.old_role}</Badge>
                            </span>
                          )}
                          {r.new_role && (
                            <span>
                              to <Badge variant="outline" className="font-mono">{r.new_role}</Badge>
                            </span>
                          )}
                          {r.requested_role && !r.new_role && (
                            <span>
                              requested <Badge variant="outline" className="font-mono">{r.requested_role}</Badge>
                            </span>
                          )}
                        </div>
                        {r.details && (
                          <p className="text-xs text-muted-foreground italic">{r.details}</p>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(r.created_at).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

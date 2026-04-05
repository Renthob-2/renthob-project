import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Search, Check, X, MessageSquare } from "lucide-react";
import { ComposeMessageDialog } from "@/components/messaging/ComposeMessageDialog";
import type { AdminProperty } from "@/hooks/useAdminData";

interface AdminPropertiesTabProps {
  properties: AdminProperty[];
  onUpdateStatus: (id: string, status: string) => void;
}

const statusBadge: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  draft: "bg-muted text-muted-foreground",
  rented: "bg-blue-100 text-blue-800",
  inactive: "bg-red-100 text-red-800",
};

export function AdminPropertiesTab({ properties, onUpdateStatus }: AdminPropertiesTabProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = properties.filter((p) => {
    const matchesSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase()) ||
      p.owner_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatPrice = (price: number, period: string) =>
    `₦${price.toLocaleString()}/${period === "year" ? "yr" : "mo"}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          Property Management ({properties.length})
        </CardTitle>
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search properties..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="rented">Rented</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No properties found.</p>
        ) : (
          <div className="space-y-3">
            {filtered.map((prop) => (
              <div key={prop.id} className="p-4 rounded-lg border bg-card hover:bg-accent/30 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{prop.title}</h4>
                      <Badge className={statusBadge[prop.status] || "bg-muted"}>{prop.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {prop.location}, {prop.city}, {prop.state}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span>{formatPrice(prop.price, prop.price_period)}</span>
                      <span>•</span>
                      <span className="capitalize">{prop.property_type}</span>
                      <span>•</span>
                      <span>Owner: {prop.owner_name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <ComposeMessageDialog
                      recipientId={prop.owner_id}
                      recipientName={prop.owner_name || "Property Owner"}
                      propertyId={prop.id}
                      propertyTitle={prop.title}
                      defaultSubject={`Regarding: ${prop.title}`}
                      trigger={
                        <Button size="sm" variant="outline">
                          <MessageSquare className="h-4 w-4 mr-1" /> Message Owner
                        </Button>
                      }
                    />
                    {prop.status === "pending" && (
                      <>
                        <Button size="sm" variant="default" onClick={() => onUpdateStatus(prop.id, "active")}>
                          <Check className="h-4 w-4 mr-1" /> Approve
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => onUpdateStatus(prop.id, "inactive")}>
                          <X className="h-4 w-4 mr-1" /> Reject
                        </Button>
                      </>
                    )}
                    {prop.status === "active" && (
                      <Button size="sm" variant="outline" onClick={() => onUpdateStatus(prop.id, "inactive")}>
                        Deactivate
                      </Button>
                    )}
                    {prop.status === "inactive" && (
                      <Button size="sm" variant="outline" onClick={() => onUpdateStatus(prop.id, "active")}>
                        Reactivate
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

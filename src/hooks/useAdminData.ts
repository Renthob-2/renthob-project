import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface AdminUser {
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  created_at: string;
  is_suspended: boolean;
  is_approved: boolean;
  suspension_reason: string | null;
}

export interface AdminProperty {
  id: string;
  title: string;
  location: string;
  city: string;
  state: string;
  price: number;
  price_period: string;
  property_type: string;
  status: string;
  owner_id: string;
  owner_name?: string;
  created_at: string;
}

export interface AdminVerification {
  id: string;
  user_id: string;
  document_type: string;
  document_url: string;
  status: string;
  submitted_at: string;
  reviewed_at: string | null;
  user_name?: string;
  user_email?: string;
}

export interface AdminApplication {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  property_id: string;
  property_title?: string;
  status: string;
  employment_status: string;
  monthly_income: string | null;
  move_in_date: string;
  created_at: string;
}

export interface AdminTourRequest {
  id: string;
  property_id: string;
  property_title?: string;
  tenant_id: string;
  tenant_name?: string;
  preferred_date: string;
  preferred_time: string;
  status: string;
  created_at: string;
}

export interface AdminStats {
  totalUsers: number;
  totalTenants: number;
  totalLandlords: number;
  totalAgents: number;
  totalProperties: number;
  activeProperties: number;
  pendingProperties: number;
  pendingVerifications: number;
  pendingApplications: number;
  pendingTours: number;
  pendingRoleRequests: number;
}

export function useAdminData() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [properties, setProperties] = useState<AdminProperty[]>([]);
  const [verifications, setVerifications] = useState<AdminVerification[]>([]);
  const [applications, setApplications] = useState<AdminApplication[]>([]);
  const [tourRequests, setTourRequests] = useState<AdminTourRequest[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0, totalTenants: 0, totalLandlords: 0, totalAgents: 0,
    totalProperties: 0, activeProperties: 0, pendingProperties: 0,
    pendingVerifications: 0, pendingApplications: 0, pendingTours: 0,
    pendingRoleRequests: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch users (profiles + roles)
      const [profilesRes, rolesRes] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("*"),
      ]);

      const profiles = profilesRes.data || [];
      const roles = rolesRes.data || [];
      const roleMap = new Map(roles.map(r => [r.user_id, r.role]));

      const adminUsers: AdminUser[] = profiles.map(p => ({
        user_id: p.user_id,
        full_name: p.full_name,
        email: p.email,
        phone: p.phone,
        role: roleMap.get(p.user_id) || "unknown",
        created_at: p.created_at,
        is_suspended: (p as any).is_suspended || false,
        is_approved: (p as any).is_approved !== false,
        suspension_reason: (p as any).suspension_reason || null,
      }));
      setUsers(adminUsers);

      // Fetch properties
      const { data: propsData } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });

      const adminProps: AdminProperty[] = (propsData || []).map(p => {
        const owner = profiles.find(pr => pr.user_id === p.owner_id);
        return {
          id: p.id, title: p.title, location: p.location, city: p.city,
          state: p.state, price: p.price, price_period: p.price_period,
          property_type: p.property_type, status: p.status,
          owner_id: p.owner_id, owner_name: owner?.full_name || "Unknown",
          created_at: p.created_at,
        };
      });
      setProperties(adminProps);

      // Fetch verifications
      const { data: verifData } = await supabase
        .from("id_verifications")
        .select("*")
        .order("submitted_at", { ascending: false });

      const adminVerifs: AdminVerification[] = (verifData || []).map(v => {
        const user = profiles.find(p => p.user_id === v.user_id);
        return {
          ...v, user_name: user?.full_name || "Unknown",
          user_email: user?.email || "Unknown",
        };
      });
      setVerifications(adminVerifs);

      // Fetch applications
      const { data: appsData } = await supabase
        .from("rental_applications")
        .select("*")
        .order("created_at", { ascending: false });

      const adminApps: AdminApplication[] = (appsData || []).map(a => {
        const prop = (propsData || []).find(p => p.id === a.property_id);
        return { ...a, property_title: prop?.title || "Unknown Property" };
      });
      setApplications(adminApps);

      // Fetch tour requests
      const { data: toursData } = await supabase
        .from("tour_requests")
        .select("*")
        .order("created_at", { ascending: false });

      const adminTours: AdminTourRequest[] = (toursData || []).map(t => {
        const prop = (propsData || []).find(p => p.id === t.property_id);
        const tenant = profiles.find(p => p.user_id === t.tenant_id);
        return {
          ...t, property_title: prop?.title || "Unknown Property",
          tenant_name: tenant?.full_name || "Unknown",
        };
      });
      setTourRequests(adminTours);

      // Calculate stats
      setStats({
        totalUsers: adminUsers.length,
        totalTenants: adminUsers.filter(u => u.role === "tenant").length,
        totalLandlords: adminUsers.filter(u => u.role === "landlord").length,
        totalAgents: adminUsers.filter(u => u.role === "agent").length,
        totalProperties: adminProps.length,
        activeProperties: adminProps.filter(p => p.status === "active").length,
        pendingProperties: adminProps.filter(p => p.status === "pending").length,
        pendingVerifications: adminVerifs.filter(v => v.status === "pending").length,
        pendingApplications: adminApps.filter(a => a.status === "pending").length,
        pendingTours: adminTours.filter(t => t.status === "pending").length,
      });
    } catch (err) {
      console.error("Admin data fetch error:", err);
      toast({ title: "Error", description: "Failed to load admin data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const updatePropertyStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("properties")
      .update({ status: status as "active" | "draft" | "inactive" | "pending" | "rented" })
      .eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: `Property status updated to ${status}` });
      fetchAll();
    }
  };

  const updateVerificationStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("id_verifications")
      .update({ status, reviewed_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: `Verification ${status}` });
      fetchAll();
    }
  };

  const updateApplicationStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("rental_applications").update({ status }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: `Application ${status}` });
      fetchAll();
    }
  };

  const updateTourStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("tour_requests").update({ status }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: `Tour request ${status}` });
      fetchAll();
    }
  };

  return {
    users, properties, verifications, applications, tourRequests, stats, loading,
    refetch: fetchAll, updatePropertyStatus, updateVerificationStatus,
    updateApplicationStatus, updateTourStatus,
  };
}

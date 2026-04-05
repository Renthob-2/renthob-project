import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, DollarSign, ArrowDownToLine, Plus, RefreshCw, Percent } from "lucide-react";
import { format } from "date-fns";

interface AffiliateWithProfile {
  id: string;
  user_id: string;
  referral_code: string;
  commission_rate: number;
  total_earnings: number;
  available_balance: number;
  is_active: boolean;
  created_at: string;
  full_name?: string;
  email?: string;
}

interface WithdrawalWithUser {
  id: string;
  affiliate_user_id: string;
  amount: number;
  status: string;
  admin_note: string | null;
  bank_name: string | null;
  account_number: string | null;
  account_name: string | null;
  created_at: string;
  reviewed_at: string | null;
  full_name?: string;
}

export default function AdminAffiliatesPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [affiliates, setAffiliates] = useState<AffiliateWithProfile[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [editingRate, setEditingRate] = useState<{ id: string; rate: string } | null>(null);
  const [editingCode, setEditingCode] = useState<{ id: string; code: string } | null>(null);
  const [emailInput, setEmailInput] = useState("");
  const [addingByEmail, setAddingByEmail] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [affRes, wdRes, profilesRes] = await Promise.all([
        supabase.from("affiliate_profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("affiliate_withdrawals").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("user_id, full_name, email"),
      ]);

      const profiles = profilesRes.data || [];
      const profileMap = new Map(profiles.map(p => [p.user_id, p]));

      setAffiliates((affRes.data || []).map((a: any) => {
        const p = profileMap.get(a.user_id);
        return { ...a, full_name: p?.full_name || "Unknown", email: p?.email || "" };
      }));

      setWithdrawals((wdRes.data || []).map((w: any) => {
        const p = profileMap.get(w.affiliate_user_id);
        return { ...w, full_name: p?.full_name || "Unknown" };
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const searchUsers = async (term: string) => {
    setSearchTerm(term);
    if (term.length < 2) { setSearchResults([]); return; }
    const { data } = await supabase.rpc("search_profiles_for_invite", { search_term: term });
    const existingIds = new Set(affiliates.map(a => a.user_id));
    setSearchResults((data || []).filter((u: any) => !existingIds.has(u.user_id)));
  };

  const addAffiliate = async (userId: string) => {
    const code = "REF" + Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const { error: profileError } = await supabase.from("affiliate_profiles").insert({
      user_id: userId,
      referral_code: code,
    } as any);

    if (profileError) {
      toast({ title: "Error", description: profileError.message, variant: "destructive" });
      return;
    }

    const { error: roleError } = await supabase.from("user_roles").update({ role: "affiliate" as any }).eq("user_id", userId);
    if (roleError) {
      console.error("Role update error:", roleError);
    }

    toast({ title: "Affiliate Added", description: `Referral code: ${code}` });
    setAddOpen(false);
    setSearchTerm("");
    setSearchResults([]);
    setEmailInput("");
    fetchAll();
  };

  const addAffiliateByEmail = async () => {
    if (!emailInput.trim()) return;
    setAddingByEmail(true);
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .eq("email", emailInput.trim().toLowerCase())
        .maybeSingle();

      if (!profile) {
        toast({ title: "User Not Found", description: "No account found with that email address.", variant: "destructive" });
        return;
      }

      const existing = affiliates.find(a => a.user_id === profile.user_id);
      if (existing) {
        toast({ title: "Already an Affiliate", description: `${profile.full_name || profile.email} is already an affiliate.`, variant: "destructive" });
        return;
      }

      await addAffiliate(profile.user_id);
    } finally {
      setAddingByEmail(false);
    }
  };

  const removeAffiliate = async (affiliate: AffiliateWithProfile) => {
    // Delete affiliate profile
    const { error: delError } = await supabase.from("affiliate_profiles").delete().eq("id", affiliate.id);
    if (delError) {
      toast({ title: "Error", description: delError.message, variant: "destructive" });
      return;
    }

    // Revert role back to tenant
    await supabase.from("user_roles").update({ role: "tenant" as any }).eq("user_id", affiliate.user_id);

    toast({ title: "Affiliate Removed", description: `${affiliate.full_name || "User"} has been removed from the affiliate program.` });
    fetchAll();
  };

  const updateReferralCode = async (affiliateId: string, newCode: string) => {
    if (!newCode.trim()) {
      toast({ title: "Error", description: "Referral code cannot be empty.", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("affiliate_profiles").update({ referral_code: newCode.trim().toUpperCase() } as any).eq("id", affiliateId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Referral Code Updated" });
      setEditingCode(null);
      fetchAll();
    }
  };

  const updateCommissionRate = async (affiliateId: string, newRate: number) => {
    const { error } = await supabase.from("affiliate_profiles").update({ commission_rate: newRate } as any).eq("id", affiliateId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Rate Updated" });
      setEditingRate(null);
      fetchAll();
    }
  };

  const handleWithdrawalAction = async (withdrawalId: string, status: "approved" | "rejected", affiliateUserId: string, amount: number) => {
    const { error } = await supabase.from("affiliate_withdrawals").update({
      status,
      reviewed_by: user?.id,
      reviewed_at: new Date().toISOString(),
    } as any).eq("id", withdrawalId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    if (status === "approved") {
      const aff = affiliates.find(a => a.user_id === affiliateUserId);
      if (aff) {
        await supabase.from("affiliate_profiles").update({
          available_balance: Math.max(0, aff.available_balance - amount),
        } as any).eq("user_id", affiliateUserId);
      }
    }

    toast({ title: `Withdrawal ${status}` });
    fetchAll();
  };

  const toggleActive = async (affiliateId: string, currentActive: boolean) => {
    const { error } = await supabase.from("affiliate_profiles").update({ is_active: !currentActive } as any).eq("id", affiliateId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: currentActive ? "Affiliate Deactivated" : "Affiliate Activated" });
      fetchAll();
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "approved": case "paid": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const pendingWithdrawals = withdrawals.filter(w => w.status === "pending");
  const totalAffiliateEarnings = affiliates.reduce((sum, a) => sum + a.total_earnings, 0);

  if (loading) {
    return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Affiliates</h2>
          <p className="text-muted-foreground text-sm">Manage affiliate program</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchAll}>
            <RefreshCw className="h-4 w-4 mr-1" /> Refresh
          </Button>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Affiliate</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Affiliate</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                {/* Add by email */}
                <div className="space-y-2">
                  <Label>Add by email address</Label>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      value={emailInput}
                      onChange={e => setEmailInput(e.target.value)}
                      placeholder="user@example.com"
                      onKeyDown={e => e.key === "Enter" && addAffiliateByEmail()}
                    />
                    <Button size="sm" onClick={addAffiliateByEmail} disabled={addingByEmail || !emailInput.trim()}>
                      {addingByEmail ? "Adding..." : "Add"}
                    </Button>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">or search</span></div>
                </div>

                {/* Search by name */}
                <div className="space-y-2">
                  <Label>Search user by name or email</Label>
                  <Input value={searchTerm} onChange={e => searchUsers(e.target.value)} placeholder="Type to search..." />
                </div>
                {searchResults.length > 0 && (
                  <div className="space-y-2 max-h-48 overflow-auto">
                    {searchResults.map((u: any) => (
                      <div key={u.user_id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="text-sm font-medium">{u.full_name || "No name"}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                        <Button size="sm" onClick={() => addAffiliate(u.user_id)}>Add</Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <Users className="h-4 w-4 text-primary mb-1" />
            <p className="text-xs text-muted-foreground">Total Affiliates</p>
            <p className="text-xl font-bold">{affiliates.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <DollarSign className="h-4 w-4 text-green-600 mb-1" />
            <p className="text-xs text-muted-foreground">Total Earnings</p>
            <p className="text-xl font-bold">₦{totalAffiliateEarnings.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <ArrowDownToLine className="h-4 w-4 text-yellow-600 mb-1" />
            <p className="text-xs text-muted-foreground">Pending Withdrawals</p>
            <p className="text-xl font-bold">{pendingWithdrawals.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <Users className="h-4 w-4 text-primary mb-1" />
            <p className="text-xs text-muted-foreground">Active Affiliates</p>
            <p className="text-xl font-bold">{affiliates.filter(a => a.is_active).length}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="affiliates">
        <TabsList>
          <TabsTrigger value="affiliates">Affiliates</TabsTrigger>
          <TabsTrigger value="withdrawals">
            Withdrawals {pendingWithdrawals.length > 0 && <Badge variant="destructive" className="ml-1 h-5 text-[10px]">{pendingWithdrawals.length}</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="affiliates">
          <Card>
            <CardContent className="pt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Earnings</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {affiliates.map(a => (
                    <TableRow key={a.id}>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{a.full_name}</p>
                          <p className="text-xs text-muted-foreground">{a.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {editingCode?.id === a.id ? (
                          <div className="flex gap-1">
                            <Input className="w-24 h-7 text-sm font-mono" value={editingCode.code} onChange={e => setEditingCode({ ...editingCode, code: e.target.value })} />
                            <Button size="sm" variant="outline" className="h-7" onClick={() => updateReferralCode(a.id, editingCode.code)}>Save</Button>
                            <Button size="sm" variant="ghost" className="h-7" onClick={() => setEditingCode(null)}>✕</Button>
                          </div>
                        ) : (
                          <button className="font-mono text-sm hover:underline" onClick={() => setEditingCode({ id: a.id, code: a.referral_code })}>
                            {a.referral_code}
                          </button>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingRate?.id === a.id ? (
                          <div className="flex gap-1">
                            <Input className="w-16 h-7 text-sm" type="number" value={editingRate.rate} onChange={e => setEditingRate({ ...editingRate, rate: e.target.value })} />
                            <Button size="sm" variant="outline" className="h-7" onClick={() => updateCommissionRate(a.id, parseFloat(editingRate.rate))}>Save</Button>
                          </div>
                        ) : (
                          <button className="text-sm hover:underline flex items-center gap-1" onClick={() => setEditingRate({ id: a.id, rate: String(a.commission_rate) })}>
                            {a.commission_rate}% <Percent className="h-3 w-3" />
                          </button>
                        )}
                      </TableCell>
                      <TableCell>₦{a.total_earnings.toLocaleString()}</TableCell>
                      <TableCell>₦{a.available_balance.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={a.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          {a.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" onClick={() => toggleActive(a.id, a.is_active)}>
                            {a.is_active ? "Deactivate" : "Activate"}
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => removeAffiliate(a)}>
                            Remove
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdrawals">
          <Card>
            <CardContent className="pt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Affiliate</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Bank</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawals.map(w => (
                    <TableRow key={w.id}>
                      <TableCell className="text-sm">{format(new Date(w.created_at), "MMM d, yyyy")}</TableCell>
                      <TableCell className="text-sm">{w.full_name}</TableCell>
                      <TableCell className="font-semibold">₦{w.amount.toLocaleString()}</TableCell>
                      <TableCell className="text-sm">{w.bank_name || "-"}</TableCell>
                      <TableCell className="text-sm">
                        <div>
                          <p>{w.account_number || "-"}</p>
                          <p className="text-xs text-muted-foreground">{w.account_name}</p>
                        </div>
                      </TableCell>
                      <TableCell><Badge className={statusColor(w.status)}>{w.status}</Badge></TableCell>
                      <TableCell>
                        {w.status === "pending" && (
                          <div className="flex gap-1">
                            <Button size="sm" variant="default" className="h-7" onClick={() => handleWithdrawalAction(w.id, "approved", w.affiliate_user_id, w.amount)}>Approve</Button>
                            <Button size="sm" variant="destructive" className="h-7" onClick={() => handleWithdrawalAction(w.id, "rejected", w.affiliate_user_id, w.amount)}>Reject</Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
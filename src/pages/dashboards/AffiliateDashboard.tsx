import { useState } from "react";
import { BackButton } from "@/components/BackButton";
import { useAffiliateData } from "@/hooks/useAffiliateData";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Copy, Users, DollarSign, TrendingUp, Wallet, ArrowDownToLine, Check, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function AffiliateDashboard() {
  const { profile, referrals, commissions, withdrawals, loading, refetch, requestWithdrawal } = useAffiliateData();
  const { toast } = useToast();
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState({ amount: "", bankName: "", accountNumber: "", accountName: "" });
  const [copied, setCopied] = useState(false);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <Card>
          <CardHeader>
            <CardTitle>Affiliate Program</CardTitle>
            <CardDescription>Your affiliate account is being set up. Please contact support if this persists.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const referralLink = `${window.location.origin}/signup?ref=${profile.referral_code}`;
  const totalSignups = referrals.length;
  const verifiedSignups = referrals.filter(r => r.status === "verified" || r.status === "converted").length;
  const conversions = referrals.filter(r => r.status === "converted").length;

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast({ title: "Copied!", description: "Referral link copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawForm.amount);
    if (!amount || amount <= 0) {
      toast({ title: "Invalid amount", variant: "destructive" });
      return;
    }
    await requestWithdrawal(amount, withdrawForm.bankName, withdrawForm.accountNumber, withdrawForm.accountName);
    setWithdrawOpen(false);
    setWithdrawForm({ amount: "", bankName: "", accountNumber: "", accountName: "" });
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "approved": case "paid": case "converted": case "verified": return "bg-green-100 text-green-800";
      case "pending": case "signed_up": return "bg-yellow-100 text-yellow-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 space-y-6">
      <BackButton />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Affiliate Dashboard</h1>
          <p className="text-muted-foreground text-sm">Track your referrals and earnings</p>
        </div>
        <Button variant="outline" size="sm" onClick={refetch}>
          <RefreshCw className="h-4 w-4 mr-1" /> Refresh
        </Button>
      </div>

      {/* Referral Code Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-1">Your Referral Code</p>
              <p className="text-2xl font-bold font-mono text-primary">{profile.referral_code}</p>
            </div>
            <div className="flex-1 w-full">
              <p className="text-sm font-medium text-muted-foreground mb-1">Referral Link</p>
              <div className="flex gap-2">
                <Input value={referralLink} readOnly className="text-xs" />
                <Button size="sm" onClick={copyReferralLink} variant="outline">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Total Signups</span>
            </div>
            <p className="text-2xl font-bold">{totalSignups}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-xs text-muted-foreground">Conversions</span>
            </div>
            <p className="text-2xl font-bold">{conversions}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Total Earnings</span>
            </div>
            <p className="text-2xl font-bold">₦{profile.total_earnings.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="h-4 w-4 text-green-600" />
              <span className="text-xs text-muted-foreground">Available Balance</span>
            </div>
            <p className="text-2xl font-bold">₦{profile.available_balance.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Commission Rate & Withdraw */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Card className="flex-1">
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-muted-foreground">Commission Rate</p>
            <p className="text-3xl font-bold text-primary">{profile.commission_rate}%</p>
            <p className="text-xs text-muted-foreground mt-1">Set by admin</p>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardContent className="pt-4 pb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Withdrawals</p>
              <p className="text-lg font-semibold">{withdrawals.filter(w => w.status === "pending").length} pending</p>
            </div>
            <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
              <DialogTrigger asChild>
                <Button size="sm" disabled={profile.available_balance <= 0}>
                  <ArrowDownToLine className="h-4 w-4 mr-1" /> Withdraw
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Request Withdrawal</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <p className="text-sm text-muted-foreground">Available: ₦{profile.available_balance.toLocaleString()}</p>
                  <div className="space-y-2">
                    <Label>Amount (₦)</Label>
                    <Input type="number" value={withdrawForm.amount} onChange={e => setWithdrawForm(f => ({ ...f, amount: e.target.value }))} placeholder="Enter amount" />
                  </div>
                  <div className="space-y-2">
                    <Label>Bank Name</Label>
                    <Input value={withdrawForm.bankName} onChange={e => setWithdrawForm(f => ({ ...f, bankName: e.target.value }))} placeholder="e.g. First Bank" />
                  </div>
                  <div className="space-y-2">
                    <Label>Account Number</Label>
                    <Input value={withdrawForm.accountNumber} onChange={e => setWithdrawForm(f => ({ ...f, accountNumber: e.target.value }))} placeholder="0123456789" />
                  </div>
                  <div className="space-y-2">
                    <Label>Account Name</Label>
                    <Input value={withdrawForm.accountName} onChange={e => setWithdrawForm(f => ({ ...f, accountName: e.target.value }))} placeholder="John Doe" />
                  </div>
                  <Button className="w-full" onClick={handleWithdraw}>Submit Withdrawal Request</Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      {/* Referrals Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Referral Signups</CardTitle>
        </CardHeader>
        <CardContent>
          {referrals.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No referrals yet. Share your code to get started!</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Code Used</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referrals.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="text-sm">{format(new Date(r.created_at), "MMM d, yyyy")}</TableCell>
                    <TableCell className="font-mono text-sm">{r.referral_code_used}</TableCell>
                    <TableCell><Badge className={statusColor(r.status)}>{r.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Commissions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Commissions</CardTitle>
        </CardHeader>
        <CardContent>
          {commissions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No commissions earned yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Transaction</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commissions.map(c => (
                  <TableRow key={c.id}>
                    <TableCell className="text-sm">{format(new Date(c.created_at), "MMM d, yyyy")}</TableCell>
                    <TableCell>₦{c.transaction_amount.toLocaleString()}</TableCell>
                    <TableCell>{c.commission_rate}%</TableCell>
                    <TableCell className="font-semibold">₦{c.commission_amount.toLocaleString()}</TableCell>
                    <TableCell><Badge className={statusColor(c.status)}>{c.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Withdrawals Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Withdrawal History</CardTitle>
        </CardHeader>
        <CardContent>
          {withdrawals.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No withdrawals yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Bank</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.map(w => (
                  <TableRow key={w.id}>
                    <TableCell className="text-sm">{format(new Date(w.created_at), "MMM d, yyyy")}</TableCell>
                    <TableCell className="font-semibold">₦{w.amount.toLocaleString()}</TableCell>
                    <TableCell className="text-sm">{w.bank_name || "-"}</TableCell>
                    <TableCell><Badge className={statusColor(w.status)}>{w.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

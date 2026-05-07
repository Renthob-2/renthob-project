import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, Settings2, Users, RotateCcw } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AffiliateTermsPanelProps {
  activeAffiliateCount: number;
  onApplied?: () => void;
}

export function AffiliateTermsPanel({ activeAffiliateCount, onApplied }: AffiliateTermsPanelProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [applying, setApplying] = useState(false);
  const [defaultRate, setDefaultRate] = useState<string>("5");
  const [minWithdrawal, setMinWithdrawal] = useState<string>("5000");
  const [bulkRate, setBulkRate] = useState<string>("5");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("platform_settings")
        .select("key, value")
        .in("key", ["default_affiliate_commission_rate", "min_withdrawal_amount"]);
      if (data) {
        for (const s of data) {
          if (s.key === "default_affiliate_commission_rate") {
            setDefaultRate(String(s.value));
            setBulkRate(String(s.value));
          }
          if (s.key === "min_withdrawal_amount") setMinWithdrawal(String(s.value));
        }
      }
      setLoading(false);
    };
    load();
  }, []);

  const saveSetting = async (key: string, value: number) => {
    const { error } = await supabase
      .from("platform_settings")
      .update({ value: value as any })
      .eq("key", key);
    if (error) throw error;
  };

  const handleSave = async () => {
    const rate = parseFloat(defaultRate);
    const minW = parseFloat(minWithdrawal);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      toast({ title: "Invalid rate", description: "Commission rate must be 0-100.", variant: "destructive" });
      return;
    }
    if (isNaN(minW) || minW < 0) {
      toast({ title: "Invalid amount", description: "Minimum withdrawal must be 0 or greater.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await saveSetting("default_affiliate_commission_rate", rate);
      await saveSetting("min_withdrawal_amount", minW);
      toast({ title: "Settings saved", description: "Affiliate program defaults updated." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleBulkApply = async () => {
    const rate = parseFloat(bulkRate);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      toast({ title: "Invalid rate", description: "Rate must be 0-100.", variant: "destructive" });
      return;
    }
    setApplying(true);
    const { data, error } = await supabase.rpc("bulk_update_affiliate_commission", {
      new_rate: rate,
      target_user_ids: null,
    });
    setApplying(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Applied", description: `Updated ${data} active affiliate(s) to ${rate}%.` });
      onApplied?.();
    }
  };

  const handleResetToDefaults = async () => {
    const rate = parseFloat(defaultRate);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      toast({ title: "Invalid default", description: "Save a valid default rate first.", variant: "destructive" });
      return;
    }
    setApplying(true);
    const { data, error } = await supabase.rpc("bulk_update_affiliate_commission", {
      new_rate: rate,
      target_user_ids: null,
    });
    setApplying(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Reset complete", description: `Reset ${data} affiliate(s) to default ${rate}%. Minimum withdrawal applies platform-wide.` });
      onApplied?.();
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Settings2 className="h-4 w-4" /> Default Affiliate Terms
          </CardTitle>
          <CardDescription>
            These defaults apply to <strong>new</strong> affiliates and are shown on the public affiliate program page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="default-rate">Default commission rate (%)</Label>
              <Input
                id="default-rate"
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={defaultRate}
                onChange={(e) => setDefaultRate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="min-w">Minimum withdrawal (₦)</Label>
              <Input
                id="min-w"
                type="number"
                min="0"
                step="100"
                value={minWithdrawal}
                onChange={(e) => setMinWithdrawal(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save defaults
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" /> Apply Rate to All Active Affiliates
          </CardTitle>
          <CardDescription>
            Bulk-update the commission rate for every active affiliate. Individual rates can still be edited per-affiliate in the table.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end gap-2">
            <div className="flex-1 space-y-2">
              <Label htmlFor="bulk-rate">New rate (%)</Label>
              <Input
                id="bulk-rate"
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={bulkRate}
                onChange={(e) => setBulkRate(e.target.value)}
              />
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button disabled={applying || activeAffiliateCount === 0}>
                  {applying ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Apply to all
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Apply {bulkRate}% to all active affiliates?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will overwrite the current commission rate for all <strong>{activeAffiliateCount}</strong> active affiliate(s). This cannot be undone in bulk.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleBulkApply}>Yes, apply</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

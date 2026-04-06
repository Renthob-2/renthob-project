import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link2, Loader2, CheckCircle, Clock, XCircle } from "lucide-react";

export function AffiliateSignupCard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [affiliateProfile, setAffiliateProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("affiliate_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      setAffiliateProfile(data);
      setLoading(false);
    };
    fetch();
  }, [user]);

  const handleApply = async () => {
    if (!user) return;
    setApplying(true);
    const code = "REF" + Math.random().toString(36).substring(2, 8).toUpperCase();
    const { error } = await supabase.from("affiliate_profiles").insert({
      user_id: user.id,
      referral_code: code,
      is_active: false,
    } as any);

    if (error) {
      if (error.code === "23505") {
        toast({ title: "Already Applied", description: "You have already applied for the affiliate program.", variant: "destructive" });
      } else {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    } else {
      toast({ title: "Application Submitted!", description: "Your affiliate application is pending admin approval." });
      setAffiliateProfile({ is_active: false, referral_code: code });
    }
    setApplying(false);
  };

  if (loading) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-5 w-5 text-primary" />
          Affiliate Program
        </CardTitle>
        <CardDescription>Earn commissions by referring users to Renthob</CardDescription>
      </CardHeader>
      <CardContent>
        {!affiliateProfile ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Join our affiliate program to earn commissions on referrals. Share your unique referral link and earn when your referrals complete transactions.
            </p>
            <Button onClick={handleApply} disabled={applying} className="w-full">
              {applying ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Link2 className="h-4 w-4 mr-2" />}
              Apply for Affiliate Program
            </Button>
          </div>
        ) : !affiliateProfile.is_active ? (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
            <Clock className="h-5 w-5 text-yellow-600 shrink-0" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Application Pending</p>
              <p className="text-xs text-yellow-600">Your affiliate application is awaiting admin approval.</p>
            </div>
            <Badge className="bg-yellow-100 text-yellow-800 ml-auto shrink-0">Pending</Badge>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
              <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-800">Active Affiliate</p>
                <p className="text-xs text-green-600">Referral Code: <span className="font-mono font-bold">{affiliateProfile.referral_code}</span></p>
              </div>
              <Badge className="bg-green-100 text-green-800 ml-auto shrink-0">Active</Badge>
            </div>
            <Button variant="outline" className="w-full" asChild>
              <a href="/affiliate">View Affiliate Dashboard</a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface AffiliateProfile {
  id: string;
  user_id: string;
  referral_code: string;
  commission_rate: number;
  total_earnings: number;
  available_balance: number;
  is_active: boolean;
  created_at: string;
}

export interface ReferralSignup {
  id: string;
  referred_user_id: string;
  affiliate_user_id: string;
  referral_code_used: string;
  status: string;
  created_at: string;
  referred_name?: string;
  referred_email?: string;
}

export interface AffiliateCommission {
  id: string;
  affiliate_user_id: string;
  referral_signup_id: string | null;
  property_id: string | null;
  transaction_amount: number;
  commission_rate: number;
  commission_amount: number;
  status: string;
  created_at: string;
}

export interface AffiliateWithdrawal {
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
}

export function useAffiliateData() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<AffiliateProfile | null>(null);
  const [referrals, setReferrals] = useState<ReferralSignup[]>([]);
  const [commissions, setCommissions] = useState<AffiliateCommission[]>([]);
  const [withdrawals, setWithdrawals] = useState<AffiliateWithdrawal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [profileRes, referralsRes, commissionsRes, withdrawalsRes] = await Promise.all([
        supabase.from("affiliate_profiles").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("referral_signups").select("*").eq("affiliate_user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("affiliate_commissions").select("*").eq("affiliate_user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("affiliate_withdrawals").select("*").eq("affiliate_user_id", user.id).order("created_at", { ascending: false }),
      ]);

      setProfile(profileRes.data as AffiliateProfile | null);
      setReferrals((referralsRes.data || []) as ReferralSignup[]);
      setCommissions((commissionsRes.data || []) as AffiliateCommission[]);
      setWithdrawals((withdrawalsRes.data || []) as AffiliateWithdrawal[]);
    } catch (err) {
      console.error("Affiliate data fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const requestWithdrawal = async (amount: number, bankName: string, accountNumber: string, accountName: string) => {
    if (!user || !profile) return;
    if (amount > profile.available_balance) {
      toast({ title: "Error", description: "Insufficient balance", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("affiliate_withdrawals").insert({
      affiliate_user_id: user.id,
      amount,
      bank_name: bankName,
      account_number: accountNumber,
      account_name: accountName,
    } as any);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Withdrawal Requested", description: `₦${amount.toLocaleString()} withdrawal submitted for review.` });
      fetchAll();
    }
  };

  return { profile, referrals, commissions, withdrawals, loading, refetch: fetchAll, requestWithdrawal };
}

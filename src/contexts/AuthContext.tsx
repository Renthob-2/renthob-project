import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { getSiteUrl } from "@/lib/siteUrl";

export type AppRole = "tenant" | "landlord" | "agent" | "admin" | "affiliate";
export type SelfServiceRole = "tenant" | "landlord" | "agent";

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  phone: string | null;
  display_name_preference: string | null;
  agency_name: string | null;
  username: string | null;
  is_approved: boolean;
  is_suspended: boolean;
  suspension_reason: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: AppRole | null;
  isAffiliate: boolean;
  affiliateActive: boolean;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    requestedRole: SelfServiceRole,
    referralCode?: string,
  ) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function isUpgradeRole(value: unknown): value is "landlord" | "agent" {
  return value === "landlord" || value === "agent";
}

async function ensureSignupIntent(user: User): Promise<void> {
  const { data: existingRole } = await supabase
    .from("user_roles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  // The database trigger normally creates this. Keeping this fallback makes
  // older projects safe without allowing a user to grant a privileged role.
  if (!existingRole) {
    const { error } = await supabase
      .from("user_roles")
      .insert({ user_id: user.id, role: "tenant" });
    if (error && error.code !== "23505") throw error;
  }

  const requestedRole =
    user.user_metadata?.requested_role ?? user.user_metadata?.app_role;

  if (isUpgradeRole(requestedRole)) {
    const { data: existingRequest, error: requestLookupError } = await supabase
      .from("role_requests")
      .select("id")
      .eq("user_id", user.id)
      .eq("requested_role", requestedRole)
      .limit(1)
      .maybeSingle();

    if (requestLookupError) throw requestLookupError;
    if (!existingRequest) {
      const { error } = await supabase
        .from("role_requests")
        .insert({ user_id: user.id, requested_role: requestedRole });
      if (error && error.code !== "23505") throw error;
    }
  }

  const referralCode = user.user_metadata?.referral_code;
  if (typeof referralCode !== "string" || !referralCode.trim()) return;

  const { data: existingReferral } = await supabase
    .from("referral_signups")
    .select("id")
    .eq("referred_user_id", user.id)
    .limit(1)
    .maybeSingle();
  if (existingReferral) return;

  const { data: affiliateUserId, error: affiliateError } = await supabase.rpc(
    "get_affiliate_by_code",
    { code: referralCode.trim() },
  );
  if (affiliateError) throw affiliateError;

  if (affiliateUserId && affiliateUserId !== user.id) {
    const { error } = await supabase.from("referral_signups").insert({
      referred_user_id: user.id,
      affiliate_user_id: affiliateUserId,
      referral_code_used: referralCode.trim(),
    });
    if (error && error.code !== "23505") throw error;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [isAffiliate, setIsAffiliate] = useState(false);
  const [affiliateActive, setAffiliateActive] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAffiliate = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("affiliate_profiles")
      .select("is_active")
      .eq("user_id", userId)
      .maybeSingle();
    setIsAffiliate(Boolean(data));
    setAffiliateActive(Boolean(data?.is_active));
  }, []);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    setProfile(data);
  }, []);

  const fetchRole = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();
    setRole((data?.role as AppRole | undefined) ?? null);
  }, []);

  const refreshUserData = useCallback(
    async (userId: string) => {
      await Promise.all([
        fetchProfile(userId),
        fetchRole(userId),
        fetchAffiliate(userId),
      ]);
    },
    [fetchAffiliate, fetchProfile, fetchRole],
  );

  useEffect(() => {
    if (!user) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") void refreshUserData(user.id);
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const interval = window.setInterval(() => {
      void Promise.all([fetchRole(user.id), fetchAffiliate(user.id)]);
    }, 60_000);

    const channel = supabase
      .channel(`user-role-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_roles",
          filter: `user_id=eq.${user.id}`,
        },
        () => void fetchRole(user.id),
      )
      .subscribe();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.clearInterval(interval);
      void supabase.removeChannel(channel);
    };
  }, [fetchAffiliate, fetchRole, refreshUserData, user]);

  useEffect(() => {
    const applySession = async (currentSession: Session | null) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (!currentSession?.user) {
        setProfile(null);
        setRole(null);
        setIsAffiliate(false);
        setAffiliateActive(false);
        setLoading(false);
        return;
      }

      try {
        await ensureSignupIntent(currentSession.user);
      } catch (error) {
        console.error("Unable to complete account setup:", error);
      }
      await refreshUserData(currentSession.user.id);
      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        void applySession(currentSession);
      },
    );

    void supabase.auth.getSession().then(({ data }) => applySession(data.session));
    return () => subscription.unsubscribe();
  }, [refreshUserData]);

  const signUp: AuthContextType["signUp"] = async (
    email,
    password,
    fullName,
    requestedRole,
    referralCode,
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: getSiteUrl("/login?verified=1"),
          data: {
            full_name: fullName.trim(),
            app_role: "tenant",
            requested_role: requestedRole,
            referral_code: referralCode?.trim() || null,
          },
        },
      });

      if (error) throw error;
      if (data.user?.identities?.length === 0) {
        throw new Error("An account with this email already exists. Please log in instead.");
      }
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error("Unable to create account") };
    }
  };

  const signIn: AuthContextType["signIn"] = async (email, password) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error("Unable to log in") };
    }
  };

  const signOut = async () => {
    setUser(null);
    setSession(null);
    setProfile(null);
    setRole(null);
    setIsAffiliate(false);
    setAffiliateActive(false);
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        role,
        isAffiliate,
        affiliateActive,
        loading,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}

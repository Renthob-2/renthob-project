import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AppRole = "tenant" | "landlord" | "agent" | "admin" | "affiliate";

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
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: AppRole | null;
  isAffiliate: boolean;
  affiliateActive: boolean;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role: AppRole, referralCode?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [isAffiliate, setIsAffiliate] = useState(false);
  const [affiliateActive, setAffiliateActive] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAffiliate = async (userId: string) => {
    const { data } = await supabase
      .from("affiliate_profiles")
      .select("is_active")
      .eq("user_id", userId)
      .maybeSingle();
    setIsAffiliate(!!data);
    setAffiliateActive(!!data?.is_active);
  };

  const fetchProfile = async (userId: string) => {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    
    setProfile(profileData);
  };

  const fetchRole = async (userId: string) => {
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();
    
    setRole(roleData?.role as AppRole | null);
  };

  // Re-fetch role when tab regains focus (catches admin role changes)
  const refetchUserData = async () => {
    const currentUser = (await supabase.auth.getUser()).data.user;
    if (currentUser) {
      await fetchProfile(currentUser.id);
      await fetchRole(currentUser.id);
      await fetchAffiliate(currentUser.id);
    }
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        refetchUserData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Also poll every 60 seconds for role changes
    const interval = setInterval(() => {
      if (user) {
        fetchRole(user.id);
        fetchAffiliate(user.id);
      }
    }, 60000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, [user]);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          const userId = currentSession.user.id;
          
          // On first sign-in after email verification, insert the role from metadata
          if (event === "SIGNED_IN") {
            const appRole = currentSession.user.user_metadata?.app_role;
            if (appRole) {
              // Check if role already exists before inserting
              const { data: existingRole } = await supabase
                .from("user_roles")
                .select("id")
                .eq("user_id", userId)
                .maybeSingle();
              
              if (!existingRole) {
                // Always insert tenant role first (RLS only allows tenant self-assignment)
                const { error: roleInsertError } = await supabase
                  .from("user_roles")
                  .insert({ user_id: userId, role: "tenant" });
                
                if (roleInsertError) {
                  console.error("Failed to insert tenant role:", roleInsertError);
                }
                
                // If they requested landlord/agent, create a role upgrade request
                if (appRole === "landlord" || appRole === "agent") {
                  const { error: requestError } = await supabase
                    .from("role_requests")
                    .insert({ user_id: userId, requested_role: appRole } as any);
                  
                  if (requestError) {
                    console.error("Failed to create role request:", requestError);
                  }
                }

                // Track referral signup if referral code was provided
                const referralCode = currentSession.user.user_metadata?.referral_code;
                if (referralCode) {
                  // Look up the affiliate by referral code
                  const { data: affiliateUserId } = await supabase.rpc("get_affiliate_by_code", { code: referralCode });
                  if (affiliateUserId && affiliateUserId !== userId) {
                    const { error: refError } = await supabase
                      .from("referral_signups")
                      .insert({
                        referred_user_id: userId,
                        affiliate_user_id: affiliateUserId,
                        referral_code_used: referralCode,
                      } as any);
                    if (refError) {
                      console.error("Failed to track referral:", refError);
                    }
                  }
                }
              }
            }
          }
          
          // Use setTimeout to avoid potential race conditions with Supabase
          setTimeout(() => {
            fetchProfile(userId);
            fetchRole(userId);
          }, 0);
        } else {
          setProfile(null);
          setRole(null);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      
      if (existingSession?.user) {
        fetchProfile(existingSession.user.id);
        fetchRole(existingSession.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, role: AppRole, referralCode?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login?verified=1`,
          data: {
            full_name: fullName,
            app_role: role,
            referral_code: referralCode || null,
          },
        },
      });

      if (error) throw error;

      // Check if user already exists (Supabase returns a fake user with no identities)
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        throw new Error("An account with this email already exists. Please log in instead.");
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    setUser(null);
    setSession(null);
    setProfile(null);
    setRole(null);
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
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

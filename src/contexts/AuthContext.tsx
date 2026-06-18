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

    const interval = setInterval(() => {
      if (user) {
        fetchRole(user.id);
        fetchAffiliate(user.id);
      }
    }, 60000);

    let channel: ReturnType<typeof supabase.channel> | null = null;
    if (user) {
      channel = supabase
        .channel(`user-role-${user.id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'user_roles', filter: `user_id=eq.${user.id}` },
          () => {
            fetchRole(user.id);
          }
        )
        .subscribe();
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
      if (channel) supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          const userId = currentSession.user.id;
          
          if (event === "SIGNED_IN") {
            const appRole = currentSession.user.user_metadata?.app_role;
            const fullName = currentSession.user.user_metadata?.full_name;
            
            if (appRole) {
              // 1. Ensure the custom user profile exists cleanly manually
              await supabase
                .from("profiles")
                .insert({ 
                  user_id: userId, 
                  full_name: fullName || "", 
                  email: currentSession.user.email 
                })
                .select()
                .maybeSingle();

              // 2. Check and assign the selected dynamic role directly
              const { data: existingRole } = await supabase
                .from("user_roles")
                .select("id")
                .eq("user_id", userId)
                .maybeSingle();
              
              if (!existingRole) {
                const { error: roleInsertError } = await supabase
                  .from("user_roles")
                  .insert({ user_id: userId, role: appRole });
                
                if (roleInsertError) {
                  console.error(`Failed to assign selection role (${appRole}):`, roleInsertError);
                }

                // Track referral signup if referral code was provided
                const referralCode = currentSession.user.user_metadata?.referral_code;
                if (referralCode) {
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
          
          setTimeout(() => {
            fetchProfile(userId);
            fetchRole(userId);
            fetchAffiliate(userId);
          }, 0);
        } else {
          setProfile(null);
          setRole(null);
          setIsAffiliate(false);
          setAffiliateActive(false);
        }
        
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      
      if (existingSession?.user) {
        fetchProfile(existingSession.user.id);
        fetchRole(existingSession.user.id);
        fetchAffiliate(existingSession.user.id);
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
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
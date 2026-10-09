import { createContext, useContext, useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { db } from "@/lib/db";

export type UserRole = "citizen" | "officer" | "contractor" | "volunteer" | "admin";

export interface Profile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  city: string;
  status: string;
  points: number;
  reports_count: number;
  resolved_count: number;
  department?: string;
  designation?: string;
  vendor_id?: string;
  area_id?: string;
  language?: string;
  notification_preferences?: any;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: any;
  profile: Profile | null;
  loading: boolean;
  profileError: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, data?: any) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<Profile | null>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  loginAsDemo: (role?: UserRole) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  profileError: null,
  signIn: async () => { },
  signUp: async () => { },
  signOut: async () => { },
  refreshProfile: async () => { },
  updateProfile: async () => null,
  resetPassword: async () => { },
  updatePassword: async () => { },
  loginAsDemo: () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Promise cache to deduplicate simultaneous profile fetches
  const fetchPromiseRef = useRef<Promise<Profile> | null>(null);

  const loginAsDemo = (role: UserRole = "citizen") => {
    let demoUser: any;
    let demoProfile: Profile;

    if (role === "officer") {
      demoUser = {
        id: "demo-officer-imc",
        email: "officer.verma@imc.gov.in",
        user_metadata: {
          full_name: "Er. Rajesh Verma",
          role: "officer",
          designation: "Zonal Municipal Commissioner (Zone 4)",
          department: "Urban Intelligence & Field Operations",
          city: "Indore"
        }
      };
      demoProfile = {
        id: "demo-officer-imc",
        name: "Er. Rajesh Verma",
        email: "officer.verma@imc.gov.in",
        role: "officer",
        city: "Indore",
        department: "Urban Intelligence & Field Operations",
        designation: "Zonal Municipal Commissioner",
        status: "active",
        points: 850,
        reports_count: 54,
        resolved_count: 48,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    } else if (role === "contractor") {
      demoUser = {
        id: "demo-contractor-gem",
        email: "contractor.infra@gem.gov.in",
        user_metadata: {
          full_name: "Vikramaditya Infra Projects",
          role: "contractor",
          vendor_id: "GEM-MP-2024-8891",
          designation: "Class-A Certified Municipal Contractor",
          city: "Indore"
        }
      };
      demoProfile = {
        id: "demo-contractor-gem",
        name: "Vikramaditya Infra (Class-A Contractor)",
        email: "contractor.infra@gem.gov.in",
        role: "contractor",
        vendor_id: "GEM-MP-2024-8891",
        designation: "Class-A Certified Municipal Contractor",
        city: "Indore",
        status: "active",
        points: 620,
        reports_count: 22,
        resolved_count: 19,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    } else {
      // Citizen default
      demoUser = {
        id: "demo-citizen-indore",
        email: "citizen.demo@quickfix.gov",
        user_metadata: {
          full_name: "Priya Sharma",
          role: role,
          designation: "Active Resident (Ward 4)",
          city: "Indore"
        }
      };
      demoProfile = {
        id: "demo-citizen-indore",
        name: "Priya Sharma",
        email: "citizen.demo@quickfix.gov",
        role: role,
        designation: "Active Resident (Ward 4)",
        city: "Indore",
        status: "active",
        points: 240,
        reports_count: 5,
        resolved_count: 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }

    setUser(demoUser);
    setProfile(demoProfile);
    setLoading(false);
    localStorage.setItem("quickfix_demo_user", JSON.stringify({ user: demoUser, profile: demoProfile }));
    localStorage.setItem("quickfix_onboarding_completed_v2", "true");
  };

  useEffect(() => {
    // Check if demo user is stored
    const storedDemo = typeof window !== 'undefined' ? localStorage.getItem('quickfix_demo_user') : null;
    if (storedDemo) {
      try {
        const parsed = JSON.parse(storedDemo);
        setUser(parsed.user);
        setProfile(parsed.profile);
        setLoading(false);
      } catch (e) {
        // ignore
      }
    }

    // 1. Single Listener setup. No separate initAuth() call to prevent double-firing.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`[Auth] State change: ${event}`);

        if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
          if (session?.user) {
            setUser(session.user);
            await loadProfile(session.user);
          } else {
            const hasDemo = localStorage.getItem('quickfix_demo_user');
            if (!hasDemo) {
              handleLoggedOutState();
            }
          }
        } else if (event === 'SIGNED_OUT') {
          localStorage.removeItem('quickfix_demo_user');
          handleLoggedOutState();
        }
        // Ensure loading screen clears
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLoggedOutState = () => {
    setUser(null);
    setProfile(null);
    setProfileError(null);
    fetchPromiseRef.current = null;
  };

  const getFallbackProfile = (userData: any): Profile => {
    console.warn("[Auth] Generating fallback profile to unblock UI.");
    return {
      id: userData.id,
      name: userData.user_metadata?.full_name || userData.email?.split('@')[0] || 'Citizen',
      email: userData.email || '',
      role: (userData.user_metadata?.role as UserRole) || 'citizen',
      city: userData.user_metadata?.city || 'Indore',
      department: userData.user_metadata?.department,
      designation: userData.user_metadata?.designation,
      vendor_id: userData.user_metadata?.vendor_id,
      status: 'active',
      points: 0,
      reports_count: 0,
      resolved_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  };

  const loadProfile = async (userData: any, forceRefresh = false, retries = 3): Promise<void> => {
    // 1. Deduplication Lock: If already fetching and not forcing a refresh, await existing promise
    if (fetchPromiseRef.current && !forceRefresh) {
      console.log("[Auth] Profile fetch already in progress, awaiting existing request.");
      try {
        await fetchPromiseRef.current;
      } catch (e) {
        // Handled by the original fetcher
      }
      return;
    }

    setProfileError(null);

    // 2. Setup the fetch promise with a strict 8-second timeout
    const fetchAttempt = async (): Promise<Profile> => {
      console.log(`[Auth] Fetching profile... (Attempts left: ${retries})`);
      if (retries < 3) await new Promise(r => setTimeout(r, 1500)); // Exponential backoff simulation

      // AbortController to properly cancel hanging fetch requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      try {
        // Assuming db.getOrCreateProfile handles its own network calls, 
        // we wrap it. If it doesn't support signals, the Promise.race below serves as a strict boundary.
        const profileData = await Promise.race([
          db.getOrCreateProfile(userData),
          new Promise((_, reject) => {
            controller.signal.addEventListener('abort', () => reject(new Error("Profile Load Timeout")));
          })
        ]);
        
        clearTimeout(timeoutId);
        return profileData as Profile;
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    };

    // Store the active promise in the ref cache
    fetchPromiseRef.current = fetchAttempt();

    try {
      const data = await fetchPromiseRef.current;
      setProfile(data);
      console.log("[Auth] Profile loaded successfully.");
    } catch (err: any) {
      // Ignore AbortError spam
      if (!err?.message?.includes('AbortError') && err.message !== "Profile Load Timeout") {
        console.error("[Auth] Profile load failed:", err);
      }

      // Retry logic
      if (retries > 0) {
        if (err.message === "Profile Load Timeout" || err?.name === 'AbortError') {
          console.log(`[Auth] Timeout reached. Retrying... (${retries})`);
        }
        // Must clear the cache so the retry creates a new promise
        fetchPromiseRef.current = null;
        return loadProfile(userData, true, retries - 1);
      }

      // Fallback Strategy
      const fallback = getFallbackProfile(userData);
      setProfile(fallback);
      setProfileError("Unable to connect to database. Operating in offline mode.");
      
    } finally {
      // Clear the cache ONLY if this exact promise was the active one
      // (prevents clearing if a retry injected a new promise)
      // Actually, it's safer to just clear it if we finished, so future refreshes work.
      fetchPromiseRef.current = null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      if (user.id?.startsWith('demo-')) {
        const stored = typeof window !== 'undefined' ? localStorage.getItem('quickfix_demo_user') : null;
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setProfile(parsed.profile);
          } catch {}
        }
        return;
      }
      await loadProfile(user, true);
    }
  };

  const updateProfile = async (updates: Partial<Profile>): Promise<Profile | null> => {
    if (!profile && !user) return null;

    const current = profile || getFallbackProfile(user);
    const updatedProfile: Profile = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString()
    };

    // 1. Immediately update in-memory state for instant reactivity
    setProfile(updatedProfile);

    // 2. Persist in localStorage
    try {
      const storedDemo = typeof window !== 'undefined' ? localStorage.getItem('quickfix_demo_user') : null;
      if (storedDemo) {
        const parsed = JSON.parse(storedDemo);
        localStorage.setItem('quickfix_demo_user', JSON.stringify({
          ...parsed,
          profile: updatedProfile
        }));
      }
      localStorage.setItem('quickfix_cached_profile', JSON.stringify(updatedProfile));
    } catch (e) {
      console.warn('[Auth] localStorage sync error:', e);
    }

    // 3. Persist to Supabase if not a demo user
    if (user?.id && !user.id.startsWith('demo-')) {
      try {
        await db.updateProfile(user.id, updates);
      } catch (err) {
        console.warn('[Auth] Remote profile sync skipped:', err);
      }
    }

    return updatedProfile;
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, metaData?: any) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metaData,
        emailRedirectTo: `${window.location.origin}/login`
      }
    });
    
    if (error) {
      // Custom handler for 429 Rate Limits
      if (error.status === 429 || error.message.toLowerCase().includes('rate limit')) {
        throw new Error("Too many signup attempts. Please wait a few minutes before trying again.");
      }
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error: any) {
      if (!error?.message?.includes('AbortError')) {
        console.error("[Auth] Sign out error:", error);
      }
    } finally {
      handleLoggedOutState();
    }
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    if (error) throw error;
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, profileError, signIn, signUp, signOut, refreshProfile, updateProfile, resetPassword, updatePassword, loginAsDemo }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

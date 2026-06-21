import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { getProfile } from "../lib/db";

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(uid) { try { setProfile(await getProfile(uid)); } catch { setProfile(null); } }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) loadProfile(data.session.user.id);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (s) loadProfile(s.user.id); else setProfile(null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const value = {
    session, user: session?.user || null, profile, loading,
    refreshProfile: () => session && loadProfile(session.user.id),
    signUp: (email, password) => supabase.auth.signUp({ email, password }),
    signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    signOut: () => supabase.auth.signOut(),
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

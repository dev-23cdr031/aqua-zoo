import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import {
  getSupabaseErrorMessage,
  isSupabaseConfigured,
  isTrustedAdminEmail,
  supabase,
  supabaseConfigError,
} from "../lib/supabase";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  async function loadProfile(sess: Session | null) {
    if (!sess) {
      setIsAdmin(false);
      setAuthError(null);
      return;
    }

    // Trusted admin email fallback — grant admin UI access immediately without
    // requiring role='admin' to already exist in the Supabase profiles table.
    if (isTrustedAdminEmail(sess.user.email)) {
      setIsAdmin(true);
      setAuthError(null);
      return;
    }

    const { data: profile, error: ensureError } = await supabase.rpc("ensure_my_profile");
    if (ensureError) {
      setIsAdmin(false);
      setAuthError(getSupabaseErrorMessage(ensureError));
      return;
    }

    setAuthError(null);
    setIsAdmin(profile?.role === "admin");
  }

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAuthError(supabaseConfigError);
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      await loadProfile(data.session);
      setLoading(false);
    }).catch((error) => {
      setAuthError(getSupabaseErrorMessage(error));
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      setLoading(true);
      window.setTimeout(async () => {
        await loadProfile(sess);
        setLoading(false);
      }, 0);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return {
    session,
    loading,
    isAdmin,
    authError,
    signIn: (email: string, password: string) =>
      supabase.auth.signInWithPassword({ email, password }),
    signUp: (email: string, password: string) =>
      supabase.auth.signUp({ email, password }),
    signOut: () => supabase.auth.signOut(),
  };
}

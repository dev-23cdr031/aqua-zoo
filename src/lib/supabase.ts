import { createClient } from "@supabase/supabase-js";

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

function isValidSupabaseUrl(value: string | undefined) {
  if (!value || value.includes("placeholder")) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.endsWith(".supabase.co");
  } catch {
    return false;
  }
}

export const isSupabaseConfigured = isValidSupabaseUrl(rawUrl) && Boolean(
  rawKey && !rawKey.includes("placeholder")
);

export const supabaseConfigError = isSupabaseConfigured
  ? null
  : "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to the local .env file or Vercel environment variables.";

// Graceful fallback to prevent module-level throw if environment variables are not yet populated
const supabaseUrl = rawUrl || "https://placeholder-aquazoo.supabase.co";
const supabaseAnonKey = rawKey || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: "pkce",
  },
});

export type { Session, User } from "@supabase/supabase-js";

export function getSupabaseErrorMessage(error: unknown) {
  const errorRecord = typeof error === "object" && error !== null
    ? error as { message?: unknown; code?: unknown; details?: unknown; hint?: unknown; error_description?: unknown }
    : null;
  const message = error instanceof Error
    ? error.message
    : typeof errorRecord?.message === "string"
      ? errorRecord.message
      : typeof errorRecord?.error_description === "string"
        ? errorRecord.error_description
        : typeof error === "string"
          ? error
          : "";
  if (/failed to fetch|networkerror|network request failed/i.test(message)) {
    return "Unable to reach Supabase. Check the Supabase URL, anon key, network connection, and project status.";
  }
  const code = typeof errorRecord?.code === "string" ? ` [${errorRecord.code}]` : "";
  const details = typeof errorRecord?.details === "string" ? ` ${errorRecord.details}` : "";
  const hint = typeof errorRecord?.hint === "string" ? ` Hint: ${errorRecord.hint}` : "";
  return message ? `${message}${code}${details}${hint}` : "Supabase request failed. Please try again.";
}

// ============================================================================
// Trusted admin emails (client-side fallback)
// ============================================================================
// These accounts get admin UI access immediately after sign-in, without needing
// role = 'admin' to already be set in the Supabase `profiles` table. This is a
// convenience for the store owner. (For Orders status changes and customer role
// management the profile role must still be 'admin' — see supabase/promote_*.sql.)
export const TRUSTED_ADMIN_EMAILS = ["brandnestcompany@gmail.com"];

export function isTrustedAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return TRUSTED_ADMIN_EMAILS.includes(email.trim().toLowerCase());
}


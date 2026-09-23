import { useState } from "react";
import {
  ArrowRight, BadgePercent, Eye, EyeOff, LogIn, LogOut, Mail, Phone,
  ShieldCheck, ShoppingBag, Truck, User, UserPlus,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import {
  getSupabaseErrorMessage,
  isSupabaseConfigured,
  isTrustedAdminEmail,
  supabaseConfigError,
} from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import { AquaLogo } from "../components/AquaLogo";
import { Bubbles } from "../components/Bubbles";
import { navigateTo } from "../router/useRouter";

type AuthMode = "signin" | "signup";

const MODE_COPY: Record<
  AuthMode,
  { title: string; subtitle: string; submit: string; switchHint: string; switchText: string }
> = {
  signin: {
    title: "Welcome back",
    subtitle: "Sign in to track orders and manage your aquarium care.",
    submit: "Sign In",
    switchHint: "New to Aqua Zoo?",
    switchText: "Create an account",
  },
  signup: {
    title: "Create your account",
    subtitle: "Join Aqua Zoo for faster checkout and exclusive member perks.",
    submit: "Create Account",
    switchHint: "Already have an account?",
    switchText: "Sign in",
  },
};

const BRAND_FEATURES = [
  { icon: BadgePercent, title: "Exclusive member deals", desc: "Early access to new arrivals and special offers." },
  { icon: Truck, title: "Faster checkout", desc: "Save your details and order in seconds." },
  { icon: ShieldCheck, title: "Track your orders", desc: "Follow every order from tank to your doorstep." },
];

const TAB_ICONS: Record<AuthMode, typeof LogIn> = {
  signin: LogIn,
  signup: UserPlus,
};

export function AuthPage() {
  const { session, loading: authLoading, authError, isAdmin, signOut } = useAuth();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    if (!isSupabaseConfigured) {
      setError(supabaseConfigError);
      return;
    }
    setSubmitting(true);

    try {
      if (mode === "signup") {
        const { error: signupError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { full_name: name.trim(), phone: phone.trim() } },
        });
        if (signupError) {
          setError(getSupabaseErrorMessage(signupError));
        } else {
          setMessage("Account created. Check your email if confirmation is enabled, then sign in.");
          setMode("signin");
        }
        setSubmitting(false);
        return;
      }

      const { data: signinData, error: signinError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signinError || !signinData.user) {
        setError(signinError ? getSupabaseErrorMessage(signinError) : "Sign in did not return a user session.");
        setSubmitting(false);
        return;
      }

      // Trusted admin email fallback — go straight to the admin portal.
      if (isTrustedAdminEmail(signinData.user.email)) {
        setSubmitting(false);
        navigateTo("/admin");
        return;
      }

      const { data: profile, error: ensureProfileError } = await supabase.rpc("ensure_my_profile");
      if (ensureProfileError) {
        await supabase.auth.signOut();
        setError(`Signed in, but your account profile could not be created. ${getSupabaseErrorMessage(ensureProfileError)}`);
        setSubmitting(false);
        return;
      }

      setSubmitting(false);
      navigateTo(profile?.role === "admin" ? "/admin" : "/");
    } catch (error) {
      setSubmitting(false);
      setError(getSupabaseErrorMessage(error));
    }
  }

  async function handleSignOut() {
    await signOut();
    setMessage("You have been signed out.");
  }

  if (authLoading) {
    return <div className="admin-loading"><div className="spinner" /><p>Loading account...</p></div>;
  }

  const copy = MODE_COPY[mode];
  const TabIcon = TAB_ICONS[mode];

  const brandPanel = (
    <div className="auth-brand">
      <Bubbles count={14} fishCount={2} />
      <div className="auth-brand-top">
        <div className="auth-brand-header">
          <AquaLogo size={52} />
          <div className="auth-wordmark">
            <h2>Sakthi's Aqua Zoo</h2>
            <p>Virudhunagar • Est. 2012</p>
          </div>
        </div>
        <div className="auth-quote">
          <h1>Dive into a world of thriving aquatic life.</h1>
          <p>
            Your trusted partner for healthy fish, lush plants, and dream aquascapes —
            all in one sign-in.
          </p>
        </div>
      </div>
      <div className="auth-features">
        {BRAND_FEATURES.map(({ icon: Icon, title, desc }) => (
          <div className="auth-feature" key={title}>
            <span className="auth-feature-icon"><Icon size={16} /></span>
            <span>
              <b>{title}</b>
              <em>{desc}</em>
            </span>
          </div>
        ))}
      </div>
      <a className="auth-brand-footer" href="#/" onClick={(e) => { e.preventDefault(); navigateTo("/"); }}>
        <ArrowRight size={15} /> Continue browsing the store
      </a>
    </div>
  );

  if (session) {
    return (
      <div className="auth-page">
        <div className="auth-shell auth-account-shell">
          <div className="auth-panel auth-account-panel">
            <div className="auth-account-head">
              <AquaLogo size={56} />
              <span className="auth-account-badge">Signed in</span>
            </div>
            <h1>You're signed in</h1>
            <p className="auth-account-email">{session.user.email}</p>
            <div className="auth-account-actions">
              {isAdmin && (
                <button className="auth-submit" onClick={() => navigateTo("/admin")}>
                  <ShieldCheck size={17} /> Open Admin Portal
                </button>
              )}
              <button className="auth-submit" onClick={() => navigateTo("/")}>
                <ShoppingBag size={17} /> Continue Shopping
              </button>
              <button className="auth-btn-secondary" onClick={handleSignOut}>
                <LogOut size={16} /> Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-shell">
        {brandPanel}

        <div className="auth-panel">
          {/* Segmented mode toggle */}
          <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "signin"}
              className={`auth-tab ${mode === "signin" ? "active" : ""}`}
              onClick={() => setMode("signin")}
            >
              <LogIn size={15} /> Sign In
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "signup"}
              className={`auth-tab ${mode === "signup" ? "active" : ""}`}
              onClick={() => setMode("signup")}
            >
              <UserPlus size={15} /> Sign Up
            </button>
          </div>

          <h1>{copy.title}</h1>
          <p className="auth-subtitle">{copy.subtitle}</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            {mode === "signup" && (
              <div className="auth-field">
                <span>Full name</span>
                <div className="auth-input-wrap">
                  <User className="auth-input-icon" size={17} />
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="e.g. Arun Kumar"
                    required
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            {mode === "signup" && (
              <div className="auth-field">
                <span>Phone number</span>
                <div className="auth-input-wrap">
                  <Phone className="auth-input-icon" size={17} />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="e.g. 98765 43210"
                    autoComplete="tel"
                  />
                </div>
              </div>
            )}

            <div className="auth-field">
              <span>Email address</span>
              <div className="auth-input-wrap">
                <Mail className="auth-input-icon" size={17} />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="auth-field">
              <span>Password</span>
              <div className="auth-input-wrap">
                <LockIcon />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={mode === "signin" ? "Enter your password" : "At least 6 characters"}
                  required
                  minLength={6}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {mode === "signup" && (
              <p className="auth-terms">
                By continuing, you agree to our{" "}
                <a href="#/contact" onClick={(e) => { e.preventDefault(); navigateTo("/contact"); }}>
                  terms &amp; privacy policy
                </a>.
              </p>
            )}

            {(error || authError) && <p className="auth-alert auth-error">{error || authError}</p>}
            {message && <p className="auth-alert auth-success">{message}</p>}

            <button type="submit" className="auth-submit" disabled={submitting}>
              <TabIcon size={18} />
              {submitting ? "Please wait..." : copy.submit}
              {!submitting && <ArrowRight size={17} />}
            </button>
          </form>

          <div className="auth-switch">
            <span>{copy.switchHint}</span>
            <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
              {copy.switchText}
            </button>
          </div>

          <button className="auth-back-link" onClick={() => navigateTo("/")}>
            <ArrowRight size={13} style={{ transform: "rotate(180deg)" }} /> Back to store
          </button>
        </div>
      </div>
    </div>
  );
}

// Inline lock icon so we avoid clashing with the Eye/EyeOff imports
function LockIcon() {
  return (
    <svg
      className="auth-input-icon"
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
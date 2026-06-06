import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout } from "@/components/nova/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — NovaMail" },
      { name: "description", content: "Sign in to your NovaMail account to manage API keys, domains, and email logs." },
      { property: "og:title", content: "Sign in — NovaMail" },
      { property: "og:description", content: "Access your NovaMail dashboard." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Welcome back, Ada");
      navigate({ to: "/dashboard" });
    }, 600);
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your NovaMail workspace."
      footer={<>Don't have an account?{" "}<Link to="/signup" className="text-foreground underline-offset-4 hover:underline">Create one</Link></>}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <SocialButtons />
        <Divider />
        <Field id="email" label="Work email" type="email" placeholder="ada@acme.dev" />
        <Field id="password" label="Password" type="password" placeholder="••••••••" right={<Link to="/login" className="text-xs text-muted-foreground hover:text-foreground">Forgot?</Link>} />
        <Button type="submit" className="w-full glow" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </AuthLayout>
  );
}

function Field({ id, label, type, placeholder, right }: { id: string; label: string; type: string; placeholder: string; right?: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <Label htmlFor={id} className="text-sm">{label}</Label>
        {right}
      </div>
      <Input id={id} type={type} placeholder={placeholder} className="bg-surface/60" required />
    </div>
  );
}

import { supabase } from "@/lib/supabase";

function SocialButtons() {
  const handleOAuth = async (provider: 'google' | 'github') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    });
    if (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      <Button type="button" variant="outline" onClick={() => handleOAuth('github')}>
        <svg viewBox="0 0 24 24" className="mr-2 h-4 w-4" fill="currentColor"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.27-1.69-1.27-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.24 3.34.95.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.58.23 2.75.11 3.04.73.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.07.78 2.17v3.22c0 .31.21.67.8.56C20.21 21.38 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5Z" /></svg>
        GitHub
      </Button>
      <Button type="button" variant="outline" onClick={() => handleOAuth('google')}>
        <svg viewBox="0 0 24 24" className="mr-2 h-4 w-4"><path fill="#EA4335" d="M12 11v3.6h5.1c-.2 1.3-1.6 3.8-5.1 3.8-3.1 0-5.6-2.6-5.6-5.8s2.5-5.8 5.6-5.8c1.7 0 2.9.7 3.6 1.4l2.4-2.4C16.6 4.3 14.5 3.5 12 3.5 6.9 3.5 2.8 7.6 2.8 12.6S6.9 21.7 12 21.7c6.9 0 9.2-4.9 9.2-7.4 0-.5 0-.9-.1-1.3H12Z" /></svg>
        Google
      </Button>
    </div>
  );
}

function Divider() {
  return (
    <div className="relative my-2 text-center text-xs text-muted-foreground">
      <span className="bg-background px-2 relative z-10">or continue with email</span>
      <span className="absolute inset-x-0 top-1/2 -z-0 h-px bg-border" />
    </div>
  );
}
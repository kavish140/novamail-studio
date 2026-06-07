import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout } from "@/components/nova/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { SocialButtons, Divider } from "@/components/nova/social-buttons";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/login")({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      throw redirect({ to: "/dashboard" });
    }
  },
  head: () => ({
    meta: [
      { title: "Sign in — NovaMail" },
      {
        name: "description",
        content: "Sign in to your NovaMail account to manage API keys, domains, and email logs.",
      },
      { property: "og:title", content: "Sign in — NovaMail" },
      { property: "og:description", content: "Access your NovaMail dashboard." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Welcome back");
      navigate({ to: "/dashboard" });
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your NovaMail workspace."
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/signup" className="text-foreground underline-offset-4 hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <SocialButtons />
        <Divider />
        <Field
          id="email"
          label="Work email"
          type="email"
          placeholder="ada@acme.dev"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Field
          id="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          right={
            <Link to="/login" className="text-xs text-muted-foreground hover:text-foreground">
              Forgot?
            </Link>
          }
        />
        <Button type="submit" className="w-full glow" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </AuthLayout>
  );
}

function Field({
  id,
  label,
  type,
  placeholder,
  right,
  value,
  onChange,
}: {
  id: string;
  label: string;
  type: string;
  placeholder: string;
  right?: React.ReactNode;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <Label htmlFor={id} className="text-sm">
          {label}
        </Label>
        {right}
      </div>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="bg-surface/60"
        required
      />
    </div>
  );
}

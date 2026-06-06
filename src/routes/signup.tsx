import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout } from "@/components/nova/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { SocialButtons, Divider } from "@/components/nova/social-buttons";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create your NovaMail account" },
      { name: "description", content: "Create a NovaMail account and send your first transactional email in under five minutes." },
      { property: "og:title", content: "Create your NovaMail account" },
      { property: "og:description", content: "Free forever for hobby projects. No credit card required." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Workspace created — let's send your first email");
      navigate({ to: "/dashboard" });
    }, 700);
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Free forever for 3,000 emails per month."
      footer={<>Already have an account?{" "}<Link to="/login" className="text-foreground underline-offset-4 hover:underline">Sign in</Link></>}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <SocialButtons />
        <Divider />
        <div>
          <Label htmlFor="name" className="mb-1.5 block text-sm">Full name</Label>
          <Input id="name" placeholder="Ada Lovelace" className="bg-surface/60" required />
        </div>
        <div>
          <Label htmlFor="email" className="mb-1.5 block text-sm">Work email</Label>
          <Input id="email" type="email" placeholder="ada@acme.dev" className="bg-surface/60" required />
        </div>
        <div>
          <Label htmlFor="password" className="mb-1.5 block text-sm">Password</Label>
          <Input id="password" type="password" placeholder="At least 12 characters" className="bg-surface/60" required minLength={12} />
        </div>
        <ul className="space-y-1.5 text-xs text-muted-foreground">
          {["3,000 free emails every month", "No credit card required", "SOC 2 Type II from day one"].map((p) => (
            <li key={p} className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-success" />{p}</li>
          ))}
        </ul>
        <Button type="submit" className="w-full glow" disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </Button>
        <p className="text-center text-[11px] text-muted-foreground">
          By signing up you agree to our <a href="#" className="underline-offset-4 hover:underline">Terms</a> and <a href="#" className="underline-offset-4 hover:underline">Privacy Policy</a>.
        </p>
      </form>
    </AuthLayout>
  );
}
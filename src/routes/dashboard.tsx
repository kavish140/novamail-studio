import { createFileRoute, redirect } from "@tanstack/react-router";
import { DashboardShell } from "@/components/nova/dashboard-shell";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      throw redirect({ to: "/login" });
    }
  },
  head: () => ({
    meta: [
      { title: "Dashboard — NovaMail" },
      { name: "description", content: "Your NovaMail dashboard." },
    ],
  }),
  component: DashboardShell,
});

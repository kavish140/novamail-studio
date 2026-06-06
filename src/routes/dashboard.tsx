import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/nova/dashboard-shell";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — NovaMail" },
      { name: "description", content: "Your NovaMail dashboard." },
    ],
  }),
  component: DashboardShell,
});
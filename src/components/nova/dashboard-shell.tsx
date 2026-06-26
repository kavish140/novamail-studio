import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  Gauge,
  KeyRound,
  ListChecks,
  Globe,
  Settings as SettingsIcon,
  Search,
  LogOut,
  BookOpen,
  FileText,
  Users,
} from "lucide-react";
import { NovaLogo } from "./logo";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";
import { useUser, useEmailLogs } from "@/hooks/use-supabase";
import { supabase } from "@/lib/supabase";

type NavItem = { to: string; label: string; icon: typeof Gauge; exact?: boolean };
const nav: NavItem[] = [
  { to: "/dashboard", label: "Overview", icon: Gauge, exact: true },
  { to: "/dashboard/keys", label: "API Keys", icon: KeyRound },
  { to: "/dashboard/logs", label: "Email Logs", icon: ListChecks },
  { to: "/dashboard/templates", label: "Templates", icon: FileText },
  { to: "/dashboard/domains", label: "Domains", icon: Globe },
  { to: "/dashboard/team", label: "Team", icon: Users },
  { to: "/dashboard/settings", label: "Settings", icon: SettingsIcon },
  { to: "/docs", label: "Documentation", icon: BookOpen },
];

export function DashboardShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const { data: user } = useUser();
  const { data: emailLogs = [] } = useEmailLogs();

  const name = user?.name || user?.email?.split("@")[0] || "User";
  const initials = name.substring(0, 2).toUpperCase();
  const email = user?.email || "";

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <div className="flex min-h-screen bg-background bg-grid">
      <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-border/60 bg-sidebar lg:flex">
        <div className="flex h-16 items-center px-6">
          <Link to="/">
            <NovaLogo />
          </Link>
        </div>
        <nav className="flex-1 px-3">
          {nav.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to as string}
                className={cn(
                  "mb-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                  active
                    ? "bg-sidebar-accent text-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="m-3 rounded-xl border border-border/60 bg-surface-elevated p-4">
          <div className="text-xs text-muted-foreground">Monthly usage</div>
          <div className="mt-1 text-sm font-semibold">
            {emailLogs.length.toLocaleString()} / 3,000
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
              style={{ width: `${Math.min((emailLogs.length / 3000) * 100, 100)}%` }}
            />
          </div>
          <Button size="sm" variant="outline" className="mt-3 w-full">
            Upgrade plan
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/60 bg-background/70 px-6 backdrop-blur">
          <div className="relative hidden flex-1 max-w-md md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search keys, recipients, logs…" className="pl-9 bg-surface/60" />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" aria-label="Notifications">
              <Bell className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full p-1 transition hover:bg-surface">
                  {user?.avatarUrl ? (
                    <Avatar className="h-8 w-8">
                      <img
                        src={user.avatarUrl}
                        alt="Avatar"
                        className="h-full w-full object-cover rounded-full"
                      />
                    </Avatar>
                  ) : (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="text-sm font-medium">{name}</div>
                  <div className="text-xs text-muted-foreground truncate">{email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/settings">Account settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/docs">Documentation</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-destructive cursor-pointer"
                >
                  <LogOut className="h-4 w-4 mr-2" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 px-6 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

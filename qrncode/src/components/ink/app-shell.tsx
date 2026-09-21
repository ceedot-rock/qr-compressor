import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Crunch" },
  { to: "/restore", label: "Restore" },
  { to: "/license", label: "License" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-dvh bg-background">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(1200px_circle_at_50%_-20%,#1a1a1e,transparent_55%)]"
      />
      <header className="relative z-10 border-b border-border/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link to="/" className="group flex min-w-0 items-baseline gap-3">
            <span className="font-display text-2xl font-medium tracking-tight text-foreground">
              INK
            </span>
            <span className="hidden truncate text-xs uppercase tracking-[0.18em] text-muted-foreground sm:inline">
              QR compressor
            </span>
          </Link>
          <nav className="flex items-center gap-1">
            {NAV.map((item) => {
              const active =
                item.to === "/"
                  ? pathname === "/"
                  : pathname === item.to || pathname.startsWith(`${item.to}/`);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex h-11 items-center rounded-md px-3 text-sm transition-[color,background-color] duration-[var(--motion-quick)] ease-[var(--ease-out)]",
                    active
                      ? "bg-card text-foreground shadow-[var(--shadow-border)]"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="relative z-10 mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {children}
      </main>
      <footer className="relative z-10 mx-auto flex max-w-6xl flex-col gap-1 px-4 pb-10 pt-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>Slid Phi Labs · Cherry Hill</p>
        <p>Dual-licensed AGPL-3.0-or-later or Commercial</p>
      </footer>
    </div>
  );
}

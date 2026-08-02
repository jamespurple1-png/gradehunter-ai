"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  ChartNoAxesCombined,
  LayoutDashboard,
  LogIn,
  ScanSearch,
  Search,
  Settings,
  Star,
  WalletCards,
} from "lucide-react";
import Badge from "@/components/ui/Badge";

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Portfolio",
    href: "/portfolio",
    icon: WalletCards,
  },
  {
    name: "Card Search",
    href: "/search",
    icon: Search,
  },
  {
    name: "Scanner",
    href: "/scanner",
    icon: ScanSearch,
  },
  {
    name: "Watchlist",
    href: "/watchlist",
    icon: Star,
  },
  {
    name: "Market",
    href: "/market",
    icon: ChartNoAxesCombined,
  },
  {
    name: "GradeHunter AI",
    href: "/ai",
    icon: Bot,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

  return (
    <aside className="hidden min-h-screen w-72 shrink-0 border-r border-border bg-surface/95 px-5 py-6 backdrop-blur-xl lg:flex lg:flex-col">
      <div className="mb-9 px-2">
        <Link
          href="/"
          className="group flex items-center gap-3 rounded-2xl px-2 py-2"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-brand/25 bg-brand/10 font-black text-brand-light shadow-lg shadow-black/20 transition group-hover:border-brand/45 group-hover:bg-brand/15">
            GH
          </div>

          <div>
            <p className="text-lg font-black tracking-[-0.03em] text-foreground">
              GradeHunter
            </p>

            <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-subtle">
              Collectibles Intelligence
            </p>
          </div>
        </Link>
      </div>

      <div className="mb-4 px-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-subtle">
          Workspace
        </p>
      </div>

      <nav className="flex-1 space-y-1.5">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                active
                  ? "border-brand/15 bg-brand/[0.07] text-foreground shadow-lg shadow-black/10"
                  : "border-transparent text-muted hover:bg-white/[0.035] hover:text-foreground"
              }`}
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-xl transition ${
                  active
                    ? "bg-brand/12 text-brand-light"
                    : "bg-white/[0.025] text-subtle group-hover:text-muted"
                }`}
              >
                <Icon size={18} />
              </span>

              <span>{item.name}</span>

              {item.name === "Scanner" && (
                <Badge tone="brand" className="ml-auto">
                  New
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 border-t border-border pt-5">
        <div className="space-y-1.5">
          <Link
            href="/login"
            className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
              isActive("/login")
                ? "bg-white/[0.06] text-foreground"
                : "text-muted hover:bg-white/[0.035] hover:text-foreground"
            }`}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.025] text-subtle transition group-hover:text-muted">
              <LogIn size={18} />
            </span>

            <span>Login</span>
          </Link>

          <Link
            href="/settings"
            className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
              isActive("/settings")
                ? "bg-white/[0.06] text-foreground"
                : "text-muted hover:bg-white/[0.035] hover:text-foreground"
            }`}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.025] text-subtle transition group-hover:text-muted">
              <Settings size={18} />
            </span>

            <span>Settings</span>
          </Link>
        </div>

        <div className="mt-5 rounded-2xl border border-border bg-white/[0.025] p-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-subtle">
              Market status
            </p>

            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-brand">
              <span className="h-1.5 w-1.5 rounded-full bg-brand shadow-[0_0_10px_rgba(214,179,106,0.7)]" />
              Live
            </span>
          </div>

          <p className="mt-3 text-sm font-semibold text-foreground">
            Pricing connected
          </p>

          <p className="mt-1 text-xs leading-5 text-subtle">
            TCGplayer market data and GBP conversion are active.
          </p>
        </div>
      </div>
    </aside>
  );
}
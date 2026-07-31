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
    <aside className="hidden min-h-screen w-72 flex-col border-r border-slate-800 bg-slate-950 px-5 py-6 lg:flex">
      <div className="mb-10 px-3">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400 font-black text-slate-950">
            GH
          </div>

          <div>
            <p className="text-lg font-black tracking-tight text-white">
              GradeHunter
            </p>

            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400">
              AI
            </p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                active
                  ? "bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-400/10"
                  : "text-slate-400 hover:bg-slate-900 hover:text-white"
              }`}
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 border-t border-slate-800 pt-5">
        <Link
          href="/login"
          className={`mb-2 flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
            isActive("/login")
              ? "bg-slate-800 text-white"
              : "text-slate-400 hover:bg-slate-900 hover:text-white"
          }`}
        >
          <LogIn size={20} />
          <span>Login</span>
        </Link>

        <Link
          href="/settings"
          className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
            isActive("/settings")
              ? "bg-slate-800 text-white"
              : "text-slate-400 hover:bg-slate-900 hover:text-white"
          }`}
        >
          <Settings size={20} />
          <span>Settings</span>
        </Link>

        <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-slate-900 p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
            GradeHunter AI
          </p>

          <h3 className="mt-2 text-lg font-bold text-white">
            Scanner Coming Soon
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Scan eBay, Cardmarket and TCGPlayer for undervalued listings and
            grading opportunities.
          </p>

          <div className="mt-4 rounded-xl bg-emerald-400 px-3 py-2 text-center text-sm font-bold text-slate-950">
            Coming Soon
          </div>
        </div>
      </div>
    </aside>
  );
}
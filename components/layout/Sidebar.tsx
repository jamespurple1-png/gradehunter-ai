"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  ChartNoAxesCombined,
  LayoutDashboard,
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

  return (
    <aside className="hidden min-h-screen w-72 flex-col border-r border-slate-800 bg-slate-950 px-5 py-6 lg:flex">
      <div className="mb-10 px-3">
        <div className="flex items-center gap-3">
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
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;

          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                isActive
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
          href="/settings"
          className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
            pathname.startsWith("/settings")
              ? "bg-slate-800 text-white"
              : "text-slate-400 hover:bg-slate-900 hover:text-white"
          }`}
        >
          <Settings size={20} />
          <span>Settings</span>
        </Link>

        <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
            Portfolio tools
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Track cards, grading costs and projected returns.
          </p>
        </div>
      </div>
    </aside>
  );
}
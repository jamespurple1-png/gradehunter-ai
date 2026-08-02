import { ReactNode } from "react";

type BadgeTone = "neutral" | "outline" | "brand" | "live" | "warning";

type BadgeProps = {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
};

const toneClasses: Record<BadgeTone, string> = {
  neutral: "bg-surface-muted px-3 py-1 text-xs font-semibold text-foreground",
  outline: "border border-border-strong bg-surface-raised px-3 py-1 text-sm text-foreground",
  brand:
    "border border-brand/15 bg-brand/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-light",
  live: "bg-brand/15 px-3 py-1 text-xs font-bold text-brand-light",
  warning: "bg-warning/15 px-3 py-1 text-xs font-bold text-warning",
};

export default function Badge({ children, tone = "neutral", className = "" }: BadgeProps) {
  return (
    <span
      className={["inline-flex items-center gap-1.5 rounded-full", toneClasses[tone], className]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </span>
  );
}

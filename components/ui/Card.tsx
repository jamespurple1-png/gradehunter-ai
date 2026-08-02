import { ElementType, ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  as?: ElementType;
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
  hoverAccent?: "border" | "brand";
  shadow?: boolean;
  className?: string;
};

const paddingClasses: Record<NonNullable<CardProps["padding"]>, string> = {
  none: "",
  sm: "p-5",
  md: "p-6",
  lg: "p-8",
};

const hoverClasses: Record<NonNullable<CardProps["hoverAccent"]>, string> = {
  border: "transition hover:-translate-y-1 hover:border-border-strong",
  brand: "transition hover:-translate-y-1 hover:border-brand/50",
};

export default function Card({
  children,
  as: Tag = "div",
  padding = "md",
  hover = false,
  hoverAccent = "border",
  shadow = false,
  className = "",
}: CardProps) {
  const classes = [
    "rounded-3xl border border-border bg-surface-raised/70",
    paddingClasses[padding],
    shadow ? "shadow-2xl shadow-black/20" : "",
    hover ? hoverClasses[hoverAccent] : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <Tag className={classes}>{children}</Tag>;
}

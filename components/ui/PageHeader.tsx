import { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
  layout?: "center" | "end";
  variant?: "default" | "hero";
  className?: string;
};

const layoutClasses: Record<NonNullable<PageHeaderProps["layout"]>, string> = {
  center: "md:flex-row md:items-center md:justify-between",
  end: "sm:flex-row sm:items-end sm:justify-between",
};

const titleClasses: Record<NonNullable<PageHeaderProps["variant"]>, string> = {
  default: "mt-2 text-4xl font-black tracking-tight",
  hero: "mt-2 text-4xl font-bold tracking-tight sm:text-5xl",
};

export default function PageHeader({
  eyebrow,
  title,
  description,
  action,
  layout = "end",
  variant = "default",
  className = "",
}: PageHeaderProps) {
  return (
    <header
      className={["mb-10 flex flex-col gap-5", layoutClasses[layout], className]
        .filter(Boolean)
        .join(" ")}
    >
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand">
          {eyebrow}
        </p>

        <h1 className={titleClasses[variant]}>{title}</h1>

        {description && (
          <p className="mt-3 max-w-2xl text-muted">{description}</p>
        )}
      </div>

      {action}
    </header>
  );
}

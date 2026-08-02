type MetricProps = {
  label: string;
  value: string;
  subtitle?: string;
  positive?: boolean;
  variant?: "tile" | "bordered";
};

export default function Metric({
  label,
  value,
  subtitle,
  positive,
  variant = "tile",
}: MetricProps) {
  if (variant === "bordered") {
    return (
      <div className="rounded-2xl border border-border bg-surface-raised/70 p-5">
        <p className="text-sm text-subtle">{label}</p>
        <p className="mt-2 text-xl font-bold text-foreground">{value}</p>
        {subtitle && <p className="mt-1 text-xs text-subtle">{subtitle}</p>}
      </div>
    );
  }

  const valueClassName =
    positive === undefined
      ? "text-foreground"
      : positive
        ? "text-positive"
        : "text-negative";

  return (
    <div className="rounded-2xl bg-background/70 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-subtle">
        {label}
      </p>
      <p className={`mt-2 font-bold ${valueClassName}`}>{value}</p>
      {subtitle && (
        <p className="mt-1 truncate text-xs text-subtle">{subtitle}</p>
      )}
    </div>
  );
}

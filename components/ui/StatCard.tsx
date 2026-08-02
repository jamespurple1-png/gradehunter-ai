type StatCardProps = {
  label: string;
  value: string;
  subtitle: string;
  positive?: boolean;
};

export default function StatCard({ label, value, subtitle, positive }: StatCardProps) {
  return (
    <div className="rounded-3xl border border-border bg-surface-raised/70 p-5 shadow-xl shadow-black/10">
      <p className="text-sm font-medium text-muted">{label}</p>

      <p
        className={`mt-3 text-3xl font-black ${
          positive === undefined
            ? "text-foreground"
            : positive
              ? "text-positive"
              : "text-negative"
        }`}
      >
        {value}
      </p>

      <p className="mt-2 text-sm text-subtle">{subtitle}</p>
    </div>
  );
}

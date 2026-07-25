type StatCardProps = {
  label: string;
  value: string;
  subtitle: string;
  positive?: boolean;
};

export default function StatCard({
  label,
  value,
  subtitle,
  positive = true,
}: StatCardProps) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-black/10">
      <p className="text-sm font-medium text-slate-400">
        {label}
      </p>

      <p
        className={`mt-3 text-3xl font-black ${
          label === "Potential ROI"
            ? positive
              ? "text-emerald-400"
              : "text-red-400"
            : "text-white"
        }`}
      >
        {value}
      </p>

      <p className="mt-2 text-sm text-slate-500">
        {subtitle}
      </p>
    </div>
  );
}
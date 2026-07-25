type MetricProps = {
  label: string;
  value: string;
};

export default function Metric({ label, value }: MetricProps) {
  return (
    <div className="rounded-2xl bg-slate-950/70 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-2 font-bold text-slate-100">
        {value}
      </p>
    </div>
  );
}
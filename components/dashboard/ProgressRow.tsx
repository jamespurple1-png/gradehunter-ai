import { formatCurrency } from "@/lib/format";

type ProgressRowProps = {
  label: string;
  value: number;
  total: number;
};

export default function ProgressRow({
  label,
  value,
  total,
}: ProgressRowProps) {
  const width = Math.min((value / total) * 100, 100);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-muted">{label}</span>
        <span className="font-bold">{formatCurrency(value)}</span>
      </div>

      <div className="h-2 rounded-full bg-surface-muted">
        <div
          className="h-2 rounded-full bg-brand"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

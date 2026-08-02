type ProgressRowProps = {
  label: string;
  value: number;
  total: number;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(value);
}

export default function ProgressRow({
  label,
  value,
  total,
}: ProgressRowProps) {
  const width = Math.min((value / total) * 100, 100);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-slate-400">{label}</span>
        <span className="font-bold">{formatCurrency(value)}</span>
      </div>

      <div className="h-2 rounded-full bg-slate-800">
        <div
          className="h-2 rounded-full bg-[#d6b36a]"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}
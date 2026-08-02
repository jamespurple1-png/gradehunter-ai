type EmptyStateProps = {
  title: string;
  description?: string;
  size?: "md" | "lg";
  as?: "h2" | "h3";
  className?: string;
};

const headingSize: Record<NonNullable<EmptyStateProps["size"]>, string> = {
  md: "text-xl",
  lg: "text-2xl",
};

export default function EmptyState({
  title,
  description,
  size = "md",
  as: Tag = "h2",
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={[
        "rounded-3xl border border-dashed border-border-strong bg-surface-raised/40 p-12 text-center",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Tag className={`${headingSize[size]} font-bold`}>{title}</Tag>
      {description && <p className="mt-2 text-muted">{description}</p>}
    </div>
  );
}

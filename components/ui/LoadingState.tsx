type LoadingStateProps = {
  message: string;
  size?: "md" | "lg";
  className?: string;
};

const sizeClasses: Record<NonNullable<LoadingStateProps["size"]>, string> = {
  md: "p-10",
  lg: "p-12",
};

export default function LoadingState({ message, size = "lg", className = "" }: LoadingStateProps) {
  return (
    <div
      className={[
        "rounded-3xl border border-border bg-surface-raised/70 text-center text-muted",
        sizeClasses[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {message}
    </div>
  );
}

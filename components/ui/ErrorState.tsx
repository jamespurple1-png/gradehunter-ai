import Button from "./Button";

type ErrorStateProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
  variant?: "panel" | "banner";
  as?: "h1" | "h2" | "h3";
  size?: "md" | "lg";
  className?: string;
};

const paddingClasses: Record<NonNullable<ErrorStateProps["size"]>, string> = {
  md: "p-10",
  lg: "p-12",
};

const headingClasses: Record<NonNullable<ErrorStateProps["size"]>, string> = {
  md: "text-xl",
  lg: "text-2xl",
};

export default function ErrorState({
  title,
  message,
  onRetry,
  variant = "panel",
  as: Tag = "h3",
  size = "md",
  className = "",
}: ErrorStateProps) {
  if (variant === "banner") {
    return (
      <div
        className={[
          "rounded-2xl border border-red-900/60 bg-red-950/30 px-5 py-4 text-red-300",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p>{message}</p>

          {onRetry && (
            <Button variant="danger" size="sm" onClick={onRetry}>
              Try again
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={[
        "rounded-3xl border border-red-900/60 bg-red-950/30 text-center",
        paddingClasses[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {title && (
        <Tag className={`${headingClasses[size]} font-bold text-red-300`}>{title}</Tag>
      )}

      <p className={title ? "mt-2 text-red-200/80" : "text-red-200/80"}>
        {message}
      </p>

      {onRetry && (
        <Button variant="danger" size="sm" className="mt-5" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

import { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "danger";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-brand font-bold text-background hover:bg-brand-light",
  secondary:
    "border border-border-strong font-semibold text-foreground hover:bg-surface-muted",
  outline:
    "border border-border-strong bg-surface-raised font-bold text-foreground hover:border-brand hover:text-brand",
  danger: "bg-red-300 font-bold text-background hover:bg-red-200",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "rounded-xl px-4 py-2 text-sm",
  md: "rounded-xl px-5 py-3",
  lg: "rounded-2xl px-6 py-4",
};

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={[
        "inline-flex items-center justify-center gap-2 transition disabled:cursor-not-allowed disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}

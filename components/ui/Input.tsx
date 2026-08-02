import { InputHTMLAttributes, forwardRef } from "react";

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className = "", ...props }, ref) {
    return (
      <input
        ref={ref}
        className={[
          "w-full rounded-xl border border-border-strong bg-background px-4 py-3 text-foreground outline-none transition placeholder:text-subtle focus:border-brand disabled:cursor-not-allowed disabled:opacity-40",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      />
    );
  }
);

export default Input;

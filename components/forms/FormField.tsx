import { InputHTMLAttributes } from "react";
import Input from "@/components/ui/Input";

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
};

export default function FormField({ label, name, ...props }: FormFieldProps) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-semibold text-foreground"
      >
        {label}
      </label>

      <Input id={name} name={name} {...props} />
    </div>
  );
}

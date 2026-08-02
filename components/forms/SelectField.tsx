import { SelectHTMLAttributes } from "react";
import Select from "@/components/ui/Select";

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  name: string;
  options: Array<[string, string]>;
};

export default function SelectField({ label, name, options, ...props }: SelectFieldProps) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-semibold text-foreground"
      >
        {label}
      </label>

      <Select id={name} name={name} {...props}>
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </Select>
    </div>
  );
}

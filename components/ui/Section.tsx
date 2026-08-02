import { ReactNode } from "react";

type SectionProps = {
  eyebrow?: string;
  title: string;
  trailing?: ReactNode;
  children?: ReactNode;
  className?: string;
};

export default function Section({
  eyebrow,
  title,
  trailing,
  children,
  className = "",
}: SectionProps) {
  return (
    <section className={className}>
      <div className="mb-5 flex items-center justify-between">
        <div>
          {eyebrow && <p className="text-sm text-subtle">{eyebrow}</p>}
          <h2 className={`text-2xl font-bold ${eyebrow ? "mt-1" : ""}`}>{title}</h2>
        </div>

        {trailing && <p className="text-sm text-subtle">{trailing}</p>}
      </div>

      {children}
    </section>
  );
}

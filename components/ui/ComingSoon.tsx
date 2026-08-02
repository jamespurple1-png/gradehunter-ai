import PageHeader from "./PageHeader";

type ComingSoonProps = {
  title: string;
  description?: string;
};

export default function ComingSoon({ title, description = title }: ComingSoonProps) {
  return (
    <div className="min-h-screen px-6 py-8 lg:px-10">
      <PageHeader eyebrow="GradeHunter AI" title={title} description={description} />

      <div className="rounded-3xl border border-border bg-surface-raised/70 p-8">
        <p className="text-muted">This feature is coming next.</p>
      </div>
    </div>
  );
}

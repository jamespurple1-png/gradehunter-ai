import { ReactNode } from "react";
import { X } from "lucide-react";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  eyebrow?: string;
  title: string;
  description?: string;
  media?: ReactNode;
  maxWidth?: "2xl" | "3xl";
  closeDisabled?: boolean;
  children: ReactNode;
};

export default function Modal({
  isOpen,
  onClose,
  eyebrow,
  title,
  description,
  media,
  maxWidth = "2xl",
  closeDisabled = false,
  children,
}: ModalProps) {
  if (!isOpen) {
    return null;
  }

  function handleClose() {
    if (closeDisabled) {
      return;
    }

    onClose();
  }

  const maxWidthClass = maxWidth === "3xl" ? "max-w-3xl" : "max-w-2xl";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-8 backdrop-blur-sm">
      <div
        className={`max-h-[92vh] w-full ${maxWidthClass} overflow-y-auto rounded-3xl border border-border-strong bg-surface-raised p-6 shadow-2xl`}
      >
        <div className="mb-6 flex items-start justify-between gap-5">
          <div className={media ? "flex items-center gap-4" : undefined}>
            {media}

            <div>
              {eyebrow && (
                <p className="text-sm font-semibold uppercase tracking-widest text-brand">
                  {eyebrow}
                </p>
              )}

              <h2 className="mt-1 text-2xl font-bold text-foreground">{title}</h2>

              {description && (
                <p className="mt-1 text-sm text-muted">{description}</p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="rounded-xl p-2 text-muted transition hover:bg-surface-muted hover:text-foreground"
            aria-label="Close modal"
          >
            <X size={22} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

"use client";

import { useEffect, type ReactNode } from "react";
import { cn } from "../../../utils/cn";

interface ModalShellProps {
  open: boolean;
  onClose: () => void;
  /** Accessible label for the dialog. */
  ariaLabel: string;
  /** Max width in Tailwind class (e.g. "max-w-md", "max-w-xl"). Defaults to xl. */
  maxWidth?: string;
  children: ReactNode;
}

/**
 * Headless dialog shell. Handles backdrop + escape + body scroll lock.
 * Renders nothing when `open` is false so SSR sees no portal.
 *
 * Consumers compose their own header/body/footer inside `children`.
 */
export function ModalShell({
  open,
  onClose,
  ariaLabel,
  maxWidth = "max-w-xl",
  children,
}: ModalShellProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      className="fixed inset-0 z-50 flex items-center justify-center px-5 py-10"
    >
      <button
        type="button"
        aria-label="Fermer"
        onClick={onClose}
        className="absolute inset-0 bg-bg-base/70 backdrop-blur-sm transition-opacity duration-200"
      />
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-2xl border border-border bg-bg-surface shadow-2xl",
          maxWidth,
        )}
      >
        {children}
      </div>
    </div>
  );
}

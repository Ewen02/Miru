"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "../../../utils/cn";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

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
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;

    const node = dialogRef.current;
    if (node) {
      const first = node.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      (first ?? node).focus();
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((el) => !el.hasAttribute("data-focus-trap-skip"));
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      previouslyFocusedRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      tabIndex={-1}
      className="fixed inset-0 z-50 flex items-center justify-center px-5 py-10 focus:outline-none"
    >
      <button
        type="button"
        aria-label="Fermer"
        onClick={onClose}
        data-focus-trap-skip
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

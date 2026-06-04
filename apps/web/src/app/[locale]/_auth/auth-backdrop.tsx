/** Neutral scattered cover silhouettes behind auth pages. */
export function AuthBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute left-[8%] top-[20%] h-58 w-40 -rotate-8 rounded-xl border border-border-subtle bg-bg-elevated opacity-40" />
      <div className="absolute right-[10%] bottom-[12%] h-62 w-45 rotate-6 rounded-xl border border-border-subtle bg-bg-surface opacity-30" />
      <div className="absolute right-[30%] top-[8%] h-48 w-33 -rotate-4 rounded-xl border border-border-subtle bg-bg-elevated opacity-20" />
    </div>
  );
}

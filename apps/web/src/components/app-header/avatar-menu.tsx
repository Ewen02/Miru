"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@miru/ui";
import { authClient } from "@/lib/auth-client";

interface AvatarMenuProps {
  user: {
    id: string;
    email: string;
    name: string;
    image: string | null;
  };
}

export function AvatarMenu({ user }: AvatarMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const initial = (user.name || user.email).charAt(0).toUpperCase();

  async function handleSignOut() {
    setSigningOut(true);
    await authClient.signOut();
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Menu utilisateur"
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-full",
          "border border-border bg-bg-elevated font-display text-[13px] text-text-primary",
          "transition-colors duration-200 hover:bg-bg-surface",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
        )}
      >
        {initial}
      </button>

      {open && (
        <div
          role="menu"
          className={cn(
            "absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-bg-surface",
            "backdrop-blur-xl",
          )}
        >
          <div className="border-b border-border-subtle px-4 py-3">
            <p className="truncate font-body text-sm font-medium text-text-primary">{user.name}</p>
            <p className="truncate font-body text-xs text-text-tertiary">{user.email}</p>
          </div>

          <nav className="flex flex-col py-1">
            <AvatarMenuItem href="/profile" onClick={() => setOpen(false)}>
              Profil
            </AvatarMenuItem>
            <AvatarMenuItem href="/watchlist" onClick={() => setOpen(false)}>
              Ma watchlist
            </AvatarMenuItem>
          </nav>

          <div className="border-t border-border-subtle py-1">
            <button
              type="button"
              role="menuitem"
              onClick={handleSignOut}
              disabled={signingOut}
              className={cn(
                "w-full px-4 py-2 text-left font-body text-sm",
                "text-text-secondary transition-colors duration-200 hover:bg-bg-elevated hover:text-error",
                "disabled:cursor-not-allowed disabled:opacity-50",
                "focus-visible:outline-none focus-visible:bg-bg-elevated",
              )}
            >
              {signingOut ? "Déconnexion…" : "Se déconnecter"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AvatarMenuItem({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      role="menuitem"
      href={href}
      onClick={onClick}
      className={cn(
        "px-4 py-2 font-body text-sm text-text-secondary transition-colors duration-200",
        "hover:bg-bg-elevated hover:text-text-primary",
        "focus-visible:outline-none focus-visible:bg-bg-elevated focus-visible:text-text-primary",
      )}
    >
      {children}
    </Link>
  );
}

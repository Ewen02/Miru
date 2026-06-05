"use client";

import { Link, useRouter } from "@/i18n/navigation";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("a11y");
  const th = useTranslations("header");
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
        aria-label={t("userMenu")}
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
              {th("menuProfile")}
            </AvatarMenuItem>
            <AvatarMenuItem href="/watchlist" onClick={() => setOpen(false)}>
              {th("menuWatchlist")}
            </AvatarMenuItem>
            <AvatarMenuItem href="/lists" onClick={() => setOpen(false)}>
              {th("menuLists")}
            </AvatarMenuItem>
            <AvatarMenuItem href="/messages" onClick={() => setOpen(false)}>
              {th("menuMessages")}
            </AvatarMenuItem>
            <AvatarMenuItem href="/activity" onClick={() => setOpen(false)}>
              {th("menuActivity")}
            </AvatarMenuItem>
            <AvatarMenuItem href="/achievements" onClick={() => setOpen(false)}>
              {th("menuAchievements")}
            </AvatarMenuItem>
            <AvatarMenuItem href="/lifetime-stats" onClick={() => setOpen(false)}>
              {th("menuStats")}
            </AvatarMenuItem>
          </nav>

          <nav className="flex flex-col border-t border-border-subtle py-1">
            <AvatarMenuItem href="/notifications" onClick={() => setOpen(false)}>
              {th("menuNotifications")}
            </AvatarMenuItem>
            <AvatarMenuItem href="/settings" onClick={() => setOpen(false)}>
              {th("menuSettings")}
            </AvatarMenuItem>
            <AvatarMenuItem href="/security" onClick={() => setOpen(false)}>
              {th("menuSecurity")}
            </AvatarMenuItem>
          </nav>

          {/* Soft donation CTA — Sympathisant. No paywall, just an invitation. */}
          <div className="border-t border-border-subtle py-1">
            <Link
              role="menuitem"
              href="/pricing"
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center justify-between px-4 py-2 font-body text-sm",
                "text-text-secondary transition-colors duration-200",
                "hover:bg-bg-elevated hover:text-text-primary",
                "focus-visible:outline-none focus-visible:bg-bg-elevated focus-visible:text-text-primary",
              )}
            >
              <span className="inline-flex items-center gap-2">
                <span
                  aria-hidden
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: "var(--color-accent)" }}
                />
                {th("menuSupport")}
              </span>
            </Link>
          </div>

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
              {signingOut ? th("signingOut") : th("signOut")}
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

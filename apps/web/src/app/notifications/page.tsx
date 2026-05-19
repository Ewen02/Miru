import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notifications",
  description: "Tes notifications Miru.",
};

interface MockNotification {
  id: string;
  kind: "episode" | "social" | "recap" | "system";
  title: string;
  excerpt: string;
  when: string;
  unread?: boolean;
}

const NOTIFICATIONS: MockNotification[] = [
  {
    id: "1",
    kind: "episode",
    title: "Frieren — Épisode 12 disponible",
    excerpt: "« La fin du voyage » — sorti il y a 12 min sur Crunchyroll.",
    when: "12 min",
    unread: true,
  },
  {
    id: "2",
    kind: "social",
    title: "@léa a commenté ton avis",
    excerpt: "« Totalement d'accord sur la séquence du pont, je l'ai revue trois fois. »",
    when: "1h",
    unread: true,
  },
  {
    id: "3",
    kind: "recap",
    title: "Ton récap de la semaine",
    excerpt: "Tu as terminé 3 anime et regardé 8h cette semaine. +12% vs semaine passée.",
    when: "il y a 4h",
    unread: true,
  },
  {
    id: "4",
    kind: "episode",
    title: "Solo Leveling — Épisode 8",
    excerpt: "Disponible depuis hier sur Crunchyroll. Tu en es à l'épisode 7.",
    when: "1j",
  },
  {
    id: "5",
    kind: "system",
    title: "Mise à jour de l'interface",
    excerpt: "La fiche anime a un nouveau header en mode scroll. Vois le changelog.",
    when: "2j",
  },
];

const FILTERS = [
  { key: "all", label: "Tout" },
  { key: "unread", label: "Non lues" },
  { key: "episodes", label: "Épisodes" },
  { key: "social", label: "Social" },
  { key: "recaps", label: "Récaps" },
];

export default function NotificationsPage() {
  const unreadCount = NOTIFICATIONS.filter((n) => n.unread).length;

  return (
    <main className="mx-auto max-w-3xl px-7 pb-20 pt-12">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="m-0 mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
            Boîte de réception
          </p>
          <h1 className="m-0 font-display text-4xl font-semibold tracking-[-0.025em] text-text-primary sm:text-5xl">
            Notifications
          </h1>
          <p className="m-0 mt-2 font-body text-sm text-text-secondary">
            {unreadCount} non lue{unreadCount > 1 ? "s" : ""} sur {NOTIFICATIONS.length}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex h-9 items-center rounded-md border border-border bg-bg-surface px-3 font-body text-xs text-text-secondary transition-colors duration-200 hover:bg-bg-elevated hover:text-text-primary"
          >
            Tout marquer comme lu
          </button>
          <Link
            href="/settings"
            aria-label="Paramètres notifications"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-bg-surface text-text-secondary transition-colors duration-200 hover:bg-bg-elevated hover:text-text-primary"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </Link>
        </div>
      </header>

      <nav className="mb-6 flex flex-wrap gap-1 border-b border-border-subtle" aria-label="Filtres">
        {FILTERS.map((f, i) => {
          const active = i === 0;
          return (
            <span
              key={f.key}
              role="tab"
              aria-selected={active}
              className="relative inline-flex h-9 items-center rounded-t-md px-3 font-body text-sm font-medium"
              style={{
                color: active ? "var(--color-text-primary)" : "var(--color-text-secondary)",
              }}
            >
              {f.label}
              {active && (
                <span
                  aria-hidden
                  className="absolute -bottom-px left-3 right-3 h-0.5"
                  style={{ backgroundColor: "var(--color-accent)" }}
                />
              )}
            </span>
          );
        })}
      </nav>

      <ul className="flex flex-col gap-2">
        {NOTIFICATIONS.map((n) => (
          <li key={n.id}>
            <article className="relative flex gap-3 rounded-xl border border-border-subtle bg-bg-surface p-4">
              {n.unread && (
                <span
                  aria-hidden
                  className="absolute left-1 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full"
                  style={{ backgroundColor: "var(--color-accent)" }}
                />
              )}
              <div
                aria-hidden
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border-subtle text-text-secondary"
                style={{ backgroundColor: "var(--color-bg-elevated)" }}
              >
                <KindIcon kind={n.kind} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="m-0 font-body text-sm font-medium text-text-primary">
                  {n.title}
                </p>
                <p className="m-0 mt-0.5 line-clamp-2 font-body text-xs text-text-secondary">
                  {n.excerpt}
                </p>
              </div>
              <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
                {n.when}
              </span>
            </article>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex justify-center">
        <button
          type="button"
          className="inline-flex h-10 items-center rounded-md border border-border bg-bg-surface px-5 font-body text-sm text-text-secondary transition-colors duration-200 hover:bg-bg-elevated hover:text-text-primary"
        >
          Charger plus
        </button>
      </div>
    </main>
  );
}

function KindIcon({ kind }: { kind: MockNotification["kind"] }) {
  if (kind === "episode") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M8 5v14l11-7z" />
      </svg>
    );
  }
  if (kind === "social") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M21 11.5a8.38 8.38 0 0 1-9 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7a8.5 8.5 0 1 1 16.1-3.8z" />
      </svg>
    );
  }
  if (kind === "recap") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M3 3v18h18" />
        <path d="m7 14 4-4 4 4 6-6" />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  );
}

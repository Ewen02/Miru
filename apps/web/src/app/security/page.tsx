import { redirect } from "next/navigation";
import type { Metadata } from "next";
import type { UserActiveSessionDto } from "@miru/types";
import { fetchUserSessions } from "@/lib/server-sessions";
import { RevokeSessionButton } from "./revoke-session-button";

export const metadata: Metadata = {
  title: "Sécurité",
  description: "Sécurité de ton compte Miru — 2FA, sessions actives.",
};

export default async function SecurityPage() {
  const sessions = await fetchUserSessions();
  if (sessions === null) redirect("/login?next=/security");

  return (
    <main className="mx-auto max-w-3xl px-7 pb-20 pt-12">
      <header className="mb-10">
        <p className="m-0 mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
          Compte
        </p>
        <h1 className="m-0 font-display text-4xl font-semibold tracking-[-0.025em] text-text-primary sm:text-5xl">
          Sécurité
        </h1>
      </header>

      <section className="mb-10">
        <h2 className="m-0 mb-4 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
          Authentification à deux facteurs
        </h2>
        <article className="flex items-center justify-between rounded-2xl border border-border-subtle bg-bg-surface p-5">
          <div>
            <p className="m-0 font-display text-base font-semibold text-text-primary">
              2FA · Application d'authentification
            </p>
            <p className="m-0 mt-0.5 font-body text-xs text-text-tertiary">
              Pas encore disponible — fonctionnalité prévue dans une prochaine mise à jour.
            </p>
          </div>
          <span className="rounded-xs border border-border bg-bg-base px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-text-tertiary">
            À venir
          </span>
        </article>
      </section>

      <section>
        <h2 className="m-0 mb-4 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
          Sessions actives
        </h2>
        {sessions.length === 0 ? (
          <div className="rounded-2xl border border-border-subtle bg-bg-surface p-6 text-center">
            <p className="m-0 font-body text-sm text-text-tertiary">
              Aucune session active. Tu devras te reconnecter au prochain rechargement.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface">
            {sessions.map((s, idx) => (
              <SessionRow
                key={s.id}
                session={s}
                isLast={idx === sessions.length - 1}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function SessionRow({
  session,
  isLast,
}: {
  session: UserActiveSessionDto;
  isLast: boolean;
}) {
  const device = parseUserAgent(session.userAgent);
  const seen = new Date(session.createdAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return (
    <div
      className={
        isLast
          ? "flex items-center justify-between p-4"
          : "flex items-center justify-between border-b border-border-subtle p-4"
      }
    >
      <div className="min-w-0 flex-1">
        <p className="m-0 font-body text-sm font-semibold text-text-primary">{device}</p>
        <p className="m-0 font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
          {session.ipAddress ?? "IP inconnue"} · ouverte le {seen}
        </p>
      </div>
      {session.current ? (
        <span
          className="rounded-xs border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider"
          style={{
            color: "var(--color-success)",
            borderColor: "color-mix(in srgb, var(--color-success) 30%, transparent)",
          }}
        >
          Actuelle
        </span>
      ) : (
        <RevokeSessionButton sessionId={session.id} />
      )}
    </div>
  );
}

/**
 * Best-effort UA → human label. Browser/OS detection only — keeps the bundle
 * tiny by avoiding a UA parsing dependency. Falls back to a neutral label
 * when detection misses.
 */
function parseUserAgent(ua: string | null): string {
  if (!ua) return "Appareil inconnu";

  const browser =
    /Edg\//.test(ua) ? "Edge"
    : /Chrome\//.test(ua) ? "Chrome"
    : /Firefox\//.test(ua) ? "Firefox"
    : /Safari\//.test(ua) ? "Safari"
    : "Navigateur";

  const os =
    /iPhone|iPad/.test(ua) ? "iOS"
    : /Android/.test(ua) ? "Android"
    : /Macintosh|Mac OS X/.test(ua) ? "macOS"
    : /Windows/.test(ua) ? "Windows"
    : /Linux/.test(ua) ? "Linux"
    : "Inconnu";

  return `${browser} · ${os}`;
}

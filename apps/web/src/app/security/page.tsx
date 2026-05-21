import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import type { UserActiveSessionDto } from "@miru/types";
import { fetchUserSessions } from "@/lib/server-sessions";
import { fetchMe } from "@/lib/server-me";
import { RevokeSessionButton } from "./revoke-session-button";
import { TwoFactorPanel } from "./two-factor-panel";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("security");
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function SecurityPage() {
  const [sessions, me, t, locale] = await Promise.all([
    fetchUserSessions(),
    fetchMe(),
    getTranslations("security"),
    getLocale(),
  ]);
  if (sessions === null || me === null) redirect("/login?next=/security");

  return (
    <main className="mx-auto max-w-3xl px-7 pb-20 pt-12">
      <header className="mb-10">
        <p className="m-0 mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
          {t("eyebrow")}
        </p>
        <h1 className="m-0 font-display text-4xl font-semibold tracking-[-0.025em] text-text-primary sm:text-5xl">
          {t("title")}
        </h1>
      </header>

      <section className="mb-10">
        <h2 className="m-0 mb-4 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
          {t("twoFactorHeading")}
        </h2>
        <TwoFactorPanel enabled={me.twoFactorEnabled} />
      </section>

      <section>
        <h2 className="m-0 mb-4 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
          {t("sessionsHeading")}
        </h2>
        {sessions.length === 0 ? (
          <div className="rounded-2xl border border-border-subtle bg-bg-surface p-6 text-center">
            <p className="m-0 font-body text-sm text-text-tertiary">
              {t("sessionsEmpty")}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface">
            {sessions.map((s, idx) => (
              <SessionRow
                key={s.id}
                session={s}
                isLast={idx === sessions.length - 1}
                t={t}
                locale={locale}
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
  t,
  locale,
}: {
  session: UserActiveSessionDto;
  isLast: boolean;
  t: (key: string) => string;
  locale: string;
}) {
  const device = parseUserAgent(session.userAgent, t);
  const seen = new Date(session.createdAt).toLocaleDateString(locale, {
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
          {session.ipAddress ?? t("ipUnknown")} · {t("openedOn")} {seen}
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
          {t("currentLabel")}
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
function parseUserAgent(ua: string | null, t: (key: string) => string): string {
  if (!ua) return t("deviceUnknown");

  const browser =
    /Edg\//.test(ua) ? "Edge"
    : /Chrome\//.test(ua) ? "Chrome"
    : /Firefox\//.test(ua) ? "Firefox"
    : /Safari\//.test(ua) ? "Safari"
    : t("browserGeneric");

  const os =
    /iPhone|iPad/.test(ua) ? "iOS"
    : /Android/.test(ua) ? "Android"
    : /Macintosh|Mac OS X/.test(ua) ? "macOS"
    : /Windows/.test(ua) ? "Windows"
    : /Linux/.test(ua) ? "Linux"
    : t("osUnknown");

  return `${browser} · ${os}`;
}

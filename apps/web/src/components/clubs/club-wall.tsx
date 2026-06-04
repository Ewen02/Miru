"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import type { ClubDetailDto } from "@miru/types";
import { joinClub, leaveClub, postToClub } from "@/lib/clubs-api";

/**
 * Join/leave control + member-only post form + wall. Reflects the server's
 * authoritative ClubDetailDto and updates in place from each action's response.
 */
export function ClubWall({ club: initial, isAuthenticated }: { club: ClubDetailDto; isAuthenticated: boolean }) {
  const t = useTranslations("clubsPage");
  const locale = useLocale();
  const router = useRouter();
  const [club, setClub] = useState(initial);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const requireAuth = () => {
    if (!isAuthenticated) {
      router.push("/login");
      return false;
    }
    return true;
  };

  const run = (fn: () => Promise<ClubDetailDto | { error: string }>) => {
    setError(null);
    startTransition(async () => {
      const result = await fn();
      if ("error" in result) setError(result.error);
      else setClub(result);
    });
  };

  const toggleMembership = () => {
    if (!requireAuth()) return;
    run(() => (club.isMember ? leaveClub(club.slug) : joinClub(club.slug)));
  };

  const submitPost = () => {
    if (!requireAuth() || pending || body.trim().length === 0) return;
    run(async () => {
      const r = await postToClub(club.slug, body.trim());
      if (!("error" in r)) setBody("");
      return r;
    });
  };

  return (
    <>
      <div className="mb-8 flex items-center gap-3">
        <span className="font-mono text-[11px] text-text-tertiary">
          {t("members", { count: club.memberCount })}
        </span>
        <button
          type="button"
          onClick={toggleMembership}
          disabled={pending}
          aria-pressed={club.isMember}
          className="inline-flex h-8 items-center rounded-md px-3.5 font-body text-sm font-medium transition-colors duration-200 disabled:opacity-50"
          style={{
            backgroundColor: club.isMember ? "transparent" : "var(--color-accent)",
            color: club.isMember ? "var(--color-text-secondary)" : "var(--color-bg-base)",
            border: club.isMember ? "1px solid var(--color-border)" : "none",
          }}
        >
          {club.isMember ? t("leave") : t("join")}
        </button>
      </div>

      <h2 className="m-0 mb-4 font-display text-xl font-semibold tracking-tight text-text-primary">
        {t("wall")}
      </h2>

      {club.isMember ? (
        <div className="mb-6">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={5000}
            rows={3}
            placeholder={t("postPlaceholder")}
            className="w-full resize-y rounded-lg border border-border bg-bg-surface px-3.5 py-2.5 font-body text-sm text-text-primary placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
          />
          <div className="mt-2 flex items-center justify-end gap-3">
            {error && <span className="font-body text-xs text-error">{error}</span>}
            <button
              type="button"
              onClick={submitPost}
              disabled={pending || body.trim().length === 0}
              className="inline-flex h-9 items-center rounded-md bg-accent px-4 font-body text-sm font-medium text-bg-base disabled:opacity-50"
            >
              {t("post")}
            </button>
          </div>
        </div>
      ) : (
        <p className="mb-6 font-body text-sm text-text-tertiary">{t("membersOnly")}</p>
      )}

      {club.posts.length === 0 ? (
        <p className="m-0 font-body text-sm text-text-tertiary">{t("noPosts")}</p>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {club.posts.map((post) => (
            <li key={post.id} className="rounded-xl border border-border-subtle bg-bg-surface p-4">
              <div className="mb-1.5 flex items-baseline gap-2">
                <span className="font-body text-sm font-semibold text-text-primary">
                  {post.author.name}
                </span>
                <time className="font-mono text-[10px] text-text-tertiary">
                  {new Date(post.createdAt).toLocaleDateString(locale)}
                </time>
              </div>
              <p className="m-0 whitespace-pre-wrap font-body text-sm leading-relaxed text-text-secondary">
                {post.body}
              </p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

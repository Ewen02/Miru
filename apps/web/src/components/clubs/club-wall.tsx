"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import type { ClubDetailDto, ClubPostDto } from "@miru/types";
import { joinClub, leaveClub, postToClub } from "@/lib/clubs-api";
import { MonogramAvatar } from "@/components/monogram-avatar";

const MAX_LENGTH = 5000;

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

  const remaining = MAX_LENGTH - body.length;

  return (
    <>
      {/* Membership action — pinned to the right above the wall. */}
      <div className="mb-8 flex items-center justify-end">
        <button
          type="button"
          onClick={toggleMembership}
          disabled={pending}
          aria-pressed={club.isMember}
          className="inline-flex h-9 items-center rounded-md px-4 font-body text-sm font-medium transition-colors duration-200 disabled:opacity-50"
          style={{
            backgroundColor: club.isMember ? "transparent" : "var(--color-accent)",
            color: club.isMember ? "var(--color-text-secondary)" : "var(--color-bg-base)",
            border: club.isMember ? "1px solid var(--color-border)" : "none",
          }}
        >
          {club.isMember ? t("leave") : t("join")}
        </button>
      </div>

      <h2 className="m-0 mb-5 font-display text-xl font-semibold tracking-tight text-text-primary">
        {t("wall")}
      </h2>

      {club.isMember ? (
        <div className="mb-8 rounded-2xl border border-border-subtle bg-bg-surface p-4">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={MAX_LENGTH}
            rows={3}
            placeholder={t("postPlaceholder")}
            className="w-full resize-y bg-transparent font-body text-sm leading-relaxed text-text-primary placeholder:text-text-tertiary focus-visible:outline-none"
          />
          <div className="mt-2 flex items-center justify-between gap-3 border-t border-border-subtle pt-3">
            <span className="font-mono text-[10px] text-text-quaternary">
              {remaining < 500 ? remaining : ""}
            </span>
            <div className="flex items-center gap-3">
              {error && <span className="font-body text-xs text-error">{error}</span>}
              <button
                type="button"
                onClick={submitPost}
                disabled={pending || body.trim().length === 0}
                className="inline-flex h-9 items-center rounded-md bg-accent px-4 font-body text-sm font-medium text-bg-base transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {t("post")}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-8 rounded-2xl border border-dashed border-border-subtle bg-bg-surface/50 p-5 text-center">
          <p className="m-0 font-body text-sm text-text-tertiary">{t("membersOnly")}</p>
        </div>
      )}

      {club.posts.length === 0 ? (
        <div className="rounded-2xl border border-border-subtle bg-bg-surface p-10 text-center">
          <p className="m-0 font-body text-sm text-text-tertiary">{t("noPosts")}</p>
        </div>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {club.posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              isOwner={post.author.name === club.ownerName}
              ownerLabel={t("ownerBadge")}
              locale={locale}
            />
          ))}
        </ul>
      )}
    </>
  );
}

function PostCard({
  post,
  isOwner,
  ownerLabel,
  locale,
}: {
  post: ClubPostDto;
  isOwner: boolean;
  ownerLabel: string;
  locale: string;
}) {
  return (
    <li className="flex gap-3 rounded-2xl border border-border-subtle bg-bg-surface p-4">
      <Link
        href={`/u/${post.author.id}`}
        className="shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
        aria-label={post.author.name}
      >
        <MonogramAvatar name={post.author.name} image={post.author.image} size="sm" />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <Link
            href={`/u/${post.author.id}`}
            className="font-body text-sm font-semibold text-text-primary transition-colors duration-200 hover:text-accent"
          >
            {post.author.name}
          </Link>
          {isOwner && (
            <span className="inline-flex h-4 items-center rounded-sm border border-accent/40 bg-accent-subtle px-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-accent">
              {ownerLabel}
            </span>
          )}
          <time className="font-mono text-[10px] text-text-tertiary">
            {new Date(post.createdAt).toLocaleDateString(locale)}
          </time>
        </div>
        <p className="m-0 whitespace-pre-wrap font-body text-sm leading-relaxed text-text-secondary text-pretty">
          {post.body}
        </p>
      </div>
    </li>
  );
}

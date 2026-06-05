"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import type { PollDto } from "@miru/types";
import { voteOnPoll } from "@/lib/polls-api";

/**
 * A single poll with clickable options. Once the viewer has voted (or the poll
 * is closed), options render as result bars with percentages. Voting updates
 * the card in place from the API response.
 */
export function PollCard({ poll: initial, isAuthenticated }: { poll: PollDto; isAuthenticated: boolean }) {
  const t = useTranslations("pollsPage");
  const router = useRouter();
  const [poll, setPoll] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const revealed = poll.votedOptionId != null || poll.closed;

  const vote = (optionId: string) => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (revealed || pending) return;
    setError(null);
    startTransition(async () => {
      const result = await voteOnPoll(poll.id, optionId);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setPoll(result);
    });
  };

  return (
    <article className="rounded-2xl border border-border-subtle bg-bg-surface p-5">
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <h2 className="m-0 font-display text-lg font-semibold tracking-tight text-text-primary">
          {poll.question}
        </h2>
        {poll.closed && (
          <span className="shrink-0 rounded-sm border border-border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-text-tertiary">
            {t("closed")}
          </span>
        )}
      </div>
      <p className="m-0 mb-4 font-mono text-[10px] uppercase tracking-[0.18em] text-text-tertiary">
        {poll.authorName} · {t("totalVotes", { count: poll.totalVotes })}
      </p>

      <div className="flex flex-col gap-2">
        {poll.options.map((option) => {
          const pct = poll.totalVotes > 0 ? Math.round((option.votes / poll.totalVotes) * 100) : 0;
          const isMine = poll.votedOptionId === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => vote(option.id)}
              disabled={revealed || pending}
              aria-pressed={isMine}
              className="relative overflow-hidden rounded-lg border border-border-subtle px-3.5 py-2.5 text-left transition-colors duration-200 enabled:hover:bg-bg-elevated disabled:cursor-default"
            >
              {revealed && (
                <span
                  aria-hidden
                  className="absolute inset-y-0 left-0 rounded-lg transition-[width] duration-500"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: isMine
                      ? "color-mix(in srgb, var(--color-accent) 22%, transparent)"
                      : "var(--color-bg-elevated)",
                  }}
                />
              )}
              <span className="relative flex items-center justify-between gap-3">
                <span className="flex items-center gap-2">
                  {isMine && (
                    <span
                      aria-hidden
                      className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent font-mono text-[9px] text-bg-base"
                    >
                      ✓
                    </span>
                  )}
                  <span
                    className={
                      isMine
                        ? "font-body text-sm font-medium text-accent"
                        : "font-body text-sm text-text-primary"
                    }
                  >
                    {option.label}
                  </span>
                </span>
                {revealed && (
                  <span
                    className={
                      isMine
                        ? "shrink-0 font-mono text-xs font-medium text-accent"
                        : "shrink-0 font-mono text-xs text-text-secondary"
                    }
                  >
                    {pct}%
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {error && <p className="m-0 mt-3 font-body text-xs text-error">{error}</p>}
    </article>
  );
}

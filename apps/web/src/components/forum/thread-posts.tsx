"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import type { ForumThreadDetailDto } from "@miru/types";
import { addForumPost } from "@/lib/forum-api";

/**
 * Renders a thread's posts and a reply form. The list updates in place from
 * the API response after replying. The first post is the thread body.
 */
export function ThreadPosts({
  threadId,
  initialPosts,
  isAuthenticated,
}: {
  threadId: string;
  initialPosts: ForumThreadDetailDto["posts"];
  isAuthenticated: boolean;
}) {
  const t = useTranslations("forumPage");
  const locale = useLocale();
  const router = useRouter();
  const [posts, setPosts] = useState(initialPosts);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = () => {
    const text = body.trim();
    if (!text || pending) return;
    setError(null);
    startTransition(async () => {
      const result = await addForumPost(threadId, text);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setPosts(result.posts);
      setBody("");
    });
  };

  return (
    <>
      <ul className="m-0 mb-8 flex list-none flex-col gap-3 p-0">
        {posts.map((post, idx) => (
          <li
            key={post.id}
            className="rounded-xl border border-border-subtle bg-bg-surface p-4"
            style={idx === 0 ? { borderColor: "color-mix(in srgb, var(--color-accent) 30%, transparent)" } : undefined}
          >
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

      {isAuthenticated ? (
        <div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={5000}
            rows={3}
            placeholder={t("replyPlaceholder")}
            className="w-full resize-y rounded-lg border border-border bg-bg-surface px-3.5 py-2.5 font-body text-sm text-text-primary placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
          />
          <div className="mt-2 flex items-center justify-end gap-3">
            {error && <span className="font-body text-xs text-error">{error}</span>}
            <button
              type="button"
              onClick={submit}
              disabled={pending || body.trim().length === 0}
              className="inline-flex h-9 items-center rounded-md bg-accent px-4 font-body text-sm font-medium text-bg-base disabled:opacity-50"
            >
              {t("reply")}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="w-full rounded-lg border border-border-subtle bg-bg-surface px-4 py-3 text-left font-body text-sm text-text-secondary transition-colors duration-200 hover:bg-bg-elevated"
        >
          {t("loginToPost")}
        </button>
      )}
    </>
  );
}

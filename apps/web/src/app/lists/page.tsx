import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { ListSummaryDto } from "@miru/types";
import { fetchLists } from "@/lib/server-lists";
import { getServerSession } from "@/lib/server-auth";
import { CreateListButton } from "./create-list-button";

interface ListsPageProps {
  searchParams: Promise<{ tab?: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("listsPage");
  return { title: t("metaTitle"), description: t("metaDescription") };
}

const TAB_KEYS = ["mine", "liked", "public"] as const;
type Tab = (typeof TAB_KEYS)[number];

const TAB_LABEL: Record<Tab, string> = {
  mine: "tabMine",
  liked: "tabLiked",
  public: "tabPublic",
};

export default async function ListsPage({ searchParams }: ListsPageProps) {
  const [sp, session, t] = await Promise.all([
    searchParams,
    getServerSession(),
    getTranslations("listsPage"),
  ]);
  const requestedTab = (sp.tab as Tab) ?? (session ? "mine" : "public");
  const activeTab = TAB_KEYS.includes(requestedTab) ? requestedTab : "mine";

  const lists = await fetchLists(activeTab).catch(() => [] as ListSummaryDto[]);

  return (
    <main className="mx-auto max-w-300 px-7 pb-20 pt-12">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="m-0 mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
            {t("eyebrow")}
          </p>
          <h1 className="m-0 font-display text-4xl font-semibold tracking-[-0.025em] text-text-primary sm:text-5xl">
            {t("title")}
          </h1>
        </div>
        {session && <CreateListButton />}
      </header>

      <nav
        className="mb-8 flex flex-wrap gap-1 border-b border-border-subtle"
        aria-label={t("tabsAria")}
      >
        {TAB_KEYS.map((key) => {
          if (!session && (key === "mine" || key === "liked")) return null;
          const isActive = activeTab === key;
          return (
            <Link
              key={key}
              href={key === "public" ? "/lists?tab=public" : `/lists?tab=${key}`}
              role="tab"
              aria-selected={isActive}
              className="relative inline-flex h-10 items-center rounded-t-md px-4 font-body text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
              style={{
                color: isActive ? "var(--color-text-primary)" : "var(--color-text-secondary)",
              }}
            >
              {t(TAB_LABEL[key])}
              {isActive && (
                <span
                  aria-hidden
                  className="absolute -bottom-px left-3 right-3 h-0.5"
                  style={{ backgroundColor: "var(--color-accent)" }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {lists.length === 0 ? (
        <EmptyState tab={activeTab} authenticated={session !== null} t={t} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lists.map((list) => (
            <ListCard key={list.id} list={list} t={t} />
          ))}
        </div>
      )}
    </main>
  );
}

type T = (key: string, values?: Record<string, string | number>) => string;

function EmptyState({
  tab,
  authenticated,
  t,
}: {
  tab: Tab;
  authenticated: boolean;
  t: T;
}) {
  if (!authenticated && tab !== "public") {
    return (
      <div className="rounded-xl border border-border-subtle bg-bg-surface p-10 text-center">
        <p className="m-0 mb-4 font-body text-sm text-text-tertiary">
          {t("emptyAnonymous")}
        </p>
        <Link
          href="/login?next=/lists"
          className="inline-flex h-10 items-center rounded-md px-4 font-body text-sm font-semibold"
          style={{ backgroundColor: "var(--color-accent)", color: "#08080c" }}
        >
          {t("emptyAnonymousCta")}
        </Link>
      </div>
    );
  }
  const messageKey: Record<Tab, string> = {
    mine: "emptyMine",
    liked: "emptyLiked",
    public: "emptyPublic",
  };
  return (
    <div className="rounded-xl border border-border-subtle bg-bg-surface p-10 text-center">
      <p className="m-0 font-body text-sm text-text-tertiary">{t(messageKey[tab])}</p>
    </div>
  );
}

function ListCard({ list, t }: { list: ListSummaryDto; t: T }) {
  return (
    <Link
      href={`/lists/${list.id}`}
      className="group block overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface transition-colors duration-200 hover:border-border hover:bg-bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
    >
      <div className="relative grid h-40 grid-cols-2 gap-px bg-bg-base">
        {Array.from({ length: 4 }, (_, i) => {
          const cover = list.previewCovers[i] ?? null;
          if (cover) {
            return (
              <div key={i} className="relative h-full w-full">
                <Image
                  src={cover}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover"
                />
              </div>
            );
          }
          return (
            <div
              key={i}
              aria-hidden
              className="h-full w-full"
              style={{
                background: `linear-gradient(${130 + i * 15}deg, color-mix(in srgb, var(--color-accent) ${15 + i * 5}%, transparent), var(--color-bg-elevated))`,
              }}
            />
          );
        })}
        {!list.isPublic && (
          <span
            className="absolute left-3 top-3 rounded-xs border border-border bg-bg-base/80 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-text-secondary backdrop-blur-sm"
          >
            {t("privateBadge")}
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="m-0 mb-1 font-display text-base font-semibold leading-tight text-text-primary group-hover:text-accent">
          {list.title}
        </h3>
        {list.description && (
          <p className="m-0 mb-3 line-clamp-2 font-body text-xs text-text-secondary">
            {list.description}
          </p>
        )}
        <div className="flex items-center gap-3 font-mono text-[10px] text-text-tertiary">
          <span>{t("titlesCount", { count: list.itemCount })}</span>
          <span aria-hidden>·</span>
          <span>{list.likeCount} ❤</span>
          <span aria-hidden>·</span>
          <span>{t("byOwner", { name: list.ownerName })}</span>
        </div>
      </div>
    </Link>
  );
}

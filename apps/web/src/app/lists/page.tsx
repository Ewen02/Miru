import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import type { ListSummaryDto } from "@miru/types";
import { fetchLists } from "@/lib/server-lists";
import { getServerSession } from "@/lib/server-auth";
import { CreateListButton } from "./create-list-button";

interface ListsPageProps {
  searchParams: Promise<{ tab?: string }>;
}

export const metadata: Metadata = {
  title: "Listes",
  description: "Tes listes Miru et les listes publiques de la communauté.",
};

const TABS = [
  { key: "mine", label: "Mes listes" },
  { key: "liked", label: "Likées" },
  { key: "public", label: "Communauté" },
] as const;

type Tab = (typeof TABS)[number]["key"];

export default async function ListsPage({ searchParams }: ListsPageProps) {
  const sp = await searchParams;
  const session = await getServerSession();
  const requestedTab = (sp.tab as Tab) ?? (session ? "mine" : "public");
  const activeTab = TABS.find((t) => t.key === requestedTab)?.key ?? "mine";

  const lists = await fetchLists(activeTab).catch(() => [] as ListSummaryDto[]);

  return (
    <main className="mx-auto max-w-300 px-7 pb-20 pt-12">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="m-0 mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
            Curated
          </p>
          <h1 className="m-0 font-display text-4xl font-semibold tracking-[-0.025em] text-text-primary sm:text-5xl">
            Listes
          </h1>
        </div>
        {session && <CreateListButton />}
      </header>

      <nav
        className="mb-8 flex flex-wrap gap-1 border-b border-border-subtle"
        aria-label="Onglets"
      >
        {TABS.map((tab) => {
          // Hide "mine"/"liked" for anonymous visitors.
          if (!session && (tab.key === "mine" || tab.key === "liked")) return null;
          const isActive = activeTab === tab.key;
          return (
            <Link
              key={tab.key}
              href={tab.key === "public" ? "/lists?tab=public" : `/lists?tab=${tab.key}`}
              role="tab"
              aria-selected={isActive}
              className="relative inline-flex h-10 items-center rounded-t-md px-4 font-body text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
              style={{
                color: isActive ? "var(--color-text-primary)" : "var(--color-text-secondary)",
              }}
            >
              {tab.label}
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
        <EmptyState tab={activeTab} authenticated={session !== null} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lists.map((list) => (
            <ListCard key={list.id} list={list} />
          ))}
        </div>
      )}
    </main>
  );
}

function EmptyState({ tab, authenticated }: { tab: Tab; authenticated: boolean }) {
  if (!authenticated && tab !== "public") {
    return (
      <div className="rounded-xl border border-border-subtle bg-bg-surface p-10 text-center">
        <p className="m-0 mb-4 font-body text-sm text-text-tertiary">
          Connecte-toi pour gérer tes listes et likes.
        </p>
        <Link
          href="/login?next=/lists"
          className="inline-flex h-10 items-center rounded-md px-4 font-body text-sm font-semibold"
          style={{ backgroundColor: "var(--color-accent)", color: "#08080c" }}
        >
          Se connecter
        </Link>
      </div>
    );
  }
  const messages: Record<Tab, string> = {
    mine: "Tu n'as pas encore de liste. Clique sur « Créer une liste » pour commencer.",
    liked: "Tu n'as pas encore liké de liste publique.",
    public: "Aucune liste publique pour l'instant.",
  };
  return (
    <div className="rounded-xl border border-border-subtle bg-bg-surface p-10 text-center">
      <p className="m-0 font-body text-sm text-text-tertiary">{messages[tab]}</p>
    </div>
  );
}

function ListCard({ list }: { list: ListSummaryDto }) {
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
            Privée
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
          <span>{list.itemCount} titres</span>
          <span aria-hidden>·</span>
          <span>{list.likeCount} ❤</span>
          <span aria-hidden>·</span>
          <span>par {list.ownerName}</span>
        </div>
      </div>
    </Link>
  );
}

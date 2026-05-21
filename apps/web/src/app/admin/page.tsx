import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { fetchAdminReports } from "@/lib/server-admin-reports";
import { QueueActions } from "./queue-actions";

export const metadata: Metadata = {
  title: "Modération",
  robots: { index: false, follow: false },
};

const REASON_LABEL: Record<string, string> = {
  SPAM: "Spam",
  ABUSE: "Abus / harcèlement",
  OFFTOPIC: "Hors-sujet",
  OTHER: "Autre",
};

const TARGET_LABEL: Record<string, string> = {
  REVIEW: "Avis",
  LIST: "Liste",
};

export default async function AdminPage() {
  const reports = await fetchAdminReports();
  if (reports === null) redirect("/login?next=/admin");

  return (
    <main className="mx-auto max-w-300 px-7 pb-20 pt-12">
      <header className="mb-10">
        <p className="m-0 mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
          Back-office
        </p>
        <h1 className="m-0 font-display text-4xl font-semibold tracking-[-0.025em] text-text-primary sm:text-5xl">
          File de modération
        </h1>
        <p className="m-0 mt-2 font-body text-sm text-text-secondary">
          {reports.length} signalement{reports.length > 1 ? "s" : ""} en attente.
        </p>
      </header>

      {reports.length === 0 ? (
        <div className="rounded-2xl border border-border-subtle bg-bg-surface p-10 text-center">
          <p className="font-body text-text-secondary">
            Rien à modérer. Tout va bien.
          </p>
        </div>
      ) : (
        <ul className="m-0 flex flex-col gap-4 p-0">
          {reports.map((r) => (
            <li
              key={r.id}
              className="flex flex-col gap-4 rounded-2xl border border-border-subtle bg-bg-surface p-5 md:flex-row md:items-start md:justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="inline-flex h-6 items-center rounded-sm bg-bg-elevated px-2 font-mono text-[10px] uppercase tracking-wider text-text-secondary">
                    {TARGET_LABEL[r.targetKind] ?? r.targetKind}
                  </span>
                  <span className="inline-flex h-6 items-center rounded-sm border border-warning/40 bg-warning/10 px-2 font-mono text-[10px] uppercase tracking-wider text-warning">
                    {REASON_LABEL[r.reason] ?? r.reason}
                  </span>
                  <span className="font-mono text-[10px] text-text-tertiary">
                    {new Date(r.createdAt).toLocaleString("fr-FR")}
                  </span>
                </div>
                <p className="m-0 mb-2 font-body text-sm text-text-primary">
                  <span className="text-text-tertiary">Auteur : </span>
                  {r.target.authorName ?? "(inconnu)"}
                  <span className="ml-3 text-text-tertiary">Signalé par : </span>
                  {r.reporterName}
                </p>
                <p className="m-0 mb-2 font-body text-sm text-text-secondary">
                  {r.target.label}
                </p>
                {r.details && (
                  <p className="m-0 mb-2 rounded-md border border-border-subtle bg-bg-base px-3 py-2 font-body text-xs italic text-text-tertiary">
                    « {r.details} »
                  </p>
                )}
                {r.target.href && (
                  <Link
                    href={r.target.href}
                    className="font-mono text-xs text-accent hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Voir le contenu →
                  </Link>
                )}
              </div>
              <QueueActions report={r} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

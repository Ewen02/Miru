import { redirect } from "next/navigation";
import Link from "next/link";
import { Logo } from "@miru/ui";
import { getServerSession } from "@/lib/server-auth";
import { SignOutButton } from "./sign-out-button";

export const metadata = {
  title: "Profil",
};

export default async function ProfilePage() {
  const session = await getServerSession();
  if (!session) redirect("/login");

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col px-6 py-12">
      <Link
        href="/"
        aria-label="Accueil Miru"
        className="mb-12 inline-flex shrink-0 self-start text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
      >
        <Logo size={24} />
      </Link>

      <header className="mb-10">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-text-tertiary">
          Profil
        </p>
        <h1 className="font-display text-4xl font-bold tracking-tight text-text-primary">
          {session.user.name}
        </h1>
        <p className="mt-2 font-body text-sm text-text-secondary">{session.user.email}</p>
      </header>

      <section className="flex flex-col gap-6">
        <div className="rounded-xl border border-border bg-bg-surface p-6">
          <h2 className="mb-3 font-display text-sm font-semibold text-text-primary">Ta watchlist</h2>
          <p className="font-body text-sm text-text-secondary">
            Retrouve les animes que tu suis, en pause, ou prévus.
          </p>
          <Link
            href="/watchlist"
            className="mt-4 inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wide text-accent transition-colors duration-200 hover:text-text-primary"
          >
            Voir ma watchlist →
          </Link>
        </div>

        <div className="flex justify-end">
          <SignOutButton />
        </div>
      </section>
    </main>
  );
}

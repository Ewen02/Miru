import Link from "next/link";
import { Logo } from "@miru/ui";

/**
 * Global footer rendered under every page. 4 columns of navigation
 * (Découvrir / Compte / Légal / Sources) + bottom bar with logo and
 * data attribution.
 *
 * Routes referenced here MUST exist — broken links erode trust. When a
 * route is removed, drop it from this list at the same time.
 */
export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border-subtle bg-bg-surface/40 px-6 pt-12 pb-8">
      <div className="mx-auto max-w-300">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          <FooterColumn
            label="Découvrir"
            links={[
              { href: "/", label: "Catalogue" },
              { href: "/calendar", label: "Calendrier" },
              { href: "/top", label: "Top 100" },
              { href: "/seasons/" + new Date().getFullYear(), label: "Cette année" },
            ]}
          />
          <FooterColumn
            label="Compte"
            links={[
              { href: "/watchlist", label: "Watchlist" },
              { href: "/profile", label: "Profil" },
              { href: "/settings", label: "Paramètres" },
              { href: "/notifications", label: "Notifications" },
            ]}
          />
          <FooterColumn
            label="Aide & infos"
            links={[
              { href: "/about", label: "À propos" },
              { href: "/help", label: "Aide" },
              { href: "/changelog", label: "Changelog" },
              { href: "/shortcuts", label: "Raccourcis" },
              { href: "/status", label: "Statut" },
            ]}
          />
          <FooterColumn
            label="Légal"
            links={[
              { href: "/terms", label: "Conditions" },
              { href: "/pricing", label: "Tarifs" },
            ]}
          />
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border-subtle pt-6">
          <div className="flex items-center gap-3 text-text-tertiary">
            <Logo size={16} />
            <span className="font-mono text-[10px] uppercase tracking-wider">
              v0.5.0 · {new Date().getFullYear()}
            </span>
          </div>
          <p className="m-0 font-body text-xs text-text-tertiary">
            Données{" "}
            <a
              href="https://anilist.co"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary underline-offset-2 hover:underline"
            >
              AniList
            </a>{" "}
            &amp;{" "}
            <a
              href="https://myanimelist.net"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary underline-offset-2 hover:underline"
            >
              MyAnimeList
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  label,
  links,
}: {
  label: string;
  links: Array<{ href: string; label: string }>;
}) {
  return (
    <nav aria-label={label}>
      <p className="m-0 mb-4 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-text-tertiary">
        {label}
      </p>
      <ul className="m-0 flex flex-col gap-2 p-0">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="font-body text-sm text-text-secondary transition-colors duration-200 hover:text-text-primary"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Logo } from "@miru/ui";

/**
 * Global footer rendered under every page. 4 columns of navigation
 * (Discover / Account / Help / Legal) + bottom bar with logo and data
 * attribution.
 *
 * Routes referenced here MUST exist — broken links erode trust. When a
 * route is removed, drop it from this list at the same time.
 */
export async function SiteFooter() {
  const t = await getTranslations("components.footer");
  const year = new Date().getFullYear();
  return (
    <footer className="mt-20 border-t border-border-subtle bg-bg-surface/40 px-6 pt-12 pb-8">
      <div className="mx-auto max-w-300">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          <FooterColumn
            label={t("discover")}
            links={[
              { href: "/", label: t("catalog") },
              { href: "/search", label: t("search") },
              { href: "/calendar", label: t("calendar") },
              { href: "/top", label: t("top") },
              { href: "/seasons/" + year, label: t("thisYear") },
            ]}
          />
          <FooterColumn
            label={t("account")}
            links={[
              { href: "/watchlist", label: t("watchlist") },
              { href: "/profile", label: t("profile") },
              { href: "/settings", label: t("settings") },
              { href: "/notifications", label: t("notifications") },
            ]}
          />
          <FooterColumn
            label={t("helpInfo")}
            links={[
              { href: "/about", label: t("about") },
              { href: "/help", label: t("help") },
              { href: "/changelog", label: t("changelog") },
              { href: "/shortcuts", label: t("shortcuts") },
              { href: "/status", label: t("status") },
            ]}
          />
          <FooterColumn
            label={t("legal")}
            links={[
              { href: "/terms", label: t("terms") },
              { href: "/pricing", label: t("pricing") },
            ]}
          />
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border-subtle pt-6">
          <div className="flex items-center gap-3 text-text-tertiary">
            <Logo size={16} />
            <span className="font-mono text-[10px] uppercase tracking-wider">
              v0.5.0 · {year}
            </span>
          </div>
          <p className="m-0 font-body text-xs text-text-tertiary">
            {t("dataFrom")}{" "}
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

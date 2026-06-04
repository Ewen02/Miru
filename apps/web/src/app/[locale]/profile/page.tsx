import { redirect } from "@/i18n/navigation";
import { getServerSession } from "@/lib/server-auth";

interface ProfileRedirectProps {
  params: Promise<{ locale: string }>;
}

/**
 * `/profile` is a redirect-only route. Historical callers (footer,
 * avatar menu, mobile bottom nav, post-login push) keep working without
 * changes: visiting /profile while signed-in lands you on your own
 * public page `/u/[handle]`. Signed-out visitors go to /login.
 *
 * Mirrors the GitHub pattern: there's no "private profile" surface —
 * /settings owns account preferences, and the public `/u/[handle]`
 * page is what "your profile" actually means.
 */
export default async function ProfileRedirect({ params }: ProfileRedirectProps) {
  const { locale } = await params;
  const session = await getServerSession();
  if (!session) {
    redirect({ href: "/login?next=/profile", locale });
    return null;
  }
  const handle = session.user.name.toLowerCase().replace(/\s+/g, "");
  redirect({ href: `/u/${handle}`, locale });
}

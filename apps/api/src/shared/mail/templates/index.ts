/**
 * Minimal inline-HTML templates. No MJML / React Email to keep the bundle
 * tiny. Style is hand-written to render the same in Gmail / Outlook / iOS.
 *
 * Tone matches Miru's editorial voice (FR, no emojis, no marketing fluff).
 */

const WRAPPER_OPEN = `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#08080c;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;color:#f3f3f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#08080c;">
    <tr>
      <td align="center" style="padding:40px 24px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:520px;background:#111118;border:1px solid #1e1e2a;border-radius:14px;">
          <tr>
            <td style="padding:32px 32px 24px;">
              <p style="margin:0 0 24px;font-family:'JetBrains Mono','SF Mono',monospace;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(243,243,245,0.32);">
                miru
              </p>`;

const WRAPPER_CLOSE = `            </td>
          </tr>
        </table>
        <p style="margin:24px 0 0;font-family:'JetBrains Mono','SF Mono',monospace;font-size:11px;color:rgba(243,243,245,0.22);">
          Miru — plateforme anime. Pas de pub, pas de tracker tiers.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;

function button(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;padding:12px 24px;background:#c8a2ff;color:#08080c;text-decoration:none;font-weight:600;font-size:15px;border-radius:8px;">${label}</a>`;
}

export function welcomeTemplate(props: { name: string; ctaUrl: string }): string {
  return `${WRAPPER_OPEN}
<h1 style="margin:0 0 16px;font-size:24px;font-weight:600;letter-spacing:-0.02em;">
  Bienvenue ${escapeHtml(props.name.split(" ")[0])}.
</h1>
<p style="margin:0 0 24px;font-size:15px;line-height:1.55;color:rgba(243,243,245,0.65);">
  Ton compte est créé. Pour démarrer, on a prévu un parcours en 3 étapes : importer ta liste AniList (optionnel), choisir 3 favoris, et sélectionner tes genres préférés.
</p>
${button(props.ctaUrl, "Lancer l'onboarding")}
<p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:rgba(243,243,245,0.32);">
  Si tu n'as pas créé ce compte, ignore simplement cet email — il expire sans action.
</p>
${WRAPPER_CLOSE}`;
}

export function verifyEmailTemplate(props: { verifyUrl: string }): string {
  return `${WRAPPER_OPEN}
<h1 style="margin:0 0 16px;font-size:24px;font-weight:600;letter-spacing:-0.02em;">
  Confirme ton adresse
</h1>
<p style="margin:0 0 24px;font-size:15px;line-height:1.55;color:rgba(243,243,245,0.65);">
  Un dernier clic pour activer ton compte Miru. Ce lien expire dans 24 heures.
</p>
${button(props.verifyUrl, "Confirmer mon e-mail")}
<p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:rgba(243,243,245,0.32);">
  Si le bouton ne fonctionne pas, copie-colle ce lien dans ton navigateur :<br/>
  <span style="word-break:break-all;color:rgba(243,243,245,0.45);">${escapeHtml(props.verifyUrl)}</span>
</p>
${WRAPPER_CLOSE}`;
}

export function passwordResetTemplate(props: { resetUrl: string }): string {
  return `${WRAPPER_OPEN}
<h1 style="margin:0 0 16px;font-size:24px;font-weight:600;letter-spacing:-0.02em;">
  Réinitialiser ton mot de passe
</h1>
<p style="margin:0 0 24px;font-size:15px;line-height:1.55;color:rgba(243,243,245,0.65);">
  On a reçu une demande de réinitialisation. Le lien ci-dessous expire dans 1 heure et n'est utilisable qu'une fois.
</p>
${button(props.resetUrl, "Choisir un nouveau mot de passe")}
<p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:rgba(243,243,245,0.32);">
  Si tu n'as pas fait cette demande, ignore cet email — ton mot de passe actuel reste valide.
</p>
${WRAPPER_CLOSE}`;
}

/**
 * S2-02 — "Un nouvel épisode d'<anime> est dispo". Sent only when the user
 * has `emailNewEpisodes` enabled and the cron's NotificationDedup says it's
 * the first time this (user, episode) pair is delivered.
 */
export function episodeAiredTemplate(props: {
  animeTitle: string;
  episodeNumber: number;
  episodeTitle: string | null;
  animeUrl: string;
  coverUrl: string | null;
}): string {
  const cover = props.coverUrl
    ? `<img src="${escapeHtml(props.coverUrl)}" alt="" width="80" height="120" style="border-radius:8px;display:block;border:1px solid #1e1e2a;" />`
    : "";
  const sub = props.episodeTitle
    ? `<p style="margin:0 0 4px;font-size:13px;color:rgba(243,243,245,0.55);">${escapeHtml(props.episodeTitle)}</p>`
    : "";
  return `${WRAPPER_OPEN}
<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 24px;">
  <tr>
    <td style="vertical-align:top;padding-right:16px;">${cover}</td>
    <td style="vertical-align:top;">
      <p style="margin:0 0 6px;font-family:'JetBrains Mono','SF Mono',monospace;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(243,243,245,0.32);">
        Nouvel épisode
      </p>
      <h1 style="margin:0 0 4px;font-size:20px;font-weight:600;letter-spacing:-0.015em;">
        ${escapeHtml(props.animeTitle)}
      </h1>
      ${sub}
      <p style="margin:0;font-size:13px;color:rgba(243,243,245,0.55);">Épisode ${props.episodeNumber}</p>
    </td>
  </tr>
</table>
${button(props.animeUrl, "Voir la fiche")}
<p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:rgba(243,243,245,0.32);">
  Tu reçois cet email parce que tu as activé les notifications par mail pour les nouveaux épisodes.
  <a href="${escapeHtml(buildSettingsUrl(props.animeUrl))}" style="color:rgba(243,243,245,0.45);text-decoration:underline;">Ajuster mes préférences</a>.
</p>
${WRAPPER_CLOSE}`;
}

/**
 * S2-03 — Sunday digest with this week's tally + a link to the personal
 * year-in-review. Compact: one stat line, one CTA, footer with the prefs
 * link. We resist showing top-anime covers — keeps the payload light and
 * avoids leaking which titles to people who shoulder-surf the inbox.
 */
export function weeklyRecapTemplate(props: {
  firstName: string;
  episodesWatched: number;
  animesCompleted: number;
  recapUrl: string;
}): string {
  const verb = props.animesCompleted > 1 ? "animes terminés" : "anime terminé";
  return `${WRAPPER_OPEN}
<h1 style="margin:0 0 16px;font-size:24px;font-weight:600;letter-spacing:-0.02em;">
  Ta semaine sur Miru, ${escapeHtml(props.firstName)}.
</h1>
<p style="margin:0 0 24px;font-size:15px;line-height:1.55;color:rgba(243,243,245,0.65);">
  ${props.episodesWatched} épisodes regardés, ${props.animesCompleted} ${verb}. Le détail complet est dans ton bilan.
</p>
${button(props.recapUrl, "Voir mon bilan")}
<p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:rgba(243,243,245,0.32);">
  Tu reçois cet email tous les dimanches. Tu peux le désactiver à tout moment depuis
  <a href="${escapeHtml(buildSettingsUrl(props.recapUrl))}" style="color:rgba(243,243,245,0.45);text-decoration:underline;">tes préférences</a>.
</p>
${WRAPPER_CLOSE}`;
}

/**
 * S2-04 — "<name> a répondu à ton avis sur <anime>". Sent when a comment
 * lands on a Review the user authored AND `emailReviewReply` is enabled.
 */
export function reviewReplyTemplate(props: {
  replierName: string;
  animeTitle: string;
  excerpt: string;
  reviewUrl: string;
}): string {
  return `${WRAPPER_OPEN}
<p style="margin:0 0 12px;font-family:'JetBrains Mono','SF Mono',monospace;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(243,243,245,0.32);">
  Nouvelle réponse
</p>
<h1 style="margin:0 0 16px;font-size:22px;font-weight:600;letter-spacing:-0.02em;">
  ${escapeHtml(props.replierName)} a répondu à ton avis sur ${escapeHtml(props.animeTitle)}.
</h1>
<blockquote style="margin:0 0 24px;padding:12px 16px;border-left:3px solid #c8a2ff;background:rgba(200,162,255,0.06);font-style:italic;font-size:14px;line-height:1.6;color:rgba(243,243,245,0.75);">
  ${escapeHtml(props.excerpt)}
</blockquote>
${button(props.reviewUrl, "Voir la conversation")}
<p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:rgba(243,243,245,0.32);">
  <a href="${escapeHtml(buildSettingsUrl(props.reviewUrl))}" style="color:rgba(243,243,245,0.45);text-decoration:underline;">Désactiver les emails de réponse</a>.
</p>
${WRAPPER_CLOSE}`;
}

/**
 * S2-08 — Day-3 nurture. Different headline than the welcome to avoid
 * "didn't you already say hi?" déjà-vu. Surfaces the "Pour toi" page
 * because by day 3 the user has typically added enough signal for the
 * recommender to be useful.
 */
export function dayThreeNurtureTemplate(props: {
  firstName: string;
  watchlistCount: number;
  forYouUrl: string;
}): string {
  const headline =
    props.watchlistCount > 0
      ? `${props.watchlistCount} anime sur ta watchlist. On peut t'en suggérer d'autres.`
      : "Trois jours plus tard, ta watchlist t'attend.";
  return `${WRAPPER_OPEN}
<h1 style="margin:0 0 16px;font-size:22px;font-weight:600;letter-spacing:-0.02em;">
  ${escapeHtml(headline)}
</h1>
<p style="margin:0 0 24px;font-size:15px;line-height:1.55;color:rgba(243,243,245,0.65);">
  Hello ${escapeHtml(props.firstName)} — on a généré des recommandations à partir de ce que tu as marqué.
  Aucune obligation : viens voir, ajoute ce qui te tente, c'est tout.
</p>
${button(props.forYouUrl, "Voir mes recommandations")}
<p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:rgba(243,243,245,0.32);">
  Si tu préfères ne plus recevoir ce genre d'email,
  <a href="${escapeHtml(buildSettingsUrl(props.forYouUrl))}" style="color:rgba(243,243,245,0.45);text-decoration:underline;">désactive-le ici</a>.
</p>
${WRAPPER_CLOSE}`;
}

/**
 * Best-effort settings deep-link. We don't always know the web origin from
 * the template caller, so we synthesise it from the action URL.
 */
function buildSettingsUrl(actionUrl: string): string {
  try {
    return new URL("/settings#notifications", actionUrl).toString();
  } catch {
    return "/settings#notifications";
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

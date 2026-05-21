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

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

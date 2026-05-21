"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { cn } from "@miru/ui";
import { authClient } from "@/lib/auth-client";

interface TwoFactorPanelProps {
  enabled: boolean;
}

type Step = "idle" | "password" | "scan" | "verify" | "backup";

/**
 * Inline 2FA management. Three flows from the same panel:
 * - Disabled → button "Activer" → password confirm → QR scan → 6-digit verify → backup codes shown
 * - Enabled  → button "Désactiver" → password confirm → done
 */
export function TwoFactorPanel({ enabled }: TwoFactorPanelProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("idle");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [qrUri, setQrUri] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const reset = () => {
    setStep("idle");
    setPassword("");
    setCode("");
    setQrUri(null);
    setBackupCodes([]);
    setError(null);
  };

  async function startEnable() {
    setError(null);
    setPending(true);
    try {
      // Better Auth: enableTwoFactor returns the TOTP URI and backup codes.
      // It requires the user's password as a re-auth challenge.
      const { data, error: err } = await authClient.twoFactor.enable({ password });
      if (err) {
        setError(err.message ?? "Mot de passe incorrect.");
        return;
      }
      if (!data) {
        setError("Réponse inattendue du serveur.");
        return;
      }
      setQrUri(data.totpURI);
      setBackupCodes(data.backupCodes);
      setStep("scan");
    } finally {
      setPending(false);
    }
  }

  async function verifyTotp() {
    setError(null);
    setPending(true);
    try {
      const { error: err } = await authClient.twoFactor.verifyTotp({ code });
      if (err) {
        setError(err.message ?? "Code invalide.");
        return;
      }
      setStep("backup");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  async function disable() {
    setError(null);
    setPending(true);
    try {
      const { error: err } = await authClient.twoFactor.disable({ password });
      if (err) {
        setError(err.message ?? "Mot de passe incorrect.");
        return;
      }
      reset();
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  if (enabled && step === "idle") {
    return (
      <article className="flex items-center justify-between rounded-2xl border border-border-subtle bg-bg-surface p-5">
        <div>
          <p className="m-0 font-display text-base font-semibold text-text-primary">
            2FA · Application d'authentification
          </p>
          <p className="m-0 mt-0.5 font-body text-xs text-text-tertiary">
            Activée — un code à 6 chiffres est demandé à chaque connexion.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setStep("password")}
          className="inline-flex h-9 items-center rounded-md border border-error/30 bg-error-muted px-4 font-body text-sm font-medium text-error transition-colors duration-200 hover:bg-error/20"
        >
          Désactiver
        </button>
      </article>
    );
  }

  if (!enabled && step === "idle") {
    return (
      <article className="flex items-center justify-between rounded-2xl border border-border-subtle bg-bg-surface p-5">
        <div>
          <p className="m-0 font-display text-base font-semibold text-text-primary">
            2FA · Application d'authentification
          </p>
          <p className="m-0 mt-0.5 font-body text-xs text-text-tertiary">
            Ajoute une seconde étape avec Google Authenticator, 1Password, Authy…
          </p>
        </div>
        <button
          type="button"
          onClick={() => setStep("password")}
          className="inline-flex h-9 items-center rounded-md px-4 font-body text-sm font-semibold"
          style={{ backgroundColor: "var(--color-accent)", color: "#08080c" }}
        >
          Activer
        </button>
      </article>
    );
  }

  return (
    <article className="rounded-2xl border border-border-subtle bg-bg-surface p-6">
      {step === "password" && (
        <PasswordStep
          enabled={enabled}
          password={password}
          setPassword={setPassword}
          onConfirm={enabled ? disable : startEnable}
          onCancel={reset}
          pending={pending}
          error={error}
        />
      )}

      {step === "scan" && qrUri && (
        <ScanStep
          qrUri={qrUri}
          code={code}
          setCode={setCode}
          onConfirm={verifyTotp}
          onCancel={reset}
          pending={pending}
          error={error}
        />
      )}

      {step === "backup" && (
        <BackupStep backupCodes={backupCodes} onDone={reset} />
      )}
    </article>
  );
}

function PasswordStep({
  enabled,
  password,
  setPassword,
  onConfirm,
  onCancel,
  pending,
  error,
}: {
  enabled: boolean;
  password: string;
  setPassword: (v: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  pending: boolean;
  error: string | null;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onConfirm();
      }}
    >
      <p className="m-0 mb-1 font-display text-base font-semibold text-text-primary">
        {enabled ? "Désactiver la 2FA" : "Activer la 2FA"}
      </p>
      <p className="m-0 mb-5 font-body text-xs text-text-tertiary">
        Confirme ton mot de passe pour continuer.
      </p>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoFocus
        autoComplete="current-password"
        required
        className={cn(
          "mb-4 h-10 w-full rounded-md border border-border bg-bg-base px-3 font-body text-sm text-text-primary",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
        )}
      />
      {error && (
        <p className="m-0 mb-3 font-body text-xs text-error" role="alert">
          {error}
        </p>
      )}
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="font-mono text-xs uppercase tracking-wider text-text-tertiary hover:text-text-secondary"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={pending || password.length === 0}
          className="inline-flex h-9 items-center rounded-md px-4 font-body text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
          style={{ backgroundColor: "var(--color-accent)", color: "#08080c" }}
        >
          {pending ? "…" : "Continuer"}
        </button>
      </div>
    </form>
  );
}

function ScanStep({
  qrUri,
  code,
  setCode,
  onConfirm,
  onCancel,
  pending,
  error,
}: {
  qrUri: string;
  code: string;
  setCode: (v: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  pending: boolean;
  error: string | null;
}) {
  // Build a QR image via the Google Charts proxy — keeps the bundle dep-free.
  const qrImage = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUri)}`;
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onConfirm();
      }}
    >
      <p className="m-0 mb-1 font-display text-base font-semibold text-text-primary">
        Scanne le QR code
      </p>
      <p className="m-0 mb-5 font-body text-xs text-text-tertiary">
        Avec ton application d'authentification (Google Authenticator, 1Password, Authy, etc.), puis saisis le code à 6 chiffres affiché.
      </p>
      <div className="mb-5 flex justify-center">
        <Image src={qrImage} alt="QR code 2FA" width={200} height={200} unoptimized />
      </div>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={6}
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
        placeholder="123 456"
        autoFocus
        className="mb-4 h-12 w-full rounded-md border border-border bg-bg-base px-3 text-center font-mono text-2xl tracking-widest text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
      />
      {error && (
        <p className="m-0 mb-3 font-body text-xs text-error" role="alert">
          {error}
        </p>
      )}
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="font-mono text-xs uppercase tracking-wider text-text-tertiary hover:text-text-secondary"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={pending || code.length !== 6}
          className="inline-flex h-9 items-center rounded-md px-4 font-body text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
          style={{ backgroundColor: "var(--color-accent)", color: "#08080c" }}
        >
          {pending ? "Vérification…" : "Valider"}
        </button>
      </div>
    </form>
  );
}

function BackupStep({ backupCodes, onDone }: { backupCodes: string[]; onDone: () => void }) {
  const copy = () => {
    navigator.clipboard.writeText(backupCodes.join("\n")).catch(() => {});
  };
  return (
    <div>
      <p className="m-0 mb-1 font-display text-base font-semibold text-text-primary">
        2FA activée ✓
      </p>
      <p className="m-0 mb-5 font-body text-xs text-text-tertiary">
        Sauvegarde ces codes de récupération dans un endroit sûr. Ils te permettent de te connecter si tu perds ton téléphone. <span className="text-text-secondary">Ils ne seront plus jamais affichés.</span>
      </p>
      <div className="mb-5 grid grid-cols-2 gap-2 rounded-md border border-border bg-bg-base p-4 font-mono text-sm">
        {backupCodes.map((c) => (
          <span key={c} className="text-text-primary">
            {c}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={copy}
          className="inline-flex h-9 items-center rounded-md border border-border bg-bg-surface px-3 font-body text-sm text-text-secondary hover:text-text-primary"
        >
          Copier
        </button>
        <button
          type="button"
          onClick={onDone}
          className="inline-flex h-9 items-center rounded-md px-4 font-body text-sm font-semibold"
          style={{ backgroundColor: "var(--color-accent)", color: "#08080c" }}
        >
          J'ai sauvegardé
        </button>
      </div>
    </div>
  );
}

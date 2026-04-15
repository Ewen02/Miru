"use client";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ reset }: GlobalErrorProps) {
  return (
    <html lang="fr">
      <body
        style={{
          background: "#08080c",
          color: "rgba(255,255,255,0.95)",
          fontFamily: "system-ui, sans-serif",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 480 }}>
          <p
            style={{
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: "rgba(255,255,255,0.32)",
            }}
          >
            Erreur fatale
          </p>
          <h1 style={{ fontSize: 28, fontWeight: 600, margin: "8px 0 12px" }}>
            L&apos;application a planté
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", marginBottom: 16 }}>
            Recharge la page pour réessayer.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              padding: "8px 16px",
              borderRadius: 10,
              border: "1px solid rgba(200,162,255,0.4)",
              background: "rgba(200,162,255,0.12)",
              color: "inherit",
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            Réessayer
          </button>
        </div>
      </body>
    </html>
  );
}

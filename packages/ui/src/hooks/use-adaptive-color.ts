"use client";

import { useEffect, useState } from "react";

/**
 * Extrait la couleur dominante d'une image (cover art anime).
 * Utilisé pour le adaptive theming — chaque fiche anime teinte l'interface.
 *
 * @param imageUrl - URL du cover art
 * @param fallback - Couleur fallback si extraction échoue
 * @returns { color, muted, subtle, isLoading }
 */
export function useAdaptiveColor(imageUrl: string | null, fallback = "#c8a2ff") {
  const [color, setColor] = useState(fallback);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!imageUrl) {
      setIsLoading(false);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = 10;
        canvas.height = 10;
        ctx.drawImage(img, 0, 0, 10, 10);

        const data = ctx.getImageData(0, 0, 10, 10).data;
        let r = 0, g = 0, b = 0, count = 0;

        for (let i = 0; i < data.length; i += 4) {
          // Ignorer les pixels trop sombres ou trop clairs
          const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
          if (brightness > 30 && brightness < 220) {
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
            count++;
          }
        }

        if (count > 0) {
          r = Math.round(r / count);
          g = Math.round(g / count);
          b = Math.round(b / count);
          setColor(`rgb(${r}, ${g}, ${b})`);
        }
      } catch {
        // CORS or canvas error — use fallback
      } finally {
        setIsLoading(false);
      }
    };

    img.onerror = () => setIsLoading(false);
  }, [imageUrl, fallback]);

  return {
    color,
    muted: color.replace("rgb", "rgba").replace(")", ", 0.12)"),
    subtle: color.replace("rgb", "rgba").replace(")", ", 0.06)"),
    gradient: `linear-gradient(135deg, ${color} 0%, transparent 60%)`,
    isLoading,
  };
}

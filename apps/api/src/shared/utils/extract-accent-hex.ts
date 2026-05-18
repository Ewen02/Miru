import sharp from "sharp";

const FETCH_TIMEOUT_MS = 5000;
const SAMPLE_SIZE = 32;
const MIN_BRIGHTNESS = 30;
const MAX_BRIGHTNESS = 220;
const MIN_SATURATION = 0.25;

/**
 * Extrait la couleur d'accent d'une image distante et la retourne en hex #RRGGBB.
 * Utilisé au sync AniList pour pre-calculer l'accent de chaque anime (SSR zero-flash).
 *
 * Algo : resize 32×32 → scan pixel-à-pixel → filtre brightness (30-220) et
 * saturation (≥0.25) → moyenne des pixels retenus. Ignorer `sharp.stats().dominant`
 * qui renvoie la teinte la plus fréquente (souvent le fond noir des covers AniList).
 */
export async function extractAccentHex(imageUrl: string | null): Promise<string | null> {
  if (!imageUrl) return null;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const res = await fetch(imageUrl, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return null;

    const buf = Buffer.from(await res.arrayBuffer());
    const { data, info } = await sharp(buf)
      .resize(SAMPLE_SIZE, SAMPLE_SIZE, { fit: "cover" })
      .raw()
      .toBuffer({ resolveWithObject: true });

    let sumR = 0;
    let sumG = 0;
    let sumB = 0;
    let count = 0;
    for (let i = 0; i < data.length; i += info.channels) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const brightness = (r + g + b) / 3;
      if (brightness < MIN_BRIGHTNESS || brightness > MAX_BRIGHTNESS) continue;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const sat = max === 0 ? 0 : (max - min) / max;
      if (sat < MIN_SATURATION) continue;
      sumR += r;
      sumG += g;
      sumB += b;
      count++;
    }
    if (count === 0) return null;

    const r = Math.round(sumR / count);
    const g = Math.round(sumG / count);
    const b = Math.round(sumB / count);
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  } catch (err) {
    console.warn(`[extractAccentHex] ${imageUrl}: ${(err as Error).message}`);
    return null;
  }
}

function toHex(n: number): string {
  return n.toString(16).padStart(2, "0");
}

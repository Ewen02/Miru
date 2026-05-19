import type { Metadata } from "next";
import { fetchAnimeCatalog, fetchGenres } from "@/lib/api";
import { OnboardFlow } from "./onboard-flow";

export const metadata: Metadata = {
  title: "Bienvenue",
  description: "Calibre Miru en 3 étapes.",
};

const STARTER_COUNT = 12;

export default async function OnboardPage() {
  // Fetch the data the client flow needs upfront — keeps it a pure
  // state-machine component without API concerns.
  const [starters, genres] = await Promise.all([
    fetchAnimeCatalog({ pageSize: STARTER_COUNT }).catch(() => null),
    fetchGenres().catch(() => []),
  ]);

  return (
    <OnboardFlow
      starters={
        starters?.data.map((a) => ({
          id: a.id,
          slug: a.slug,
          title: a.title,
          coverUrl: a.coverUrl,
        })) ?? []
      }
      genres={genres.map((g) => ({ slug: g.slug, name: g.name }))}
    />
  );
}

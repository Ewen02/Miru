import { prisma } from "../src";
import { seedGenres } from "./seed/genres";
import { seedPlatforms } from "./seed/platforms";

/**
 * Idempotent seed for static data. Designed to be runnable on every deploy:
 *  - Achievements: badge catalog (only this was seeded before).
 *  - Genres: AniList genre list (so NSFW filtering + browse pages work
 *    even before the first import).
 *  - Platforms: streaming platforms shown on anime cards.
 *
 * The anime catalog itself stays out — it's populated by the sync crons
 * (or `pnpm sync:trending` for a fresh DB).
 *
 * All upserts key on natural keys (code/slug). Safe to re-run.
 */

const ACHIEVEMENTS: Array<{
  code: string;
  name: string;
  description: string;
  icon: string | null;
  threshold: number | null;
}> = [
  {
    code: "first_watchlist",
    name: "Premier pas",
    description: "Ajoute ton premier anime à la watchlist.",
    icon: "✦",
    threshold: 1,
  },
  {
    code: "first_review",
    name: "Critique",
    description: "Publie ton premier avis.",
    icon: "✎",
    threshold: 1,
  },
  {
    code: "completed_10",
    name: "Régulier",
    description: "Termine 10 anime.",
    icon: "★",
    threshold: 10,
  },
  {
    code: "completed_100",
    name: "Vétéran",
    description: "Termine 100 anime.",
    icon: "✷",
    threshold: 100,
  },
  {
    code: "first_list",
    name: "Curateur",
    description: "Crée ta première liste.",
    icon: "❏",
    threshold: 1,
  },
  {
    code: "first_follow",
    name: "Sociable",
    description: "Suis un autre membre.",
    icon: "⚇",
    threshold: 1,
  },
];

async function seedAchievements(): Promise<number> {
  for (const a of ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { code: a.code },
      create: a,
      update: { name: a.name, description: a.description, icon: a.icon, threshold: a.threshold },
    });
  }
  return ACHIEVEMENTS.length;
}

async function main() {
  const [achievements, genres, platforms] = await Promise.all([
    seedAchievements(),
    seedGenres(prisma),
    seedPlatforms(prisma),
  ]);
  console.log(
    `Seeded: ${achievements} achievements, ${genres} genres, ${platforms} platforms.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });

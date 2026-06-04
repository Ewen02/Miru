import { prisma } from "../src";

/**
 * Seeds the static achievement catalog. Idempotent — re-running upserts by
 * `code`, so it's safe to run on every deploy. Unlocking is handled at
 * runtime by the application; this only defines the badges that exist.
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

async function main() {
  for (const a of ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { code: a.code },
      create: a,
      update: { name: a.name, description: a.description, icon: a.icon, threshold: a.threshold },
    });
  }
  console.log(`Seeded ${ACHIEVEMENTS.length} achievements.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });

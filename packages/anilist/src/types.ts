import { z } from "zod";

/**
 * Schema runtime minimal — sécurise uniquement les champs critiques
 * qu'on ne peut pas recalculer si absents (id, idMal, nested IDs).
 * Le reste est parsé en best-effort côté adapter.
 */
export const AniListAnimeSchema = z.object({
  id: z.number().int().positive(),
  idMal: z.number().int().positive().nullable(),
  title: z.object({
    romaji: z.string().nullable(),
    english: z.string().nullable(),
    native: z.string().nullable(),
  }),
  description: z.string().nullable().optional(),
  coverImage: z.object({
    large: z.string().nullable().optional(),
    extraLarge: z.string().nullable().optional(),
    color: z.string().nullable().optional(),
  }),
  bannerImage: z.string().nullable().optional(),
  format: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  season: z.string().nullable().optional(),
  seasonYear: z.number().int().nullable().optional(),
  episodes: z.number().int().nullable().optional(),
  duration: z.number().int().nullable().optional(),
  genres: z.array(z.string()).default([]),
  isAdult: z.boolean().nullable().optional(),
  averageScore: z.number().nullable().optional(),
  studios: z
    .object({ nodes: z.array(z.object({ name: z.string() })).default([]) })
    .default({ nodes: [] }),
  characters: z
    .object({
      edges: z
        .array(
          z.object({
            role: z.enum(["MAIN", "SUPPORTING", "BACKGROUND"]),
            node: z.object({
              id: z.number().int(),
              name: z.object({
                full: z.string(),
                native: z.string().nullable().optional(),
              }),
              image: z.object({ large: z.string().nullable().optional() }),
            }),
            voiceActors: z
              .array(
                z.object({
                  id: z.number().int(),
                  name: z.object({ full: z.string() }),
                }),
              )
              .default([]),
          }),
        )
        .default([]),
    })
    .default({ edges: [] }),
  streamingEpisodes: z
    .array(
      z.object({
        title: z.string().nullable().optional(),
        thumbnail: z.string().nullable().optional(),
        url: z.string().nullable().optional(),
        site: z.string().nullable().optional(),
      }),
    )
    .nullable()
    .default([]),
  externalLinks: z
    .array(
      z.object({
        site: z.string(),
        url: z.string(),
        type: z.string().nullable().optional(),
        icon: z.string().nullable().optional(),
        color: z.string().nullable().optional(),
      }),
    )
    .nullable()
    .default([]),
  relations: z
    .object({
      edges: z
        .array(
          z.object({
            relationType: z.string(),
            node: z.object({
              id: z.number().int(),
              title: z.object({
                romaji: z.string().nullable().optional(),
                english: z.string().nullable().optional(),
                native: z.string().nullable().optional(),
              }),
              format: z.string().nullable().optional(),
              seasonYear: z.number().int().nullable().optional(),
              coverImage: z
                .object({
                  large: z.string().nullable().optional(),
                  extraLarge: z.string().nullable().optional(),
                })
                .optional(),
            }),
          }),
        )
        .default([]),
    })
    .default({ edges: [] }),
});

export type AniListAnime = z.infer<typeof AniListAnimeSchema>;
export type AniListCharacterEdge = AniListAnime["characters"]["edges"][number];

import { z } from "zod";

export const JikanEpisodeSchema = z.object({
  mal_id: z.number().int().positive(),
  title: z.string().nullable().optional(),
  title_japanese: z.string().nullable().optional(),
  title_romanji: z.string().nullable().optional(),
  duration: z.number().int().nullable().optional(),
  aired: z.string().nullable().optional(),
  filler: z.boolean().optional(),
  recap: z.boolean().optional(),
});

export const JikanEpisodesResponseSchema = z.object({
  data: z.array(JikanEpisodeSchema.or(z.unknown())),
  pagination: z
    .object({
      last_visible_page: z.number().int().optional(),
      has_next_page: z.boolean().optional(),
      current_page: z.number().int().optional(),
    })
    .optional(),
});

export type JikanEpisode = z.infer<typeof JikanEpisodeSchema>;
export type JikanEpisodesResponse = z.infer<typeof JikanEpisodesResponseSchema>;

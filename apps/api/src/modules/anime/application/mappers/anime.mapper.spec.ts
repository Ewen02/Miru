import { CharacterRole } from "@miru/types";
import { makeAnimeEntity } from "../../domain/entities/__fixtures__/anime.fixture";
import { AnimeMapper } from "./anime.mapper";

describe("AnimeMapper", () => {
  describe("toCard", () => {
    it("exposes the catalog fields and drops detail-only props", () => {
      const entity = makeAnimeEntity({ title: "My Anime" });

      const card = AnimeMapper.toCard(entity);

      expect(card.title).toBe("My Anime");
      expect(card).not.toHaveProperty("synopsis");
      expect(card).not.toHaveProperty("episodes");
    });
  });

  describe("toCharacterCards", () => {
    it("filters out characters without a persisted id", () => {
      const entity = makeAnimeEntity({
        characters: [
          {
            id: "char-1",
            externalAnilistId: 1,
            name: "Persisted",
            nameJp: null,
            imageUrl: null,
            role: CharacterRole.MAIN,
            voiceActorId: null,
            voiceActorAnilistId: null,
            voiceActorName: null,
            order: 0,
          },
          {
            id: null,
            externalAnilistId: 2,
            name: "Not yet persisted",
            nameJp: null,
            imageUrl: null,
            role: CharacterRole.SUPPORTING,
            voiceActorId: null,
            voiceActorAnilistId: null,
            voiceActorName: null,
            order: 1,
          },
        ],
      });

      const cards = AnimeMapper.toCharacterCards(entity.characters);

      expect(cards).toHaveLength(1);
      expect(cards[0].name).toBe("Persisted");
    });
  });

  describe("toDetail", () => {
    it("resolves relation slugs when present and null otherwise", () => {
      const entity = makeAnimeEntity({
        relations: [
          {
            relatedExternalAnilistId: 42,
            relationType: "SEQUEL",
            title: "Sequel",
            coverUrl: null,
            format: "TV",
            year: 2026,
          },
          {
            relatedExternalAnilistId: 99,
            relationType: "PREQUEL",
            title: "Unknown prequel",
            coverUrl: null,
            format: null,
            year: null,
          },
        ],
      });
      const slugs = new Map([[42, "sequel-slug"]]);

      const detail = AnimeMapper.toDetail(entity, slugs);

      expect(detail.relations).toEqual([
        {
          relationType: "SEQUEL",
          title: "Sequel",
          coverUrl: null,
          format: "TV",
          year: 2026,
          slug: "sequel-slug",
        },
        {
          relationType: "PREQUEL",
          title: "Unknown prequel",
          coverUrl: null,
          format: null,
          year: null,
          slug: null,
        },
      ]);
    });

    it("defaults to an empty slug map when none provided", () => {
      const entity = makeAnimeEntity({
        relations: [
          {
            relatedExternalAnilistId: 42,
            relationType: "SEQUEL",
            title: "Sequel",
            coverUrl: null,
            format: null,
            year: null,
          },
        ],
      });

      const detail = AnimeMapper.toDetail(entity);

      expect(detail.relations[0].slug).toBeNull();
    });
  });
});

import { InvalidRatingException } from "../exceptions/anime.exceptions";
import { makeAnimeEntity } from "./__fixtures__/anime.fixture";

describe("AnimeEntity", () => {
  describe("updateRating", () => {
    it("accepts ratings in the 0-10 range", () => {
      const anime = makeAnimeEntity();

      anime.updateRating(7.2);
      expect(anime.averageRating).toBe(7.2);

      anime.updateRating(0);
      expect(anime.averageRating).toBe(0);

      anime.updateRating(10);
      expect(anime.averageRating).toBe(10);
    });

    it("rejects ratings outside the 0-10 range", () => {
      const anime = makeAnimeEntity();

      expect(() => anime.updateRating(-1)).toThrow(InvalidRatingException);
      expect(() => anime.updateRating(11)).toThrow(InvalidRatingException);
      expect(anime.averageRating).toBe(8.5);
    });
  });

  describe("getter immutability", () => {
    it("returns a defensive copy of relations so callers cannot mutate the entity", () => {
      const anime = makeAnimeEntity({
        relations: [
          {
            relatedExternalAnilistId: 1,
            relationType: "SEQUEL",
            title: "Sequel",
            coverUrl: null,
            format: null,
            year: null,
          },
        ],
      });

      const relations = anime.relations;
      relations.pop();

      expect(anime.relations).toHaveLength(1);
    });
  });
});

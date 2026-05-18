import { Inject, Injectable } from "@nestjs/common";
import { UseCase } from "@shared/domain/use-case.base";
import {
  AnimeAccentPreview,
  AnimeRepositoryPort,
} from "../../domain/ports/anime-repository.port";
import { AnimeNotFoundException } from "../../domain/exceptions/anime.exceptions";
import { ANIME_REPOSITORY } from "../tokens";

/**
 * Lookup accent + titre rapide pour permettre un <Suspense> interne sur la fiche :
 * la page web charge ce use-case d'abord (≤10ms DB), rend immédiatement le div accent
 * et le skeleton, puis suspend le fetch complet.
 */
@Injectable()
export class GetAnimeAccentUseCase implements UseCase<string, AnimeAccentPreview> {
  constructor(
    @Inject(ANIME_REPOSITORY)
    private readonly animeRepository: AnimeRepositoryPort,
  ) {}

  async execute(slug: string): Promise<AnimeAccentPreview> {
    const preview = await this.animeRepository.findAccentPreviewBySlug(slug);
    if (!preview) throw new AnimeNotFoundException(slug);
    return preview;
  }
}

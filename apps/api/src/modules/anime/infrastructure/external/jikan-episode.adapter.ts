import { Injectable, Inject } from "@nestjs/common";
import { JikanClient } from "@miru/jikan";
import type { JikanEpisode } from "@miru/jikan";
import { EpisodeInput, EpisodeSyncPort } from "../../domain/ports/episode-sync.port";
import { JIKAN_CLIENT } from "../../application/tokens";

@Injectable()
export class JikanEpisodeAdapter implements EpisodeSyncPort {
  constructor(@Inject(JIKAN_CLIENT) private readonly client: JikanClient) {}

  async fetchEpisodes(malId: number): Promise<EpisodeInput[]> {
    const raw = await this.client.fetchEpisodes(malId);
    return raw.map((ep, index) => this.toInput(ep, index));
  }

  private toInput(ep: JikanEpisode, index: number): EpisodeInput {
    return {
      number: ep.mal_id ?? index + 1,
      title: ep.title ?? null,
      titleJp: ep.title_japanese ?? null,
      titleRomaji: ep.title_romanji ?? null,
      duration: ep.duration != null ? Math.round(ep.duration / 60) : null,
      airedAt: ep.aired ? this.parseDate(ep.aired) : null,
      filler: ep.filler ?? false,
      recap: ep.recap ?? false,
      thumbnail: null,
      url: null,
    };
  }

  private parseDate(value: string): Date | null {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
}

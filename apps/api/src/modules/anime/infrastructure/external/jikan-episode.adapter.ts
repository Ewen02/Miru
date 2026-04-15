import { Injectable } from "@nestjs/common";
import { JikanClient } from "@miru/jikan";
import type { JikanEpisode } from "@miru/jikan";
import { EpisodeInput, EpisodeSyncPort } from "../../domain/ports/episode-sync.port";

@Injectable()
export class JikanEpisodeAdapter implements EpisodeSyncPort {
  private readonly client = new JikanClient();

  async fetchEpisodes(malId: number): Promise<EpisodeInput[]> {
    const raw = await this.client.fetchEpisodes(malId);
    return raw.map((ep, index) => this.toInput(ep, index));
  }

  private toInput(ep: JikanEpisode, index: number): EpisodeInput {
    return {
      number: ep.mal_id ?? index + 1,
      title: ep.title,
      titleJp: ep.title_japanese,
      titleRomaji: ep.title_romanji,
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

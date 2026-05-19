import { CharacterEntity } from "../entities/character.entity";

export interface CharacterAppearance {
  animeId: string;
  animeSlug: string;
  animeTitle: string;
  animeYear: number | null;
  animeCoverUrl: string | null;
  animeEpisodeCount: number | null;
  role: string;
}

export interface CharacterVoiceCredit {
  voiceActorId: string;
  voiceActorName: string;
  /** Number of times this VA voiced the character across episodes/seasons. */
  appearances: number;
}

export interface CharacterRepositoryPort {
  findById(id: string): Promise<CharacterEntity | null>;
  appearancesByCharacterId(characterId: string): Promise<CharacterAppearance[]>;
  voiceCreditsByCharacterId(characterId: string): Promise<CharacterVoiceCredit[]>;
}

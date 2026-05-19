import { VoiceActorEntity } from "../entities/voice-actor.entity";

export interface VoiceActorRole {
  characterId: string;
  characterName: string;
  characterImageUrl: string | null;
  animeId: string;
  animeSlug: string;
  animeTitle: string;
  animeCoverUrl: string | null;
  animeYear: number | null;
  role: string;
}

export interface VoiceActorStats {
  /** Distinct anime count. */
  animeCount: number;
  /** Distinct character count. */
  roleCount: number;
}

export interface VoiceActorRepositoryPort {
  findById(id: string): Promise<VoiceActorEntity | null>;
  rolesByVoiceActorId(voiceActorId: string): Promise<VoiceActorRole[]>;
  statsByVoiceActorId(voiceActorId: string): Promise<VoiceActorStats>;
}

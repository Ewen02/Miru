import { PlatformEntity } from "../entities/platform.entity";

export interface PlatformUpsertInput {
  name: string;
  slug: string;
  iconUrl: string | null;
  color: string | null;
  baseUrl: string;
}

export interface PlatformRepositoryPort {
  findAll(): Promise<PlatformEntity[]>;
  /**
   * Upsert idempotent par slug. Le slug est dérivé du `site` AniList (slugifié)
   * et reste stable même quand AniList renvoie plusieurs URLs/casing pour le
   * même service.
   */
  upsertBySlug(input: PlatformUpsertInput): Promise<PlatformEntity>;
}

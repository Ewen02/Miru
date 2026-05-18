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
   * Upsert idempotent par baseUrl. La baseUrl est la clé naturelle car AniList ne
   * fournit que l'URL et le `site` libre — le slug est dérivé localement.
   */
  upsertByBaseUrl(input: PlatformUpsertInput): Promise<PlatformEntity>;
}

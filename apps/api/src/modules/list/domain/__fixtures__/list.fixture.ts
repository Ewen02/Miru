import { ListEntity } from "../entities/list.entity";

export function makeListEntity(
  overrides: Partial<{
    id: string;
    userId: string;
    title: string;
    description: string | null;
    slug: string;
    isPublic: boolean;
  }> = {},
): ListEntity {
  return ListEntity.create(overrides.id ?? "list-1", {
    userId: overrides.userId ?? "u1",
    title: overrides.title ?? "Ma liste",
    description: overrides.description ?? null,
    slug: overrides.slug ?? "ma-liste",
    isPublic: overrides.isPublic ?? true,
    coverArtSeed: null,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z"),
  });
}

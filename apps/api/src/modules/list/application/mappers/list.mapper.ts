import type { ListDetailDto, ListSummaryDto } from "@miru/types";
import {
  ListSummary,
  ListWithItems,
} from "../../domain/ports/list-repository.port";

export class ListMapper {
  static toSummaryDto(summary: ListSummary): ListSummaryDto {
    return {
      id: summary.id,
      userId: summary.userId,
      ownerName: summary.ownerName,
      title: summary.title,
      description: summary.description,
      slug: summary.slug,
      isPublic: summary.isPublic,
      coverArtSeed: summary.coverArtSeed,
      previewCovers: summary.previewCovers,
      itemCount: summary.itemCount,
      likeCount: summary.likeCount,
      updatedAt: summary.updatedAt.toISOString(),
    };
  }

  static toDetailDto(
    detail: ListWithItems,
    likedByViewer: boolean,
    ownedByViewer: boolean,
  ): ListDetailDto {
    const snap = detail.list;
    return {
      id: snap.id,
      userId: snap.userId,
      ownerName: detail.ownerName,
      title: snap.title,
      description: snap.description,
      slug: snap.slug,
      isPublic: snap.isPublic,
      coverArtSeed: snap.coverArtSeed,
      itemCount: detail.itemCount,
      likeCount: detail.likeCount,
      updatedAt: snap.updatedAt.toISOString(),
      likedByViewer,
      ownedByViewer,
      items: detail.items.map((it) => ({
        animeId: it.animeId,
        animeSlug: it.animeSlug,
        animeTitle: it.animeTitle,
        animeYear: it.animeYear,
        animeCoverUrl: it.animeCoverUrl,
        animeAverageRating: it.animeAverageRating,
        order: it.order,
        note: it.note,
        addedAt: it.addedAt.toISOString(),
      })),
    };
  }
}

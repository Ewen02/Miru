import type { ActivityEventDto } from "@miru/types";
import { ActivityEventView } from "../../domain/ports/activity-repository.port";

export class ActivityMapper {
  static toDto(view: ActivityEventView): ActivityEventDto {
    return {
      id: view.id,
      userId: view.userId,
      actorName: view.actorName,
      kind: view.kind,
      createdAt: view.createdAt.toISOString(),
      anime: view.anime,
      list: view.list,
      achievement: view.achievement,
      meta: view.meta,
    };
  }
}

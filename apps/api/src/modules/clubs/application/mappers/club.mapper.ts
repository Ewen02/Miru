import type { ClubDetailDto, ClubPostDto, ClubSummaryDto } from "@miru/types";
import {
  ClubDetailView,
  ClubPostView,
  ClubSummaryView,
} from "../../domain/ports/club-repository.port";

export class ClubMapper {
  static toSummaryDto(view: ClubSummaryView): ClubSummaryDto {
    return {
      id: view.id,
      name: view.name,
      slug: view.slug,
      description: view.description,
      memberCount: view.memberCount,
      isMember: view.isMember,
    };
  }

  static toPostDto(view: ClubPostView): ClubPostDto {
    return {
      id: view.id,
      body: view.body,
      createdAt: view.createdAt.toISOString(),
      author: {
        id: view.author.id,
        name: view.author.name,
        image: view.author.image,
      },
    };
  }

  static toDetailDto(view: ClubDetailView): ClubDetailDto {
    return {
      id: view.id,
      name: view.name,
      slug: view.slug,
      description: view.description,
      memberCount: view.memberCount,
      isMember: view.isMember,
      ownerName: view.ownerName,
      posts: view.posts.map((post) => ClubMapper.toPostDto(post)),
    };
  }
}

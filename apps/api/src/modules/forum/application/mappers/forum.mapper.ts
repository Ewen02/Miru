import type {
  ForumCategory,
  ForumPostDto,
  ForumThreadDetailDto,
  ForumThreadSummaryDto,
} from "@miru/types";
import {
  ForumPostView,
  ForumThreadDetailView,
  ForumThreadSummaryView,
} from "../../domain/ports/forum-repository.port";

export class ForumMapper {
  static toSummaryDto(view: ForumThreadSummaryView): ForumThreadSummaryDto {
    return {
      id: view.id,
      title: view.title,
      category: view.category as ForumCategory,
      authorName: view.authorName,
      postCount: view.postCount,
      updatedAt: view.updatedAt.toISOString(),
    };
  }

  static toPostDto(view: ForumPostView): ForumPostDto {
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

  static toDetailDto(view: ForumThreadDetailView): ForumThreadDetailDto {
    return {
      id: view.id,
      title: view.title,
      category: view.category as ForumCategory,
      authorName: view.authorName,
      createdAt: view.createdAt.toISOString(),
      posts: view.posts.map((post) => ForumMapper.toPostDto(post)),
    };
  }
}

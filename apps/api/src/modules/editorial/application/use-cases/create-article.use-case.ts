import { Inject, Injectable } from "@nestjs/common";
import { ValidationException } from "@shared/domain/domain-exception";
import { UseCase } from "@shared/domain/use-case.base";
import { slugify } from "@shared/utils/slugify";
import { ArticleRepositoryPort } from "../../domain/ports/article-repository.port";
import { ARTICLE_REPOSITORY } from "../tokens";

const MAX_SLUG_TRIES = 10;

interface Input {
  authorId: string;
  title: string;
  kicker?: string | null;
  excerpt?: string | null;
  body: string;
  coverUrl?: string | null;
  publish?: boolean;
}

interface Output {
  slug: string;
}

@Injectable()
export class CreateArticleUseCase implements UseCase<Input, Output> {
  constructor(@Inject(ARTICLE_REPOSITORY) private readonly articleRepo: ArticleRepositoryPort) {}

  async execute({
    authorId,
    title,
    kicker,
    excerpt,
    body,
    coverUrl,
    publish,
  }: Input): Promise<Output> {
    const trimmedTitle = title.trim();
    if (trimmedTitle.length < 2 || trimmedTitle.length > 200) {
      throw new ValidationException("Le titre doit contenir entre 2 et 200 caractères.");
    }

    const trimmedBody = body.trim();
    if (trimmedBody.length < 1) {
      throw new ValidationException("Le corps de l'article ne peut pas être vide.");
    }

    const baseSlug = slugify(trimmedTitle);
    if (!baseSlug) {
      throw new ValidationException("Le titre produit un slug vide.");
    }

    const slug = await this.resolveUniqueSlug(baseSlug);

    const createdSlug = await this.articleRepo.create({
      slug,
      title: trimmedTitle,
      kicker: kicker ?? null,
      excerpt: excerpt ?? null,
      body: trimmedBody,
      coverUrl: coverUrl ?? null,
      authorId,
      publish: publish ?? false,
    });

    return { slug: createdSlug };
  }

  private async resolveUniqueSlug(baseSlug: string): Promise<string> {
    if (!(await this.articleRepo.slugExists(baseSlug))) {
      return baseSlug;
    }
    for (let suffix = 2; suffix <= MAX_SLUG_TRIES; suffix += 1) {
      const candidate = `${baseSlug}-${suffix}`;
      if (!(await this.articleRepo.slugExists(candidate))) {
        return candidate;
      }
    }
    throw new ValidationException("Impossible de générer un slug unique pour cet article.");
  }
}

import { IsInt, IsOptional, IsString, Max, MaxLength, MinLength, Min } from "class-validator";

export class UpsertReviewDto {
  @IsInt()
  @Min(1)
  @Max(10)
  rating!: number;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  body?: string | null;
}

export class AddCommentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  body!: string;
}

export interface ReviewDto {
  id: string;
  userId: string;
  animeId: string;
  rating: number;
  body: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewListItemDto extends ReviewDto {
  author: {
    id: string;
    name: string;
    image: string | null;
  };
}

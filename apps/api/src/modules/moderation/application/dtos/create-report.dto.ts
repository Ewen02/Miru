import { IsIn, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateReportDto {
  @IsIn(["REVIEW", "LIST"])
  targetKind!: "REVIEW" | "LIST";

  @IsString()
  @MinLength(1)
  @MaxLength(60)
  targetId!: string;

  @IsIn(["SPAM", "ABUSE", "OFFTOPIC", "OTHER"])
  reason!: "SPAM" | "ABUSE" | "OFFTOPIC" | "OTHER";

  @IsOptional()
  @IsString()
  @MaxLength(500)
  details?: string;
}

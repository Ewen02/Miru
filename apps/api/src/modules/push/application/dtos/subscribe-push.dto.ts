import { IsString, IsNotEmpty, MaxLength } from "class-validator";

export class SubscribePushDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(700)
  endpoint!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  p256dh!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  auth!: string;
}

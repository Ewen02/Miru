import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import type { UserProfile } from "@miru/types";
import { AuthRequiredGuard } from "@auth/auth-required.guard";
import { CurrentUserId } from "@auth/current-user.decorator";
import { GetCurrentUserUseCase } from "../../application/use-cases/get-current-user.use-case";
import { GetUserProfileUseCase } from "../../application/use-cases/get-user-profile.use-case";

interface UserDto {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  image: string | null;
}

@Controller("users")
export class UserController {
  constructor(
    private readonly getCurrentUser: GetCurrentUserUseCase,
    private readonly getUserProfile: GetUserProfileUseCase,
  ) {}

  @Get("me")
  @UseGuards(AuthRequiredGuard)
  async me(@CurrentUserId() userId: string): Promise<UserDto> {
    const user = await this.getCurrentUser.execute(userId);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      emailVerified: user.emailVerified,
      image: user.image,
    };
  }

  @Get(":handle")
  async profile(@Param("handle") handle: string): Promise<UserProfile> {
    const { user, joinedAt, stats, favorites, reviews } =
      await this.getUserProfile.execute({ handle });

    return {
      id: user.id,
      handle: user.name,
      name: user.name,
      image: user.image,
      joinedAt: joinedAt ? joinedAt.toISOString() : null,
      stats,
      favorites,
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        body: r.body,
        createdAt: r.createdAt.toISOString(),
        anime: r.anime,
      })),
    };
  }
}

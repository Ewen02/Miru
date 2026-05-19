import { Entity } from "@shared/domain/entity.base";

export type NotificationKind = "EPISODE_AIRED" | "REVIEW_REPLY" | "WEEKLY_RECAP" | "SYSTEM";

interface NotificationProps {
  userId: string;
  kind: NotificationKind;
  title: string;
  excerpt: string | null;
  linkUrl: string | null;
  coverUrl: string | null;
  payload: Record<string, unknown> | null;
  readAt: Date | null;
  createdAt: Date;
}

export class NotificationEntity extends Entity<NotificationProps> {
  get userId(): string {
    return this.props.userId;
  }
  get kind(): NotificationKind {
    return this.props.kind;
  }
  get title(): string {
    return this.props.title;
  }
  get excerpt(): string | null {
    return this.props.excerpt;
  }
  get linkUrl(): string | null {
    return this.props.linkUrl;
  }
  get coverUrl(): string | null {
    return this.props.coverUrl;
  }
  get payload(): Record<string, unknown> | null {
    return this.props.payload;
  }
  get readAt(): Date | null {
    return this.props.readAt;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }

  static create(id: string, props: NotificationProps): NotificationEntity {
    return new NotificationEntity(id, props);
  }
}

/**
 * Storage for Web Push subscriptions. Endpoint is unique — registering the
 * same endpoint twice (re-subscribe) must upsert, not duplicate.
 */
export interface PushSubscriptionRecord {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export interface PushSubscriptionRepositoryPort {
  upsert(
    userId: string,
    sub: PushSubscriptionRecord,
    userAgent: string | null,
  ): Promise<void>;
  deleteByEndpoint(endpoint: string): Promise<void>;
  findByUserId(userId: string): Promise<PushSubscriptionRecord[]>;
}

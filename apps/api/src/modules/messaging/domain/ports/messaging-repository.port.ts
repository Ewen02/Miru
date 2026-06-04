/**
 * Read models built by the repository from the persistence layer; consumed by
 * the use cases and mapped to the messaging DTOs.
 */
export interface ConversationSummaryView {
  id: string;
  /** The other participant (not the viewer). */
  peer: { id: string; name: string; image: string | null };
  lastMessageAt: Date | null;
  /** Unread messages sent by the peer to the viewer. */
  unreadCount: number;
}

export interface DirectMessageView {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: Date;
}

export interface ConversationDetailView {
  id: string;
  peer: { id: string; name: string; image: string | null };
  messages: DirectMessageView[];
}

export interface MessagingRepositoryPort {
  /**
   * The viewer's conversations, ordered lastMessageAt desc (nulls last). peer is
   * the other participant; unreadCount = peer messages with readAt null.
   */
  listConversations(userId: string): Promise<ConversationSummaryView[]>;
  /**
   * Canonical-order the pair (sort the two ids), upsert on the unique
   * (userAId, userBId), and return the conversation id.
   */
  getOrCreateConversation(userId: string, peerId: string): Promise<string>;
  /**
   * A single conversation with its last 100 messages ordered createdAt asc, or
   * null if it does not exist or userId is not a participant. peer is the other
   * participant.
   */
  getConversation(conversationId: string, userId: string): Promise<ConversationDetailView | null>;
  isParticipant(conversationId: string, userId: string): Promise<boolean>;
  /**
   * Create the message and set conversation.lastMessageAt = now; return the
   * created message view.
   */
  sendMessage(conversationId: string, senderId: string, body: string): Promise<DirectMessageView>;
  /**
   * Set readAt = now on messages in this conversation whose senderId != userId
   * and readAt is null.
   */
  markRead(conversationId: string, userId: string): Promise<void>;
}

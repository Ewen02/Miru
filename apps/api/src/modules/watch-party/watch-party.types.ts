/**
 * Ephemeral watch-party state, held in memory by the gateway (no persistence).
 * A party is a room where a host's playback position is mirrored to guests and
 * everyone can chat live.
 */
export interface PartyPlayback {
  /** Whether the host is currently playing. */
  playing: boolean;
  /** Playback position in seconds at `updatedAtMs`. */
  positionSeconds: number;
  /** Server clock (ms) when the position was last set, for drift correction. */
  updatedAtMs: number;
}

export interface PartyState {
  code: string;
  hostId: string;
  /** Optional anime/episode context the host is watching. */
  animeSlug: string | null;
  title: string | null;
  playback: PartyPlayback;
  /** Connected participant user ids. */
  members: string[];
}

export interface PartyChatMessage {
  userId: string;
  userName: string;
  body: string;
  /** Server clock (ms). */
  atMs: number;
}

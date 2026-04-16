/**
 * Tokens d'injection pour les ports.
 * Permet de découpler l'application de l'implémentation infra.
 *
 * Le module NestJS bind ces tokens aux adapters concrets.
 */
export const ANIME_REPOSITORY = Symbol("ANIME_REPOSITORY");
export const ANIME_SYNC = Symbol("ANIME_SYNC");
export const EPISODE_SYNC = Symbol("EPISODE_SYNC");
export const ANILIST_CLIENT = Symbol("ANILIST_CLIENT");
export const JIKAN_CLIENT = Symbol("JIKAN_CLIENT");

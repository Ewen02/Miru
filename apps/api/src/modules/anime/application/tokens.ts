/**
 * Tokens d'injection pour les ports.
 * Permet de découpler l'application de l'implémentation infra.
 *
 * Le module NestJS bind ces tokens aux adapters concrets.
 */
export const ANIME_REPOSITORY = Symbol("ANIME_REPOSITORY");
export const ANIME_SYNC = Symbol("ANIME_SYNC");

# Miru — Roadmap

> Produit : plateforme anime **Explorer, Organiser, Partager**.
> État actuel : monorepo scaffoldé, API NestJS hexagonale avec module `anime` + `sync`, front Next catalogue `/` qui affiche 20 trending AniList, Postgres Docker.

---

## Phase 0 — Acquis

- Monorepo Turbo + pnpm, 5 packages (`config`, `types`, `db`, `anilist`, `ui`)
- API NestJS hexagonale (ports & adapters, 3 couches)
- Module `anime` complet (domain/application/infra) + module `sync`
- Client AniList via `fetch` natif, conversion /100 → /10
- Schema Prisma cœur : `Anime`, `Studio`, `Genre`, `Episode` (minimal)
- Postgres Docker (port 5433)
- Front Next 16 + Tailwind v4 + design system Miru (tokens + `AnimeCard`)
- Page `/` fonctionnelle, SSR, `revalidate: 60s`
- Commandes `pnpm dev` (tout-en-un), `/sync:trending`, `/check`
- Setup Claude Code : slash commands + subagents

---

## Phase 1 — Explorer (MVP read-only) · ~10 jours

**Objectif** : naviguer, découvrir, afficher une fiche anime complète. Sans compte.

### 1.1 Fiche anime `/anime/[id]` — 1j

- Route dynamique Next, server component
- `GET /animes/:id` existant → enrichir pour retourner episodes + genres + platforms
- Composant `AnimeHero` (banner + cover overlay + titre + note)
- Sections : synopsis, infos techniques, grille d'épisodes
- Navigation retour catalogue

### 1.2 Liens plateformes (couche 1 — AniList `externalLinks`) — 1j

- Enrichir query AniList avec `externalLinks { site url type icon color }`
- Schema Prisma : `Platform` + `AnimeOnPlatform` (source `ANILIST`)
- Domain : `PlatformEntity`, repository, inclus dans `AnimeEntity`
- UI : `PlatformBadge` sur fiche anime ("Regarder sur Crunchyroll")

### 1.3 Episodes détaillés via Jikan (MyAnimeList) — 2j

- `packages/jikan/` — nouveau client (fetch natif, rate-limit 3 req/s)
- Port `EpisodeSyncPort` dans `modules/anime/domain/ports/`
- Adapter `JikanEpisodeAdapter` dans `modules/anime/infrastructure/external/`
- Use case `ImportEpisodesUseCase` dans `modules/sync`
- Schema Episode enrichi : `titleJp`, `titleRomaji`, `filler`, `recap`
- UI : `EpisodeRow` avec numéro, titre, durée, date d'air

### 1.4 Personnages — 1.5j

- Schema : `Character`, `VoiceActor`, `AnimeCharacter` (rôle)
- Query AniList déjà fournit `characters.edges` avec voiceActors
- Port `CharacterSyncPort` + adapter AniList
- Repository + use case `GetAnimeCharactersUseCase`
- UI : `CharacterCard` (vertical, image + nom + rôle), section sur fiche anime

### 1.5 Recherche + filtres — 2j

- Barre de recherche sur `/` (query param `?search=`, debounce 300ms côté client)
- `GET /animes?search=...` existe déjà → tester
- Filtres : status (airing/finished/announced), format (TV/movie/…), genre, année
- Composants UI : `SearchInput`, `FilterBar`, `FilterChip`
- Pagination infinie ou pages numérotées (à choisir)

### 1.6 Sync automatique — 1j

- `@nestjs/schedule` : cron quotidien `0 4 * * *` → `ImportTrendingUseCase` (50 anime)
- Cron horaire `0 * * * *` pour anime en `AIRING` uniquement (refresh episodes via Jikan)
- Scope retries / échecs : logger + continuer (MVP, pas de système de jobs)

### 1.7 Qualité + polish — 1.5j

- SEO basique (metadata par fiche anime)
- Loading states + skeletons (`Shimmer` composant)
- Error boundaries
- Images optimisées via `next/image` + `remotePatterns` AniList/MAL CDN
- Audit Lighthouse sur page catalogue

**Livrable Phase 1** : app publique navigable avec catalogue, fiches complètes, recherche, liens streaming basiques.

---

## Phase 2 — Organiser (avec auth) · ~7 jours

**Objectif** : créer des comptes, avoir une watchlist personnelle.

### 2.1 Auth BetterAuth — 2j

- Installer + configurer BetterAuth côté API
- Schema Prisma : `User`, `Session`, `Account`
- Module `user` hexagonal (domain `UserEntity`, repository Prisma)
- Provider : email + password au MVP (OAuth Google plus tard)
- Côté web : pages `/login`, `/register`, `/profile`
- Middleware Next : protection de routes, cookie session httpOnly
- Guard NestJS : `@CurrentUser()` decorator custom

### 2.2 Module `watchlist` — 2j

- Schema : `WatchlistEntry` (userId, animeId, status, currentEpisode, rating, isFavorite, updatedAt)
- Module hexagonal complet
- Use cases : `AddToWatchlistUseCase`, `UpdateProgressUseCase`, `RemoveFromWatchlistUseCase`, `GetUserWatchlistUseCase`
- Routes : `POST /watchlist`, `PATCH /watchlist/:animeId`, `DELETE /watchlist/:animeId`, `GET /users/me/watchlist`
- Event emitter : `watchlist.updated` → listener futur pour anime.averageUserRating

### 2.3 UI watchlist — 2j

- Composants `WatchlistButton` (toggle avec pulse), `StatusSelector` (Watching / Completed / Planned / Dropped / On Hold)
- Page `/watchlist` : onglets par statut, progress bar par anime
- Boutons +/- épisode sur fiche anime quand anime en watchlist
- Favoris (cœur) séparé du statut

### 2.4 Reviews / notes — 1j

- Module `review` hexagonal, schema `Review` (userId, animeId, rating, body, createdAt)
- `POST /reviews`, `GET /animes/:id/reviews`
- Listener `review.created` → recalcul `averageUserRating` sur `Anime`
- UI : formulaire note + textarea sur fiche anime, section reviews

**Livrable Phase 2** : chaque user a son compte, sa watchlist persistée, ses reviews.

---

## Phase 3 — Partager · ~5 jours

**Objectif** : profils publics, partage de listes, découverte sociale.

### 3.1 Profils publics — 2j

- Route `/u/[username]` : avatar, bio, stats (total watched, fav genres), watchlist publique (opt-in)
- Module `user` étendu : `username` unique, `bio`, `isPublic`
- UI : page profil, composant `UserStats`

### 3.2 Partage ciblé — 1j

- URL partageable pour une watchlist : `/u/:username/list/:slug`
- Listes custom nommées (ex. "Top seinen 2024") — nouveau modèle `CustomList`
- Copie-lien + OG images générées (Next OG image)

### 3.3 Feed social léger — 2j

- Activity feed : "Ewen a ajouté X à sa watchlist", "Ewen a noté Y 9/10"
- Schema : `ActivityEvent` (userId, type, payload, createdAt)
- Pas de follow au MVP — juste page `/discover` avec activités récentes publiques
- Follow / friends : Phase 6

**Livrable Phase 3** : app sociale légère, partage fonctionnel.

---

## Phase 4 — Streaming liens précis (scraping) · ~4 jours

**Objectif** : liens par épisode, pas juste par anime. Opt-in derrière feature flag.

### 4.1 Infra scraping — 2j

- Package `packages/scraper/` : wrapper fetch + `cheerio` + retry + rate-limit
- Config par plateforme (selectors, user-agent, throttle)
- Table `ScrapeJob` (status, targetUrl, lastSuccess, lastError) pour debug

### 4.2 Adapter Crunchyroll — 1j

- `CrunchyrollScraperAdapter` implémente `EpisodeLinkPort`
- Match anime Miru ↔ slug Crunchyroll (via recherche + heuristique titre)
- Extraction URLs par épisode
- Schema : `EpisodePlatformLink` avec `source: CRUNCHYROLL_SCRAPE`, `verifiedAt`

### 4.3 Adapter ADN — 1j

- Idem, source `ADN_SCRAPE`
- Feature flag `ENABLE_SCRAPERS=false` par défaut
- Cron de vérification hebdo des URLs (cassées → marquer invalide)

**Livrable Phase 4** : sur fiche anime, chaque épisode a ses liens directs Crunchyroll/ADN quand dispo.

**Avertissement légal** : scraping gris vis-à-vis des CGU Crunchyroll/ADN. Usage perso OK, usage public avec utilisateurs → risque cease & desist. Feature flag OFF par défaut. À re-valider avant activation en prod.

---

## Phase 5 — Performance & scale · ~5 jours

### 5.1 Jobs async proprement — 2j

- BullMQ + Redis (docker-compose)
- Migrer les crons `@nestjs/schedule` → queues avec retries, priorités, deadletter
- Dashboard Bull Board en dev

### 5.2 Cache — 1j

- Redis cache pour les endpoints lourds (`GET /animes`, `GET /animes/:id`)
- Cache invalidation sur `save` anime (event bus)
- CDN : Vercel / Cloudflare devant le front

### 5.3 Images — 1j

- Proxy images AniList/MAL via `next/image` local pour résilience
- Sharp thumbnails générés en background pour les covers

### 5.4 Monitoring — 1j

- Sentry (front + API)
- Logs structurés (pino) côté API
- Healthchecks `/health` + `/ready`

---

## Phase 6 — Produit mature (optionnel, post-MVP validé)

Pas planifié en détail, à arbitrer selon retours utilisateurs :

- **Recommandations** : "si tu as aimé X, regarde Y" (basé sur AnimeRelations + genre affinity)
- **Follow / friends** : vrai graphe social
- **Listes collaboratives** : plusieurs users co-éditent une liste
- **Planning hebdo** : "quoi cette semaine" avec les AIRING de ta watchlist
- **Notifications** : nouvel épisode d'un anime en watchlist → push/email
- **Mobile app** : React Native partagé via `packages/ui` cross-platform ou app web installable (PWA)
- **OAuth** (Google, Discord, MAL import)
- **i18n** : anglais en plus du français

---

## Stack additionnelle par phase

| Phase | Nouveautés techniques                              |
| ----- | -------------------------------------------------- |
| 1     | `@nestjs/schedule`, `packages/jikan`, `next/image` |
| 2     | BetterAuth, Prisma `User/Session`                  |
| 3     | Next OG image runtime                              |
| 4     | `cheerio`, feature flags                           |
| 5     | Redis, BullMQ, Sentry, Pino                        |

---

## Rythme & priorités

**Si solo à temps partiel (soirs/WE)** :

- Phase 1 : ~3 semaines
- Phase 2 : ~2 semaines
- Phase 3 : ~1.5 semaines
- **MVP shippable public** : ~6-7 semaines
- Phase 4 : bonus opt-in selon motivation
- Phase 5 : à déclencher si trafic

**Chemin critique minimum pour sortir** : 1.1 → 1.3 → 1.5 → 2.1 → 2.2 → 2.3. Le reste est amplification.

---

## Décisions structurantes à prendre

1. **Scraping légal** : perso/privé OK, public risqué. À re-valider avant Phase 4.
2. **Hébergement** : Vercel (front) + Railway/Fly.io (API+Postgres) ? ou self-host ? (décide en Phase 2.1 avant auth prod)
3. **Pricing** : 100% gratuit ? Donation ? Premium (pas de pub, listes illimitées) ? À trancher avant Phase 3.
4. **i18n dès le début ou FR-only au MVP ?** Avis : FR-only, i18n en Phase 6.

---

## Prochaine action concrète recommandée

**Phase 1.1 — fiche anime `/anime/[id]`** : c'est le prolongement direct de ce qu'on vient de livrer, ça exerce le full-stack (API detail + entity + mapper + page Next + composants UI), et ça débloque le reste de la Phase 1.

# Miru — Roadmap

> Plateforme anime **Explorer, Organiser, Partager**.
> **État actuel : Phase 6 (Mature) atteinte sur tous les axes prévus + extensions hors-roadmap.**

## TL;DR

Phases 1, 2, 3, 5 (perf), 6 (recommandations, notifications, billing, admin, i18n) **toutes livrées**. La dernière phase ouverte est la **Phase 4 — Streaming liens précis (scraping)**, encore non démarrée et flaggée pour réflexion légale. Le reste est polish + opérations.

---

## Phase 0 — Acquis (jour 1)

- ✅ Monorepo Turbo + pnpm, 8 packages (`config`, `types`, `db`, `anilist`, `ui`, `jikan`, `http-client`, scraper à venir)
- ✅ API NestJS hexagonale (ports & adapters, 3 couches)
- ✅ Postgres Docker (port 5433) + Prisma 6
- ✅ Front Next 16 + Tailwind v4 + design system Miru
- ✅ Setup Claude Code : slash commands + subagents (`hex-architect`, `ui-stylist`, `prisma-schema`)

## Phase 1 — Explorer ✅

- ✅ **1.1** Fiche anime `/anime/[slug]` complète (hero, synopsis, infos, episodes, personnages, doubleurs, relations, plateformes, accent dynamique extrait via sharp)
- ✅ **1.2** Plateformes (couche 1 AniList externalLinks)
- ✅ **1.3** Episodes Jikan (`packages/jikan`, enrichissement filler/recap)
- ✅ **1.4** Personnages + doubleurs (fiches `/characters/[id]`, `/people/[id]`)
- ✅ **1.5** Recherche `/search`, filtres genres/format/année/status, pagination
- ✅ **1.6** Sync auto via `@nestjs/schedule` (cron horaire trending + AIRING episodes refresh, `ENABLE_SCHEDULER=true`)
- ✅ **1.7** SEO complet (metadata dynamique, OG images per route via `/opengraph-image.tsx`, sitemap.ts + robots.ts), skeletons, error boundaries

**Bonus hors-roadmap :** `/top`, `/calendar`, `/seasons/[year]`, `/genre/[slug]` éditorial, `/studios/[slug]`, NSFW filter 3 couches.

## Phase 2 — Organiser ✅

- ✅ **2.1** BetterAuth câblé complet : signup, login, sessions, email verification, password reset, **+ 2FA TOTP avec QR + backup codes**, gestion sessions actives `/security`
- ✅ **2.2** Module `watchlist` + 5 statuts + currentEpisode
- ✅ **2.3** UI watchlist `/watchlist` avec onglets + cards
- ✅ **2.4** Reviews avec slider 1-10, spoiler toggle, agrégation `averageUserRating`

**Bonus hors-roadmap :** per-episode tracking (`UserEpisode`), streaks calculés depuis l'historique.

## Phase 3 — Partager ✅ (majoritairement)

- ✅ **3.1** Profils publics `/u/[handle]` avec stats, favorites, histogram, badge Sympathisant
- ✅ **3.2** Listes custom `/lists/[id]` partageables, OG images dynamiques, likes
- ⏸️ **3.3** Feed social `/discover` — **explicitement skippé** par décision produit (pas de followers en DB)

## Phase 4 — Streaming liens précis (scraping) 🔒

**Statut : non démarré. À trancher business + légal.**

- ❌ **4.1** Package `packages/scraper/` — wrapper fetch + cheerio + rate-limit
- ❌ **4.2** Adapter Crunchyroll
- ❌ **4.3** Adapter ADN

**Risque légal** : scraping gris vs CGU des plateformes. Feature flag `ENABLE_SCRAPERS=false` par défaut, à activer en connaissance de cause.

## Phase 5 — Performance & scale ✅ (partiellement)

- ❌ **5.1** Jobs async via BullMQ + Redis — **pas fait**, `@nestjs/schedule` suffit pour le volume actuel
- ❌ **5.2** Cache Redis — pas fait, Prisma + ISR suffisent
- ✅ **5.3** Images optimisées (`next/image` + CDN AniList/MAL), accent extrait via sharp
- ✅ **5.4** **Observabilité complète** : Sentry (api + web client + edge), Pino structuré, healthchecks `/health` + `/health/ready`, page `/status` live (sondes 30s ISR), rate-limiting Throttler + Better Auth scope

## Phase 6 — Produit mature ✅

Originellement "optionnel post-MVP", toute la phase est livrée :

- ✅ **Recommandations perso** : CTE scoring genres ×2 + studios, `/for-you` + slider home
- ✅ **Notifications** : 4 kinds (EPISODE_AIRED, REVIEW_REPLY, WEEKLY_RECAP, SYSTEM), cron producers, `/notifications` UI
- ✅ **Web Push (PWA)** : VAPID, service worker, toggle opt-in dans `/settings`
- ✅ **i18n FR + EN complet** : next-intl v4 cookie-based, locale switcher, 30+ pages migrées
- ✅ **Stripe Sympathisant** : checkout + portal + webhook, badge sur profil
- ✅ **Admin / Modération** : `User.role`, table `Report`, `AdminRequiredGuard`, dashboard `/admin`
- ✅ **AniList import** : OAuth + import watchlist (existe sur `/onboard`)
- ❌ **Follow / friends** : décision skip (Phase 3.3 idem)
- ❌ **Listes collaboratives** : pas commencé
- ❌ **OAuth Google / Discord / MAL** : email/password only pour l'instant
- ❌ **React Native** : PWA installable seulement

## Hors-roadmap originel mais livré

- Year-in-review `/year-in-review/[year]` avec partage Twitter
- Lifetime stats `/lifetime-stats`
- Calendrier hebdomadaire `/calendar` avec live spotlight
- Top 100 `/top`
- Saisons `/seasons/[year]`
- Pricing page réelle avec Stripe
- Reports/modération `/admin`
- Tests E2E Playwright (3 specs, à étendre)
- Deploy guide `.claude/docs/deploy.md` (Railway + Vercel)

---

## Ce qui reste — backlog opérationnel

| Item                          | Statut    | Action                                                                                  |
| ----------------------------- | --------- | --------------------------------------------------------------------------------------- |
| VAPID keys prod               | env vide  | `npx web-push generate-vapid-keys` + injecter sur Railway                              |
| Stripe keys prod              | env vide  | Créer produit "Sympathisant" + clés `sk_live_…` + webhook secret                       |
| Resend API key prod           | env vide  | Créer clé sur resend.com + domaine vérifié                                              |
| Sentry DSN                    | env vide  | Créer projets API + Web sur sentry.io                                                   |
| **Déploiement réel**          | jamais    | Suivre `.claude/docs/deploy.md` (Railway + Vercel)                                      |
| Tests E2E élargis             | 3 specs   | Ajouter signup → watchlist → review (couverture ~10% → ~50%)                            |
| PWA icons multi-tailles       | manifest minimal | Générer 192/512/maskable + install prompt                                         |
| **Phase 4 Scraping**          | à trancher | Décision business/légal — voir [.claude/docs/scraping-decision.md](.claude/docs/scraping-decision.md) |
| OAuth Google/Discord/MAL      | non       | Si demande utilisateur — pas prioritaire                                                |
| Listes collaboratives         | non       | Phase 6 bonus, à arbitrer                                                               |
| Follow / friends              | skip      | Décision produit, ne pas relancer sans signal fort                                      |

---

## Stack actuelle

| Couche      | Choix                                                                  |
| ----------- | ---------------------------------------------------------------------- |
| Mono        | Turborepo + pnpm workspaces                                            |
| Front       | Next 16 (RSC, App Router), Tailwind v4, next-intl v4                   |
| Back        | NestJS 11 hexagonale, Prisma 6                                         |
| DB          | PostgreSQL 16 (docker dev :5433, Railway prod)                         |
| Auth        | BetterAuth + 2FA plugin                                                |
| Mail        | Resend                                                                 |
| Billing     | Stripe                                                                 |
| Push        | Web Push (VAPID) + service worker                                      |
| Obs         | Sentry, Pino, healthchecks                                             |
| Cron        | `@nestjs/schedule` (pas de Redis pour l'instant)                       |
| Tests       | Jest unit côté API (72 tests / 26 suites) + Playwright E2E (3 specs)   |
| Deploy      | Railway (api + postgres) + Vercel (web)                                |

---

## Prochaines actions concrètes

1. **Mettre la doc à jour partout** (ce fichier ✅, CLAUDE.md racine, sous-CLAUDE.md)
2. **Trancher Phase 4 Scraping** — décision dans `.claude/docs/scraping-decision.md`
3. **Élargir tests E2E** sur les parcours auth + watchlist
4. **Déployer pour de vrai** (Railway + Vercel) — toutes les clés tierces à provisionner

Tout le reste est itération sur retours utilisateurs.

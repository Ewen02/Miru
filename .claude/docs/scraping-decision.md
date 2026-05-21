# Phase 4 — Scraping Crunchyroll & ADN

> Décision : **construit, désactivé par défaut**.

## Contexte

La Phase 4 originale de la roadmap visait à enrichir les fiches anime avec
des liens directs **par épisode** vers Crunchyroll et ADN — alors que la
Phase 1.2 ne fournit que des liens **par série** (via `externalLinks` AniList).

## Pourquoi c'est gris

Les CGU de Crunchyroll et ADN interdisent explicitement le scraping
automatisé. En pratique :

- **Usage perso** (un seul utilisateur, faible volume) → toléré dans 99%
  des cas, jamais activement poursuivi.
- **Service multi-utilisateurs qui consomme la donnée scrapée** →
  augmente le risque proportionnellement au trafic. Possible
  cease-and-desist, blocage IP, ou contestation publique.

Aucune jurisprudence européenne ne tranche définitivement, mais le
contexte 2024-2026 (DSA, jurisprudence hiQ vs LinkedIn revisitée par
Van Buren) penche **modérément** vers la légalité du scraping de
contenu public sans contournement d'authentification — ce qui est
exactement notre cas.

## Décision

**On code la Phase 4 derrière un feature flag `ENABLE_SCRAPERS` (default
`false`).** Le code reste inerte tant que le flag n'est pas explicitement
activé. Avantages :

1. **Architecture prête** : pas de dette à rattraper si on décide d'activer.
2. **Pas de risque par défaut** : aucun trafic ne sort vers CR/ADN tant
   que le flag est OFF.
3. **Décision business explicite** : activer le flag = signer pour le
   risque, ce qui force une vraie discussion.

## Conditions d'activation

`ENABLE_SCRAPERS=true` ne doit être posé que si **toutes** ces conditions
sont vraies :

- [ ] Conseil juridique consulté (au minimum 1 avocat IT)
- [ ] Volume de scraping borné (< 100 req/min total, respect du
      robots.txt si présent)
- [ ] Cache agressif côté Miru (24h minimum sur les liens trouvés)
- [ ] User-Agent identifiable + email de contact dans le UA
- [ ] Plan de désactivation rapide (env var → toggle UI, < 5min)
- [ ] Budget juridique provisionné pour cease-and-desist éventuel

Sans ces conditions, **garder OFF**.

## Périmètre technique

3 livrables :

1. **`packages/scraper/`** — utilitaires fetch + cheerio + retry +
   rate-limit. Pas spécifique à une plateforme. Logging dédié.
2. **Module API `streaming-link`** (hexagonal) — port `EpisodeLinkPort`,
   2 adapters (`CrunchyrollScraperAdapter`, `ADNScraperAdapter`).
   Schema Prisma `EpisodePlatformLink` avec source
   (`CRUNCHYROLL_SCRAPE` | `ADN_SCRAPE`), `verifiedAt`, `brokenAt`.
3. **Cron de vérification** hebdo qui re-fetch les URLs marquées
   `verifiedAt` > 7j et marque les 404 comme `brokenAt`.

## Comportement avec flag OFF

- Module instancié mais cron désactivé via `@Cron(..., { disabled: !flag })`
- UI ne montre pas les liens même si la table en contient (filtre côté
  use case)
- Aucune requête sortante vers crunchyroll.com / animationdigitalnetwork.com

## Évolution future possible

Si le scraping s'avère problématique mais qu'on veut garder les liens
par épisode :

- **Affiliation officielle** : Crunchyroll propose un programme partner
  qui donne accès à une API. Pas gratuit mais légal.
- **User-submitted** : les utilisateurs eux-mêmes proposent les liens
  via un bouton "Ajouter un lien", on modère a posteriori. Pas de
  scraping, juste de la curation.
- **Skip** : retirer la feature complètement, garder les liens série
  d'AniList suffit pour 95% des cas d'usage.

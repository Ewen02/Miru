export const MEDIA_FRAGMENT = `
  fragment MediaFragment on Media {
    id
    idMal
    title { romaji english native }
    description
    coverImage { large extraLarge color }
    bannerImage
    format
    status
    season
    seasonYear
    episodes
    duration
    genres
    isAdult
    averageScore
    studios(isMain: true) { nodes { name } }
    characters(sort: ROLE, perPage: 25) {
      edges {
        role
        node { id name { full native } image { large } }
        voiceActors(language: JAPANESE) { id name { full } }
      }
    }
    streamingEpisodes { title thumbnail url site }
    externalLinks { site url type icon color }
    relations {
      edges {
        relationType(version: 2)
        node {
          id
          title { romaji english native }
          format
          seasonYear
          coverImage { large extraLarge }
        }
      }
    }
  }
`;

export const TRENDING_QUERY = `
  query Trending($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(sort: TRENDING_DESC, type: ANIME, isAdult: false) { ...MediaFragment }
    }
  }
  ${MEDIA_FRAGMENT}
`;

export const SEASON_QUERY = `
  query Season($season: MediaSeason, $seasonYear: Int, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(season: $season, seasonYear: $seasonYear, type: ANIME, sort: POPULARITY_DESC, isAdult: false) {
        ...MediaFragment
      }
    }
  }
  ${MEDIA_FRAGMENT}
`;

export const ANIME_SEARCH_QUERY = `
  query Search($query: String, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(search: $query, type: ANIME, isAdult: false) { ...MediaFragment }
    }
  }
  ${MEDIA_FRAGMENT}
`;

export const ANIME_DETAIL_QUERY = `
  query AnimeDetail($id: Int) {
    Media(id: $id, type: ANIME) { ...MediaFragment }
  }
  ${MEDIA_FRAGMENT}
`;

/**
 * Lightweight query for importing a user's anime list. Only fields we need
 * to build a WatchlistEntry: the media id (maps to externalAnilistId),
 * status, progress, optional score and dates.
 */
export const USER_MEDIA_LIST_QUERY = `
  query UserMediaList($username: String) {
    MediaListCollection(userName: $username, type: ANIME) {
      lists {
        entries {
          mediaId
          status
          progress
          score(format: POINT_10)
          startedAt { year month day }
          completedAt { year month day }
        }
      }
    }
  }
`;

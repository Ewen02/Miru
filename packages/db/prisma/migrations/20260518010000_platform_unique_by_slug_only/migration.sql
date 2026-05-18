-- Drop the now-redundant unique constraints on Platform.name and Platform.baseUrl.
-- The slug (derived from the AniList "site" label) is the only canonical key:
-- the same service can be served on different host variants
-- (e.g. crunchyroll.com vs www.crunchyroll.com) and AniList sometimes returns
-- minor casing differences on the name field.
DROP INDEX IF EXISTS "Platform_name_key";
DROP INDEX IF EXISTS "Platform_baseUrl_key";

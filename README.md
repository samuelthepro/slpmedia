# slpmedia.pro

Landing page for SLP Media. Static, single file, served by GitHub Pages from `main` at the root.

- `index.html` is the whole page (fonts from Google Fonts, everything else inline).
- The wordmark and sign-off logo are the B2 Birthstone script lockups, inlined as outlined SVG paths.
- Icons and `og.jpg` are rendered from the logo PNGs; the source generator lives in the "SLP Media Logo" folder.
- DNS: Porkbun. Apex A records to GitHub Pages, `www` CNAME to `samuelthepro.github.io`.

## Early-access signups

The hero form does two things in parallel and succeeds if either lands:

1. Inserts a row into `public.early_access_signups` in the `slp-gallery` Supabase project (`udkfrzzaxwtmvamevnfl`) through PostgREST. The publishable key in the page can only INSERT into that table (RLS, no SELECT), one row per email (unique on `lower(email)`), and only with `source = 'slpmedia.pro'`. A 409 means the email was already on the list.
2. Posts to Web3Forms, which emails samuel@samuellongproductions.com.

Read the list from the gallery repo (`~/Projects/slp-gallery`) with its production `POSTGRES_URL_NON_POOLING`:

```sql
select email, created_at, page from early_access_signups order by created_at desc;
```

Schema (columns): `id`, `email`, `source`, `page`, `user_agent`, `created_at`. The table was created directly in production and is not yet in the gallery repo's migrations; add it there with `create table if not exists` when convenient.

# slpmedia.pro

Landing page for SLP Media. Static, single file, served by Vercel (team `slp-media`, project `slpmedia`).

- `index.html` is the whole page (fonts from Google Fonts, everything else inline).
- The wordmark and sign-off logo are the B2 Birthstone script lockups, inlined as outlined SVG paths.
- Icons and `og.jpg` are rendered from the logo PNGs; the source generator lives in the "SLP Media Logo" folder.
- `vercel.json` turns on clean URLs, sets security headers, and caches the icons for a week. No build step.
- Deploy: push to `main` once the repo is connected to the Vercel project (Vercel dashboard, project Settings, Git). Until then, `npx vercel@59.23.0 deploy --prod --scope slp-media` from this folder.
- DNS: Porkbun. Apex A records to Vercel, `www` CNAME to Vercel (308 to the apex), `_vercel` TXT for domain verification. The iCloud Mail records (MX, DKIM, SPF, apple-domain) stay as they are.

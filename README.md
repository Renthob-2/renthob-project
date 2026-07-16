# Renthob

Renthob is a Nigerian rental marketplace for renters, landlords, agents, affiliates, and platform administrators. It supports property discovery, saved listings, applications, tours, messaging, listing management, role approvals, identity review, and a deterministic plain-language rental advisor.

## Local development

Requirements: Node.js 20+ and npm.

```sh
npm install
cp .env.example .env
npm run dev
```

Set the public Supabase URL and publishable key in `.env`. Never add a service-role key to a browser environment variable.

## Verification

```sh
npm run check
npm audit --omit=dev
```

`npm run check` runs TypeScript, ESLint, unit tests, and a production build. GitHub Actions runs the same checks for pushes to `main` and pull requests.

## Deployment

1. Install a valid TLS certificate covering `renthob.com` and `www.renthob.com`.
2. Apply the pending files in `supabase/migrations/` to the production Supabase project.
3. Deploy the `rental-advisor` and `og-property` edge functions.
4. Configure the variables documented in `.env.example` in the hosting dashboard.
5. Run `npm run build` and publish `dist/`.
6. On LiteSpeed/Apache, include the hidden `dist/.htaccess` file so client-side routes work after a refresh and HTTP is redirected to the now-valid HTTPS origin. Vercel uses the included `vercel.json` rewrite instead.

The production origin is `https://renthob.com`.

# ENCIRCLE

ENCIRCLE is a strategic solo word game. Players form words from a 5×6 field of circles, claim letters, steal unprotected rival letters, and surround circles to lock them.

## Accounts

- Guests can play without an account.
- Free passwordless accounts use a six-digit code sent from `play@typty.com`.
- Signed-in players can resume an unfinished game on another device and track games, wins, and win rate.
- Account sessions last 180 days and use secure, HTTP-only cookies.

## Local development

```bash
pnpm install
pnpm dictionary:update
pnpm run dev
pnpm run build
```

The browser app is built with Vite and React. Word validation merges the existing game list with a filtered English Wiktionary dataset generated through Kaikki/Wiktextract. Production uses a PHP API and a private SQLite database on DreamHost. The private `gridlock-config.php` file and SQLite database live above the public web root and are never committed or deployed with the site.

## 5×6 circle beta

The experimental `beta/5x6-circles` branch deploys only to `beta.gridlockword.com` through `scripts/deploy-beta.sh`. It uses DreamHost user `dh_cwxxe8`, a dedicated SSH key, the `5x6-v2` saved-game format, and a separate `gridlock-beta.sqlite` database. The beta deployment script cannot write to the production web directory.

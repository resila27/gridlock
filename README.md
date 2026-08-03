# GRIDLOCK

GRIDLOCK is a strategic solo word game. Players form words from a 5×5 field, claim letters, steal unprotected rival letters, and surround tiles to lock them.

## Accounts

- Guests can play without an account.
- Free passwordless accounts use a six-digit code sent from `play@typty.com`.
- Signed-in players can resume an unfinished game on another device and track games, wins, and win rate.
- Account sessions last 180 days and use secure, HTTP-only cookies.

## Local development

```bash
pnpm install
pnpm run dev
pnpm run build
```

The browser app is built with Vite and React. Production uses a PHP API and a private SQLite database on DreamHost. The private `gridlock-config.php` file and SQLite database live above the public web root and are never committed or deployed with the site.

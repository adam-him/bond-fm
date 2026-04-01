# BOND FM

Lightweight music sharing. Upload tracks, listen to what others shared.

## Stack

- Cloudflare Pages (static frontend)
- Cloudflare Pages Functions (API)
- Cloudflare R2 (audio + metadata storage)

## Deploy

```bash
wrangler pages deploy public --project-name bond-fm
```

Add R2 binding `BUCKET → bond-fm` in the Cloudflare Pages dashboard.

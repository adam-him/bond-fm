# BOND FM

A lightweight music sharing site. Upload tracks, listen to what others have shared.

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Vercel Blob (audio + metadata storage)

## Setup

1. Clone & install

```bash
npm install
```

2. Create a Vercel Blob store (vercel.com → your project → Storage → Blob), then add to `.env.local`:

```
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
```

3. Run locally

```bash
npm run dev
```

## Deploy

Push to GitHub, import in Vercel. Add `BLOB_READ_WRITE_TOKEN` in project settings → Environment Variables.

That's it.

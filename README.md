This is a Next.js email workspace for classifying emails and generating drafts with AI. The application can run locally or as a single production container.

## Docker

The image is built without any API keys. Each person running the app must supply their own key at runtime via `.env.local` (which is ignored by Git).

```bash
# 1. Create your local environment file from the template and add your key
cp .env.example .env.local
# then edit .env.local and set DEEPSEEK_API_KEY to your own key

# 2. Build and start the application
docker compose up --build
```

Open [http://localhost:3000](http://localhost:3000). The email history lives inside the container, so it resets whenever the container is recreated. Stop it with:

```bash
docker compose down
```

The compose setup uses one container for the Next.js application and its server-side AI integrations. Credentials remain in `.env.local`, which is ignored by Git; `.env.example` documents the expected variables without exposing any values.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

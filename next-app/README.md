# vauvannimet ja nextjs

Kirjastot

        iron-session
        mongoose










        .
        .
        .
        .
        .
        .
        .
        .
        .
        .
        .
        .

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

# Instructions for GitHub Copilot

## Project Overview

- **Framework**: Next.js
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Purpose**: Helps users choose baby names.

## Key Directories

- `components/`: Reusable UI components.
- `data/`: Stores data files for boys' and girls' names.
- `lib/`: Utility functions for database connection, session management, and API handling.
- `pages/`: Next.js pages and API routes.
- `styles/`: Global and module-specific CSS files.
- `test/`: Scripts or utilities for testing.

## Main Features

- **Login Dialog**: Allows users to log in or proceed without an account.
- **API Routes**: Handles login, logout, user data, and other functionalities.
- **State Management**: Managed using React Context in `state/state.tsx`.

## Development Workflow

1. Use `npm run dev` to start the development server.
2. Make changes in `components/` or `pages/` for UI or routing updates.
3. Update API logic in `pages/api/`.
4. Test changes locally.

## Future Tasks

- Follow existing patterns for state management, API calls, and styling.
- Test all changes to ensure they align with the application's purpose.

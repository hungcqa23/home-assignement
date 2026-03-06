# Project: Photo Upload & Comment

> ⚠️ **GUIDING PRINCIPLE:** _"Show up your skill as best as you can during this assignment. Our tech lead will check your code and git management as well."_
> Every decision — code structure, naming, commits, error handling, testing — should reflect **senior-level quality**. No shortcuts, no lazy code. Impress the reviewer.

## Overview

Monorepo full-stack application allowing users to upload photos and comment on them.

## Tech Stack

- **Frontend:** Next.js (App Router), TypeScript, Ant Design
- **Backend:** NestJS, TypeScript, Prisma ORM
- **Database:** PostgreSQL
- **Image Storage:** Cloudflare R2 (S3-compatible, zero egress fees)
- **Package Manager:** pnpm workspaces
- **Build System:** Turborepo (task orchestration + caching)
- **Containerization:** Docker Compose
- **Deployment:** Vercel (frontend) + Railway (backend + PostgreSQL)

## Monorepo Structure

```
apps/
  web/              → Next.js frontend (port 3000)
  server/           → Express backend API (port 4000)
packages/
  shared/           → Shared TypeScript types/interfaces
docker-compose.yml
pnpm-workspace.yaml
```

## Code Conventions

### General

- Language: TypeScript (strict mode) for both frontend and backend
- Use ESLint + Prettier for formatting
- No `any` types — use proper typing
- Use absolute imports with path aliases (`@/`)
- Keep files small and focused — one component/module per file

### Frontend (`apps/web`)

- Use Next.js App Router (`app/` directory)
- Components: PascalCase files, e.g., `PhotoCard.tsx`
- Hooks: camelCase with `use` prefix, e.g., `usePhotos.ts`
- Use Ant Design components — do not reinvent UI primitives
- API calls via a centralized `lib/api.ts` client
- Handle loading, error, and empty states for all data fetching

### Backend (`apps/server`)

- RESTful API design using NestJS modules
- Module structure: `src/modules/photos/` (controller, service, dto, module)
- Validate request input using `class-validator` + `class-transformer` (NestJS pipes)
- Consistent error response via NestJS exception filters
- Use Prisma for all database operations — no raw SQL
- Upload images to Cloudflare R2 via `@aws-sdk/client-s3`

### Shared (`packages/shared`)

- Only export TypeScript types/interfaces
- No runtime dependencies

## API Design

```
POST   /api/photos          → Upload a photo (multipart/form-data)
GET    /api/photos          → List all photos with comments
GET    /api/photos/:id      → Get a single photo with comments
POST   /api/photos/:id/comments  → Add a comment to a photo
```

## Git Conventions

- Use **conventional commits**: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `style:`, `test:`
- Branch naming: `feat/photo-upload`, `feat/comment-system`, `chore/docker-setup`
- Keep commits small and atomic — one logical change per commit
- Write meaningful commit messages that explain _why_, not just _what_
- Merge feature branches via pull requests (squash merge preferred)

## Git Workflow

1. `main` branch is always deployable
2. Create feature branches from `main`
3. PR → review → squash merge → delete branch

## Database Schema (Prisma)

```prisma
model Photo {
  id        String    @id @default(cuid())
  filename  String
  url       String
  caption   String?
  createdAt DateTime  @default(now())
  comments  Comment[]
}

model Comment {
  id        String   @id @default(cuid())
  content   String
  author    String?
  photoId   String
  photo     Photo    @relation(fields: [photoId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
}
```

## Environment Variables

- `DATABASE_URL` — PostgreSQL connection string
- `NEXT_PUBLIC_API_URL` — Backend API base URL (for frontend)
- `PORT` — Backend server port (default: 4000)
- `UPLOAD_DIR` — Directory for uploaded images (default: `./uploads`)

## Testing

- Backend: Jest for unit tests on services/controllers
- Frontend: React Testing Library if time permits
- Focus on critical paths: photo upload, comment creation

## Quality Checklist

- [ ] TypeScript strict mode, no `any`
- [ ] All API endpoints return consistent response format
- [ ] Loading & error states handled in UI
- [ ] Form validation (file type/size, comment not empty)
- [ ] Clean git history with conventional commits
- [ ] README with setup instructions and architecture overview
- [ ] Docker Compose for one-command local setup

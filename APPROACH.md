# Engineering Approach & Best Practices

> This document outlines the engineering decisions, architecture, and practices applied to the Photo Upload & Comment assignment — demonstrating how each choice reflects production-grade thinking.

---

## 1. Project Structure — Turborepo Monorepo

```
photo-upload-comment/
├── apps/
│   ├── web/              → Next.js 15 (App Router), Ant Design
│   └── server/           → NestJS REST API, Prisma ORM
├── packages/
│   └── shared/           → TypeScript interfaces (zero runtime deps)
├── docker-compose.yml    → One-command PostgreSQL setup
├── turbo.json            → Build orchestration + caching
└── pnpm-workspace.yaml   → Workspace dependency management
```

**Why this structure?**

- **Shared types** between frontend and backend are enforced at compile time — no drift between API contracts and client code.
- **Turborepo** caches builds, runs `dev` tasks concurrently, and respects dependency graph (`shared` builds before consumers).
- **pnpm workspaces** provide strict, efficient dependency resolution with symlinks — no phantom dependencies.

---

## 2. Backend Architecture — NestJS Modular Design

### Module Organization

| Module          | Scope  | Responsibility                                   |
| --------------- | ------ | ------------------------------------------------ |
| `PrismaModule`  | Global | Database connection lifecycle, graceful shutdown |
| `StorageModule` | Global | Cloudflare R2 client, presigned URL generation   |
| `PhotosModule`  | Scoped | Photo CRUD, comment operations                   |

### Cross-Cutting Concerns

| Layer                    | Implementation                 | Purpose                                                                                                                       |
| ------------------------ | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| **Exception Filter**     | `AllExceptionsFilter`          | Consistent error response shape across all endpoints                                                                          |
| **Response Interceptor** | `TransformResponseInterceptor` | Wraps all success responses in `{ data, message? }` envelope                                                                  |
| **Validation Pipe**      | Global `ValidationPipe`        | DTO validation via `class-validator`, strips unknown fields (`whitelist`), rejects unexpected fields (`forbidNonWhitelisted`) |
| **Env Validation**       | `class-validator` at startup   | Fail fast if required env vars are missing — no cryptic runtime errors                                                        |

### API Design

```
POST   /api/photos/upload-url    → Request presigned URL for direct R2 upload
POST   /api/photos               → Create photo record (after successful R2 upload)
GET    /api/photos               → List all photos with comments (newest first)
GET    /api/photos/:id           → Single photo with comments
POST   /api/photos/:id/comments  → Add comment to a photo
```

All responses follow a consistent envelope:

```json
// Success
{ "data": { ... }, "message": "Photo created successfully" }

// Error
{ "statusCode": 400, "timestamp": "...", "path": "/api/photos", "error": "..." }
```

---

## 3. Image Upload — Presigned URL Strategy

```
Client                          Server                     Cloudflare R2
  │                               │                             │
  │  1. POST /photos/upload-url   │                             │
  │  { filename, contentType }    │                             │
  │──────────────────────────────►│                             │
  │                               │  Generate presigned PUT URL │
  │  { url, key }                 │                             │
  │◄──────────────────────────────│                             │
  │                               │                             │
  │  2. PUT binary directly to R2 │                             │
  │──────────────────────────────────────────────────────────►  │
  │                               │                             │
  │  3. POST /photos              │                             │
  │  { key, filename, caption }   │                             │
  │──────────────────────────────►│  Store record in PostgreSQL │
  │                               │                             │
  │  { data: Photo }              │                             │
  │◄──────────────────────────────│                             │
```

**Why presigned URLs over multipart upload?**

| Concern       | Multipart (multer)                   | Presigned URL                            |
| ------------- | ------------------------------------ | ---------------------------------------- |
| Server memory | Buffers entire file in memory        | Zero file bytes touch the server         |
| Scalability   | Bottlenecked by API server bandwidth | Upload offloaded to R2 edge              |
| Security      | File bytes pass through server       | URL expires in 10 min, scoped to one key |
| Complexity    | Requires multer middleware, pipes    | Simple DTO validation only               |

---

## 4. Data Validation — Defense in Depth

### Backend (NestJS DTOs + class-validator)

- **`RequestUploadDto`**: `contentType` validated with `@Matches(/^image\/(jpeg|png|gif|webp)$/)` — only allowed MIME types.
- **`CreatePhotoDto`**: `key` and `filename` required, `caption` optional with `@MaxLength(500)`.
- **`CreateCommentDto`**: `content` required (non-empty), `author` optional.
- **Global pipe**: `whitelist: true` strips unexpected fields, `forbidNonWhitelisted: true` rejects them with a clear error.

### Frontend

- File type/size validation before initiating upload.
- Form validation before API calls — disabled submit buttons, inline error messages.
- Graceful handling of API errors with user-friendly messages.

---

## 5. Database Design — Prisma ORM

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

**Key decisions:**

- **`cuid()` IDs**: Non-sequential, URL-safe, collision-resistant — avoids enumeration attacks.
- **`onDelete: Cascade`**: Deleting a photo automatically removes its comments — referential integrity at the database level.
- **Optional fields** (`caption`, `author`) are nullable — no empty string workarounds.

---

## 6. Frontend Architecture — Next.js App Router

### Component Strategy

| Layer          | Pattern                      | Example                                                             |
| -------------- | ---------------------------- | ------------------------------------------------------------------- |
| Pages          | Server components by default | `app/page.tsx`, `app/photos/[id]/page.tsx`                          |
| Interactive UI | `"use client"` components    | `PhotoUploadForm.tsx`, `CommentForm.tsx`                            |
| API calls      | Centralized client           | `lib/api.ts` — typed `get`, `post`, `uploadPhoto`                   |
| UI library     | Ant Design                   | No custom UI primitives — leverage `Upload`, `Card`, `Form`, `List` |

### State Handling

- **Loading states**: Skeleton/spinner during data fetching.
- **Error states**: Error boundaries + inline error messages.
- **Empty states**: Meaningful "no photos yet" messaging.
- **Optimistic UI**: Immediate feedback on comment submission.

---

## 7. Environment & Configuration

### Startup Validation

Environment variables are validated at application startup using `class-validator`. If any required variable is missing, the server fails immediately with a descriptive error — no silent failures or undefined values at runtime.

### Required Variables

| Variable               | Purpose                           |
| ---------------------- | --------------------------------- |
| `DATABASE_URL`         | PostgreSQL connection string      |
| `R2_ACCOUNT_ID`        | Cloudflare account identifier     |
| `R2_ACCESS_KEY_ID`     | R2 API token key                  |
| `R2_SECRET_ACCESS_KEY` | R2 API token secret               |
| `R2_BUCKET_NAME`       | Target bucket for photo uploads   |
| `R2_PUBLIC_URL`        | Public CDN URL for serving images |
| `PORT`                 | Server port (default: 4000)       |

---

## 8. Developer Experience

| Practice               | Tool                                                   |
| ---------------------- | ------------------------------------------------------ |
| Formatting             | Prettier (consistent across all files)                 |
| Type checking          | TypeScript strict mode (`noEmit` lint task)            |
| Monorepo orchestration | Turborepo (`turbo dev` runs all apps concurrently)     |
| Database               | Docker Compose for PostgreSQL (`docker compose up -d`) |
| Hot reload             | NestJS `--watch` mode, Next.js fast refresh            |

### Local Setup (3 commands)

```bash
pnpm install
docker compose up -d
pnpm dev
```

---

## 9. Git Practices

- **Conventional commits**: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`
- **Atomic commits**: One logical change per commit.
- **Feature branches**: `feat/photo-upload`, `feat/comment-system`, `chore/docker-setup`
- **Meaningful messages**: Explain _why_, not just _what_.

---

## 10. Deployment Strategy

| Component     | Platform      | Reason                                                |
| ------------- | ------------- | ----------------------------------------------------- |
| Frontend      | Vercel        | Native Next.js support, edge CDN, zero-config         |
| Backend       | Railway       | Container hosting, auto-deploy from Git               |
| Database      | Neon          | Serverless PostgreSQL, branching, autoscaling to zero |
| Image Storage | Cloudflare R2 | S3-compatible, zero egress fees, global CDN           |

# 📸 Photo Upload & Comment

A full-stack monorepo application for uploading photos and adding comments, built with Next.js 14 and NestJS.

> **Live Demo:** _Deployed on Vercel (frontend) + Railway (backend) — see [Deployment](#-deployment) for details._

---

## ✨ Features

- **Photo Upload** — Direct browser-to-R2 uploads via presigned URLs (no server bottleneck)
- **Photo Gallery** — Browse all uploaded photos in a responsive grid
- **Photo Detail** — View full-size photos with their comment thread
- **Comments** — Add comments to any photo
- **Delete Photos** — Removes the image from R2 storage and cascades to all associated comments
- **Delete Comments** — Remove individual comments from a photo

## 🛠 Tech Stack

| Layer    | Technology                                      |
| -------- | ----------------------------------------------- |
| Frontend | Next.js 14 (App Router), TypeScript, Ant Design |
| Backend  | NestJS, TypeScript, Prisma ORM                  |
| Database | PostgreSQL (Neon serverless)                    |
| Storage  | Cloudflare R2 (S3-compatible, zero egress)      |
| Monorepo | pnpm workspaces, Turborepo                      |
| Quality  | ESLint, Prettier, Husky, commitlint             |

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Monorepo                           │
│                                                         │
│  apps/                                                  │
│  ├── web/            → Next.js 14 frontend (port 3000)  │
│  ├── server/         → NestJS backend API (port 4000)   │
│  │                                                      │
│  packages/                                              │
│  └── shared/         → Shared TypeScript types          │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

```
                    ┌──────────────┐
                    │   Browser    │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            │
       ┌────────────┐ ┌────────┐       │ Presigned URL
       │  Next.js   │ │ NestJS │◄──────┘ upload flow
       │  Frontend  │ │  API   │
       └────────────┘ └───┬────┘
                          │
                ┌─────────┼─────────┐
                ▼                   ▼
         ┌────────────┐    ┌──────────────┐
         │ PostgreSQL │    │ Cloudflare   │
         │   (Neon)   │    │     R2       │
         └────────────┘    └──────────────┘
```

**Upload flow:** The client requests a presigned URL from the API, uploads the image directly to Cloudflare R2 from the browser, then creates the photo record in the database — keeping the server lightweight and avoiding large file transfers through the API.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/) >= 8
- PostgreSQL instance (local or [Neon](https://neon.tech/) serverless)
- [Cloudflare R2](https://developers.cloudflare.com/r2/) bucket (for image storage)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd take-home-assignemnt

# Install dependencies
pnpm install
```

### Environment Variables

#### Backend (`apps/server/.env`)

```bash
cp apps/server/.env.example apps/server/.env
```

| Variable               | Description                         | Example                          |
| ---------------------- | ----------------------------------- | -------------------------------- |
| `DATABASE_URL`         | PostgreSQL connection string (Neon) | `postgresql://user:pass@host/db` |
| `R2_ACCOUNT_ID`        | Cloudflare account ID               | `abc123...`                      |
| `R2_ACCESS_KEY_ID`     | R2 API token key                    | `your-access-key`                |
| `R2_SECRET_ACCESS_KEY` | R2 API token secret                 | `your-secret-key`                |
| `R2_BUCKET_NAME`       | R2 bucket name                      | `photo-uploads`                  |
| `R2_PUBLIC_URL`        | Public CDN URL for serving images   | `https://pub-xxx.r2.dev`         |
| `PORT`                 | Server port (default: `4000`)       | `4000`                           |

#### Frontend (`apps/web/.env.local`)

```bash
cp apps/web/.env.example apps/web/.env.local
```

| Variable              | Description          | Default                     |
| --------------------- | -------------------- | --------------------------- |
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:4000/api` |

### Database Setup

```bash
# Push Prisma schema to the database
pnpm --filter @photo-app/server db:push
```

### Running

```bash
# Start both frontend and backend in development mode
pnpm dev
```

The frontend will be available at [http://localhost:3000](http://localhost:3000) and the API at [http://localhost:4000](http://localhost:4000).

## 📡 API Endpoints

| Method   | Endpoint                                   | Description                         |
| -------- | ------------------------------------------ | ----------------------------------- |
| `POST`   | `/api/photos/upload-url`                   | Request presigned URL for R2 upload |
| `POST`   | `/api/photos`                              | Create photo record                 |
| `GET`    | `/api/photos`                              | List all photos with comments       |
| `GET`    | `/api/photos/:id`                          | Get single photo with comments      |
| `DELETE` | `/api/photos/:id`                          | Delete photo (cascades comments)    |
| `POST`   | `/api/photos/:id/comments`                 | Add comment to a photo              |
| `DELETE` | `/api/photos/:photoId/comments/:commentId` | Delete a comment                    |

## 🧪 Testing

```bash
# Run backend unit tests
pnpm --filter @photo-app/server test
```

## 🚢 Deployment

| Service  | Platform                                                 |
| -------- | -------------------------------------------------------- |
| Frontend | [Vercel](https://vercel.com/)                            |
| Backend  | [Railway](https://railway.app/)                          |
| Database | [Neon](https://neon.tech/) (serverless PostgreSQL)       |
| Storage  | [Cloudflare R2](https://www.cloudflare.com/products/r2/) |

### Docker (Local)

```bash
docker compose up
```

## 📄 License

This project is licensed under the [MIT License](LICENSE).

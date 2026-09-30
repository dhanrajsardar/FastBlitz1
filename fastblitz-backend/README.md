# FastBlitz Backend

AI-powered short-form video generation and publishing platform backend.

## Features

- **User Authentication**: JWT-based auth with refresh tokens, RBAC
- **Workspace Management**: Multi-tenant workspaces with team collaboration
- **Social Media Integration**: OAuth for TikTok, Instagram, YouTube, LinkedIn, Reddit
- **AI Content Pipeline**: Website scraping → Brand analysis → Video generation via fal.ai
- **Blitz Swipe Queue**: Tinder-like approval workflow with monetization
- **Scheduling & Publishing**: Calendar view, multi-platform publishing
- **Analytics**: Real-time metrics collection and dashboard
- **Billing**: Stripe subscriptions with credit system

## Tech Stack

- **Runtime**: Node.js 20+ with TypeScript
- **Framework**: Fastify with TypeBox/Zod validation
- **Database**: PostgreSQL with Prisma ORM
- **Queue**: BullMQ (Redis) for background jobs
- **Real-time**: Socket.io for live updates
- **Storage**: S3-compatible (Cloudflare R2) + CDN
- **AI/ML**: OpenAI GPT-4o, fal.ai (Kling/Runway), ElevenLabs TTS
- **Payments**: Stripe
- **Deploy**: Docker + Railway

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- Redis 7+
- MinIO/S3-compatible storage (for local dev)

### Installation

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Start dependencies (PostgreSQL, Redis, MinIO)
docker-compose -f docker/docker-compose.yml up -d

# Run migrations
npm run prisma:migrate

# Seed database
npm run prisma:seed

# Start development server
npm run dev
```

### API Documentation

Visit `http://localhost:3000/docs` for Swagger/OpenAPI documentation.

## Project Structure

```
src/
├── config/           # Configuration (env, clients, constants)
├── modules/          # Feature modules
│   ├── auth/         # Authentication
│   ├── users/        # User profiles & credits
│   ├── workspaces/   # Team workspaces
│   ├── social/       # Social OAuth (5 platforms)
│   ├── campaigns/    # Campaign management
│   ├── generation/   # AI video generation
│   ├── content/      # Content library
│   ├── scheduling/   # Blitz swipe & calendar
│   ├── publishing/   # Multi-platform publishing
│   ├── analytics/    # Metrics collection
│   └── billing/      # Stripe subscriptions
├── shared/           # Shared utilities
│   ├── queue/        # BullMQ queues & workers
│   ├── events/       # Real-time events
│   ├── errors/       # Custom error classes
│   ├── middleware/   # Fastify middleware
│   ├── utils/        # Helper functions
│   └── socket/       # Socket.io setup
├── routes/           # Route registration
├── plugins/          # Fastify plugins
├── app.ts            # App factory
└── main.ts           # Entry point
```

## Key API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/me` - Current user

### Campaigns
- `POST /api/v1/campaigns` - Create campaign from URL
- `GET /api/v1/campaigns` - List campaigns
- `GET /api/v1/campaigns/:id` - Get campaign with progress

### Blitz (Swipe Queue)
- `GET /api/v1/blitz/cards` - Get swipeable cards
- `POST /api/v1/blitz/action` - Approve/reject card

### Scheduling
- `GET /api/v1/schedule` - Calendar view
- `POST /api/v1/schedule` - Create scheduled post
- `POST /api/v1/schedule/:id/publish-now` - Immediate publish

### Analytics
- `GET /api/v1/analytics/overview` - Workspace summary
- `GET /api/v1/analytics/posts` - Post-level metrics
- `GET /api/v1/analytics/trends` - Trending content

### Billing
- `GET /api/v1/billing/subscription` - Current subscription
- `POST /api/v1/billing/checkout` - Create Stripe checkout
- `POST /api/v1/billing/portal` - Create Stripe portal

## Environment Variables

See `.env.example` for all required variables.

Key variables:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` - JWT signing keys (min 32 chars)
- `ENCRYPTION_KEY` - AES-256-GCM key for token encryption (base64, 32 chars)
- `FAL_API_KEY` - fal.ai API key for video generation
- `STRIPE_SECRET_KEY` - Stripe secret key
- `OPENAI_API_KEY` - OpenAI API key for brand analysis
- `ELEVENLABS_API_KEY` - ElevenLabs API key for TTS

## Deployment

### Railway (Recommended)

1. Connect GitHub repo to Railway
2. Add PostgreSQL and Redis services
3. Set environment variables
4. Deploy

### Docker

```bash
# Build
docker build -f docker/Dockerfile -t fastblitz-backend .

# Run
docker run -p 3000:3000 --env-file .env fastblitz-backend
```

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

## License

MIT
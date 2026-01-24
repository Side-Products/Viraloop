# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Viraloop is an AI-powered platform for creating virtual influencers that automatically generate and post video content across TikTok, Instagram, and YouTube. Users create AI personas with custom appearance and voice, write scripts, and the system generates talking-head videos that can be scheduled for automated posting.

**Tech Stack:**
- **Frontend**: Next.js 15 with React 19, Redux for state management, Tailwind CSS
- **Backend**: Next.js API routes, MongoDB with Mongoose
- **AI Services**: Kie.ai (Nano Banana Pro for images), Replicate (Kling v2.1 for video), ElevenLabs (TTS)
- **Storage**: AWS S3 / Wasabi
- **Auth**: NextAuth.js with Google OAuth
- **Payments**: Stripe

## Plan & Review

### Before starting work
- Always in plan mode to make a plan
- After get the plan, make sure you Write the plan to .claude/tasks/TASK_NAME.md.
- The plan should be a detailed implementation plan and the reasoning behind them, as well as tasks broken down.
- If the task require external knowledge or certain package, also research to get latest knowledge (Use Task tool for research)
- Once you write the plan, firstly ask me to review it. Do not continue until I approve the plan.

### While implementing
- You should update the plan as you work.
- After you complete tasks in the plan, you should update and append detailed descriptions of the changes you made, so following tasks can be easily hand over to other engineers.

## Development Commands

```bash
npm run dev              # Start dev server on port 3001
npm run build            # Production build
npm run lint             # Run ESLint
npm run format           # Format with Prettier
npm run cron             # Run background cron jobs
```

## High-Level Architecture

### Multi-Tenancy & Team System

- Users belong to one or more **Teams**
- Resources (influencers, posts, schedules) belong to teams, not users
- Teams can override global API keys (OpenAI, Replicate, ElevenLabs, Kie.ai, AWS)

### Content Generation Pipeline

1. **Influencer Creation**:
   - User provides name, persona, niche
   - Portrait image generated via Nano Banana Pro (Kie.ai)
   - Video preview generated via Kling v2.1 (Replicate)
   - ElevenLabs voice selected

2. **Post Creation**:
   - User writes script + action prompt
   - **Stage 1 (TTS)**: Script → audio via ElevenLabs
   - **Stage 2 (Video)**: Image + audio + prompt → video via Kling
   - Progress tracked 0-100% with checkpoint system for resuming failed jobs

3. **Automated Posting**:
   - Schedule modes: one-time, recurring (hourly/daily/weekly), or loop
   - Per-platform OAuth tokens used for TikTok, Instagram, YouTube
   - Analytics synced back per platform

### Key Database Models

- **User** / **Team** / **Member** - Auth and multi-tenancy
- **Influencer** - Virtual persona with voice, image, video preview, connected social accounts
- **InfluencerImage** / **InfluencerVideo** - Generated media assets
- **Post** - Content with script, TTS stage, video stage, per-platform posting status
- **Schedule** - Posting schedules with execution history
- **Task** - Background job queue
- **YoutubeAuth** / **TiktokAuth** / **InstagramAuth** - Per-influencer OAuth tokens

### API Routes Organization

```
src/pages/api/
├── auth/              # NextAuth + registration
├── influencer/        # CRUD, image/video generation
│   └── [id]/accounts  # Social media connections
├── post/              # Post CRUD and generation
├── schedule/          # Schedule CRUD and execution
├── oauth/             # YouTube, TikTok, Instagram OAuth flows
├── youtube/           # YouTube upload
├── tiktok/            # TikTok upload
├── instagram/         # Instagram upload
├── team/              # Team management
├── tts/               # Voice generation
├── dashboard/         # Stats
└── datafast/          # Analytics tracking
```

### Backend Structure

- **Controllers** (`src/backend/controllers/`) - Business logic
- **Models** (`src/backend/models/`) - Mongoose schemas
- **Middlewares** (`src/backend/middlewares/`) - Auth, error handling
- **Modules** (`src/backend/modules/`) - AI integrations (imageGeneration, videoGeneration, tts)

### Redux Store

State slices: `influencerReducers`, `postReducers`, `scheduleReducers`, `socialReducers`

Location: `src/redux/`

### Background Jobs

Location: `cron/` directory - Task processing, schedule execution, token refresh

## Key AI Integrations

| Service | Model | Purpose |
|---------|-------|---------|
| Kie.ai | Nano Banana Pro | Portrait image generation |
| Replicate | Kling v2.1 | Video generation from image + prompt |
| ElevenLabs | Various voices | Text-to-speech |

## Important Patterns

1. **Async Generation**: All media generation is async with status tracking (pending → processing → completed/failed) and checkpoint system for resuming

2. **Multi-Platform Posting**: Single post can target multiple platforms, each with custom metadata and separate OAuth tokens

3. **Team-Level Overrides**: API keys configurable per team in Team model

4. **Schedule Types**:
   - One-time: Post at specific datetime
   - Recurring: Hourly/daily/weekly/custom intervals
   - Loop: Cycle through content queue continuously

## Environment Variables

**Required:**
- `MONGODB_URI`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `JWT_SECRET`
- `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`
- `SES_S3_AWS_ACCESS_KEY_ID`, `SES_S3_AWS_SECRET_ACCESS_KEY`, `AWS_BUCKET_NAME`
- `REPLICATE_API_TOKEN`, `KIE_AI_API_KEY`, `ELEVENLABS_API_KEY`

**Social OAuth:**
- `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET`
- `INSTAGRAM_APP_ID`, `INSTAGRAM_APP_SECRET`
- `YOUTUBE_CLIENT_ID`, `YOUTUBE_CLIENT_SECRET`

**Optional:**
- `OPENAI_API_KEY`, `STRIPE_SECRET_KEY`, `DATAFAST_API_KEY`

# FootLineBot

LINE Messaging Bot for Amateur Football Group Management

## Overview

FootLineBot is a LINE messaging bot that helps manage amateur football groups, handles weekly event registrations, tracks player positions/preferences, and automatically generates balanced team lineups.

## Features

- **User Management**: Players can register and set their position preferences
- **Group Management**: Create and manage football groups with multiple members
- **Event Scheduling**: Schedule weekly matches with configurable game types (5v5, 7v7, 11v11)
- **Registration System**: Players can register for events, with waitlist support
- **Lineup Generation**: Automatically generate balanced team lineups based on player ratings and positions
- **Rotation Management**: Track player rest to ensure fair play time
- **LINE Integration**: Full LINE Messaging API integration with webhook support

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **LINE Integration**: @line/bot-sdk
- **Validation**: Zod
- **Hosting**: Vercel (recommended)

## Prerequisites

Before setting up FootLineBot, ensure you have:

1. **Node.js 18+** - [Download](https://nodejs.org/)
2. **PostgreSQL database** - Local installation or cloud provider (Supabase, Neon, Railway, Vercel Postgres)
3. **LINE Developer Account** - [Sign up](https://developers.line.biz/)
4. **Git** - For version control

## Local Development Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd FootLineBot
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# LINE Bot Configuration
LINE_CHANNEL_ID=your_channel_id
LINE_CHANNEL_SECRET=your_channel_secret
LINE_ACCESS_TOKEN=your_access_token

# Database Configuration
DATABASE_URL="postgresql://user:password@localhost:5432/footlinebot?schema=public"

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_LINE_CHANNEL_ID=your_channel_id
```

### 4. Set up the database

Generate Prisma client and push schema to database:

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push
```

Alternatively, for migration-based setup:

```bash
npm run db:migrate
```

### 5. Run the development server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## LINE Developer Console Setup

### Step 1: Create a Provider

1. Go to [LINE Developers Console](https://developers.line.biz/console/)
2. Create a new provider (e.g., "FootLineBot")

### Step 2: Create a Messaging API Channel

1. Under your provider, click "Create a channel"
2. Select "Messaging API"
3. Fill in the required information:
   - Channel name: FootLineBot (or your preferred name)
   - Channel description: Football group management bot
   - Category: Entertainment > Sports
   - Subcategory: Football/Soccer
4. Agree to the terms and create the channel

### Step 3: Get Channel Credentials

After creating the channel, you'll find:

1. **Channel ID** - In Basic settings (starts with `2000...`)
2. **Channel Secret** - In Basic settings
3. **Access Token** - In Messaging API settings (click "Issue" to generate)

### Step 4: Configure Webhook

1. In Messaging API settings, set Webhook URL:
   ```
   https://your-domain.com/api/line/callback
   ```
   (Use `http://localhost:3000/api/line/callback` for local testing with ngrok)

2. Enable "Use webhook" toggle

3. Add your bot to a LINE group or chat to test the webhook

### Step 5: Set Up LINE Bot Basic ID (Optional)

For group invitations, you'll need the Bot Basic ID:
- Found in Messaging API settings (starts with `U...`)

## Database Setup

### Local PostgreSQL

1. Install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/) or use [PostgreSQL App](https://postgresapp.com/)

2. Create a database:
   ```bash
   createdb footlinebot
   ```

3. Update your `.env`:
   ```
   DATABASE_URL="postgresql://postgres:your_password@localhost:5432/footlinebot?schema=public"
   ```

### Cloud PostgreSQL (Recommended for Production)

**Supabase:**
```
DATABASE_URL="postgresql://postgres:your_password@your-project.supabase.co:5432/postgres?schema=public&sslmode=require"
```

**Neon:**
```
DATABASE_URL="postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/footlinebot?sslmode=require"
```

**Railway:**
```
DATABASE_URL="postgres://username:password@railway-host:port/footlinebot"
```

**Vercel Postgres:**
```
DATABASE_URL="postgres://username:password@aws.connect.psdb.cloud/footlinebot?sslmode=require"
```

## Deployment to Vercel

### Option 1: Deploy via Git (Recommended)

1. Push your code to GitHub/GitLab/Bitbucket

2. Go to [Vercel Dashboard](https://vercel.com/dashboard)

3. Click "Add New..." → "Project"

4. Import your repository

5. Configure Environment Variables:
   ```
   LINE_CHANNEL_ID = your_channel_id
   LINE_CHANNEL_SECRET = your_channel_secret
   LINE_ACCESS_TOKEN = your_access_token
   DATABASE_URL = your_production_database_url
   NEXT_PUBLIC_LINE_CHANNEL_ID = your_channel_id
   NEXT_PUBLIC_APP_URL = https://your-project.vercel.app
   ```

6. Click "Deploy"

### Option 2: Deploy via Vercel CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

Follow the prompts to configure environment variables.

### Post-Deployment Steps

1. Update LINE Webhook URL in LINE Developer Console:
   ```
   https://your-vercel-app.vercel.app/api/line/callback
   ```

2. Test the webhook by sending a message to your bot

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run database migrations |
| `npm run db:studio` | Open Prisma Studio |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/line/callback` | LINE webhook callback |
| GET/POST | `/api/groups` | List/Create groups |
| GET/PUT/DELETE | `/api/groups/[id]` | Get/Update/Delete group |
| GET/POST | `/api/events` | List/Create events |
| GET/PUT/DELETE | `/api/events/[id]` | Get/Update/Delete event |
| POST | `/api/events/[id]/register` | Register for event |
| DELETE | `/api/events/[id]/register` | Cancel registration |
| POST | `/api/events/[id]/lineup` | Generate lineup |
| GET | `/api/events/[id]/lineup` | Get lineup |
| GET/PUT | `/api/users/me` | Get/Update current user |

## LINE Bot Commands

| Command | Description |
|---------|-------------|
| `/start` | Initialize user profile |
| `/help` | Show help information |
| `/menu` | Show main menu |
| `/groups` | List your groups |
| `/register` | Register for an event |
| `/myprofile` | View/edit your profile |
| `/lineup` | View lineup for an event |

## Testing Commands

### Test Local Server

```bash
# Start development server
npm run dev

# Test API endpoints
curl http://localhost:3000/api/groups

# Test LINE webhook (use ngrok for local testing)
ngrok http 3000
```

### Test Production Build

```bash
# Build the application
npm run build

# Start production server
npm run start
```

### Database Studio

```bash
# Open Prisma Studio
npm run db:studio
```

## Troubleshooting Guide

### Common Issues

#### 1. "Cannot find module '@prisma/client'"

**Solution:**
```bash
npm run db:generate
```

#### 2. "Database connection failed"

**Solutions:**
- Verify DATABASE_URL is correct
- Check database server is running
- Ensure database exists
- For cloud databases, check IP whitelist

#### 3. "LINE webhook not working"

**Solutions:**
- Verify webhook URL is correct in LINE Developer Console
- Check webhook is enabled
- For local testing, use ngrok: `ngrok http 3000`
- Check Vercel function logs

#### 4. "Signature validation failed"

**Solutions:**
- Verify LINE_CHANNEL_SECRET is correct
- Check signature generation in `src/lib/line/signature.ts`
- Ensure webhook uses POST method

#### 5. "Prisma migration errors"

**Solutions:**
```bash
# Reset database (warning: deletes all data)
npm run db:push -- --force-reset

# Or create new migration
npm run db:migrate -- --name init
```

#### 6. "Build errors on Vercel"

**Solutions:**
- Ensure all environment variables are set in Vercel Dashboard
- Check Build Command in Vercel settings (should be `npm run build`)
- Verify Node.js version in package.json engines

### Debug Mode

Enable debug logging by adding to your `.env`:

```env
DEBUG=true
```

### Getting Help

- Check the [issues](https://github.com/your-repo/footlinebot/issues) page
- Review the code in `src/lib/line/` for LINE integration
- Check Prisma documentation for database issues

## Project Structure

```
FootLineBot/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── api/               # API routes
│   │   │   ├── line/          # LINE webhook
│   │   │   ├── groups/        # Group CRUD
│   │   │   ├── events/        # Event CRUD + registration + lineup
│   │   │   └── users/         # User management
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── globals.css        # Global styles
│   ├── lib/
│   │   ├── db/prisma.ts       # Database client
│   │   ├── line/client.ts     # LINE client
│   │   ├── line/signature.ts  # Signature validation
│   │   ├── line/handlers/     # LINE message handlers
│   │   └── utils.ts           # Utility functions
│   ├── types/
│   │   └── index.ts           # TypeScript types
│   └── services/
│       ├── user.service.ts
│       ├── group.service.ts
│       ├── event.service.ts
│       ├── registration.service.ts
│       └── lineup.service.ts
├── .env.example
├── package.json
├── tsconfig.json
├── next.config.js
├── vercel.json
└── README.md
```

## License

MIT

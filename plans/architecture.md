# FootLineBot - System Architecture Document

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [High-Level System Architecture](#2-high-level-system-architecture)
3. [Database Schema (PostgreSQL)](#3-database-schema-postgresql)
4. [API Route Structure](#4-api-route-structure)
5. [LINE Bot Conversation Flow](#5-line-bot-conversation-flow)
6. [Lineup Generation Algorithm](#6-lineup-generation-algorithm)
7. [Module/Folder Structure](#7-modulefolder-structure)
8. [Environment Variables](#8-environment-variables)
9. [Security Considerations](#9-security-considerations)

---

## 1. Project Overview

**Project Name:** FootLineBot  
**Type:** LINE Messaging Bot for Amateur Football Group Management  
**Core Functionality:** A LINE bot that manages amateur football groups, handles weekly event registrations, tracks player positions/preferences, and automatically generates balanced team lineups.  
**Target Users:** Amateur football group administrators and players

---

## 2. High-Level System Architecture

### 2.1 Architecture Diagram

```mermaid
graph TB
    subgraph "LINE Platform"
        LINE[LINE Messaging API]
        WEBHOOK[LINE Webhook]
    end

    subgraph "Vercel Platform"
        NEXT[Next.js App]
        
        subgraph "API Routes"
            LINE_CB[Line Callback<br/>/api/line/callback]
            API_GROUPS[Groups API<br/>/api/groups]
            API_EVENTS[Events API<br/>/api/events]
            API_REGISTRATIONS[Registrations API<br/>/api/registrations]
            API_LINEUPS[Lineups API<br/>/api/lineups]
            API_USERS[Users API<br/>/api/users]
        end
        
        subgraph "Services"
            LINE_SVC[LINE Bot Service]
            AUTH_SVC[Authentication Service]
            LINEUP_SVC[Lineup Generation Service]
            NOTIF_SVC[Notification Service]
        end
        
        subgraph "Lib"
            DB[Database Client]
            VALIDATOR[Request Validator]
            LOGGER[Logger]
        end
    end

    subgraph "Database"
        PG[(PostgreSQL)]
    end

    LINE --> WEBHOOK
    WEBHOOK --> LINE_CB
    LINE_CB --> LINE_SVC
    LINE_SVC --> AUTH_SVC
    LINE_SVC --> API_GROUPS
    LINE_SVC --> API_EVENTS
    API_GROUPS --> DB
    API_EVENTS --> DB
    API_REGISTRATIONS --> DB
    API_LINEUPS --> LINEUP_SVC
    API_LINEUPS --> DB
    DB --> PG
```

### 2.2 Component Responsibilities

| Component | Responsibility |
|-----------|----------------|
| LINE Messaging API | Receive user messages, send replies |
| Next.js API Routes | Handle HTTP requests, business logic |
| LINE Bot Service | Parse LINE events, handle commands |
| Authentication Service | Validate LINE signatures, user sessions |
| Lineup Generation Service | Generate balanced team lineups |
| Notification Service | Send LINE messages to users |
| Database Client | PostgreSQL connection management |

---

## 3. Database Schema (PostgreSQL)

### 3.1 Entity Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ GROUPS : "admins"
    USERS ||--o{ REGISTRATIONS : "registers"
    GROUPS ||--o{ EVENTS : "hosts"
    EVENTS ||--o{ REGISTRATIONS : "has"
    EVENTS ||--o{ TEAM_ASSIGNMENTS : "generates"
    EVENTS ||--o{ LINEUPS : "produces"
    USERS ||--o{ TEAM_ASSIGNMENTS : "assigned_to"
```

### 3.2 Table Definitions

#### 3.2.1 Users Table

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    line_user_id VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    position_1 VARCHAR(50) NOT NULL,  -- GK, DEF, MID, FWD
    position_2 VARCHAR(50),
    position_3 VARCHAR(50),
    rating DECIMAL(3,2) DEFAULT 5.00,
    total_matches INTEGER DEFAULT 0,
    total_played_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_line_id ON users(line_user_id);
```

#### 3.2.2 Groups Table

```sql
CREATE TABLE groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    country VARCHAR(100),
    admin_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    default_game_type VARCHAR(10) CHECK (default_game_type IN ('11', '7', '5')),
    tactics JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_groups_admin ON groups(admin_user_id);
```

#### 3.2.3 Group Members Table

```sql
CREATE TABLE group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(group_id, user_id)
);

CREATE INDEX idx_group_members_group ON group_members(group_id);
CREATE INDEX idx_group_members_user ON group_members(user_id);
```

#### 3.2.4 Events Table

```sql
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    title VARCHAR(255),
    event_date DATE NOT NULL,
    start_time TIME NOT NULL,
    total_duration_minutes INTEGER DEFAULT 90,
    minutes_per_match INTEGER DEFAULT 20,
    teams_count INTEGER DEFAULT 2,
    game_type VARCHAR(10) CHECK (game_type IN ('11', '7', '5')),
    max_players INTEGER,
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'closed', 'in_progress', 'completed', 'cancelled')),
    registration_deadline TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_events_group ON events(group_id);
CREATE INDEX idx_events_date ON events(event_date);
```

#### 3.2.5 Registrations Table

```sql
CREATE TABLE registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'registered' CHECK (status IN ('registered', 'waitlisted', 'cancelled', 'confirmed')),
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    UNIQUE(event_id, user_id)
);

CREATE INDEX idx_registrations_event ON registrations(event_id);
CREATE INDEX idx_registrations_user ON registrations(user_id);
```

#### 3.2.6 Team Assignments Table

```sql
CREATE TABLE team_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    team_number INTEGER NOT NULL,
    player_ids UUID[] DEFAULT '{}',
    substitutes UUID[] DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_team_assignments_event ON team_assignments(event_id);
```

#### 3.2.7 Lineups Table

```sql
CREATE TABLE lineups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    team_number INTEGER NOT NULL,
    position_assignments JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_lineups_event ON lineups(event_id);
```

#### 3.2.8 User Rest Logs Table (for rotation management)

```sql
CREATE TABLE user_rest_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    was_resting BOOLEAN DEFAULT FALSE,
    rest_reason VARCHAR(50),
    logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_rest_logs_user ON user_rest_logs(user_id);
CREATE INDEX idx_rest_logs_event ON user_rest_logs(event_id);
```

---

## 4. API Route Structure

### 4.1 Route Overview

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/line/callback` | LINE webhook callback | LINE Platform |
| GET/POST | `/api/groups` | List/Create groups | Authenticated |
| GET/PUT/DELETE | `/api/groups/[id]` | Get/Update/Delete group | Group Admin |
| POST | `/api/groups/[id]/members` | Add group member | Group Admin |
| DELETE | `/api/groups/[id]/members/[userId]` | Remove member | Group Admin |
| GET/POST | `/api/events` | List/Create events | Authenticated |
| GET/PUT/DELETE | `/api/events/[id]` | Get/Update/Delete event | Group Admin |
| POST | `/api/events/[id]/register` | Register for event | Authenticated |
| DELETE | `/api/events/[id]/register` | Cancel registration | Authenticated |
| POST | `/api/events/[id]/generate-lineup` | Generate lineup | Group Admin |
| GET | `/api/events/[id]/lineup` | Get current lineup | Group Member |
| GET/PUT | `/api/users/me` | Get/Update current user | Authenticated |
| GET | `/api/users/[id]` | Get user profile | Authenticated |
| GET | `/api/groups/[id]/members` | List group members | Group Member |

### 4.2 Request/Response Formats

#### 4.2.1 POST /api/groups

**Request:**
```json
{
  "name": "Sunday Football Club",
  "country": "Thailand",
  "defaultGameType": "7"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "name": "Sunday Football Club",
  "country": "Thailand",
  "defaultGameType": "7",
  "adminUserId": "uuid",
  "tactics": {},
  "createdAt": "2026-03-19T00:00:00Z"
}
```

#### 4.2.2 POST /api/events

**Request:**
```json
{
  "groupId": "uuid",
  "title": "Weekly Match",
  "eventDate": "2026-03-22",
  "startTime": "09:00",
  "totalDurationMinutes": 90,
  "minutesPerMatch": 20,
  "teamsCount": 2,
  "gameType": "7",
  "maxPlayers": 14,
  "registrationDeadline": "2026-03-21T18:00:00Z"
}
```

#### 4.2.3 POST /api/events/[id]/register

**Request:**
```json
{
  "notes": "Can play any position"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "eventId": "uuid",
  "userId": "uuid",
  "status": "registered",
  "registeredAt": "2026-03-19T10:00:00Z"
}
```

#### 4.2.4 PUT /api/users/me

**Request:**
```json
{
  "position1": "MID",
  "position2": "DEF",
  "position3": "FWD",
  "email": "user@email.com"
}
```

---

## 5. LINE Bot Conversation Flow

### 5.1 Command Flow Diagram

```mermaid
flowchart TD
    START[User sends message] --> CHECK{Command Type?}
    
    CHECK -->|/start| REG_CHECK{User registered?}
    REG_CHECK -->|No| ASK_NAME[Ask for name]
    ASK_NAME --> SAVE_USER[Create user profile]
    SAVE_USER --> SHOW_MENU[Show main menu]
    REG_CHECK -->|Yes| SHOW_MENU
    
    CHECK -->|/help| SHOW_HELP[Show help]
    SHOW_HELP --> SHOW_MENU
    
    CHECK -->|/menu| SHOW_MENU
    
    CHECK -->|/groups| LIST_GROUPS[List user's groups]
    LIST_GROUPS --> SHOW_GROUPS[Show group list with buttons]
    
    CHECK -->|/register| SELECT_EVENT[Select event]
    SELECT_EVENT --> CONFIRM_REG[Confirm registration]
    CONFIRM_REG --> REG_SUCCESS[Show success message]
    
    CHECK -->|/myprofile| SHOW_PROFILE[Show user profile]
    SHOW_PROFILE --> EDIT_PROFILE[Edit profile option]
    
    CHECK -->|/lineup| SELECT_EVENT2[Select event]
    SELECT_EVENT2 --> SHOW_LINEUP[Show lineup]
    
    CHECK -->|Rich Menu| RICH_ACTION{Rich menu action}
    RICH_ACTION -->|Register| /register flow
    RICH_ACTION -->|My Profile| /myprofile flow
    RICH_ACTION -->|Groups| /groups flow
    
    SHOW_MENU --> END
    
    style START fill:#b3e5fc
    style SHOW_MENU fill:#c8e6c9
    style END fill:#ffcdd2
```

### 5.2 Rich Menu Structure

```
┌─────────────────────────────────────────┐
│  [Register]  [My Profile]  [My Groups]  │
├─────────────────────────────────────────┤
│                                         │
│         Main Action Buttons             │
│      (context-based on state)           │
│                                         │
└─────────────────────────────────────────┘
```

### 5.3 Command Reference

| Command | Description | Parameters | Access |
|---------|-------------|------------|--------|
| `/start` | Initialize user | None | New User |
| `/help` | Show help | None | All |
| `/menu` | Show main menu | None | All |
| `/groups` | List groups | None | All |
| `/create-group` | Create new group | name, country | All |
| `/join-group` | Join group | group_code | All |
| `/events` | List events | [group_id] | All |
| `/register` | Register for event | event_id | All |
| `/myprofile` | View/edit profile | None | All |
| `/lineup` | View lineup | event_id | Group Member |
| `/generate-lineup` | Generate lineup | event_id | Group Admin |

---

## 6. Lineup Generation Algorithm

### 6.1 Algorithm Overview

The lineup generation algorithm creates balanced teams based on:
1. Player position preferences (ordered 1/2/3)
2. Player rating (skill level)
3. Game type (11v11, 7v7, 5v5)
4. Admin-defined tactics
5. Rest/rotation management

### 6.2 Position Mapping by Game Type

```javascript
const POSITION_MAPPINGS = {
  '11': {
    GK: 1,    // Goalkeeper
    CB: 4,    // Center Back
    LB: 1,    // Left Back
    RB: 1,    // Right Back
    CDM: 1,   // Defensive Mid
    CM: 2,    // Central Mid
    CAM: 1,   // Attacking Mid
    LW: 1,    // Left Wing
    RW: 1,    // Right Wing
    ST: 2     // Striker
  },
  '7': {
    GK: 1,
    CB: 2,
    CM: 2,
    CAM: 1,
    ST: 1
  },
  '5': {
    GK: 1,
    DEF: 1,
    MID: 2,
    FWD: 1
  }
};
```

### 6.3 Pseudocode

```
FUNCTION generateLineup(event, registrations):
    
    // 1. Filter confirmed registrations
    confirmed = registrations.filter(r => r.status === 'confirmed')
    
    // 2. Sort players by rating (descending)
    sortedPlayers = confirmed.sortByDescending(p => p.rating)
    
    // 3. Calculate rest rotations
    restRotation = calculateRestRotation(event.groupId, sortedPlayers)
    
    // 4. If more players than spots, mark some as substitutes
    maxPlayers = event.gameType * event.teamsCount
    IF sortedPlayers.length > maxPlayers:
        playingPlayers = sortedPlayers[0:maxPlayers]
        substitutes = sortedPlayers[maxPlayers:]
    ELSE:
        playingPlayers = sortedPlayers
        substitutes = []
    
    // 5. Group by primary position preference
    positionGroups = groupByPrimaryPosition(playingPlayers)
    
    // 6. Distribute players to teams balancing skill
    teams = createBalancedTeams(positionGroups, event.teamsCount)
    
    // 7. Assign specific positions within teams
    FOR each team IN teams:
        assignedPositions = assignPositions(team, event.gameType)
    
    // 8. Save to database
    FOR each team IN teams:
        saveTeamAssignment(event.id, team.number, team.players)
        saveLineup(event.id, team.number, team.positions)
    
    RETURN teams

FUNCTION calculateRestRotation(groupId, players):
    // Get last N events where player rested
    // Rotate fairly based on rest history
    // Consider: total played time, consecutive matches
    RETURN restMapping

FUNCTION createBalancedTeams(positionGroups, teamsCount):
    // Distribute players to minimize skill difference between teams
    // Use snake draft or balanced distribution algorithm
    // Ensure each team has required positions
    RETURN balancedTeams
```

### 6.4 Rest Management Rules

| Rule | Description |
|------|-------------|
| Max consecutive matches | Player rests after 3 consecutive matches |
| Min rest ratio | 1 rest per 4 matches played |
| Priority rests | Players with higher total minutes get priority |
| Skill preservation | Don't rest best players unless necessary |

---

## 7. Module/Folder Structure

### 7.1 Project Structure

```
footlinebot/
├── .env.local.example
├── .gitignore
├── next.config.js
├── package.json
├── tsconfig.json
├── README.md
│
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── line/
│   │   │   │   └── callback/
│   │   │   │       └── route.ts
│   │   │   ├── groups/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts
│   │   │   │       └── members/
│   │   │   │           ├── route.ts
│   │   │   │           └── [userId]/
│   │   │   │               └── route.ts
│   │   │   ├── events/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts
│   │   │   │       ├── register/
│   │   │   │       │   └── route.ts
│   │   │   │       └── lineup/
│   │   │   │           └── route.ts
│   │   │   ├── users/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   └── health/
│   │   │       └── route.ts
│   │   │
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Input.tsx
│   │   ├── line/
│   │   │   ├── LineupCard.tsx
│   │   │   ├── EventCard.tsx
│   │   │   └── GroupCard.tsx
│   │   └── layout/
│   │       └── Header.tsx
│   │
│   ├── lib/
│   │   ├── db/
│   │   │   ├── index.ts
│   │   │   ├── user.ts
│   │   │   ├── group.ts
│   │   │   ├── event.ts
│   │   │   ├── registration.ts
│   │   │   └── lineup.ts
│   │   ├── line/
│   │   │   ├── client.ts
│   │   │   ├── parser.ts
│   │   │   ├── handler.ts
│   │   │   └── messages.ts
│   │   ├── auth/
│   │   │   ├── signature.ts
│   │   │   └── session.ts
│   │   ├── lineup/
│   │   │   ├── generator.ts
│   │   │   ├── balancer.ts
│   │   │   └── rotator.ts
│   │   ├── utils/
│   │   │   ├── date.ts
│   │   │   ├── validation.ts
│   │   │   └── constants.ts
│   │   └── logger.ts
│   │
│   ├── services/
│   │   ├── user.service.ts
│   │   ├── group.service.ts
│   │   ├── event.service.ts
│   │   ├── registration.service.ts
│   │   └── notification.service.ts
│   │
│   ├── types/
│   │   ├── user.ts
│   │   ├── group.ts
│   │   ├── event.ts
│   │   ├── registration.ts
│   │   ├── lineup.ts
│   │   └── api.ts
│   │
│   └── constants/
│       ├── positions.ts
│       ├── game-types.ts
│       └── messages.ts
│
├── public/
│   └── images/
│       └── logo.png
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
└── tests/
    ├── lib/
    │   ├── lineup/
    │   │   └── generator.test.ts
    │   └── auth/
    │       └── signature.test.ts
    └── fixtures/
        └── users.json
```

### 7.2 Key Module Responsibilities

| Module | Responsibility |
|--------|----------------|
| `lib/db/*` | Database queries and ORM operations |
| `lib/line/*` | LINE SDK client, event parsing, message building |
| `lib/auth/*` | LINE signature validation, session management |
| `lib/lineup/*` | Lineup generation algorithms |
| `services/*` | Business logic layer |
| `types/*` | TypeScript type definitions |
| `constants/*` | Application constants |

---

## 8. Environment Variables

### 8.1 Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `LINE_CHANNEL_ID` | LINE Developer Channel ID | 1234567890 |
| `LINE_CHANNEL_SECRET` | LINE Developer Channel Secret | abcdef123456... |
| `LINE_ACCESS_TOKEN` | LINE Messaging API Access Token | AbCdEfGhIjKlMn... |
| `DATABASE_URL` | PostgreSQL connection string | postgres://user:pass@host:5432/db |
| `NEXT_PUBLIC_LINE_CHANNEL_ID` | Public channel ID for client | 1234567890 |

### 8.2 Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | development |
| `VERCEL_URL` | Vercel deployment URL | localhost:3000 |
| `LOG_LEVEL` | Logging level | info |
| `SESSION_SECRET` | Session encryption secret | random string |

### 8.3 Example .env.local

```bash
# LINE Configuration
LINE_CHANNEL_ID=1234567890
LINE_CHANNEL_SECRET=your_channel_secret_here
LINE_ACCESS_TOKEN=your_access_token_here
NEXT_PUBLIC_LINE_CHANNEL_ID=1234567890

# Database
DATABASE_URL=postgres://username:password@localhost:5432/footlinebot

# Application
NODE_ENV=development
LOG_LEVEL=debug
SESSION_SECRET=super-secret-session-key-change-in-production

# Vercel (auto-set)
VERCEL_URL=your-project.vercel.app
```

---

## 9. Security Considerations

### 9.1 LINE Signature Validation

```typescript
// lib/auth/signature.ts
import crypto from 'crypto';

export function validateLineSignature(
  body: string,
  channelSecret: string,
  signature: string
): boolean {
  const hash = crypto
    .createHmac('SHA256', channelSecret)
    .update(body, 'utf8')
    .digest('base64');
  
  return hash === signature;
}
```

### 9.2 Security Checklist

| Item | Implementation |
|------|----------------|
| LINE Signature Validation | Validate all webhook requests |
| Rate Limiting | Implement per-user rate limits |
| Input Validation | Validate all API inputs with Zod |
| SQL Injection | Use parameterized queries/Prisma |
| XSS Prevention | Sanitize user inputs |
| HTTPS Only | Force HTTPS in production |
| Environment Variables | Never commit secrets to git |
| Database Permissions | Use least-privilege database user |

### 9.3 API Security Flow

```mermaid
sequenceDiagram
    participant User as LINE User
    participant LINE as LINE Platform
    participant API as Next.js API
    participant DB as PostgreSQL
    
    User->>LINE: Send message
    LINE->>API: POST /api/line/callback
    Note over API: Validate signature
    API->>DB: Query/Create data
    DB-->>API: Return data
    API-->>LINE: Reply message
    LINE-->>User: Show reply
```

---

## Appendix A: Game Type Configurations

| Game Type | Total Players | Positions | Typical Duration |
|-----------|---------------|-----------|------------------|
| 11v11 | 22 | GK, 4 DEF, 4 MID, 2 FWD | 90 min |
| 7v7 | 14 | GK, 2 DEF, 3 MID, 1 FWD | 70 min |
| 5v5 | 10 | GK, 1 DEF, 2 MID, 1 FWD | 50 min |

---

## Appendix B: Position Priority Rules

1. **Primary Position (Position 1)**: Must be filled first
2. **Secondary Position (Position 2)**: Used if primary is filled
3. **Tertiary Position (Position 3)**: Emergency backup
4. **No Position**: Player can fill any position

---

*Document Version: 1.0*  
*Created: 2026-03-19*  
*Last Updated: 2026-03-19*

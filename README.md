# BIGBOSS Community — Multi-Language Bigg Boss Fan Ecosystem

> **High-Performance Unofficial Reality TV Fan Voting & Community Platform**  
> Covering **Bigg Boss Telugu, Tamil, Hindi, Kannada, Malayalam, Marathi & Bangla** with real-time fan polling, Monday-to-Friday nomination cycles, past weekly archives, and frictionless anonymous device participation.

---

## 🌟 The 4 Interconnected Product Pillars

BIGBOSS Community is an end-to-end reality show fan ecosystem designed around 4 core pillars:

1. **Multi-Language Bigg Boss Discovery:**
   - Seamless discovery across all regional editions: **Telugu, Tamil, Hindi, Kannada, Malayalam, Marathi, and Bangla**.
   - Data-driven show and season architecture allowing unlimited regional shows and historical editions.
   - Dynamic cinematic billboards with custom theme palettes: **Netflix-inspired Dark Theme** and **Amazon Prime Video-inspired Gradient Light Theme**.

2. **Authoritative Live Fan Voting:**
   - **Anonymous-First Voting:** Fans can immediately cast 1 daily vote per device/voter identity without any forced login or personal data collection.
   - **Authoritative Database Enforcement:** Powered by PostgreSQL unique constraints `(week_id, device_id, vote_date)` and atomic database transactions.
   - **Realtime Vote Broadcasts:** WebSockets stream live contestant vote percentages and community rankings instantly upon ballot submission.

3. **Fan Social Participation (Ephemeral Live Chat + Persistent Opinions):**
   - **Dual-Mode Discussion System:**
     - **Live Room Chat (Ephemeral):** In-memory sliding window for instant, high-frequency episode reactions. Keeps server memory clean without clogging historical database records.
     - **Community Opinions (Persistent):** Authenticated fan posts with threaded replies and 4 active reaction types: **Like (👍), Love (❤️), Agree (🤝), and Disagree (👎)**.
   - **Strict Privacy Model:** Public DTOs expose *only* anonymous nicknames (`Fan_4821`) and avatar accent colors. Private emails, OAuth provider IDs, and internal UUIDs are strictly kept confidential and never leaked.

4. **Historical Season & Eviction Archive:**
   - Complete multi-week nomination history, final vote totals, percentage breakdowns, and official eviction records.
   - Clear distinction between **Unofficial Fan Community Poll Standings** and **Official TV Broadcaster Results**.

---

## 🔒 Identity & Privacy Architecture

The platform implements a strict 3-layer identity model:

| Layer | Scope | Visibility | Example |
| :--- | :--- | :--- | :--- |
| **Internal User Identity** | Private DB Account | Backend Only | `b2f1505c-3a6d-495c-9c71-bdfcfa457106` |
| **Authentication Identity** | Google OAuth / Email | Private User Profile Only | `fan@example.com` |
| **Public Community Identity** | Site-wide Discussions | Public to All Fans | `Fan_4821` / Accent Color |

- **Zero-Barrier Guests:** New visitors receive a persistent browser device pass with an auto-generated nickname (`Fan_XXXX`) allowing immediate voting and live chat.
- **Guest-to-Authenticated Link:** When a user logs in via Google or account authentication, their device ID is linked via `user_device_links`. Their public nickname and voting history are retained without revealing their email or identity to other users.

---

## 🛠️ Admin Studio Control Center

The admin panel (`/admin`) provides full lifecycle management:
- **Show & Season Management:** Create and configure new regional shows, hosts, artwork, and seasons (`ongoing`, `upcoming`, `completed`).
- **Contestant Management:** Add contestants with photos, native script names, bio, and status (`in_house`, `evicted`, `winner`).
- **Weekly Nomination Polls:** Choose nominated contestants, set voting windows, launch polls, close polls, and declare eviction outcomes.
- **Community Moderation:** Review flagged content reports, hide inappropriate posts, pin community highlights, and resolve reports.
- **Security:** Protected by role-based JWT authentication (`role: admin`) and server-side authorization.

---

## 🏗️ Technical Architecture & Tech Stack

```mermaid
graph TD
    Client[Next.js 14 Web App - Netflix Dark & Prime Light] -->|REST API & Auth| GoAPI[Go 1.22 Server Service]
    Client -->|WebSockets Room Streaming| WSHub[Go WebSocket Hub]
    GoAPI -->|Pooled Queries & DDL Migrations| NeonDB[(Neon Serverless PostgreSQL)]
    GoAPI -->|Ephemeral Live Chat & Rate Limiting| InMemStore[Go Ephemeral Memory Store]
```

- **Frontend:** Next.js 14 (App Router), Vanilla CSS / Tailwind CSS, Lucide Icons, React Bits motion effects (`AuroraGlow`, `BlurText`, `PulseGlowBadge`, `SpotlightCard`).
- **Backend:** Go REST API + Gorilla WebSockets, JWT authentication (`HS256`), Token-Bucket Rate Limiter, and HTML-safe sanitization.
- **Database:** Neon Serverless PostgreSQL with PgBouncer connection pooling and embedded forward migrations (`go:embed`).

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js 18+ and npm
- Go 1.22+
- Neon PostgreSQL connection string (or local PostgreSQL 13+)

### 1. Clone & Configure Environment
```bash
git clone https://github.com/lokeshwarM/BIGBOSS.git
cd BIGBOSS

# Copy environment template
cp .env.example .env
```
Edit `.env` with your database credentials:
```env
PORT=8081
DATABASE_URL=postgresql://user:password@ep-sample.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
DEVICE_AUTH_SECRET=your_32_char_secret_key_here
ADMIN_SECRET=your_admin_secret_key
ADMIN_EMAILS=admin@bigboss.community
NEXT_PUBLIC_API_URL=http://localhost:8081/api
NEXT_PUBLIC_WS_URL=ws://localhost:8081/ws
```

### 2. Run Backend (Go)
```bash
cd backend
go run cmd/server/main.go
```
The backend automatically executes all embedded PostgreSQL migrations on startup and starts listening on port `8081`.

### 3. Run Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Verification

Run backend unit and integration tests:
```bash
cd backend
go test -v ./...
```
Tests verify:
- Authentication & JWT token generation / extraction
- Ephemeral chat sliding window and persistent social post models
- Reaction toggle and uniqueness constraints
- Token-bucket rate limiting across endpoints
- Role-based authorization on admin endpoints

---

## ⚖️ Legal Disclaimer
*BIGBOSS Community is an independent, non-commercial fan platform. It is not affiliated with, endorsed by, or sponsored by Viacom18, JioCinema, Disney+ Hotstar, Endemol Shine, Banijay, Star Maa, or any official Bigg Boss broadcaster. All trademarks and contestant images belong to their respective copyright holders.*

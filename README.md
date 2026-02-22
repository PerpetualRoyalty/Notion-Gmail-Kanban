# 🗂️ Notion-Gmail-Kanban

A bidirectional Kanban board that integrates with **Notion** and **Gmail** for unified task management with real-time syncing.

## Features

- 📥 Pull tasks from a Notion database (status, priority, due date)
- 📧 Parse Gmail labeled emails into Kanban cards automatically
- 🔄 Sync status changes back to Notion in real-time
- 🔔 Send Gmail notifications on key status changes or deadlines
- 🔐 OAuth 2.0 authentication — no credentials stored
- ⚡ <5 minute sync latency via webhooks + polling fallback

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React / Next.js |
| Middleware | Node.js (Express) |
| Queue | Redis + BullMQ |
| Notion Sync | Notion API v1 + Webhooks |
| Gmail Sync | Gmail API + Watch API |
| Auth | OAuth 2.0 |
| Deployment | Docker Compose |

## Quick Start

```bash
git clone https://github.com/PerpetualRoyalty/Notion-Gmail-Kanban.git
cd Notion-Gmail-Kanban
cp .env.example .env
# Fill in your credentials in .env
docker-compose up
```

## Environment Variables

See `.env.example` for all required variables.

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for full system design.

## 2-Week Pilot

See [docs/pilot-plan.md](./docs/pilot-plan.md) for the phased rollout plan.

## License

MIT

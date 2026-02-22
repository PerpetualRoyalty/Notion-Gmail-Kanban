# System Architecture

## High-Level Data Flow

```
Gmail (labeled emails)
       ↓  Push Notification (Gmail Watch API)
Middleware Service (Node.js / Express)
       ↓  Parse + Normalize
Kanban Board (React / Next.js)
       ↕  Bidirectional Sync
Notion Database (via Notion API + Webhooks)
       ↓  Status Change
Gmail Notification (via Gmail API send)
```

## Components

| Component | Technology | Role |
|---|---|---|
| Kanban Frontend | React / Next.js | Visual board, drag-and-drop |
| Middleware API | Node.js (Express) | Orchestrates sync logic |
| Notion Integration | Notion API v1 + Webhooks | Pull tasks, push status changes |
| Gmail Integration | Gmail API (OAuth 2.0) | Parse task emails, send notifications |
| Queue System | Redis + BullMQ | Rate limit handling, retry logic |
| Auth Layer | OAuth 2.0 | Secure token management |

## Sync Strategy

### Dual-Mode Sync
```
Primary:  Webhooks (Notion) + Watch API (Gmail) — near real-time
Fallback: Polling every 5 minutes — catches missed events
```

### Queue Architecture
```
Incoming Events → Redis Queue → Worker Pool (3 concurrent) → API Calls
                                     ↓
                              Failed? → Retry with backoff (1s, 2s, 4s, 8s)
                                     ↓
                              Dead Letter Queue → Alert + Manual Review
```

## Security Model

- OAuth 2.0 for both Google and Notion — no passwords stored
- Webhook signature validation — verify `X-Notion-Signature` header
- Token encryption — AES-256 at rest in environment secrets
- Scoped permissions — minimum required Gmail scopes only
- HTTPS only — all webhook endpoints behind TLS

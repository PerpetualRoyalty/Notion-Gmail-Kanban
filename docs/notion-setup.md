# Notion Setup Guide

## 1. Create a Notion Integration

1. Go to https://www.notion.so/my-integrations
2. Click **New Integration**
3. Name it `Kanban Sync`
4. Select your workspace
5. Set capabilities: **Read content**, **Update content**, **Insert content**
6. Copy the **Internal Integration Token** → set as `NOTION_TOKEN` in `.env`

## 2. Prepare Your Database

Create a new Notion database (or use existing) with these properties:

| Property Name | Type | Notes |
|---|---|---|
| Name | Title | Task title |
| Status | Select | Options: Backlog, In Progress, In Review, Completed, Archived |
| Priority | Select | Options: Urgent, High, Medium, Low |
| Due Date | Date | |
| Source | Select | Options: notion, gmail, manual |
| Gmail Thread ID | Rich Text | Populated automatically from Gmail sync |
| Last Synced | Date | Updated by middleware on each sync |

## 3. Share Database with Integration

1. Open the database in Notion
2. Click **...** → **Connections** → **Add connection**
3. Select `Kanban Sync`

## 4. Get Database ID

From the database URL:
```
https://www.notion.so/YOUR-WORKSPACE/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx?v=...
                                     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                     This is your Database ID
```
Set as `NOTION_DATABASE_ID` in `.env`.

## 5. Register Webhook

```bash
curl -X POST https://api.notion.com/v1/webhooks \
  -H "Authorization: Bearer $NOTION_TOKEN" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-middleware-url.com/webhooks/notion",
    "subscribed_events": ["page.created", "page.updated", "database.updated"]
  }'
```

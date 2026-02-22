# Gmail Setup Guide

## 1. Enable Gmail API

1. Go to https://console.cloud.google.com
2. Create or select a project
3. Navigate to **APIs & Services** → **Enable APIs**
4. Enable **Gmail API** and **Cloud Pub/Sub API**

## 2. Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client ID**
3. Application type: **Web application**
4. Add authorized redirect URI: `http://localhost:3001/auth/google/callback`
5. Download credentials → extract `client_id` and `client_secret` → set in `.env`

## 3. Required OAuth Scopes

```
https://www.googleapis.com/auth/gmail.readonly
https://www.googleapis.com/auth/gmail.send
https://www.googleapis.com/auth/gmail.labels
https://www.googleapis.com/auth/gmail.modify
```

## 4. Create Gmail Label

1. In Gmail, go to **Settings** → **Labels** → **Create new label**
2. Name it: `task-inbox`
3. Set up a filter: emails matching `[TASK]` in subject → apply label `task-inbox`

## 5. Set Up Cloud Pub/Sub

```bash
# Create topic
gcloud pubsub topics create gmail-tasks

# Grant Gmail publish permission
gcloud pubsub topics add-iam-policy-binding gmail-tasks \
  --member=serviceAccount:gmail-api-push@system.gserviceaccount.com \
  --role=roles/pubsub.publisher

# Create push subscription pointing to your middleware
gcloud pubsub subscriptions create gmail-tasks-sub \
  --topic=gmail-tasks \
  --push-endpoint=https://your-middleware-url.com/webhooks/gmail
```

## 6. Email Format for Auto-Parsing

For best task detection, format emails as:
```
Subject: [TASK] Brief task description

Due by: 2026-03-15
Priority: High

Task details and context here...
```

require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Worker } = require('bullmq');
const { initWebSocket } = require('./websocket');
const webhookRoutes = require('./routes/webhooks');
const authRoutes = require('./routes/auth');
const tasksRoutes = require('./routes/tasks');
const { processNotionUpdate } = require('./notion');
const { startPollingFallback } = require('./sync');
const redis = { url: process.env.REDIS_URL };

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());

// Routes
app.use('/webhooks', webhookRoutes);
app.use('/auth', authRoutes);
app.use('/api/tasks', tasksRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// WebSocket (real-time push to frontend)
initWebSocket(server);

// BullMQ Workers
new Worker('notion-updates', async (job) => {
  await processNotionUpdate(job.data);
  console.log(`[Worker] Notion update processed: ${job.data.pageId}`);
}, { connection: redis, concurrency: 3 });

new Worker('gmail-notifications', async (job) => {
  const { google } = require('googleapis');
  const { getOAuthClient } = require('./gmail');
  const auth = getOAuthClient(job.data.tokens);
  const gmail = google.gmail({ version: 'v1', auth });
  const { task, newStatus } = job.data;
  const subject = `[Kanban Update] "${task.title}" moved to ${newStatus}`;
  const body = `Task: ${task.title}\nNew Status: ${newStatus}\nDue: ${task.dueDate || 'N/A'}\nPriority: ${task.priority}`;
  const raw = Buffer.from(
    `To: ${task.assignee}\nSubject: ${subject}\nContent-Type: text/plain\n\n${body}`
  ).toString('base64url');
  await gmail.users.messages.send({ userId: 'me', requestBody: { raw } });
  console.log(`[Worker] Gmail notification sent for task: ${task.title}`);
}, { connection: redis, concurrency: 2 });

// Polling fallback (every 5 min)
if (process.env.NOTION_DATABASE_ID) {
  startPollingFallback(process.env.NOTION_DATABASE_ID);
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Middleware running on port ${PORT}`));

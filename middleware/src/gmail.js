const { google } = require('googleapis');
const { Queue } = require('bullmq');

const gmailQueue = new Queue('gmail-notifications', { connection: { url: process.env.REDIS_URL } });

/**
 * Create an OAuth2 client from stored tokens
 */
function getOAuthClient(tokens) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  oauth2Client.setCredentials(tokens);
  return oauth2Client;
}

/**
 * Register Gmail Watch API for push notifications on a label
 */
async function watchGmailLabel(auth, labelId) {
  const gmail = google.gmail({ version: 'v1', auth });
  const response = await gmail.users.watch({
    userId: 'me',
    requestBody: {
      labelIds: [labelId],
      topicName: process.env.GOOGLE_PUBSUB_TOPIC
    }
  });
  console.log(`Gmail Watch registered. Expires: ${new Date(Number(response.data.expiration)).toISOString()}`);
  // Schedule renewal 1 day before expiration (Watch API expires every 7 days)
  const renewIn = Number(response.data.expiration) - Date.now() - 86400000;
  setTimeout(() => watchGmailLabel(auth, labelId), renewIn);
  return response.data;
}

/**
 * Parse a Gmail message into a KanbanCard shape
 */
function parseTaskEmail(message) {
  const headers = message.payload.headers;
  const subject = headers.find(h => h.name === 'Subject')?.value || '';
  const from = headers.find(h => h.name === 'From')?.value || '';
  const body = decodeEmailBody(message.payload);

  return {
    title: extractTaskTitle(subject),
    priority: detectPriority(subject, body),
    dueDate: extractDueDate(body),
    source: 'gmail',
    gmailThreadId: message.threadId,
    gmailMessageId: message.id,
    assignee: from,
    lastSynced: new Date().toISOString()
  };
}

/**
 * Queue a status notification email
 */
async function sendStatusNotification(auth, task, newStatus) {
  await gmailQueue.add('send-notification', { tokens: auth.credentials, task, newStatus }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 }
  });
}

// --- Helpers ---

function extractTaskTitle(subject) {
  return subject.replace(/^\[(TASK|TODO|ACTION)\]\s*/i, '').trim();
}

function detectPriority(subject, body) {
  const text = `${subject} ${body}`.toLowerCase();
  if (text.includes('urgent') || text.includes('asap')) return 'urgent';
  if (text.includes('high priority') || text.includes('high-priority')) return 'high';
  if (text.includes('low priority') || text.includes('low-priority')) return 'low';
  return 'medium';
}

function extractDueDate(body) {
  const patterns = [
    /due[:\s]+([\d\/\-]+)/i,
    /deadline[:\s]+([\d\/\-]+)/i,
    /by ([A-Z][a-z]+ \d{1,2}(?:,? \d{4})?)/i
  ];
  for (const pattern of patterns) {
    const match = body.match(pattern);
    if (match) return new Date(match[1]).toISOString().split('T')[0];
  }
  return null;
}

function decodeEmailBody(payload) {
  if (payload.body?.data) {
    return Buffer.from(payload.body.data, 'base64').toString('utf-8');
  }
  if (payload.parts) {
    const textPart = payload.parts.find(p => p.mimeType === 'text/plain');
    if (textPart?.body?.data) {
      return Buffer.from(textPart.body.data, 'base64').toString('utf-8');
    }
  }
  return '';
}

module.exports = { getOAuthClient, watchGmailLabel, parseTaskEmail, sendStatusNotification };

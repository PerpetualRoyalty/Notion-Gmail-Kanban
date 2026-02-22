const { Client } = require('@notionhq/client');
const { Queue } = require('bullmq');

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const notionQueue = new Queue('notion-updates', { connection: { url: process.env.REDIS_URL } });

/**
 * Fetch all non-archived tasks from the Notion database
 */
async function fetchNotionTasks(databaseId) {
  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: 'Status',
      select: { does_not_equal: 'Archived' }
    },
    sorts: [{ property: 'Due Date', direction: 'ascending' }]
  });
  return response.results.map(normalizeNotionPage);
}

/**
 * Update Notion page status when a Kanban card is moved
 */
async function updateNotionStatus(pageId, newStatus) {
  await notionQueue.add('update-status', { pageId, newStatus }, {
    attempts: 4,
    backoff: { type: 'exponential', delay: 1000 }
  });
}

/**
 * Worker: process queued Notion status updates
 */
async function processNotionUpdate({ pageId, newStatus }) {
  await notion.pages.update({
    page_id: pageId,
    properties: {
      Status: { select: { name: newStatus } },
      'Last Synced': { date: { start: new Date().toISOString() } }
    }
  });
}

/**
 * Normalize a Notion page result into a KanbanCard shape
 */
function normalizeNotionPage(page) {
  const props = page.properties;
  return {
    id: page.id,
    title: props.Name?.title?.[0]?.plain_text || 'Untitled',
    status: props.Status?.select?.name || 'Inbox',
    priority: props.Priority?.select?.name || 'Medium',
    dueDate: props['Due Date']?.date?.start || null,
    source: 'notion',
    notionPageId: page.id,
    lastSynced: new Date().toISOString()
  };
}

/**
 * Validate incoming Notion webhook signature
 */
function validateNotionWebhook(req) {
  const signature = req.headers['x-notion-signature'];
  const expected = require('crypto')
    .createHmac('sha256', process.env.NOTION_WEBHOOK_SECRET)
    .update(JSON.stringify(req.body))
    .digest('hex');
  return signature === `sha256=${expected}`;
}

module.exports = { fetchNotionTasks, updateNotionStatus, processNotionUpdate, validateNotionWebhook };

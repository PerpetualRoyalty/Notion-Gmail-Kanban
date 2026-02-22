const express = require('express');
const router = express.Router();
const { validateNotionWebhook, processNotionUpdate } = require('../notion');
const { parseTaskEmail } = require('../gmail');
const { broadcastUpdate } = require('../websocket');

/**
 * POST /webhooks/notion
 * Receives Notion webhook events
 */
router.post('/notion', (req, res) => {
  if (!validateNotionWebhook(req)) {
    return res.status(401).json({ error: 'Invalid webhook signature' });
  }

  const { type, entity, data } = req.body;
  res.sendStatus(200); // Acknowledge immediately

  // Process asynchronously
  setImmediate(async () => {
    try {
      if (type === 'page.updated' || type === 'page.created') {
        broadcastUpdate({ event: 'notion:sync', pageId: entity.id, data });
      }
    } catch (err) {
      console.error('Notion webhook processing error:', err);
    }
  });
});

/**
 * POST /webhooks/gmail
 * Receives Gmail Pub/Sub push notifications
 */
router.post('/gmail', async (req, res) => {
  const message = req.body?.message;
  if (!message) return res.sendStatus(400);

  res.sendStatus(200); // Acknowledge immediately

  setImmediate(async () => {
    try {
      const data = JSON.parse(Buffer.from(message.data, 'base64').toString());
      const { emailAddress, historyId } = data;
      broadcastUpdate({ event: 'gmail:new-email', emailAddress, historyId });
    } catch (err) {
      console.error('Gmail webhook processing error:', err);
    }
  });
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const { watchGmailLabel } = require('../gmail');

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.labels',
  'https://www.googleapis.com/auth/gmail.modify'
];

// In-memory token store (replace with encrypted DB in production)
let storedTokens = null;

function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

// Step 1: Redirect to Google consent screen
router.get('/google', (req, res) => {
  const auth = getOAuth2Client();
  const url = auth.generateAuthUrl({ access_type: 'offline', scope: SCOPES, prompt: 'consent' });
  res.redirect(url);
});

// Step 2: Handle OAuth callback
router.get('/google/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const auth = getOAuth2Client();
    const { tokens } = await auth.getToken(code);
    storedTokens = tokens;
    auth.setCredentials(tokens);

    // Start Gmail Watch on task-inbox label
    const gmail = google.gmail({ version: 'v1', auth });
    const labelsRes = await gmail.users.labels.list({ userId: 'me' });
    const label = labelsRes.data.labels.find(l => l.name === (process.env.GMAIL_LABEL || 'task-inbox'));
    if (label) await watchGmailLabel(auth, label.id);

    res.redirect(`${process.env.FRONTEND_URL}?auth=success`);
  } catch (err) {
    console.error('OAuth error:', err);
    res.redirect(`${process.env.FRONTEND_URL}?auth=error`);
  }
});

router.get('/status', (req, res) => {
  res.json({ authenticated: !!storedTokens });
});

module.exports = router;

const { fetchNotionTasks } = require('./notion');
const { broadcastUpdate } = require('./websocket');

let pollingInterval = null;

/**
 * Start polling fallback (every 5 minutes)
 * Used when webhooks miss events
 */
function startPollingFallback(databaseId) {
  if (pollingInterval) clearInterval(pollingInterval);
  
  pollingInterval = setInterval(async () => {
    try {
      const tasks = await fetchNotionTasks(databaseId);
      broadcastUpdate({ event: 'notion:full-sync', tasks });
      console.log(`[Poll] Synced ${tasks.length} tasks from Notion`);
    } catch (err) {
      console.error('[Poll] Sync error:', err);
    }
  }, 5 * 60 * 1000); // 5 minutes

  console.log('Polling fallback started (5 min interval)');
}

function stopPollingFallback() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
}

module.exports = { startPollingFallback, stopPollingFallback };

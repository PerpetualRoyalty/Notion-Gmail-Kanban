const express = require('express');
const router = express.Router();
const { fetchNotionTasks, updateNotionStatus } = require('../notion');

// GET /api/tasks — fetch all tasks from Notion
router.get('/', async (req, res) => {
  try {
    const tasks = await fetchNotionTasks(process.env.NOTION_DATABASE_ID);
    res.json(tasks);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// PATCH /api/tasks/:id/status — update task status
router.patch('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'status is required' });
  try {
    await updateNotionStatus(id, status);
    res.json({ success: true, id, status });
  } catch (err) {
    console.error('Error updating status:', err);
    res.status(500).json({ error: 'Failed to update task status' });
  }
});

module.exports = router;

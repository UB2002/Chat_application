const express = require('express');
const db = require("../db/config");
const router = express.Router();


// GET /api/messages/:contactId
// The parameter name in the URL now matches the variable name below.
router.get('/:contactId', async (req, res) => {
  try {
    const contactId = parseInt(req.params.contactId, 10);
    const userId = req.user.id;

    if (isNaN(contactId)) {
      return res.status(400).json({ error: 'Invalid contact ID.' });
    }

    const { rows } = await db.query(
      'SELECT * FROM messages WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1) ORDER BY timestamp ASC LIMIT 50',
      [userId, contactId]
    );
    res.json(rows);
  } catch (err) {
    console.error('get messages error:', err);
    res.status(500).json({ error: 'Server error while fetching messages' });
  }
});


// POST /api/messages
router.post('/', async (req, res) => {
  try {
    const { receiver_id, message } = req.body;
    const { rows } = await db.query(
      'INSERT INTO messages (sender_id, receiver_id, message) VALUES ($1, $2, $3) RETURNING *',
      [req.user.id, receiver_id, message]
    );
    console.log(rows);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('post message error:', err);
    res.status(500).json({ error: 'Server error while sending message' });
  }
});

module.exports = router;

require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const path = require('path');

const Message = require('./models/Message');

const app = express();
app.use(express.json({ limit: '5mb' }));
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: process.env.FRONTEND_URL || '*' } });

io.on('connection', socket => {
  console.log('Socket connected:', socket.id);
  socket.on('disconnect', () => console.log('Socket disconnected:', socket.id));
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connect error:', err.message);
    process.exit(1);
  });

/**
 * Utilities: parse the incoming webhook 'value' object that matches your sample.
 * Handles: contacts[], messages[], metadata, and also common status updates (value.statuses)
 */
async function handleWebhookValue(value) {
  // get contact info if present
  const contact = (value.contacts && value.contacts[0]) || null;
  const profileName = contact?.profile?.name || null;
  const wa_id = contact?.wa_id || null;
  const metadata = value.metadata || {};

  // if statuses array exists (some whatsapp webhooks use value.statuses for status updates)
  if (Array.isArray(value.statuses) && value.statuses.length) {
    for (const s of value.statuses) {
      const refId = s?.id || s?.message_id || s?.wa_id || s?.recipient_id || null;
      const status = s?.status || s?.status_name || s?.delivery_status || null;
      // try to update messages that match message_id or meta_msg_id
      if (refId && status) {
        await Message.updateMany(
          { $or: [{ message_id: refId }, { meta_msg_id: refId }] },
          { $set: { status } }
        );
        const one = await Message.findOne({ $or: [{ message_id: refId }, { meta_msg_id: refId }] });
        if (one) io.emit('update_status', one);
      }
    }
  }

  // messages array (incoming messages)
  if (Array.isArray(value.messages)) {
    for (const m of value.messages) {
      const msgId = m?.id || null;
      const text = m?.text?.body || (m?.body && m.body.text) || '';
      const ts = m?.timestamp ? new Date(Number(m.timestamp) * 1000) : (m?.timestamp_ms ? new Date(Number(m.timestamp_ms)) : new Date());
      const incoming = {
        wa_id: wa_id || m?.from || 'unknown',
        message_id: msgId,
        meta_msg_id: m?.meta_msg_id || null,
        text,
        attachments: m?.attachments || [],
        from_me: false,
        status: 'sent',
        timestamp: ts,
        name: profileName || null,
        number: wa_id || m?.from || null
      };

      // dedupe by message_id/meta_msg_id
      const query = [];
      if (incoming.message_id) query.push({ message_id: incoming.message_id });
      if (incoming.meta_msg_id) query.push({ meta_msg_id: incoming.meta_msg_id });

      if (query.length) {
        const existing = await Message.findOne({ $or: query });
        if (existing) {
          // update stored doc with any new data (text/status)
          await Message.updateOne({ _id: existing._id }, { $set: incoming });
          const updated = await Message.findById(existing._id);
          io.emit('new_message', updated);
        } else {
          const created = await Message.create(incoming);
          io.emit('new_message', created);
        }
      } else {
        // no ID -> create anyway (best effort)
        const created = await Message.create(incoming);
        io.emit('new_message', created);
      }
    }
  }
}

/**
 * Top-level webhook route - accepts the full payload you pasted
 * Accepts single object or array of payloads.
 */
app.post('/api/webhook', async (req, res) => {
  const body = req.body;

  const handlePayload = async (p) => {
    // flexible: your sample wraps data under metaData.entry[].changes[].value
    const metaData = p?.metaData || p?.metadata || null;
    if (metaData && Array.isArray(metaData.entry)) {
      for (const entry of metaData.entry) {
        const changes = entry?.changes || [];
        for (const c of changes) {
          const value = c?.value || c?.messages || c?.valueOf?.() || null;
          if (value) {
            await handleWebhookValue(value);
          }
        }
      }
    } else {
      // fallback: maybe the object is already the 'value'
      const value = p?.value || p;
      await handleWebhookValue(value);
    }
  };

  try {
    if (Array.isArray(body)) {
      for (const p of body) await handlePayload(p);
    } else {
      await handlePayload(body);
    }
    res.json({ ok: true });
  } catch (err) {
    console.error('webhook processing error', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * Conversations - group by wa_id, return last message + count
 */
app.get('/api/conversations', async (req, res) => {
  try {
    const convs = await Message.aggregate([
      { $sort: { timestamp: -1 } },
      { $group: {
        _id: '$wa_id',
        lastMessage: { $first: '$$ROOT' },
        count: { $sum: 1 }
      }},
      { $project: { wa_id: '$_id', lastMessage: 1, count: 1, _id: 0 } },
      { $sort: { 'lastMessage.timestamp': -1 } }
    ]);
    res.json(convs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
});

/**
 * Get messages for a conversation
 */
app.get('/api/conversations/:wa_id/messages', async (req, res) => {
  try {
    const wa_id = decodeURIComponent(req.params.wa_id);
    const messages = await Message.find({ wa_id }).sort({ timestamp: 1 }).lean();
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
});

/**
 * Send message (UI) - saves only
 */
app.post('/api/messages', async (req, res) => {
  try {
    const { wa_id, text, name, number } = req.body;
    if (!wa_id || !text) return res.status(400).json({ error: 'wa_id_and_text_required' });
    const msg = await Message.create({
      wa_id,
      from_me: true,
      text,
      status: 'sent',
      timestamp: new Date(),
      name: name || null,
      number: number || null
    });
    io.emit('new_message', msg);
    res.json(msg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
});

/**
 * Optional: update message status manually (useful for testing)
 * body: { message_id, status }
 */
app.post('/api/messages/update-status', async (req, res) => {
  try {
    const { message_id, meta_msg_id, status } = req.body;
    if (!status || (!message_id && !meta_msg_id)) return res.status(400).json({ error: 'message_id_or_meta_msg_id_and_status_required' });
    const query = [];
    if (message_id) query.push({ message_id });
    if (meta_msg_id) query.push({ meta_msg_id });
    const result = await Message.updateMany({ $or: query }, { $set: { status } });
    const one = await Message.findOne({ $or: query });
    if (one) io.emit('update_status', one);
    res.json({ ok: true, matched: result.matchedCount || result.n || 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
});


app.get('/api/health', (req, res) => res.json({ ok: true }));


if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'frontend', 'dist')));
  app.get('*', (req, res) => res.sendFile(path.join(__dirname, '..', 'frontend', 'dist', 'index.html')));
}

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server listening on ${PORT}`));

module.exports = { app, io };

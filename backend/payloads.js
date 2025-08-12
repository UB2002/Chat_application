// Usage: node scripts/process_payloads.js ./payloads
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const mongoose = require('mongoose');
const Message = require('./models/Message')
const dir = process.argv[2] || path.join(__dirname, '..', 'data');

async function handleWebhookValue(value) {
  const contact = (value.contacts && value.contacts[0]) || null;
  const profileName = contact?.profile?.name || null;
  const wa_id = contact?.wa_id || null;

  if (Array.isArray(value.statuses) && value.statuses.length) {
    for (const s of value.statuses) {
      const refId = s?.id || s?.message_id || null;
      const status = s?.status || null;
      if (refId && status) {
        await Message.updateMany(
          { $or: [{ message_id: refId }, { meta_msg_id: refId }] },
          { $set: { status } }
        );
      }
    }
  }

  if (Array.isArray(value.messages)) {
    for (const m of value.messages) {
      const msgId = m?.id || null;
      const text = m?.text?.body || (m?.body && m.body.text) || '';
      const ts = m?.timestamp ? new Date(Number(m.timestamp) * 1000) : new Date();
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

      const query = [];
      if (incoming.message_id) query.push({ message_id: incoming.message_id });
      if (incoming.meta_msg_id) query.push({ meta_msg_id: incoming.meta_msg_id });

      if (query.length) {
        const existing = await Message.findOne({ $or: query });
        if (existing) {
          await Message.updateOne({ _id: existing._id }, { $set: incoming });
        } else {
          await Message.create(incoming);
        }
      } else {
        await Message.create(incoming);
      }
    }
  }
}

async function handlePayload(p) {
  const metaData = p?.metaData || p?.metadata || null;
  if (metaData && Array.isArray(metaData.entry)) {
    for (const entry of metaData.entry) {
      const changes = entry?.changes || [];
      for (const c of changes) {
        const value = c?.value || c;
        if (value) {
          await handleWebhookValue(value);
        }
      }
    }
  } else {
    await handleWebhookValue(p?.value || p);
  }
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URI, {
    //useNewUrlParser: true, 
    //useUnifiedTopology: true 
  });
  console.log('Connected to MongoDB');

  if (!fs.existsSync(dir)) {
    console.error('Payloads dir not found:', dir);
    process.exit(1);
  }

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  for (const f of files) {
    const raw = fs.readFileSync(path.join(dir, f), 'utf8');
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        for (const p of parsed) await handlePayload(p);
      } else {
        await handlePayload(parsed);
      }
      console.log('Processed', f);
    } catch (err) {
      console.warn('Skipping', f, 'error:', err.message);
    }
  }

  console.log('Done.');
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

const { Schema, model } = require('mongoose');

const MessageSchema = new Schema({
  wa_id: { type: String, required: true },        // sender / conversation id
  from_me: { type: Boolean, default: false },
  message_id: { type: String, index: true, default: null },   // message id from webhook (e.g. "wamid....")
  meta_msg_id: { type: String, index: true, default: null },  // alternative id if present
  text: { type: String, default: '' },
  attachments: { type: Array, default: [] },
  status: { type: String, enum: ['sent','delivered','read','unknown'], default: 'unknown' },
  timestamp: { type: Date, default: Date.now },
  name: { type: String, default: null },
  number: { type: String, default: null }
}, { timestamps: true, collection: 'processed_messages' });

MessageSchema.index({ wa_id: 1, timestamp: 1 });

module.exports = model('Message', MessageSchema);

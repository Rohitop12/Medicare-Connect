const mongoose = require('mongoose');

const aiConversationSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sessionTitle: { type: String, default: 'New Conversation' },
  messages: [{
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

const AIConversation = mongoose.model('AIConversation', aiConversationSchema);
module.exports = AIConversation;

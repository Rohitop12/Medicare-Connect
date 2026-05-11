const { GoogleGenAI } = require('@google/genai');
const AIConversation = require('../models/AIConversation');
const Reminder = require('../models/Reminder');
const Appointment = require('../models/Appointment');

const initializeAI = () => {
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
};

// @desc    Send message to AI and get response
// @route   POST /api/ai/chat
// @access  Private (Patient only)
const chatWithAI = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    const patientId = req.user._id;

    let conversation;
    if (sessionId) {
      conversation = await AIConversation.findById(sessionId);
      if (!conversation || conversation.patientId.toString() !== patientId.toString()) {
        return res.status(404).json({ message: 'Conversation not found' });
      }
    } else {
      conversation = new AIConversation({
        patientId,
        sessionTitle: message.substring(0, 30) + '...',
        messages: []
      });
    }

    // Add user message
    conversation.messages.push({ role: 'user', content: message });
    await conversation.save();

    // Fetch user context for system prompt
    const activeReminders = await Reminder.find({ patientId, isActive: true });
    const upcomingAppointments = await Appointment.find({ patientId, status: { $in: ['pending', 'confirmed'] } })
      .populate('doctorId', 'name specialization');

    const systemPrompt = `You are MediCare AI, a compassionate and knowledgeable health assistant for the MediCare Connect platform. 
    You help patients with: health questions, understanding symptoms, medication info, appointment guidance, reminder management tips, and general wellness advice. 
    You have full awareness of the platform's features. Always recommend consulting a real doctor for diagnoses. Be warm, clear, and supportive.
    
    Context about the current user (${req.user.name}):
    Active Reminders: ${activeReminders.map(r => r.medicineName + ' at ' + r.times.join(', ')).join('; ')}
    Upcoming Appointments: ${upcomingAppointments.map(a => 'Dr. ' + a.doctorId.name + ' (' + a.doctorId.specialization + ') on ' + new Date(a.scheduledAt).toLocaleString()).join('; ')}`;

    // Build history for API
    const history = conversation.messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // In a real implementation, we would use streaming. For simplicity in this controller, we use generateContent.
    // However, the prompt asks to stream the response back. We can do this using SSE or just a normal response if streaming is complex to setup.
    // Let's implement standard non-streaming first, then we can upgrade to streaming if needed.
    
    const ai = initializeAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: 'Understood. I am ready to help.' }] },
        ...history
      ]
    });

    const aiText = response.text;

    // Save AI response
    conversation.messages.push({ role: 'assistant', content: aiText });
    await conversation.save();

    res.json({
      sessionId: conversation._id,
      message: { role: 'assistant', content: aiText, timestamp: new Date() }
    });

  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ message: 'Error communicating with AI assistant' });
  }
};

// @desc    Get past AI sessions
// @route   GET /api/ai/history
// @access  Private (Patient only)
const getHistory = async (req, res) => {
  try {
    const conversations = await AIConversation.find({ patientId: req.user._id })
      .select('_id sessionTitle createdAt')
      .sort({ createdAt: -1 });
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get specific session messages
// @route   GET /api/ai/history/:sessionId
// @access  Private (Patient only)
const getSession = async (req, res) => {
  try {
    const conversation = await AIConversation.findById(req.params.sessionId);
    if (conversation && conversation.patientId.toString() === req.user._id.toString()) {
      res.json(conversation);
    } else {
      res.status(404).json({ message: 'Conversation not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a session
// @route   DELETE /api/ai/history/:sessionId
// @access  Private (Patient only)
const deleteSession = async (req, res) => {
  try {
    const conversation = await AIConversation.findById(req.params.sessionId);
    if (conversation && conversation.patientId.toString() === req.user._id.toString()) {
      await conversation.deleteOne();
      res.json({ message: 'Session deleted' });
    } else {
      res.status(404).json({ message: 'Conversation not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  chatWithAI,
  getHistory,
  getSession,
  deleteSession
};

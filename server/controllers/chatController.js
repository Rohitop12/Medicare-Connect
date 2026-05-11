const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Get all chat threads
// @route   GET /api/chat/conversations
// @access  Private
const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all distinct users the current user has chatted with
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    }).sort({ createdAt: -1 });

    const contactIds = new Set();
    const conversations = [];

    messages.forEach(msg => {
      const otherUser = msg.senderId.toString() === userId.toString() ? msg.receiverId : msg.senderId;
      if (!contactIds.has(otherUser.toString())) {
        contactIds.add(otherUser.toString());
        conversations.push({
          contactId: otherUser,
          lastMessage: msg.message,
          timestamp: msg.createdAt,
          isRead: msg.isRead
        });
      }
    });

    // Populate contact details
    const populatedConvos = await Promise.all(conversations.map(async (convo) => {
      const contact = await User.findById(convo.contactId).select('name email profilePic role');
      return { ...convo, contact };
    }));

    res.json(populatedConvos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get messages between current user and userId
// @route   GET /api/chat/messages/:userId
// @access  Private
const getMessages = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const otherUserId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: currentUserId }
      ]
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send a message
// @route   POST /api/chat/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const senderId = req.user._id;

    const newMessage = new Message({
      senderId,
      receiverId,
      message
    });

    const savedMessage = await newMessage.save();
    
    // Note: Actual real-time emission is handled via Socket.io
    
    res.status(201).json(savedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark messages as read
// @route   PUT /api/chat/messages/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (message) {
      message.isRead = true;
      await message.save();
      res.json({ message: 'Marked as read' });
    } else {
      res.status(404).json({ message: 'Message not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead
};

const express = require('express');
const router = express.Router();
const { getConversations, getMessages, sendMessage, markAsRead } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.get('/conversations', protect, getConversations);
router.get('/messages/:userId', protect, getMessages);
router.post('/messages', protect, sendMessage);
router.put('/messages/:id/read', protect, markAsRead);

module.exports = router;

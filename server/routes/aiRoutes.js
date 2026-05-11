const express = require('express');
const router = express.Router();
const { chatWithAI, getHistory, getSession, deleteSession } = require('../controllers/aiController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.post('/chat', protect, restrictTo('patient'), chatWithAI);
router.get('/history', protect, restrictTo('patient'), getHistory);
router.get('/history/:sessionId', protect, restrictTo('patient'), getSession);
router.delete('/history/:sessionId', protect, restrictTo('patient'), deleteSession);

module.exports = router;

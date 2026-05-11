const express = require('express');
const router = express.Router();
const { createReview, getReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(getReviews)
  .post(protect, createReview);

module.exports = router;

const Review = require('../models/Review');

// @desc    Create new review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    // Check if user already submitted a review
    const alreadyReviewed = await Review.findOne({ user: req.user._id });

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'You have already submitted a review' });
    }

    const review = new Review({
      user: req.user._id,
      rating: Number(rating),
      comment
    });

    const createdReview = await review.save();
    res.status(201).json(createdReview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get top/recent reviews
// @route   GET /api/reviews
// @access  Public
const getReviews = async (req, res) => {
  try {
    // Fetch top 6 approved reviews, populate user details (name, role, profilePic)
    const reviews = await Review.find({ status: 'approved' })
      .populate('user', 'name role profilePic')
      .sort({ createdAt: -1 })
      .limit(6);

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createReview,
  getReviews
};

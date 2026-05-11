import React, { useState } from 'react';
import { Star, Send } from 'lucide-react';
import axiosInstance from '../api/axios';
import toast from 'react-hot-toast';

const ReviewForm = () => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    if (!comment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post('/reviews', { rating, comment });
      setSubmitted(true);
      toast.success('Review submitted successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Star size={32} fill="currentColor" />
        </div>
        <h3 className="text-xl font-heading font-bold text-gray-900 mb-2">Thank You!</h3>
        <p className="text-gray-500">Your review has been published on our homepage. We appreciate your feedback.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="mb-4">
        <h3 className="text-xl font-heading font-bold text-gray-900">Share Your Experience</h3>
        <p className="text-gray-500 text-sm">Rate the platform and let others know what you think.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              type="button"
              key={star}
              className={`transition-colors ${
                star <= (hover || rating) ? 'text-amber-400' : 'text-gray-200'
              }`}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(rating)}
            >
              <Star size={28} fill="currentColor" />
            </button>
          ))}
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write your review here..."
          className="w-full h-24 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none text-sm"
          maxLength={300}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white font-medium rounded-xl hover:bg-teal-700 transition disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Review'} <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;

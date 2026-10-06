import React, { useState } from 'react';
import { reviewsAPI } from '../services/api';

export default function ReviewModal({ order, isOpen, onClose, onReviewSubmitted }) {
  const [foodRating, setFoodRating] = useState(5);
  const [cookRating, setCookRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !order) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await reviewsAPI.create({
        order_id: order.id,
        cook_id: order.assigned_cook_id,
        food_rating: foodRating,
        cook_rating: cookRating,
        comment: comment
      });
      if (onReviewSubmitted) onReviewSubmitted();
      onClose();
    } catch (err) {
      console.error("Failed to submit review:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
        <h3 className="font-extrabold text-slate-800 text-xl mb-1">Rate & Review Order #{order.id}</h3>
        <p className="text-xs text-slate-500 mb-4">How was your homemade food experience with Ghule's Kitchen?</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Food Taste & Quality Rating:</label>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFoodRating(star)}
                  className={`text-2xl transition ${star <= foodRating ? 'text-amber-400' : 'text-slate-200'}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Preparation & Packaging Rating:</label>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setCookRating(star)}
                  className={`text-2xl transition ${star <= cookRating ? 'text-amber-400' : 'text-slate-200'}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Review Comments (Optional):</label>
            <textarea
              rows="3"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Freshness, softness of rotis, taste notes..."
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="flex space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 bg-orange-600 text-white font-bold text-xs rounded-xl hover:bg-orange-700 shadow"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

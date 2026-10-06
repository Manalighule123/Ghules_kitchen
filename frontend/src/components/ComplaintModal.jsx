import React, { useState } from 'react';
import { complaintsAPI } from '../services/api';

export default function ComplaintModal({ order, isOpen, onClose, onComplaintSubmitted }) {
  const [type, setType] = useState('QUALITY');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !order) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;
    setSubmitting(true);
    try {
      await complaintsAPI.file({
        order_id: order.id,
        cook_id: order.assigned_cook_id,
        type: type,
        description: description
      });
      if (onComplaintSubmitted) onComplaintSubmitted();
      onClose();
    } catch (err) {
      console.error("Failed to file complaint:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
        <h3 className="font-extrabold text-slate-800 text-xl mb-1">Report Quality or Order Issue</h3>
        <p className="text-xs text-slate-500 mb-4">Order #{order.id} - Ghule's Kitchen Customer Support</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Issue Category:</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
            >
              <option value="QUALITY">Poor Food Quality / Taste Issue</option>
              <option value="MISSING_ITEM">Missing Item(s) in Package</option>
              <option value="LATE_DELIVERY">Delayed Preparation / Late Delivery</option>
              <option value="PACKAGING">Packaging Seal / Container Issue</option>
              <option value="WRONG_ORDER">Received Incorrect Item</option>
              <option value="OTHER">Other Query</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Describe what happened:</label>
            <textarea
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide details about the food quality, packaging or delivery..."
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          <div className="bg-rose-50 p-2.5 rounded-xl border border-rose-200 text-rose-800 text-[11px]">
            🛡️ Your feedback is directly reviewed by Mr. Ghule (Founder & Admin) to maintain strict hygiene & quality standards.
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
              className="flex-1 py-2.5 bg-rose-600 text-white font-bold text-xs rounded-xl hover:bg-rose-700 shadow"
            >
              {submitting ? 'Submitting...' : 'File Support Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

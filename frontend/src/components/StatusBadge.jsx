import React from 'react';

const STATUS_CONFIG = {
  PLACED: { label: 'Order Placed', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
  CONFIRMED: { label: 'Kitchen Confirmed', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  OVERLOAD_DETECTED: { label: 'Overload Detected', bg: 'bg-rose-100 text-rose-800 border-rose-300 font-bold animate-pulse' },
  SEARCHING_COOK: { label: 'Searching Cooks', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
  COOK_ASSIGNED: { label: 'Cook Assigned', bg: 'bg-teal-50 text-teal-700 border-teal-200' },
  COOK_ACCEPTED: { label: 'Cook Accepted', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  PREPARING: { label: 'Preparing Food', bg: 'bg-amber-100 text-amber-800 border-amber-300' },
  READY: { label: 'Ready for Pickup', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', bg: 'bg-purple-50 text-purple-700 border-purple-200' },
  DELIVERED: { label: 'Delivered', bg: 'bg-slate-100 text-slate-700 border-slate-300' },
  CANCELLED: { label: 'Cancelled', bg: 'bg-red-50 text-red-600 border-red-200' },
  REJECTED: { label: 'Rejected', bg: 'bg-gray-100 text-gray-600 border-gray-300' },
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || { label: status, bg: 'bg-slate-100 text-slate-700 border-slate-200' };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs border ${config.bg}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />
      {config.label}
    </span>
  );
}

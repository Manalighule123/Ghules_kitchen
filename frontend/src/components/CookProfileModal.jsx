import React from 'react';

export default function CookProfileModal({ cook, isOpen, onClose }) {
  if (!isOpen || !cook) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold text-sm"
        >
          ✕
        </button>

        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-400 to-amber-500 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg">
            {cook.name ? cook.name.charAt(0) : 'C'}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-extrabold text-slate-800 text-xl">{cook.name}</h3>
              {cook.verification_status === 'APPROVED' && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 flex items-center space-x-1">
                  ✓ Verified Partner
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 flex items-center mt-0.5">
              📍 {cook.location} ({cook.service_radius_km || 5.0} km radius)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 my-4 bg-slate-50 p-3 rounded-xl text-center border border-slate-100">
          <div>
            <span className="text-xs text-slate-400 block">Rating</span>
            <span className="text-base font-bold text-amber-500">⭐ {cook.rating || 4.8}</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Hygiene Score</span>
            <span className="text-base font-bold text-emerald-600">🧼 {cook.hygiene_score || 95}%</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Capacity</span>
            <span className="text-base font-bold text-slate-700">{cook.current_capacity} / {cook.max_capacity}</span>
          </div>
        </div>

        <div className="space-y-3 text-xs text-slate-600 border-t border-slate-100 pt-3">
          <div>
            <span className="font-bold text-slate-700 block">Specialization:</span>
            <p className="text-slate-500">{cook.specialization || 'Homemade Indian Breads & Meals'}</p>
          </div>

          <div>
            <span className="font-bold text-slate-700 block">Service Areas Covered:</span>
            <p className="text-slate-500">{cook.service_areas || 'Thergaon, Wakad, Pimple Saudagar'}</p>
          </div>

          <div className="flex justify-between">
            <div>
              <span className="font-bold text-slate-700 block">Working Hours:</span>
              <p className="text-slate-500">{cook.working_hours || '09:00 AM - 09:00 PM'}</p>
            </div>
            <div>
              <span className="font-bold text-slate-700 block">Available Days:</span>
              <p className="text-slate-500">{cook.available_days || 'Mon-Sun'}</p>
            </div>
          </div>

          <div className="bg-orange-50 p-3 rounded-xl border border-orange-200 text-orange-800 text-[11px]">
            ✨ <span className="font-bold">Ghule's Kitchen Capacity Network:</span> Home-cook partners are independent verified micro-kitchens who help satisfy order surges when primary kitchen capacity is full.
          </div>
        </div>

        <button 
          onClick={onClose} 
          className="w-full mt-4 py-2.5 bg-slate-800 text-white font-semibold text-xs rounded-xl hover:bg-slate-900 transition"
        >
          Close Profile
        </button>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { aiAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { Sparkles, ChefHat, CheckCircle2, ArrowRight, Calculator, MapPin } from 'lucide-react';

export default function AIAllocationPage() {
  const [matchedCooks, setMatchedCooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allocating, setAllocating] = useState(false);
  const [result, setResult] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await aiAPI.matchCooks(1);
      setMatchedCooks(res.data.recommended_cooks || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRunAllocation = async () => {
    setAllocating(true);
    setResult(null);
    try {
      const res = await aiAPI.allocateOrders(1);
      setResult(res.data);
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setAllocating(false);
    }
  };

  if (loading) return <LoadingSpinner message="Evaluating AI Hyperlocal Matching Engine..." />;

  return (
    <div className="space-y-8 pb-20">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold text-slate-900">Smart Order Allocation & Order Splitting Engine</h1>
            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
              Live Demo Mode
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated workload distribution across Ghule's Kitchen and nearby verified home-cook partners.
          </p>
        </div>

        <button
          onClick={handleRunAllocation}
          disabled={allocating}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs shadow-lg shadow-orange-500/20 flex items-center space-x-2 transition-all self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>{allocating ? 'AI Dispatching Workload...' : 'Execute 100-Roti Order Splitting Demo'}</span>
        </button>
      </div>

      {/* Scenario Overview Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl space-y-4 border border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/80 border border-amber-800/80 px-2.5 py-0.5 rounded-full">
              Real Business Case Scenario
            </span>
            <h2 className="text-xl font-extrabold text-white mt-1">
              Customer Bulk Order: 100 Whole Wheat Chapatis / Rotis
            </h2>
          </div>
          <span className="text-xs font-extrabold text-orange-400">Order Value: ₹1,200</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
            <span className="text-slate-400 block text-[11px]">Ghule's Kitchen Capacity:</span>
            <span className="text-lg font-extrabold text-amber-400">40 Rotis</span>
            <span className="text-[10px] text-slate-400 block mt-1">(Internal kitchen capacity limit)</span>
          </div>

          <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
            <span className="text-slate-400 block text-[11px]">Extra Capacity Required:</span>
            <span className="text-lg font-extrabold text-rose-400">60 Rotis</span>
            <span className="text-[10px] text-slate-400 block mt-1">(Requires external partner network)</span>
          </div>

          <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
            <span className="text-slate-400 block text-[11px]">Hyperlocal Partners Found:</span>
            <span className="text-lg font-extrabold text-emerald-400">4 Verified Cooks</span>
            <span className="text-[10px] text-slate-400 block mt-1">(Thergaon, Wakad, Pimple Saudagar)</span>
          </div>
        </div>

        {/* Dynamic Allocation Result Output */}
        {result && (
          <div className="bg-emerald-950 border border-emerald-500/40 p-5 rounded-2xl text-emerald-200 text-xs space-y-3">
            <div className="flex items-center space-x-2 font-extrabold text-sm text-emerald-300">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>{result.message}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="bg-emerald-900/60 p-3 rounded-xl border border-emerald-700">
                <span className="font-bold text-white block">Part 1: Ghule's Kitchen</span>
                <span className="text-emerald-300">40 Rotis (Internal Capacity)</span>
              </div>
              {result.assignments.map((a, idx) => (
                <div key={idx} className="bg-emerald-900/60 p-3 rounded-xl border border-emerald-700">
                  <span className="font-bold text-white block">Part {idx + 2}: {a.cook_name}</span>
                  <span className="text-emerald-300">{a.assigned_quantity} Rotis (Payout: ₹{a.payout_amount})</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Hyperlocal Cook Matching Rationale Grid */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-4">
        <div>
          <h3 className="font-extrabold text-base text-slate-900">Ranked Partner Matching Rationale</h3>
          <p className="text-xs text-slate-500">Evaluates distance, availability, cooking capacity, specialization & workload ratio.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {matchedCooks.map((c) => (
            <div key={c.cook_id} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">{c.cook_name}</h4>
                  <p className="text-xs text-slate-500">📍 {c.location}</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800">
                  {Math.round(c.score * 100)}%
                </span>
              </div>

              <div className="text-xs space-y-1 text-slate-600 border-t border-slate-200/80 pt-2">
                <div className="flex justify-between">
                  <span>Distance:</span>
                  <span className="font-bold text-slate-800">{c.distance_km} km</span>
                </div>
                <div className="flex justify-between">
                  <span>Capacity:</span>
                  <span className="font-bold text-slate-800">{c.available_capacity} rotis</span>
                </div>
                <div className="flex justify-between">
                  <span>Specialization:</span>
                  <span className="font-medium text-slate-700">{c.specialization}</span>
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-[11px] text-slate-500">
                <span className="font-bold text-slate-700 block mb-1">Key Match Reasons:</span>
                {c.reasons.join(' • ')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

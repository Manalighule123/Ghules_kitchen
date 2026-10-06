import React, { useState, useEffect } from 'react';
import { kitchensAPI, aiAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { AlertTriangle, Sparkles, ChefHat, CheckCircle2, RefreshCw, Layers } from 'lucide-react';

export default function OverloadDetectionPage() {
  const [capacity, setCapacity] = useState(null);
  const [cooks, setCooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allocating, setAllocating] = useState(false);
  const [message, setMessage] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [capRes, cooksRes] = await Promise.all([
        kitchensAPI.getCapacity(1),
        kitchensAPI.getAvailableCooks(1)
      ]);
      setCapacity(capRes.data);
      setCooks(cooksRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAllocate = async () => {
    setAllocating(true);
    setMessage(null);
    try {
      const res = await aiAPI.allocateOrders(1);
      setMessage(res.data.message);
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setAllocating(false);
    }
  };

  if (loading) return <LoadingSpinner message="Evaluating overload metrics..." />;

  const isOverloaded = capacity?.overload_count > 0;

  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-rose-600" />
            <span>Overload Detection Center</span>
          </h1>
          <p className="text-xs text-slate-500">Real-time demand monitoring & overflow capacity routing</p>
        </div>

        <button
          onClick={loadData}
          className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center space-x-1 text-xs font-semibold"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Re-Evaluate</span>
        </button>
      </div>

      {/* Main Status Display Card */}
      <div className={`p-6 rounded-3xl border shadow-md ${
        isOverloaded ? 'bg-gradient-to-r from-rose-900 to-amber-950 text-white border-rose-800' : 'bg-emerald-900 text-white border-emerald-800'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-1">
              SYSTEM STATUS EVALUATION
            </span>
            <h2 className="text-2xl font-extrabold text-white">
              {isOverloaded ? 'OVERLOAD DETECTED - SPOOK SPIKE ACTIVE' : 'NORMAL OPERATIONAL CAPACITY'}
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              {isOverloaded
                ? `Current orders (${capacity.current_orders}) exceed maximum kitchen capacity (${capacity.total_capacity}). ${capacity.overload_count} excess orders are queued for external cook allocation.`
                : `Current orders (${capacity.current_orders}) are well within kitchen capacity (${capacity.total_capacity}). No action required.`}
            </p>
          </div>

          {isOverloaded && (
            <button
              onClick={handleAllocate}
              disabled={allocating}
              className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-xs shadow-lg shadow-emerald-950/60 flex items-center space-x-2 shrink-0 transition-transform hover:scale-105"
            >
              <Sparkles className="w-4 h-4" />
              <span>{allocating ? 'Allocating...' : 'Trigger AI Order Allocation'}</span>
            </button>
          )}
        </div>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Numerical Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6">
          <span className="text-xs font-semibold uppercase text-slate-400 block">Total Active Orders</span>
          <span className="text-3xl font-extrabold text-slate-900 mt-1 block">{capacity.current_orders}</span>
          <span className="text-[11px] text-slate-500 mt-1 block">In process at Spice Hub</span>
        </div>
        <div className="glass-card p-6">
          <span className="text-xs font-semibold uppercase text-slate-400 block">Max Kitchen Capacity</span>
          <span className="text-3xl font-extrabold text-slate-900 mt-1 block">{capacity.total_capacity}</span>
          <span className="text-[11px] text-slate-500 mt-1 block">Staff preparation ceiling</span>
        </div>
        <div className="glass-card p-6">
          <span className="text-xs font-semibold uppercase text-slate-400 block">Calculated Overload</span>
          <span className={`text-3xl font-extrabold mt-1 block ${isOverloaded ? 'text-rose-600' : 'text-emerald-600'}`}>
            {capacity.overload_count}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">Excess beyond capacity</span>
        </div>
      </div>
    </div>
  );
}

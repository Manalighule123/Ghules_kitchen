import React, { useState, useEffect } from 'react';
import { kitchensAPI, aiAPI, ordersAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import AIAssistantWidget from '../components/AIAssistantWidget';
import LoadingSpinner from '../components/LoadingSpinner';
import { WebSocketClient } from '../services/websocket';
import {
  Utensils, AlertTriangle, ChefHat, CheckCircle2, Sparkles, ArrowRight,
  RefreshCw, Layers, TrendingUp, Clock, Users, Play
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function KitchenDashboard() {
  const [kitchenId, setKitchenId] = useState(1); // Spice Hub
  const [capacityData, setCapacityData] = useState(null);
  const [matchedCooks, setMatchedCooks] = useState([]);
  const [allocationResult, setAllocationResult] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [allocatingLoading, setAllocatingLoading] = useState(false);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [capRes, cooksRes, ordersRes] = await Promise.all([
        kitchensAPI.getCapacity(kitchenId),
        kitchensAPI.getAvailableCooks(kitchenId),
        ordersAPI.getAll({ kitchen_id: kitchenId })
      ]);
      setCapacityData(capRes.data);
      setMatchedCooks(cooksRes.data);
      setOrders(ordersRes.data);
    } catch (err) {
      console.error('Error loading kitchen dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();

    // WebSocket real-time subscription
    const ws = new WebSocketClient(kitchenId, (msg) => {
      console.log('[WS Event Received on Kitchen Dashboard]:', msg);
      if (['ORDERS_ALLOCATED', 'NEW_ORDER', 'ORDER_STATUS_UPDATED'].includes(msg.event)) {
        loadDashboardData();
      }
    });
    ws.connect();

    return () => ws.disconnect();
  }, [kitchenId]);

  // STEP 5: Find Cooks
  const handleFindCooks = async () => {
    setMatchingLoading(true);
    try {
      const res = await aiAPI.matchCooks(kitchenId);
      setMatchedCooks(res.data.recommended_cooks);
    } catch (err) {
      console.error('Error finding cooks:', err);
    } finally {
      setMatchingLoading(false);
    }
  };

  // STEP 7: Allocate Orders
  const handleAllocateOrders = async () => {
    setAllocatingLoading(true);
    setAllocationResult(null);
    try {
      const res = await aiAPI.allocateOrders(kitchenId);
      setAllocationResult(res.data);
      await loadDashboardData();
    } catch (err) {
      console.error('Error allocating orders:', err);
    } finally {
      setAllocatingLoading(false);
    }
  };

  if (loading && !capacityData) {
    return <LoadingSpinner message="Calculating real-time kitchen load & capacity..." />;
  }

  const isOverloaded = capacityData?.overload_count > 0;

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Utensils className="w-6 h-6 text-emerald-600" />
            <span>Kitchen Operations Dashboard</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time load balancing for <span className="font-semibold text-slate-800">{capacityData?.kitchen_name}</span>
          </p>
        </div>

        <button
          onClick={loadDashboardData}
          className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 shadow-xs flex items-center space-x-1.5 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Refresh Live Stats</span>
        </button>
      </div>

      {/* OVERLOAD ALERT BANNER (CRITICAL DEMO REQUIREMENT 7) */}
      {isOverloaded && (
        <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-amber-900 text-white rounded-3xl p-6 shadow-xl border border-rose-700 animate-in fade-in duration-200">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-300 flex items-center justify-center shrink-0 border border-rose-400/30">
                <AlertTriangle className="w-7 h-7 animate-bounce" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-lg text-white">CAPACITY OVERLOAD DETECTED!</span>
                  <span className="bg-rose-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                    Action Needed
                  </span>
                </div>
                <p className="text-xs text-rose-200 leading-relaxed max-w-xl">
                  Current Orders (<span className="font-bold text-white">{capacityData.current_orders}</span>) exceeds Kitchen Capacity (<span className="font-bold text-white">{capacityData.total_capacity}</span>).
                  You have <span className="font-bold text-amber-300 underline">{capacityData.overload_count} excess orders</span> requiring distributed home cook allocation!
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={handleFindCooks}
                disabled={matchingLoading}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold border border-slate-700 shadow-md flex items-center space-x-2 transition-all"
              >
                <ChefHat className="w-4 h-4 text-amber-400" />
                <span>{matchingLoading ? 'Matching Cooks...' : 'Find Cooks'}</span>
              </button>

              <button
                onClick={handleAllocateOrders}
                disabled={allocatingLoading}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-extrabold shadow-lg shadow-emerald-900/50 flex items-center space-x-2 transition-all hover:scale-105"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span>{allocatingLoading ? 'Allocating...' : 'Allocate Orders'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Active Orders</span>
            <Layers className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{capacityData?.current_orders}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Received this peak hour</span>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Kitchen Capacity</span>
            <Utensils className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{capacityData?.total_capacity}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Max internal staff limit</span>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Overloaded Orders</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className={`text-2xl font-extrabold ${isOverloaded ? 'text-rose-600 font-black' : 'text-slate-900'}`}>
            {capacityData?.overload_count}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Beyond kitchen capacity</span>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Available Cooks</span>
            <ChefHat className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{matchedCooks.filter(c => c.available).length}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Verified & nearby online</span>
        </div>
      </div>

      {/* Allocation Success Toast Banner */}
      {allocationResult && (
        <div className="bg-emerald-900 text-white rounded-2xl p-5 shadow-lg border border-emerald-700 animate-in fade-in duration-200">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <h4 className="font-bold text-sm text-white">{allocationResult.message}</h4>
              <p className="text-xs text-emerald-200 mt-0.5">
                {allocationResult.allocated_count} excess orders distributed across {new Set(allocationResult.assignments.map(a => a.cook_id)).size} home cook(s). Remaining overload: {allocationResult.remaining_overload}.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* AI COOK MATCHING RECOMMENDATIONS (DEMO REQUIREMENT 8 & 26) */}
      <div className="glass-card p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>AI Ranked Home Cooks Recommendation</span>
            </h2>
            <p className="text-xs text-slate-500">Cook match formula based on Availability, Proximity, Capacity, Cuisine & Workload.</p>
          </div>
          <button
            onClick={handleFindCooks}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200/80"
          >
            Re-run Match Score
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {matchedCooks.map((cook) => (
            <div
              key={cook.cook_id}
              className={`p-4 rounded-2xl border transition-all ${
                cook.available && cook.available_capacity > 0
                  ? 'bg-white border-slate-200 hover:border-emerald-300 shadow-xs'
                  : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{cook.cook_name}</h3>
                  <span className="text-[11px] text-slate-500">{cook.location}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    Match: {Math.round(cook.score * 100)}%
                  </span>
                </div>
              </div>

              <div className="text-xs space-y-1.5 pt-2 border-t border-slate-100 mb-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">Available Capacity:</span>
                  <span className="font-bold text-slate-800">{cook.available_capacity} meals</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Distance:</span>
                  <span className="font-medium text-slate-700">{cook.distance_km} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Cuisine:</span>
                  <span className="font-medium text-slate-700">{cook.cuisine_types}</span>
                </div>
              </div>

              {/* Explanatory Reasons List */}
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  AI Recommendation Reasons:
                </span>
                <ul className="space-y-0.5 text-[11px] text-slate-600">
                  {cook.reasons.map((r, idx) => (
                    <li key={idx} className="flex items-center space-x-1">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Incoming Orders Table */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Current Incoming Orders Ledger</h2>
          <span className="text-xs text-slate-500">{orders.length} orders total</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-2">Order ID</th>
                <th className="py-3 px-2">Customer</th>
                <th className="py-3 px-2">Items</th>
                <th className="py-3 px-2">Amount</th>
                <th className="py-3 px-2">Assigned Cook</th>
                <th className="py-3 px-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.slice(0, 15).map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-2 font-mono font-bold text-slate-900">#{ord.id}</td>
                  <td className="py-3 px-2 font-medium text-slate-800">{ord.customer_name}</td>
                  <td className="py-3 px-2 text-slate-600 max-w-xs truncate">
                    {ord.items.map(i => `${i.quantity}x ${i.item_name}`).join(', ')}
                  </td>
                  <td className="py-3 px-2 font-bold text-slate-900">₹{ord.total_amount}</td>
                  <td className="py-3 px-2 text-slate-700 font-medium">
                    {ord.assigned_cook_name ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold">
                        <ChefHat className="w-3 h-3 text-emerald-600" />
                        {ord.assigned_cook_name}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Internal Staff</span>
                    )}
                  </td>
                  <td className="py-3 px-2">
                    <StatusBadge status={ord.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Assistant Drawer Component */}
      <AIAssistantWidget kitchenId={kitchenId} userRole="KITCHEN" />
    </div>
  );
}

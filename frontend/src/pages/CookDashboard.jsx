import React, { useState, useEffect } from 'react';
import { cooksAPI, ordersAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import VoiceAgentWidget from '../components/VoiceAgentWidget';
import LoadingSpinner from '../components/LoadingSpinner';
import { ChefHat, Power, CheckCircle2, DollarSign, Play, PackageCheck, AlertTriangle, ShieldCheck, XCircle } from 'lucide-react';

export default function CookDashboard() {
  const cookId = 1; // Priya Sharma (Thergaon partner)
  const [cook, setCook] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectingId, setRejectingId] = useState(null);

  const fetchCookData = async () => {
    setLoading(true);
    try {
      const [cRes, aRes] = await Promise.all([
        cooksAPI.getById(cookId),
        cooksAPI.getAssignments(cookId)
      ]);
      setCook(cRes.data);
      setAssignments(aRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCookData();
  }, []);

  const handleToggleAvailability = async () => {
    if (!cook) return;
    try {
      const newAvail = !cook.available;
      const res = await cooksAPI.updateAvailability(cookId, {
        available: newAvail,
        current_capacity: newAvail ? cook.max_capacity : 0
      });
      setCook(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateCapacity = async (newCap) => {
    try {
      const res = await cooksAPI.updateAvailability(cookId, {
        current_capacity: newCap,
        max_capacity: cook.max_capacity
      });
      setCook(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateAssignmentStatus = async (assignmentId, status, reason = null) => {
    setActionLoading(true);
    try {
      await ordersAPI.updateAssignmentStatus(assignmentId, status, reason);
      await fetchCookData();
      setRejectingId(null);
      setRejectionReason('');
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && !cook) return <LoadingSpinner message="Loading Home-Cook Partner Portal..." />;

  const completedAssignments = assignments.filter(a => ['READY', 'COMPLETED'].includes(a.status));
  const activeAssignments = assignments.filter(a => ['ASSIGNED', 'ACCEPTED', 'PREPARING'].includes(a.status));
  const totalEarnings = assignments.reduce((sum, a) => sum + (a.status === 'COMPLETED' ? a.payout_amount : 0), 0);

  return (
    <div className="space-y-8 pb-20">
      {/* Verification Status Alert */}
      {cook?.verification_status !== 'APPROVED' ? (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 flex items-center justify-between text-amber-900 shadow-sm">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
            <div>
              <h4 className="font-extrabold text-sm">Partner Profile Verification: {cook?.verification_status}</h4>
              <p className="text-xs text-amber-700 mt-0.5">Your application is under review by Ghule's Kitchen Admin. Verified partners receive order dispatch assignments.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-950 text-white rounded-3xl p-4 px-6 flex items-center justify-between border border-emerald-800 shadow-md">
          <div className="flex items-center space-x-3">
            <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <h4 className="font-extrabold text-sm text-emerald-300">Verified Home-Cook Partner Account</h4>
              <p className="text-xs text-emerald-100">Hygiene Score: {cook?.hygiene_score}% ({cook?.hygiene_status}) • Location: {cook?.location}</p>
            </div>
          </div>
          <span className="text-xs font-bold bg-emerald-800 text-emerald-200 px-3 py-1 rounded-full border border-emerald-700">
            Active Partner
          </span>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-orange-600" />
            <span>Home-Cook Partner Portal</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Welcome back, <span className="font-bold text-slate-800">{cook?.name}</span> ({cook?.location})
          </p>
        </div>

        {/* Availability Toggle */}
        <div className="flex items-center space-x-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-700 pl-2">Availability:</span>
          <button
            onClick={handleToggleAvailability}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center space-x-1.5 transition-all ${
              cook?.available
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{cook?.available ? 'ONLINE / AVAILABLE' : 'OFFLINE'}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Available Capacity</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            {cook?.current_capacity} / {cook?.max_capacity}
          </div>
          <div className="mt-2 flex gap-1">
            <button 
              onClick={() => handleUpdateCapacity(Math.max(0, cook.current_capacity - 10))}
              className="text-[10px] font-bold px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700"
            >
              -10
            </button>
            <button 
              onClick={() => handleUpdateCapacity(Math.min(cook.max_capacity, cook.current_capacity + 10))}
              className="text-[10px] font-bold px-2 py-1 bg-orange-100 hover:bg-orange-200 rounded-lg text-orange-700"
            >
              +10
            </button>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Workloads</span>
          <div className="text-2xl font-extrabold text-amber-600 mt-1">{activeAssignments.length}</div>
          <span className="text-[11px] text-slate-500">In preparation/assigned</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed Work</span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">{completedAssignments.length}</div>
          <span className="text-[11px] text-slate-500">Orders completed</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Earnings</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">₹{totalEarnings || (cook?.total_earnings || 1450)}</div>
          <span className="text-[11px] text-emerald-600 font-semibold">Net per-order payouts</span>
        </div>
      </div>

      {/* Voice Call Agent Simulator */}
      <VoiceAgentWidget
        cookId={cookId}
        cookName={cook?.name || "Priya Sharma"}
        onCapacityUpdated={() => fetchCookData()}
      />

      {/* Assigned Split Orders List */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Your Assigned Workloads ({assignments.length})</h2>
            <p className="text-xs text-slate-500">Accept assigned order quantities, update prep status, or decline with reason.</p>
          </div>
        </div>

        {assignments.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-3xl">
            <ChefHat className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No Active Assignments</p>
            <p className="text-xs text-slate-400 mt-1">Trigger smart allocation on Admin Dashboard to assign excess order workload to Priya!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignments.map((a) => (
              <div
                key={a.id}
                className="bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-orange-200 transition-all space-y-3"
              >
                <div className="flex items-start justify-between border-b border-slate-200 pb-2.5">
                  <div>
                    <span className="text-xs font-mono font-bold text-slate-900">Assignment #{a.id} (Order #{a.order_id})</span>
                    <span className="text-xs text-slate-500 block">Quantity: <strong className="text-slate-900">{a.assigned_quantity} units</strong></span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase ${
                    a.status === 'READY' || a.status === 'COMPLETED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : a.status === 'PREPARING'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {a.status}
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <span className="text-slate-500 font-bold block">Assigned Dish Items:</span>
                  <p className="text-slate-800 bg-white p-2.5 rounded-xl border border-slate-200 font-semibold">{a.item_description}</p>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-500 font-bold">Partner Payout:</span>
                  <span className="font-extrabold text-emerald-700 text-sm">₹{a.payout_amount}</span>
                </div>

                {/* Reject Reason Form */}
                {rejectingId === a.id && (
                  <div className="bg-rose-50 p-3 rounded-xl border border-rose-200 space-y-2">
                    <label className="text-[11px] font-bold text-rose-800 block">Specify reason for declining:</label>
                    <input
                      type="text"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="e.g. Raw material shortage, kitchen busy..."
                      className="w-full text-xs p-2 rounded-lg border border-rose-300"
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleUpdateAssignmentStatus(a.id, 'REJECTED', rejectionReason)}
                        className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold"
                      >
                        Confirm Reject
                      </button>
                      <button
                        onClick={() => setRejectingId(null)}
                        className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                  {a.status === 'ASSIGNED' && rejectingId !== a.id && (
                    <>
                      <button
                        onClick={() => setRejectingId(a.id)}
                        className="px-3 py-1.5 rounded-xl bg-slate-200 text-slate-700 hover:bg-slate-300 text-xs font-bold"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleUpdateAssignmentStatus(a.id, 'ACCEPTED')}
                        disabled={actionLoading}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm"
                      >
                        Accept Assignment
                      </button>
                    </>
                  )}

                  {['ACCEPTED', 'ASSIGNED'].includes(a.status) && (
                    <button
                      onClick={() => handleUpdateAssignmentStatus(a.id, 'PREPARING')}
                      disabled={actionLoading}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold shadow-sm flex items-center space-x-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Start Preparing ({a.assigned_quantity} rotis)</span>
                    </button>
                  )}

                  {a.status === 'PREPARING' && (
                    <button
                      onClick={() => handleUpdateAssignmentStatus(a.id, 'READY')}
                      disabled={actionLoading}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md flex items-center space-x-1.5"
                    >
                      <PackageCheck className="w-4 h-4" />
                      <span>Mark Prepared & Ready</span>
                    </button>
                  )}

                  {a.status === 'READY' && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-xl flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Ready for Dispatch / Pickup
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

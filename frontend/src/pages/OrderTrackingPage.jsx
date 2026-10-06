import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ordersAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ReviewModal from '../components/ReviewModal';
import ComplaintModal from '../components/ComplaintModal';
import { Clock, CheckCircle2, ChefHat, Utensils, RefreshCw, XCircle, Star, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function OrderTrackingPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('id') || 1;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [complaintOpen, setComplaintOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const navigate = useNavigate();

  const fetchOrder = () => {
    setLoading(true);
    ordersAPI.getById(orderId)
      .then(res => setOrder(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrder();
    const timer = setInterval(fetchOrder, 3000); // Live polling tracker
    return () => clearInterval(timer);
  }, [orderId]);

  const handleCancelOrder = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    setCancelling(true);
    try {
      await ordersAPI.cancel(order.id);
      fetchOrder();
    } catch (err) {
      alert(err.response?.data?.detail || "Order cannot be cancelled.");
    } finally {
      setCancelling(false);
    }
  };

  if (loading && !order) return <LoadingSpinner message="Tracking order live status & split assignments..." />;

  const steps = [
    { key: 'PLACED', label: 'Order Placed' },
    { key: 'CONFIRMED', label: 'Kitchen Confirmed' },
    { key: 'OVERLOAD_DETECTED', label: 'Capacity Shortage Check' },
    { key: 'COOK_ASSIGNED', label: 'Partner Cooks Assigned' },
    { key: 'PREPARING', label: 'Food Preparation' },
    { key: 'READY', label: 'Ready for Pickup' },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
    { key: 'DELIVERED', label: 'Delivered' }
  ];

  const getStepIndex = (st) => {
    const idx = steps.findIndex(s => s.key === st);
    return idx !== -1 ? idx : 1;
  };

  const currentIdx = getStepIndex(order?.status);

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold text-slate-900">Order Tracker #{order?.id}</h1>
            {order?.is_split && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                🔀 Split Workload Order
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Preferred Delivery: {order?.preferred_delivery_time || 'ASAP'}</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchOrder}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center space-x-1.5 text-xs font-semibold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>

          {['PLACED', 'CONFIRMED', 'OVERLOAD_DETECTED'].includes(order?.status) && (
            <button
              onClick={handleCancelOrder}
              disabled={cancelling}
              className="px-3 py-2 bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 rounded-xl text-xs font-bold transition flex items-center space-x-1"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Cancel Order</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Status Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-mono text-slate-400">GHULE'S KITCHEN THERGAON</span>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">{order?.kitchen_name}</h2>
          </div>
          <StatusBadge status={order?.status} />
        </div>

        {/* Timeline Stepper */}
        <div className="space-y-4">
          {steps.map((step, idx) => {
            const isDone = idx <= currentIdx;
            const isCurrent = idx === currentIdx;

            return (
              <div key={step.key} className="flex items-center space-x-4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isCurrent
                      ? 'bg-orange-600 text-white ring-4 ring-orange-100 font-extrabold scale-110'
                      : isDone
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>
                <div className="flex-1">
                  <span className={`text-sm ${isCurrent ? 'font-extrabold text-slate-900' : isDone ? 'font-semibold text-slate-700' : 'text-slate-400'}`}>
                    {step.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic Order Splitting Breakdown Panel */}
      {order?.assignments && order.assignments.length > 0 && (
        <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-base text-amber-400 flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-amber-400" />
                <span>Distributed Preparation Assignments ({order.assignments.length} Home Cooks)</span>
              </h3>
              <p className="text-xs text-slate-400">Workload split across nearby verified home-cook partners to avoid prep delays</p>
            </div>
            <span className="text-xs font-bold bg-amber-400/20 text-amber-300 px-3 py-1 rounded-full border border-amber-400/30">
              Live Preparation Status
            </span>
          </div>

          <div className="space-y-3">
            {order.assignments.map((assignment, idx) => (
              <div key={assignment.id} className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 font-extrabold text-sm flex items-center justify-center border border-amber-500/30">
                    P{idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-sm text-slate-100">{assignment.cook_name}</h4>
                      <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full font-semibold">
                        Qty: {assignment.assigned_quantity} units
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{assignment.item_description}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-slate-700 pt-2 sm:pt-0">
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
                    assignment.status === 'READY' || assignment.status === 'COMPLETED'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : assignment.status === 'PREPARING'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse'
                      : 'bg-slate-700 text-slate-300'
                  }`}>
                    Status: {assignment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Customer Action Bar (Review & Complaint) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-sm text-slate-800">Need Assistance or Want to Share Feedback?</h4>
          <p className="text-xs text-slate-500">Rate your food experience or reach out to customer support</p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            onClick={() => setReviewOpen(true)}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center space-x-1"
          >
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>Rate & Review</span>
          </button>

          <button
            onClick={() => setComplaintOpen(true)}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-slate-500" />
            <span>Report Issue</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      <ReviewModal 
        order={order} 
        isOpen={reviewOpen} 
        onClose={() => setReviewOpen(false)} 
        onReviewSubmitted={fetchOrder} 
      />

      <ComplaintModal 
        order={order} 
        isOpen={complaintOpen} 
        onClose={() => setComplaintOpen(false)} 
        onComplaintSubmitted={fetchOrder} 
      />
    </div>
  );
}

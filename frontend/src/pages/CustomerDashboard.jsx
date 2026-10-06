import React, { useState, useEffect } from 'react';
import { ordersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { Link } from 'react-router-dom';
import { ShoppingBag, Utensils, Clock, ArrowRight } from 'lucide-react';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersAPI.getAll({ customer_id: user?.id || 4 })
      .then(res => setOrders(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <LoadingSpinner message="Loading customer portal..." />;

  const activeOrder = orders.find(o => !['DELIVERED', 'CANCELLED', 'REJECTED'].includes(o.status));

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Customer Portal</h1>
          <p className="text-xs text-slate-500">Welcome back, {user?.name}</p>
        </div>

        <Link
          to="/browse-kitchens"
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center space-x-2 self-start sm:self-auto"
        >
          <Utensils className="w-4 h-4" />
          <span>Order Food Now</span>
        </Link>
      </div>

      {/* Active Order Banner */}
      {activeOrder && (
        <div className="bg-gradient-to-r from-emerald-900 to-teal-950 text-white p-6 rounded-3xl shadow-xl border border-emerald-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block mb-1">
                Active Order in Progress
              </span>
              <h2 className="text-xl font-bold text-white">{activeOrder.kitchen_name}</h2>
              <p className="text-xs text-emerald-200 mt-1">Order #{activeOrder.id} • ₹{activeOrder.total_amount}</p>
            </div>

            <Link
              to={`/order-tracking?id=${activeOrder.id}`}
              className="px-5 py-2.5 rounded-xl bg-white text-emerald-900 font-extrabold text-xs shadow-md flex items-center space-x-1.5 hover:bg-slate-100"
            >
              <span>Track Live Status</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Recent Orders List */}
      <div className="glass-card p-6 space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Your Recent Orders</h2>
        <div className="divide-y divide-slate-100">
          {orders.map((ord) => (
            <div key={ord.id} className="py-3.5 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-900">Order #{ord.id}</span>
                <p className="text-slate-500">{ord.kitchen_name} • ₹{ord.total_amount}</p>
              </div>
              <div className="flex items-center space-x-3">
                <StatusBadge status={ord.status} />
                <Link
                  to={`/order-tracking?id=${ord.id}`}
                  className="text-emerald-600 font-semibold hover:underline"
                >
                  Track
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

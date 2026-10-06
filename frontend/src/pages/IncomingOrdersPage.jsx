import React, { useState, useEffect } from 'react';
import { ordersAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { ShoppingBag, RefreshCw, Filter } from 'lucide-react';

export default function IncomingOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchOrders = () => {
    setLoading(true);
    ordersAPI.getAll({ kitchen_id: 1, status: statusFilter || undefined })
      .then(res => setOrders(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  if (loading) return <LoadingSpinner message="Fetching incoming kitchen orders..." />;

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-emerald-600" />
            <span>Incoming Kitchen Orders</span>
          </h1>
          <p className="text-xs text-slate-500">Live order feed for Spice Hub Cloud Kitchen</p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Statuses</option>
            <option value="PLACED">PLACED</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="OVERLOAD_DETECTED">OVERLOAD_DETECTED</option>
            <option value="COOK_ASSIGNED">COOK_ASSIGNED</option>
            <option value="PREPARING">PREPARING</option>
            <option value="READY">READY</option>
          </select>

          <button
            onClick={fetchOrders}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3">Order ID</th>
                <th className="py-3 px-3">Time</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Items & Quantities</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Assigned Handler</th>
                <th className="py-3 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-3 font-mono font-bold text-slate-900">#{ord.id}</td>
                  <td className="py-3.5 px-3 text-slate-500">
                    {new Date(ord.order_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3.5 px-3 font-medium text-slate-800">{ord.customer_name}</td>
                  <td className="py-3.5 px-3 text-slate-600 max-w-sm">
                    {ord.items.map(i => `${i.quantity}x ${i.item_name}`).join(', ')}
                  </td>
                  <td className="py-3.5 px-3 font-bold text-slate-900">₹{ord.total_amount}</td>
                  <td className="py-3.5 px-3 text-slate-700 font-medium">
                    {ord.assigned_cook_name ? (
                      <span className="text-emerald-700 font-semibold">{ord.assigned_cook_name} (Cook)</span>
                    ) : (
                      <span className="text-slate-400">Spice Hub Staff</span>
                    )}
                  </td>
                  <td className="py-3.5 px-3">
                    <StatusBadge status={ord.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

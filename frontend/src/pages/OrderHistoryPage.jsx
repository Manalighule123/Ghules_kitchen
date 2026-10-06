import React, { useState, useEffect } from 'react';
import { ordersAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { ShoppingBag } from 'lucide-react';

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersAPI.getAll({ customer_id: 4 })
      .then(res => setOrders(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner message="Fetching order history..." />;

  return (
    <div className="space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-emerald-600" />
          <span>Customer Order History</span>
        </h1>
        <p className="text-xs text-slate-500">All past orders placed on Ghules Kitchen platform</p>
      </div>

      <div className="glass-card p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3">Order ID</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Kitchen</th>
                <th className="py-3 px-3">Items</th>
                <th className="py-3 px-3">Total Amount</th>
                <th className="py-3 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-3 font-mono font-bold text-slate-900">#{ord.id}</td>
                  <td className="py-3.5 px-3 text-slate-500">
                    {new Date(ord.order_time).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-slate-800">{ord.kitchen_name}</td>
                  <td className="py-3.5 px-3 text-slate-600">
                    {ord.items.map(i => `${i.quantity}x ${i.item_name}`).join(', ')}
                  </td>
                  <td className="py-3.5 px-3 font-bold text-slate-900">₹{ord.total_amount}</td>
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

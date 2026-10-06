import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Utensils, ChefHat, Users, ShoppingBag,
  Sparkles, BarChart3, AlertTriangle, PhoneCall, DollarSign, Clock, ShieldCheck
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { role } = useAuth();

  const getMenuItems = () => {
    switch (role) {
      case 'admin':
        return [
          { to: '/admin/dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
          { to: '/admin/kitchens', label: 'Cloud Kitchens', icon: Utensils },
          { to: '/admin/cooks', label: 'Home Cooks', icon: ChefHat },
          { to: '/admin/customers', label: 'Customers', icon: Users },
          { to: '/admin/orders', label: 'All Orders', icon: ShoppingBag },
          { to: '/admin/ai-allocation', label: 'AI Allocation Ledger', icon: Sparkles },
          { to: '/admin/analytics', label: 'Analytics & Reports', icon: BarChart3 }
        ];

      case 'kitchen':
        return [
          { to: '/kitchen/dashboard', label: 'Kitchen Overview', icon: LayoutDashboard },
          { to: '/kitchen/overload', label: 'Overload Detection', icon: AlertTriangle, badge: 'AI' },
          { to: '/kitchen/incoming-orders', label: 'Incoming Orders', icon: ShoppingBag },
          { to: '/kitchen/available-cooks', label: 'Available Cooks', icon: ChefHat },
          { to: '/kitchen/distributed-orders', label: 'Distributed Orders', icon: Sparkles }
        ];

      case 'cook':
        return [
          { to: '/cook/dashboard', label: 'Cook Dashboard', icon: LayoutDashboard },
          { to: '/cook/assigned-orders', label: 'Assigned Orders', icon: ShoppingBag },
          { to: '/cook/voice-agent', label: 'Voice AI Simulator', icon: PhoneCall, badge: 'Voice' },
          { to: '/cook/earnings', label: 'Earnings Summary', icon: DollarSign }
        ];

      case 'customer':
      default:
        return [
          { to: '/customer/dashboard', label: 'Customer Portal', icon: LayoutDashboard },
          { to: '/browse-kitchens', label: 'Browse Kitchens', icon: Utensils },
          { to: '/order-tracking', label: 'Order Tracker', icon: Clock },
          { to: '/customer/order-history', label: 'Order History', icon: ShoppingBag }
        ];
    }
  };

  const menuItems = getMenuItems();

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 md:hidden"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`
          fixed md:sticky top-20 left-0 bottom-0 md:bottom-auto z-50 md:z-30
          w-64 bg-white border border-slate-200/90 rounded-none md:rounded-3xl
          shadow-xl md:shadow-sm p-4 flex flex-col justify-between shrink-0
          transition-transform duration-200 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          h-[calc(100vh-5rem)] md:h-[calc(100vh-6.5rem)] overflow-y-auto
        `}
      >
        <div className="space-y-4">
          <div className="px-3 py-1.5 bg-slate-100/80 rounded-xl border border-slate-200/50">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              {role} Control Center
            </p>
          </div>

          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700 uppercase">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="p-3 bg-slate-900 text-white rounded-2xl border border-slate-800 mt-6 shadow-inner">
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Ghule's Kitchen AI v1.0</span>
          </div>
          <p className="text-[10px] text-slate-300 leading-tight">
            Real-time load balancing and cook capacity distribution engine active.
          </p>
        </div>
      </aside>
    </>
  );
}

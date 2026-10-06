import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, UtensilsCrossed, ChefHat, User, Sparkles } from 'lucide-react';

export default function DemoRoleSwitcher() {
  const { role, switchDemoRole } = useAuth();

  const roles = [
    { key: 'KITCHEN', label: 'Kitchen (Spice Hub)', icon: UtensilsCrossed, bg: 'bg-emerald-600' },
    { key: 'COOK', label: 'Cook (Priya)', icon: ChefHat, bg: 'bg-amber-600' },
    { key: 'ADMIN', label: 'Admin', icon: ShieldCheck, bg: 'bg-purple-600' },
    { key: 'CUSTOMER', label: 'Customer', icon: User, bg: 'bg-blue-600' }
  ];

  return (
    <div className="bg-slate-900 text-white text-xs py-2 px-4 flex flex-wrap items-center justify-between border-b border-slate-800 shadow-inner">
      <div className="flex items-center space-x-2 font-medium">
        <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" style={{ animationDuration: '4s' }} />
        <span className="text-slate-300 font-semibold uppercase tracking-wider text-[11px]">Demo Role Switcher:</span>
        <span className="text-slate-400 hidden md:inline">Click to switch instant view:</span>
      </div>

      <div className="flex items-center space-x-1.5 overflow-x-auto py-1">
        {roles.map((r) => {
          const Icon = r.icon;
          const isActive = role === r.key.toLowerCase();
          return (
            <button
              key={r.key}
              onClick={() => switchDemoRole(r.key)}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs transition-all duration-200 font-medium ${
                isActive
                  ? `${r.bg} text-white shadow-sm ring-2 ring-white/20 font-bold scale-105`
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{r.label}</span>
              {isActive && <span className="ml-1 w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Utensils, ChefHat, ArrowRight, ShieldCheck, Cpu, Zap, Activity, Users, Globe } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            
            {/* Tagline Badge */}
            <div className="inline-flex items-center space-x-2 bg-emerald-50 border border-emerald-200/80 px-4 py-1.5 rounded-full text-xs font-semibold text-emerald-700 shadow-xs">
              <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span>AI-Powered Cloud Kitchen Load Balancing</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
              GHULE’S KITCHEN
            </h1>
            <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Turn sudden order overload into distributed cooking capacity.
            </p>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              When a cloud kitchen receives more orders than its internal staff can handle, Ghule's AI automatically detects capacity overload and dynamically distributes excess orders to verified, available home cooks nearby.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                to="/kitchen/dashboard"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-600/30 hover:-translate-y-0.5 transition-all flex items-center justify-center space-x-2"
              >
                <span>Launch Live Overload Demo</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/browse-kitchens"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex items-center justify-center space-x-2"
              >
                <Utensils className="w-4 h-4 text-emerald-600" />
                <span>Browse Cloud Kitchens</span>
              </Link>
            </div>

            {/* Micro Stats Bar */}
            <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
              <div className="p-4 bg-white/80 rounded-2xl border border-slate-200/80 shadow-xs">
                <span className="text-2xl font-extrabold text-slate-900 block">30+</span>
                <span className="text-xs text-slate-500 font-medium">Overloaded Orders Handled</span>
              </div>
              <div className="p-4 bg-white/80 rounded-2xl border border-slate-200/80 shadow-xs">
                <span className="text-2xl font-extrabold text-emerald-600 block">100%</span>
                <span className="text-xs text-slate-500 font-medium">Capacity Overflow Protection</span>
              </div>
              <div className="p-4 bg-white/80 rounded-2xl border border-slate-200/80 shadow-xs">
                <span className="text-2xl font-extrabold text-slate-900 block">2.1 km</span>
                <span className="text-xs text-slate-500 font-medium">Avg Cook Radius Match</span>
              </div>
              <div className="p-4 bg-white/80 rounded-2xl border border-slate-200/80 shadow-xs">
                <span className="text-2xl font-extrabold text-amber-600 block">&lt; 10s</span>
                <span className="text-xs text-slate-500 font-medium">AI Dispatch Latency</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Interactive Problem / Solution Demo Overview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 lg:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-3xl mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-2">The Capacity Problem</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">How Ghule's AI Solves Peak Hour Spikes</h2>
            <p className="text-slate-400 text-sm mt-2">Example scenario running live in this application right now:</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-sm">
                01
              </div>
              <h3 className="font-bold text-base text-white">Order Spike (45 Orders)</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Spice Hub receives 45 customer orders. Internal kitchen capacity is set to 30 meals max.
              </p>
              <div className="bg-rose-950/60 p-2.5 rounded-xl border border-rose-800/80 text-[11px] text-rose-300 font-semibold">
                ALERT: 15 Excess Orders Overloaded
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
                02
              </div>
              <h3 className="font-bold text-base text-white">AI Cook Matching</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Matching score checks proximity, remaining capacity, availability & cuisine match for home cooks.
              </p>
              <div className="bg-amber-950/60 p-2.5 rounded-xl border border-amber-800/80 text-[11px] text-amber-300 font-semibold">
                Top Match: Priya Sharma (2.1 km, 10 Cap)
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                03
              </div>
              <h3 className="font-bold text-base text-white">Automated Allocation</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Excess 15 orders distributed cleanly to Priya & Sneha. Cook accepts and updates status live.
              </p>
              <div className="bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-800/80 text-[11px] text-emerald-300 font-semibold">
                STATUS: Distributed & Preparing
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role Selector Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900">Explore Role Dashboards</h2>
          <p className="text-slate-600 text-sm mt-2">Test all 4 participant roles in our distributed ecosystem:</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Kitchen */}
          <Link
            to="/kitchen/dashboard"
            className="glass-card glass-card-hover p-6 flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Utensils className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900">Cloud Kitchen</h3>
              <p className="text-xs text-slate-500 mt-2">
                Monitor capacity overload, view live order spikes, and trigger AI cook allocation.
              </p>
            </div>
            <div className="mt-6 flex items-center text-xs font-bold text-emerald-600 space-x-1">
              <span>Open Kitchen Hub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* Cook */}
          <Link
            to="/cook/dashboard"
            className="glass-card glass-card-hover p-6 flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ChefHat className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900">Home Cook</h3>
              <p className="text-xs text-slate-500 mt-2">
                Toggle availability, accept allocated meals, run voice AI call simulator, and track earnings.
              </p>
            </div>
            <div className="mt-6 flex items-center text-xs font-bold text-amber-600 space-x-1">
              <span>Open Cook Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* Customer */}
          <Link
            to="/browse-kitchens"
            className="glass-card glass-card-hover p-6 flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900">Customer Portal</h3>
              <p className="text-xs text-slate-500 mt-2">
                Browse cloud kitchen menus, place orders, and track real-time preparation status.
              </p>
            </div>
            <div className="mt-6 flex items-center text-xs font-bold text-blue-600 space-x-1">
              <span>Browse Kitchens</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* Admin */}
          <Link
            to="/admin/dashboard"
            className="glass-card glass-card-hover p-6 flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900">Platform Admin</h3>
              <p className="text-xs text-slate-500 mt-2">
                View platform analytics, manage kitchens & cooks, and chat with AI operations assistant.
              </p>
            </div>
            <div className="mt-6 flex items-center text-xs font-bold text-purple-600 space-x-1">
              <span>Open Admin Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}

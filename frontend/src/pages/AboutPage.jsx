import React from 'react';
import { ShieldCheck, Utensils, Heart, Award, Cpu, Globe } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-16">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold text-slate-900">About Ghule's Kitchen</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Pioneering distributed cloud kitchen capacity and empower home chefs through AI orchestration.
        </p>
      </div>

      <div className="glass-card p-8 space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Utensils className="w-6 h-6 text-emerald-600" />
          <span>Our Vision & Mission</span>
        </h2>
        <p className="text-slate-600 text-sm leading-relaxed">
          Cloud kitchens face extreme demand volatility during lunch and dinner peak hours. Expanding physical kitchen space for 2-hour daily spikes is cost-prohibitive. Ghule's Kitchen bridge this gap by connecting cloud kitchens with verified local home chefs who possess unused cooking bandwidth and authentic culinary talent.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900">AI Capacity Routing</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Real-time algorithmic dispatch calculating distance, workload, cuisine compatibility, and response speed.
          </p>
        </div>

        <div className="glass-card p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Heart className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900">Empower Home Chefs</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Unlocking flexible earning potential for passionate home cooks right from their home kitchens.
          </p>
        </div>

        <div className="glass-card p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900">Quality & Safety Standards</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Standardized recipes, ingredient check-ins, and strict hygiene protocols for every distributed order.
          </p>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Sparkles, Utensils, ChefHat, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HowItWorksPage() {
  const steps = [
    {
      num: '01',
      title: 'Order Placement & Overload Monitoring',
      desc: 'Customers place orders on Ghules Kitchen. As order volume approaches the main kitchen’s max capacity (e.g. 30 meals), the backend overload detector engages.',
      icon: Utensils,
      color: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      num: '02',
      title: 'AI Cook Matching Engine',
      desc: 'Our scoring algorithm calculates weighted scores for nearby home cooks based on: Availability (30%), Available Capacity (25%), Distance (20%), Cuisine (15%), and Workload (10%).',
      icon: Sparkles,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      num: '03',
      title: 'Automated Order Distribution & Voice Agent',
      desc: 'Excess orders are assigned to top-ranked cooks. Automated Voice AI (or text simulator) notifies the cook, parses natural speech response, and updates capacity.',
      icon: ChefHat,
      color: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    {
      num: '04',
      title: 'Real-Time Preparation & Live Tracking',
      desc: 'Cook accepts and prepares meals. Status changes from PREPARING to READY to OUT_FOR_DELIVERY with WebSocket updates sent to customer and kitchen.',
      icon: CheckCircle2,
      color: 'bg-purple-50 text-purple-700 border-purple-200'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-16">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold text-slate-900">How It Works</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          The 4-step AI orchestration workflow behind Ghules Kitchen load balancing.
        </p>
      </div>

      <div className="space-y-6">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="glass-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-start space-x-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-lg border ${s.color} shrink-0`}>
                  {s.num}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span>{s.title}</span>
                  </h3>
                  <p className="text-slate-600 text-sm mt-1 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 shrink-0">
                <Icon className="w-6 h-6 text-slate-600" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center pt-6">
        <Link
          to="/kitchen/dashboard"
          className="inline-flex items-center space-x-2 px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-600/30 transition-all"
        >
          <span>Test Live Overload Demo Flow</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

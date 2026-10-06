import React, { useState, useEffect } from 'react';
import { analyticsAPI, aiAPI, cooksAPI, complaintsAPI, packagingAPI, settingsAPI } from '../services/api';
import AIAssistantWidget from '../components/AIAssistantWidget';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  ShieldCheck, Utensils, ChefHat, Users, ShoppingBag, Sparkles,
  AlertTriangle, BarChart3, TrendingUp, DollarSign, Package, MessageSquare,
  CheckCircle2, XCircle, Sliders, RefreshCw, Calculator, HelpCircle
} from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('capacity');
  const [analytics, setAnalytics] = useState(null);
  const [matchedCooks, setMatchedCooks] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [cooks, setCooks] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [packaging, setPackaging] = useState([]);
  const [costSettings, setCostSettings] = useState(null);

  const [loading, setLoading] = useState(true);
  const [allocating, setAllocating] = useState(false);
  const [allocationResult, setAllocationResult] = useState(null);

  // Financial contribution calculator interactive state
  const [calcRevenue, setCalcRevenue] = useState(1200);
  const [calcQuantity, setCalcQuantity] = useState(100);
  const [calcInternal, setCalcInternal] = useState(40);
  const [calcPartner, setCalcPartner] = useState(60);
  const [calcDistance, setCalcDistance] = useState(2.0);
  const [calcResult, setCalcResult] = useState(null);

  // Chat reply state
  const [replyText, setReplyText] = useState('');
  const [activeConvId, setActiveConvId] = useState(null);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [aRes, cRes, convRes, cookRes, compRes, pkgRes, setRes] = await Promise.all([
        analyticsAPI.getStats(),
        aiAPI.matchCooks(1),
        aiAPI.getPartnerConversations(),
        cooksAPI.getAll(),
        complaintsAPI.getAll(),
        packagingAPI.getAll(1),
        settingsAPI.get()
      ]);
      setAnalytics(aRes.data);
      setMatchedCooks(cRes.data.recommended_cooks || []);
      setConversations(convRes.data);
      setCooks(cookRes.data);
      setComplaints(compRes.data);
      setPackaging(pkgRes.data);
      setCostSettings(setRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleRunAllocation = async () => {
    setAllocating(true);
    try {
      const res = await aiAPI.allocateOrders(1);
      setAllocationResult(res.data);
      await fetchAdminData();
    } catch (err) {
      console.error(err);
    } finally {
      setAllocating(false);
    }
  };

  const handleCalculateContrib = async () => {
    try {
      const res = await aiAPI.calculateContribution({
        total_revenue: calcRevenue,
        item_count: calcQuantity,
        distance_km: calcDistance,
        kitchen_internal_quantity: calcInternal,
        partner_quantity: calcPartner
      });
      setCalcResult(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApprovePartnerConv = async (convId) => {
    try {
      await aiAPI.approvePartnerConversation(convId);
      await fetchAdminData();
      alert("Home-Cook Partner approved and activated!");
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendAdminReply = async (convId) => {
    if (!replyText.trim()) return;
    try {
      await aiAPI.partnerChat({ conversation_id: convId, user_message: replyText });
      setReplyText('');
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerifyCook = async (cookId, status) => {
    try {
      await cooksAPI.verifyCook(cookId, { verification_status: status });
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveComplaint = async (compId) => {
    const resText = prompt("Enter resolution notes for customer:");
    if (!resText) return;
    try {
      await complaintsAPI.resolve(compId, { resolution: resText, status: "RESOLVED" });
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddStock = async (pkgId) => {
    try {
      await packagingAPI.updateStock(pkgId, { add_quantity: 50 });
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !analytics) return <LoadingSpinner message="Initializing Ghule's Kitchen Master Admin Command Center..." />;

  const { summary } = analytics;

  return (
    <div className="space-y-8 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold text-slate-900">Ghule's Kitchen Founder Command Center</h1>
            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
              Thergaon Main Hub
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Smart Kitchen Capacity Management, Hyperlocal Partner Dispatch & Contribution Analytics</p>
        </div>

        <button
          onClick={fetchAdminData}
          className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">Today's Orders</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{summary.total_orders || 45}</div>
          <span className="text-[11px] text-slate-500">Total order volume</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">Ghule's Kitchen Cap</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">40 / 100</div>
          <span className="text-[11px] text-amber-600 font-bold">60 extra required</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">Verified Cooks</span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">{cooks.filter(c => c.verification_status === 'APPROVED').length}</div>
          <span className="text-[11px] text-slate-500">Thergaon / Wakad</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">AI Escalations</span>
          <div className="text-2xl font-extrabold text-rose-600 mt-1">
            {conversations.filter(c => c.status === 'ESCALATED_ADMIN_REQUIRED').length}
          </div>
          <span className="text-[11px] text-rose-600 font-semibold">Admin action needed</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">Packaging Stock</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            {packaging.filter(p => p.is_low_stock).length > 0 ? '⚠️ Low' : 'OK'}
          </div>
          <span className="text-[11px] text-slate-500">Inventory alerts</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">Est. Contribution</span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">42.5%</div>
          <span className="text-[11px] text-emerald-600 font-semibold">Average Net Margin</span>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'capacity', label: '⚡ Smart Capacity & 100-Roti Demo', icon: Utensils },
          { id: 'financials', label: '💰 Contribution Calculator', icon: Calculator },
          { id: 'conversations', label: '🤖 AI Partner Conversations', icon: MessageSquare },
          { id: 'verification', label: '🛡️ Partner Verification', icon: ShieldCheck },
          { id: 'quality', label: '🚨 Quality & Complaints', icon: AlertTriangle },
          { id: 'packaging', label: '📦 Packaging Stock', icon: Package },
          { id: 'settings', label: '⚙️ Business Rules', icon: Sliders }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center space-x-2 ${
                isActive
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: SMART CAPACITY & 100-ROTI ORDER DEMO */}
      {activeTab === 'capacity' && (
        <div className="space-y-6">
          {/* Overload Alert Box */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-900 uppercase">
                  Scenario Demo: Bulk Order Surge
                </span>
                <h2 className="text-xl font-extrabold text-amber-400 mt-2">
                  Order #1: 100 Rotis Bulk Order (Rahul Verma)
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Ghule's Kitchen Capacity = 40 Rotis • Extra Capacity Required = 60 Rotis
                </p>
              </div>

              <button
                onClick={handleRunAllocation}
                disabled={allocating}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs rounded-2xl shadow-lg transition flex items-center space-x-2 shrink-0"
              >
                <Sparkles className="w-4 h-4" />
                <span>{allocating ? 'AI Dispatching Orders...' : 'Trigger AI Smart Order Allocation'}</span>
              </button>
            </div>

            {/* Allocation Result Banner */}
            {allocationResult && (
              <div className="bg-emerald-950/80 border border-emerald-500/40 p-4 rounded-2xl text-emerald-200 text-xs space-y-2">
                <div className="font-bold text-sm text-emerald-300">✓ AI Order Splitting Executed Successfully!</div>
                <p>{allocationResult.message}</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                  {allocationResult.assignments.map((asg, idx) => (
                    <div key={idx} className="bg-emerald-900/60 p-2.5 rounded-xl border border-emerald-700 text-[11px]">
                      <span className="font-bold text-white">{asg.cook_name}:</span> {asg.assigned_quantity} rotis (Payout: ₹{asg.payout_amount})
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Hyperlocal Cook Matching Score Table */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Nearby Verified Cook Matching Scores</h3>
                <p className="text-xs text-slate-500">Matching Score = Distance (20%) + Capacity (25%) + Availability (25%) + Specialization (15%) + Workload (15%)</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-3">Home Cook</th>
                    <th className="py-3 px-3">Location & Distance</th>
                    <th className="py-3 px-3">Capacity</th>
                    <th className="py-3 px-3">Specialization</th>
                    <th className="py-3 px-3">Hygiene Score</th>
                    <th className="py-3 px-3">Matching Score</th>
                    <th className="py-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {matchedCooks.map((c) => (
                    <tr key={c.cook_id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-3 font-bold text-slate-900">{c.cook_name}</td>
                      <td className="py-3.5 px-3 text-slate-600">📍 {c.location} ({c.distance_km} km)</td>
                      <td className="py-3.5 px-3 font-semibold text-slate-800">{c.available_capacity} rotis</td>
                      <td className="py-3.5 px-3 text-slate-600">{c.specialization}</td>
                      <td className="py-3.5 px-3 text-emerald-600 font-bold">98% Verified</td>
                      <td className="py-3.5 px-3">
                        <span className="px-2.5 py-1 rounded-full font-extrabold text-xs bg-emerald-100 text-emerald-800">
                          {Math.round(c.score * 100)}% Match
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        {c.available ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">Eligible</span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">Offline / Unverified</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FINANCIAL PROFITABILITY & CONTRIBUTION CALCULATOR */}
      {activeTab === 'financials' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-6">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Order Contribution & Profitability Calculator</h2>
            <p className="text-xs text-slate-500">Calculate net contribution margins for orders distributed across internal kitchen and partner cooks.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Calculator Controls */}
            <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <h3 className="font-bold text-sm text-slate-800">Configure Order Parameters</h3>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Customer Order Value (Revenue ₹):</label>
                <input
                  type="number"
                  value={calcRevenue}
                  onChange={(e) => setCalcRevenue(Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Ghule's Kitchen Portion (units):</label>
                  <input
                    type="number"
                    value={calcInternal}
                    onChange={(e) => setCalcInternal(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Partner Cook Portion (units):</label>
                  <input
                    type="number"
                    value={calcPartner}
                    onChange={(e) => setCalcPartner(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-bold text-orange-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Delivery Distance (km):</label>
                <input
                  type="number"
                  step="0.5"
                  value={calcDistance}
                  onChange={(e) => setCalcDistance(Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-bold"
                />
              </div>

              <button
                onClick={handleCalculateContribution}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow transition"
              >
                Calculate Net Contribution Breakdown
              </button>
            </div>

            {/* Contribution Results Panel */}
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-800">Estimated Cost & Profitability Breakdown</h3>

              {calcResult ? (
                <div className="bg-slate-900 text-white p-6 rounded-2xl space-y-4 shadow-xl border border-slate-800">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <span className="text-xs text-slate-400">Total Customer Revenue</span>
                    <span className="text-xl font-extrabold text-amber-400">₹{calcResult.total_revenue}</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>• Raw Food Prep Cost (Internal):</span>
                      <span className="font-mono">₹{calcResult.food_prep_cost}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>• Home-Cook Partner Payout:</span>
                      <span className="font-mono text-orange-400">₹{calcResult.partner_payout}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>• Packaging Containers & Bags:</span>
                      <span className="font-mono">₹{calcResult.packaging_cost}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>• Delivery & Logistics ({calcResult.distance_km} km):</span>
                      <span className="font-mono">₹{calcResult.delivery_cost}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>• Platform & Payment Fee:</span>
                      <span className="font-mono">₹{calcResult.platform_fee}</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-800 pt-3 flex justify-between items-center">
                    <div>
                      <span className="text-xs text-slate-400 block">Net Estimated Contribution</span>
                      <span className="text-2xl font-extrabold text-emerald-400">₹{calcResult.estimated_contribution}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Contribution Margin %</span>
                      <span className="text-2xl font-extrabold text-emerald-400">{calcResult.contribution_margin_pct}%</span>
                    </div>
                  </div>

                  <div className="bg-emerald-950/60 p-3 rounded-xl border border-emerald-700/60 text-emerald-200 text-xs font-semibold">
                    ✅ {calcResult.recommendation}
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-2xl text-xs text-slate-400">
                  Click 'Calculate Net Contribution Breakdown' to evaluate order economics.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AI PARTNER CONVERSATIONS & ESCALATION DASHBOARD */}
      {activeTab === 'conversations' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">AI Partner Onboarding & Conversation Center</h2>
              <p className="text-xs text-slate-500">AI Assistant handles routine partner inquiries. Complex rate queries are escalated for Admin review.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Conversation List */}
            <div className="lg:col-span-1 space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition ${
                    activeConvId === conv.id
                      ? 'bg-slate-900 text-white border-slate-800 shadow-md'
                      : conv.status === 'ESCALATED_ADMIN_REQUIRED'
                      ? 'bg-rose-50 border-rose-200 text-slate-800 hover:bg-rose-100'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-sm">{conv.partner_name}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      conv.status === 'ESCALATED_ADMIN_REQUIRED'
                        ? 'bg-rose-600 text-white'
                        : conv.status === 'APPROVED'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-500 text-white'
                    }`}>
                      {conv.status === 'ESCALATED_ADMIN_REQUIRED' ? 'Escalated' : conv.status}
                    </span>
                  </div>
                  <p className="text-xs line-clamp-2 opacity-80">{conv.ai_summary}</p>
                </div>
              ))}
            </div>

            {/* Active Conversation Detail Window */}
            <div className="lg:col-span-2 bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
              {activeConvId ? (() => {
                const conv = conversations.find(c => c.id === activeConvId);
                if (!conv) return null;
                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <div>
                        <h3 className="font-extrabold text-base text-slate-900">{conv.partner_name}</h3>
                        <p className="text-xs text-slate-500">📍 {conv.location || 'Location Pending'} • Capacity: {conv.daily_capacity} rotis/day</p>
                      </div>

                      {conv.status !== 'APPROVED' && (
                        <button
                          onClick={() => handleApprovePartnerConv(conv.id)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition"
                        >
                          Approve & Activate Partner
                        </button>
                      )}
                    </div>

                    <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-900 font-medium">
                      🤖 <span className="font-bold">AI Summary:</span> {conv.ai_summary}
                    </div>

                    {/* Chat Messages Log */}
                    <div className="space-y-3 max-h-64 overflow-y-auto p-3 bg-white rounded-xl border border-slate-200">
                      {conv.messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${
                            msg.sender === 'PARTNER' ? 'items-start' : 'items-end'
                          }`}
                        >
                          <span className="text-[10px] font-bold text-slate-400 mb-0.5">{msg.sender}</span>
                          <div
                            className={`p-3 rounded-2xl text-xs max-w-[80%] ${
                              msg.sender === 'PARTNER'
                                ? 'bg-slate-100 text-slate-800 rounded-tl-none'
                                : 'bg-orange-600 text-white rounded-tr-none font-medium'
                            }`}
                          >
                            {msg.message_text}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Admin Reply */}
                    <div className="flex space-x-2 pt-2">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Reply directly as Admin..."
                        className="flex-1 text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <button
                        onClick={() => handleSendAdminReply(conv.id)}
                        className="px-4 py-3 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800"
                      >
                        Send Reply
                      </button>
                    </div>
                  </div>
                );
              })() : (
                <div className="text-center py-20 text-xs text-slate-400">Select a partner conversation from the list to view chat transcript & summary.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PARTNER VERIFICATION & HYGIENE CHECKLIST */}
      {activeTab === 'verification' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Home-Cook Partner Verification & Hygiene Checklist</h2>
            <p className="text-xs text-slate-500">Admin must verify identity, kitchen hygiene score & service area before activating partners.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Home Cook</th>
                  <th className="py-3 px-3">Location & Radius</th>
                  <th className="py-3 px-3">Specialization</th>
                  <th className="py-3 px-3">Daily Capacity</th>
                  <th className="py-3 px-3">Hygiene Score</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cooks.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-3 font-bold text-slate-900">{c.name}</td>
                    <td className="py-3.5 px-3 text-slate-600">📍 {c.location} ({c.service_radius_km} km)</td>
                    <td className="py-3.5 px-3 text-slate-600">{c.specialization}</td>
                    <td className="py-3.5 px-3 font-semibold text-slate-800">{c.max_capacity} rotis/day</td>
                    <td className="py-3.5 px-3 font-bold text-emerald-600">🧼 {c.hygiene_score}%</td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        c.verification_status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {c.verification_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 flex space-x-2">
                      {c.verification_status !== 'APPROVED' ? (
                        <button
                          onClick={() => handleVerifyCook(c.id, 'APPROVED')}
                          className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-700"
                        >
                          Approve
                        </button>
                      ) : (
                        <button
                          onClick={() => handleVerifyCook(c.id, 'REJECTED')}
                          className="px-3 py-1.5 bg-slate-100 text-slate-600 font-semibold rounded-xl text-xs hover:bg-slate-200"
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: QUALITY CONTROL & COMPLAINTS */}
      {activeTab === 'quality' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Quality Control & Customer Complaints Center</h2>
            <p className="text-xs text-slate-500">Investigate food quality reports, missing items, packaging defects, and log administrative resolutions.</p>
          </div>

          {complaints.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400">No open customer complaints reported.</div>
          ) : (
            <div className="space-y-3">
              {complaints.map((comp) => (
                <div key={comp.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-xs text-rose-600 bg-rose-100 px-2.5 py-0.5 rounded-full uppercase">
                        {comp.type}
                      </span>
                      <span className="font-bold text-xs text-slate-900">Order #{comp.order_id}</span>
                      <span className="text-xs text-slate-400">• Customer: {comp.customer_name}</span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium mt-1 font-sans">{comp.description}</p>
                    {comp.resolution && (
                      <p className="text-xs text-emerald-700 font-semibold mt-1 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                        ✓ Resolution: {comp.resolution}
                      </p>
                    )}
                  </div>

                  {comp.status === 'OPEN' && (
                    <button
                      onClick={() => handleResolveComplaint(comp.id)}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow shrink-0"
                    >
                      Investigate & Resolve
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: PACKAGING INVENTORY */}
      {activeTab === 'packaging' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Packaging Inventory Management</h2>
              <p className="text-xs text-slate-500">Track eco roti boxes, curry containers, paper carry bags & thermal sealing rolls.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {packaging.map((item) => (
              <div key={item.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-xs text-slate-900">{item.item_name}</h4>
                  {item.is_low_stock && (
                    <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                      Low Stock
                    </span>
                  )}
                </div>
                <div className="text-2xl font-extrabold text-slate-900">
                  {item.available_quantity} <span className="text-xs text-slate-400 font-normal">{item.unit}</span>
                </div>
                <div className="text-[11px] text-slate-500 flex justify-between">
                  <span>Min threshold: {item.min_threshold} {item.unit}</span>
                  <span className="font-semibold text-slate-700">₹{item.cost_per_unit}/unit</span>
                </div>

                <button
                  onClick={() => handleAddStock(item.id)}
                  className="w-full mt-2 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl transition"
                >
                  + Add 50 Stock Units
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Embedded Admin AI Assistant */}
      <AIAssistantWidget userRole="ADMIN" />
    </div>
  );
}

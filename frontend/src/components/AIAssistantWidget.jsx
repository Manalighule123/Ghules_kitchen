import React, { useState } from 'react';
import { aiAPI } from '../services/api';
import { Bot, Send, Sparkles, HelpCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function AIAssistantWidget({ kitchenId = null, userRole = 'ADMIN' }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const sampleQuestions = [
    "Why was Priya selected for these orders?",
    "How many orders are currently overloaded?",
    "Which cooks are available right now?",
    "How many orders are being prepared externally?",
    "What is the current kitchen capacity?"
  ];

  const handleAsk = async (textToAsk) => {
    const q = textToAsk || query;
    if (!q.trim()) return;

    setLoading(true);
    setResponse(null);

    try {
      const res = await aiAPI.askAssistant(q, kitchenId, userRole);
      setResponse(res.data);
    } catch (err) {
      console.error('AI Assistant query error:', err);
      setResponse({
        query: q,
        answer: "The AI assistant service encountered a temporary error. Please verify backend connection.",
        sources: ["Local Fallback Engine"],
        suggested_actions: ["Refresh Dashboard"]
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-emerald-950 text-white rounded-3xl p-6 shadow-xl border border-slate-800">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base tracking-tight flex items-center gap-2">
              <span>Ghule's AI Operations Assistant</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30 uppercase">
                Live DB AI
              </span>
            </h3>
            <p className="text-xs text-slate-400">Ask questions about order spikes, cook selection, capacity and distribution logic.</p>
          </div>
        </div>
      </div>

      {/* Suggested Quick Questions */}
      <div className="mb-4">
        <p className="text-xs text-slate-400 font-medium mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Quick AI Demo Queries:</span>
        </p>
        <div className="flex flex-wrap gap-1.5">
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuery(q);
                handleAsk(q);
              }}
              className="text-xs bg-slate-800/90 hover:bg-emerald-600/30 hover:border-emerald-500/40 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 transition-all text-left"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Query Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk();
        }}
        className="flex items-center space-x-2 mb-4"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type your question about capacity or cooks..."
            className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-white px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center space-x-1.5 transition-all shadow-md shadow-emerald-900/40"
        >
          {loading ? (
            <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <>
              <span>Ask AI</span>
              <Send className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      {/* Response Display Box */}
      {response && (
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 text-xs space-y-3 animate-in fade-in duration-200">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              AI Query Response
            </span>
            <p className="text-slate-200 text-sm leading-relaxed font-normal bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              "{response.answer}"
            </p>
          </div>

          {response.sources && response.sources.length > 0 && (
            <div className="flex items-center space-x-2 text-[11px] text-slate-400">
              <span className="font-semibold text-slate-500">Data Sources:</span>
              <div className="flex flex-wrap gap-1">
                {response.sources.map((src, i) => (
                  <span key={i} className="bg-slate-700/60 px-2 py-0.5 rounded-md text-slate-300">
                    {src}
                  </span>
                ))}
              </div>
            </div>
          )}

          {response.suggested_actions && response.suggested_actions.length > 0 && (
            <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between">
              <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Suggested System Actions:
              </span>
              <div className="flex gap-2">
                {response.suggested_actions.map((act, i) => (
                  <span key={i} className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800/80 px-2 py-1 rounded-md font-medium">
                    {act}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

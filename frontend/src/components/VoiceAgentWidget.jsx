import React, { useState } from 'react';
import { voiceAPI } from '../services/api';
import { PhoneCall, Mic, MicOff, Send, CheckCircle2, Volume2, Sparkles } from 'lucide-react';

export default function VoiceAgentWidget({ cookId = 1, cookName = "Priya Sharma", onCapacityUpdated }) {
  const [callActive, setCallActive] = useState(false);
  const [incomingText, setIncomingText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionResult, setSessionResult] = useState(null);

  const presetResponses = [
    "I can prepare 10 meals",
    "Yes, I am available for 5 orders",
    "I can take 8 thalis today",
    "I am not available right now",
    "I am unavailable today"
  ];

  const handleSimulateCall = async (textToSubmit) => {
    const text = textToSubmit || incomingText;
    if (!text.trim()) return;

    setLoading(true);
    setSessionResult(null);

    try {
      const res = await voiceAPI.simulateCall(cookId, text);
      setSessionResult(res.data);
      if (onCapacityUpdated) onCapacityUpdated(res.data);
    } catch (err) {
      console.error('Voice call simulation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200/80">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-200">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <span>Voice AI Agent Simulator</span>
              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full uppercase">
                Whisper Prototype
              </span>
            </h3>
            <p className="text-xs text-slate-500">Simulate automated voice dispatch calls with natural language cook responses.</p>
          </div>
        </div>

        <button
          onClick={() => setCallActive(!callActive)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
            callActive ? 'bg-rose-100 text-rose-700 hover:bg-rose-200' : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm'
          }`}
        >
          {callActive ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          <span>{callActive ? 'End Call' : 'Simulate Call'}</span>
        </button>
      </div>

      {/* Simulated AI Dispatch Prompt */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl mb-4 border border-slate-800">
        <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold mb-1">
          <Volume2 className="w-4 h-4 animate-pulse" />
          <span>AI Automated Voice Prompt:</span>
        </div>
        <p className="text-xs text-slate-200 italic font-mono bg-slate-800/80 p-3 rounded-xl border border-slate-700">
          "Hello {cookName}, this is Ghules Kitchen AI Dispatch! We have an order demand spike. Are you available to prepare extra home meals today?"
        </p>
      </div>

      {/* Preset Quick Responses */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Click a preset speech response:</span>
        </p>
        <div className="flex flex-wrap gap-1.5">
          {presetResponses.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                setIncomingText(preset);
                handleSimulateCall(preset);
              }}
              className="text-xs bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200 transition-colors text-left"
            >
              "{preset}"
            </button>
          ))}
        </div>
      </div>

      {/* Manual Speech Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSimulateCall();
        }}
        className="flex items-center space-x-2 mb-4"
      >
        <input
          type="text"
          value={incomingText}
          onChange={(e) => setIncomingText(e.target.value)}
          placeholder="Or type what the cook says (e.g., 'I can prepare 10 thalis')..."
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
        />
        <button
          type="submit"
          disabled={loading || !incomingText.trim()}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 text-white px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center space-x-1.5 transition-all shadow-sm"
        >
          {loading ? (
            <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <>
              <span>Process Speech</span>
              <Send className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      {/* NLP Result Display */}
      {sessionResult && (
        <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 text-xs space-y-2 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2">
            <span className="font-bold text-emerald-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>NLP Intent Output</span>
            </span>
            <span className="text-[11px] bg-emerald-200 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
              INTENT: {sessionResult.nlp_result.intent}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-slate-700 pt-1">
            <div>
              <span className="text-slate-500 block text-[11px]">Availability Status:</span>
              <span className={`font-bold ${sessionResult.updated_availability ? 'text-emerald-700' : 'text-rose-700'}`}>
                {sessionResult.updated_availability ? 'ONLINE / AVAILABLE' : 'OFFLINE / UNAVAILABLE'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Updated Cooking Capacity:</span>
              <span className="font-bold text-slate-900">{sessionResult.updated_cook_capacity} meals</span>
            </div>
          </div>

          <p className="text-[11px] text-emerald-800 pt-1 border-t border-emerald-200/60 italic">
            {sessionResult.status_message}
          </p>
        </div>
      )}
    </div>
  );
}

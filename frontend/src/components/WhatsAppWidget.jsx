import React from 'react';
import { MessageCircle, Phone } from 'lucide-react';

export default function WhatsAppWidget() {
  const phoneNumber = '919767781142';
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=Hello%20Ghule's%20Kitchen,%20I%20would%20like%20to%20connect%20with%20you!`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-3 rounded-full shadow-2xl hover:shadow-emerald-500/40 transform hover:-translate-y-1 transition-all duration-300 group"
      title="Connect on WhatsApp (+91 9767781142)"
    >
      <div className="relative">
        <MessageCircle className="w-6 h-6 fill-white text-emerald-600 animate-pulse" />
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-300 rounded-full animate-ping"></span>
      </div>
      <div className="flex flex-col text-left">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-100">WhatsApp Connect</span>
        <span className="text-xs font-bold leading-none">+91 9767781142</span>
      </div>
    </a>
  );
}

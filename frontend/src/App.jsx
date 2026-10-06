import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Public Pages
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import HowItWorksPage from './pages/HowItWorksPage';
import LoginPage from './pages/LoginPage';
import BrowseKitchens from './pages/BrowseKitchens';

// Customer Pages
import CustomerDashboard from './pages/CustomerDashboard';
import OrderTrackingPage from './pages/OrderTrackingPage';
import OrderHistoryPage from './pages/OrderHistoryPage';

// Kitchen Pages
import KitchenDashboard from './pages/KitchenDashboard';
import IncomingOrdersPage from './pages/IncomingOrdersPage';
import OverloadDetectionPage from './pages/OverloadDetectionPage';

// Cook Pages
import CookDashboard from './pages/CookDashboard';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AIAllocationPage from './pages/AIAllocationPage';

import WhatsAppWidget from './components/WhatsAppWidget';

export default function App() {
  const { role } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getRoleDashboardRedirect = () => {
    switch (role) {
      case 'admin': return <Navigate to="/admin/dashboard" replace />;
      case 'kitchen': return <Navigate to="/kitchen/dashboard" replace />;
      case 'cook': return <Navigate to="/cook/dashboard" replace />;
      case 'customer':
      default: return <Navigate to="/customer/dashboard" replace />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased relative">
      <Navbar onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 gap-6 items-start">
        <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

        <main className="flex-1 min-w-0 w-full transition-all">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/browse-kitchens" element={<BrowseKitchens />} />
            <Route path="/order-tracking" element={<OrderTrackingPage />} />

            {/* Dashboard Redirect */}
            <Route path="/dashboard" element={getRoleDashboardRedirect()} />

            {/* Customer Routes */}
            <Route path="/customer/dashboard" element={<CustomerDashboard />} />
            <Route path="/customer/order-history" element={<OrderHistoryPage />} />

            {/* Kitchen Routes */}
            <Route path="/kitchen/dashboard" element={<KitchenDashboard />} />
            <Route path="/kitchen/incoming-orders" element={<IncomingOrdersPage />} />
            <Route path="/kitchen/overload" element={<OverloadDetectionPage />} />
            <Route path="/kitchen/available-cooks" element={<KitchenDashboard />} />
            <Route path="/kitchen/distributed-orders" element={<AIAllocationPage />} />

            {/* Cook Routes */}
            <Route path="/cook/dashboard" element={<CookDashboard />} />
            <Route path="/cook/assigned-orders" element={<CookDashboard />} />
            <Route path="/cook/voice-agent" element={<CookDashboard />} />
            <Route path="/cook/earnings" element={<CookDashboard />} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/kitchens" element={<AdminDashboard />} />
            <Route path="/admin/cooks" element={<AdminDashboard />} />
            <Route path="/admin/customers" element={<AdminDashboard />} />
            <Route path="/admin/orders" element={<IncomingOrdersPage />} />
            <Route path="/admin/ai-allocation" element={<AIAllocationPage />} />
            <Route path="/admin/analytics" element={<AdminDashboard />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      <WhatsAppWidget />
    </div>
  );
}

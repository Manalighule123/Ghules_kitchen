import React, { useState, useEffect } from 'react';
import { kitchensAPI, ordersAPI, cooksAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import AIFoodRecognitionModal from '../components/AIFoodRecognitionModal';
import CookProfileModal from '../components/CookProfileModal';
import { Utensils, Plus, Minus, ArrowRight, Star, Clock, Camera, User, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function BrowseKitchens() {
  const [kitchens, setKitchens] = useState([]);
  const [selectedKitchen, setSelectedKitchen] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [cooks, setCooks] = useState([]);
  const [selectedCook, setSelectedCook] = useState(null);
  const [cart, setCart] = useState({}); // itemId -> qty
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('Flat 402, Royal Palms Society, Thergaon, Pune - 411033');
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState('07:30 PM Today');
  const [customerNotes, setCustomerNotes] = useState('');

  const [aiLensOpen, setAiLensOpen] = useState(false);
  const [cookModalOpen, setCookModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([kitchensAPI.getAll(), cooksAPI.getAll()])
      .then(([kRes, cRes]) => {
        setKitchens(kRes.data);
        setCooks(cRes.data);
        if (kRes.data.length > 0) {
          selectKitchen(kRes.data[0]);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const selectKitchen = (k) => {
    setSelectedKitchen(k);
    setCart({});
    kitchensAPI.getMenu(k.id)
      .then(res => setMenuItems(res.data))
      .catch(err => console.error(err));
  };

  const updateCartQty = (itemId, delta) => {
    setCart(prev => {
      const current = prev[itemId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      }
      return { ...prev, [itemId]: next };
    });
  };

  const handleAiDetectedItemAdd = (detected) => {
    const matched = menuItems.find(m => m.name.toLowerCase().includes(detected.name.toLowerCase()) || detected.name.toLowerCase().includes(m.name.toLowerCase()));
    if (matched) {
      updateCartQty(matched.id, 10);
    } else if (menuItems.length > 0) {
      updateCartQty(menuItems[0].id, 10);
    }
  };

  const calculateTotal = () => {
    return Object.entries(cart).reduce((sum, [itemId, qty]) => {
      const item = menuItems.find(m => m.id === parseInt(itemId));
      return sum + (item ? item.price * qty : 0);
    }, 0);
  };

  const calculateTotalQty = () => {
    return Object.values(cart).reduce((a, b) => a + b, 0);
  };

  const handlePlaceOrder = async () => {
    const itemsToOrder = Object.entries(cart).map(([itemId, qty]) => ({
      menu_item_id: parseInt(itemId),
      quantity: qty
    }));

    if (itemsToOrder.length === 0) return;

    setPlacingOrder(true);
    try {
      const res = await ordersAPI.create({
        kitchen_id: selectedKitchen.id,
        items: itemsToOrder,
        delivery_address: deliveryAddress,
        preferred_delivery_time: deliveryTimeSlot,
        customer_notes: customerNotes,
        priority: calculateTotalQty() >= 30 ? "HIGH" : "NORMAL"
      });
      navigate(`/order-tracking?id=${res.data.id}`);
    } catch (err) {
      console.error('Error placing order:', err);
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading homemade kitchens & verified partner network..." />;

  const filteredMenuItems = menuItems.filter(item => {
    const matchCat = categoryFilter === 'ALL' || item.category === categoryFilter;
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-8 pb-24">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-amber-500 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-amber-100 uppercase tracking-wider mb-2 inline-block">
            Ghule's Kitchen • Hyperlocal Homemade Food
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Fresh Homemade Food & Smart Capacity Dispatch
          </h1>
          <p className="text-amber-100 text-xs md:text-sm mt-1 max-w-xl">
            Order authentic rotis, thalis & curries. Powered by Ghule's Kitchen & verified local home-cook partners in Thergaon, Wakad & Pune.
          </p>
        </div>

        <button
          onClick={() => setAiLensOpen(true)}
          className="px-5 py-3 bg-white text-orange-700 hover:bg-orange-50 font-bold text-xs rounded-2xl shadow-lg transition flex items-center space-x-2 shrink-0 border border-orange-200"
        >
          <Camera className="w-4 h-4 text-orange-600" />
          <span>AI Food Recognition Lens</span>
        </button>
      </div>

      {/* Main Kitchen selection */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Utensils className="w-5 h-5 text-orange-600" />
            <span>Ghule's Kitchen Outlets</span>
          </h2>
          <span className="text-xs text-slate-500 font-medium">Thergaon Main Kitchen (100 Rotis/Day Max Capacity)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {kitchens.map((k) => {
            const isSelected = selectedKitchen?.id === k.id;
            return (
              <div
                key={k.id}
                onClick={() => selectKitchen(k)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl border-slate-700 scale-[1.02]'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-base">{k.name}</h3>
                  <span className="text-[10px] font-extrabold bg-emerald-500 text-white px-2.5 py-0.5 rounded-full">
                    Capacity: {k.current_capacity}/{k.total_capacity}
                  </span>
                </div>
                <p className={`text-xs ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>📍 {k.location}</p>
                <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-current/10 font-medium">
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-current text-amber-400" /> 4.9 (120+ reviews)
                  </span>
                  <span className="text-emerald-400 text-[11px] font-bold">✓ Direct Kitchen</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Verified Home-Cook Partners Network Bar */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-base text-amber-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Verified Home-Cook Partners Network</span>
            </h3>
            <p className="text-xs text-slate-400">Nearby verified home cooks ready for excess workload assistance</p>
          </div>
          <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800">
            {cooks.filter(c => c.verification_status === 'APPROVED').length} Active Verified Partners
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {cooks.map((c) => (
            <div
              key={c.id}
              onClick={() => { setSelectedCook(c); setCookModalOpen(true); }}
              className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 p-3.5 rounded-2xl cursor-pointer transition flex items-center justify-between"
            >
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-xs text-slate-100">{c.name}</span>
                  {c.verification_status === 'APPROVED' && <span className="text-emerald-400 text-xs">✓</span>}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">📍 {c.location}</p>
                <p className="text-[10px] text-amber-300 font-medium mt-1">⭐ {c.rating} • Cap: {c.current_capacity} meals</p>
              </div>
              <User className="w-4 h-4 text-slate-400" />
            </div>
          ))}
        </div>
      </div>

      {/* Menu & Cart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Menu Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">{selectedKitchen?.name} Menu</h2>
              <p className="text-xs text-slate-500">Freshly cooked to order with home recipes</p>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap gap-1.5">
              {['ALL', 'Indian Bread', 'Thali', 'Curry', 'Rice & Dal', 'Sweets'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    categoryFilter === cat
                      ? 'bg-orange-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredMenuItems.map((item) => {
              const qty = cart[item.id] || 0;
              return (
                <div key={item.id} className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-sm text-slate-900">{item.name}</h3>
                      <span className="font-extrabold text-sm text-orange-600">₹{item.price}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.description}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" /> {item.preparation_time} mins prep
                    </span>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl">
                      <button
                        onClick={() => updateCartQty(item.id, -1)}
                        className="w-7 h-7 rounded-lg bg-white shadow-xs flex items-center justify-center text-slate-700 hover:bg-slate-200"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-extrabold text-slate-900 w-5 text-center">{qty}</span>
                      <button
                        onClick={() => updateCartQty(item.id, 1)}
                        className="w-7 h-7 rounded-lg bg-orange-600 text-white shadow-xs flex items-center justify-center hover:bg-orange-700"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Cart Drawer */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl sticky top-24 space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>Your Cart</span>
              <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
                {calculateTotalQty()} items
              </span>
            </h3>

            {calculateTotalQty() === 0 ? (
              <div className="text-center py-10 space-y-2">
                <div className="text-3xl">🫓</div>
                <p className="text-xs font-semibold text-slate-600">Your cart is currently empty</p>
                <p className="text-[11px] text-slate-400">Select rotis, thalis or curries to place an order</p>
              </div>
            ) : (
              <>
                <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                  {Object.entries(cart).map(([itemId, qty]) => {
                    const item = menuItems.find(m => m.id === parseInt(itemId));
                    if (!item) return null;
                    return (
                      <div key={itemId} className="flex justify-between items-center text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <div>
                          <span className="font-bold text-slate-900">{qty}x</span> {item.name}
                        </div>
                        <span className="font-extrabold text-slate-900">₹{item.price * qty}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Delivery Time & Address Inputs */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Delivery Address:</label>
                    <input
                      type="text"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Preferred Delivery Time:</label>
                    <select
                      value={deliveryTimeSlot}
                      onChange={(e) => setDeliveryTimeSlot(e.target.value)}
                      className="w-full text-xs p-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-none font-medium"
                    >
                      <option value="ASAP">ASAP (Next 30-45 mins)</option>
                      <option value="07:30 PM Today">07:30 PM Today (Dinner)</option>
                      <option value="08:30 PM Today">08:30 PM Today (Late Dinner)</option>
                      <option value="12:30 PM Tomorrow">12:30 PM Tomorrow (Lunch)</option>
                    </select>
                  </div>
                </div>

                {/* Large order capacity notification */}
                {calculateTotalQty() >= 30 && (
                  <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl text-amber-800 text-[11px]">
                    ⚡ <span className="font-bold">Bulk Order Detected ({calculateTotalQty()} units):</span> Ghule's Kitchen AI dispatch will automatically coordinate nearby verified home cooks if internal capacity is exceeded.
                  </div>
                )}

                <div className="pt-3 border-t border-slate-200 space-y-3">
                  <div className="flex justify-between text-base font-extrabold text-slate-900">
                    <span>Total Amount:</span>
                    <span className="text-orange-600">₹{calculateTotal()}</span>
                  </div>

                  <button
                    onClick={handlePlaceOrder}
                    disabled={placingOrder}
                    className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-orange-500/20 flex items-center justify-center space-x-2 transition-all"
                  >
                    {placingOrder ? (
                      <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <>
                        <span>Place Order & Track Live</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AIFoodRecognitionModal 
        isOpen={aiLensOpen} 
        onClose={() => setAiLensOpen(false)} 
        onAddToCart={handleAiDetectedItemAdd} 
      />

      <CookProfileModal 
        cook={selectedCook} 
        isOpen={cookModalOpen} 
        onClose={() => setCookModalOpen(false)} 
      />
    </div>
  );
}

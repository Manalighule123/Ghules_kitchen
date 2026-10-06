import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { Utensils, ShieldCheck, ChefHat, User, ArrowRight, Lock, Mail, Phone, MapPin, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const { loginUser, switchDemoRole, DEMO_ACCOUNTS } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Login State
  const [email, setEmail] = useState('kitchen@ghuleskitchen.com');
  const [password, setPassword] = useState('kitchen123');

  // Register State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRole, setRegRole] = useState('customer'); // customer or cook
  const [regLocation, setRegLocation] = useState('Thergaon, Pune');
  const [regCapacity, setRegCapacity] = useState(30);
  const [regSpecialization, setRegSpecialization] = useState('Whole Wheat Chapati & Rotis');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await authAPI.login(email, password);
      loginUser(res.data.user, res.data.access_token);
      
      const role = res.data.user.role;
      if (role === 'admin') navigate('/admin/dashboard');
      else if (role === 'kitchen') navigate('/kitchen/dashboard');
      else if (role === 'cook') navigate('/cook/dashboard');
      else navigate('/customer/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const regRes = await authAPI.register({
        name: regName,
        email: regEmail,
        password: regPassword,
        phone: regPhone,
        role: regRole
      });

      setSuccessMsg("Account registered successfully in Ghule's Kitchen database! Logging in...");
      
      // Auto login after registration
      const loginRes = await authAPI.login(regEmail, regPassword);
      loginUser(loginRes.data.user, loginRes.data.access_token);

      setTimeout(() => {
        if (regRole === 'cook') navigate('/cook/dashboard');
        else navigate('/customer/dashboard');
      }, 1000);

    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (key) => {
    const acc = DEMO_ACCOUNTS[key];
    if (acc) {
      setEmail(acc.email);
      setPassword(`${acc.role}123`);
      switchDemoRole(key);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6">
        {/* Toggle Login vs Register */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl">
          <button
            type="button"
            onClick={() => { setIsRegistering(false); setError(null); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
              !isRegistering ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegistering(true); setError(null); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
              isRegistering ? 'bg-orange-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Register New Account
          </button>
        </div>

        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center mx-auto shadow-md shadow-orange-500/20">
            <Utensils className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">
            {isRegistering ? 'Create Ghule’s Kitchen Account' : 'Portal Sign In'}
          </h2>
          <p className="text-xs text-slate-500">
            {isRegistering ? 'Join as a Customer or Verified Home-Cook Partner' : 'Access your capacity dashboard & order tracking'}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-bold">
            {successMsg}
          </div>
        )}

        {/* Demo Quick Fill for Login */}
        {!isRegistering && (
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2 text-center">
              1-Click Demo Accounts:
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => fillDemo('KITCHEN')}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 flex items-center justify-center space-x-1 border border-emerald-200/60"
              >
                <Utensils className="w-3 h-3 text-emerald-600" />
                <span>Kitchen</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemo('COOK')}
                className="px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-800 text-xs font-semibold hover:bg-amber-100 flex items-center justify-center space-x-1 border border-amber-200/60"
              >
                <ChefHat className="w-3 h-3 text-amber-600" />
                <span>Cook</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemo('ADMIN')}
                className="px-2.5 py-1.5 rounded-lg bg-purple-50 text-purple-800 text-xs font-semibold hover:bg-purple-100 flex items-center justify-center space-x-1 border border-purple-200/60"
              >
                <ShieldCheck className="w-3 h-3 text-purple-600" />
                <span>Admin</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemo('CUSTOMER')}
                className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-800 text-xs font-semibold hover:bg-blue-100 flex items-center justify-center space-x-1 border border-blue-200/60"
              >
                <User className="w-3 h-3 text-blue-600" />
                <span>Customer</span>
              </button>
            </div>
          </div>
        )}

        {/* LOGIN FORM */}
        {!isRegistering ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all"
            >
              {loading ? (
                <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* REGISTRATION FORM */
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Account Type:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRegRole('customer')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                    regRole === 'customer'
                      ? 'bg-orange-600 text-white border-orange-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  👤 Customer
                </button>
                <button
                  type="button"
                  onClick={() => setRegRole('cook')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                    regRole === 'cook'
                      ? 'bg-orange-600 text-white border-orange-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  🍳 Home Cook Partner
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="e.g. Suman Deshmukh"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="suman@gmail.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone</label>
                <input
                  type="tel"
                  required
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="+919822003344"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {regRole === 'cook' && (
              <div className="space-y-2 bg-amber-50 p-3 rounded-2xl border border-amber-200 text-xs">
                <span className="font-bold text-amber-900 block">Home-Cook Partner Details:</span>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block">Location (Area/Pincode):</label>
                  <input
                    type="text"
                    value={regLocation}
                    onChange={(e) => setRegLocation(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block">Daily Prep Capacity (rotis/meals):</label>
                  <input
                    type="number"
                    value={regCapacity}
                    onChange={(e) => setRegCapacity(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block">Food Specialization:</label>
                  <input
                    type="text"
                    value={regSpecialization}
                    onChange={(e) => setRegSpecialization(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg text-xs"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all mt-2"
            >
              {loading ? (
                <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <>
                  <span>Create Account & Save to Database</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

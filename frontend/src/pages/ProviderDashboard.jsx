import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Briefcase, Calendar, DollarSign, Clock,
  Star, MapPin, User, Settings, Bell, TrendingUp,
  CheckCircle, XCircle, AlertCircle, ChevronRight, Plus,
  Edit3, Trash2, Eye, EyeOff, Zap, Crown, Shield,
  MessageSquare, BarChart3, Package, RefreshCw,
  Phone, Mail, Wrench, LogOut, ArrowUp, ArrowDown,
  IndianRupee, Target, Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { useToast } from '../components/Toast';
import ChatWindow from '../components/ChatWindow';
import BookingTimeline from '../components/BookingTimeline';

const TABS = [
  { id: 'overview',      label: 'Overview',      icon: LayoutDashboard },
  { id: 'jobs',          label: 'Job Queue',      icon: Briefcase },
  { id: 'services',      label: 'My Services',    icon: Package },
  { id: 'earnings',      label: 'Earnings',       icon: DollarSign },
  { id: 'availability',  label: 'Availability',   icon: Calendar },
  { id: 'profile',       label: 'Profile',        icon: Settings },
];

const STATUS_COLORS = {
  'Upcoming':    'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Confirmed':   'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'In Progress': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  'Completed':   'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'Cancelled':   'bg-red-500/10 text-red-400 border-red-500/20',
};

const DAYS = ['mon','tue','wed','thu','fri','sat','sun'];
const DAY_LABELS = { mon:'Mon', tue:'Tue', wed:'Wed', thu:'Thu', fri:'Fri', sat:'Sat', sun:'Sun' };
const TIME_SLOTS = ['06:00','07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00'];

function StatCard({ icon: Icon, label, value, sub, color = 'violet', delta }) {
  const colors = {
    violet: 'from-violet-600 to-indigo-600',
    emerald: 'from-emerald-500 to-teal-600',
    amber: 'from-amber-500 to-orange-500',
    blue: 'from-blue-500 to-cyan-500',
  };
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 400 }}
      className="relative rounded-2xl p-6 border border-white/5 overflow-hidden"
      style={{ background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(12px)' }}>
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 bg-gradient-to-br ${colors[color]}`} />
      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${colors[color]} mb-4 shadow-lg`}>
        <Icon size={20} className="text-white" />
      </div>
      <p className="text-slate-400 text-sm font-medium mb-1">{label}</p>
      <p className="text-3xl font-black text-white mb-1">{value}</p>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
      {delta !== undefined && (
        <div className={`flex items-center gap-1 mt-2 text-xs font-bold ${delta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {delta >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
          {Math.abs(delta)}% vs last month
        </div>
      )}
    </motion.div>
  );
}

// Simple SVG Earnings Chart
function EarningsBar({ weeklyData }) {
  if (!weeklyData || weeklyData.length === 0) return null;
  const max = Math.max(...weeklyData.map(d => d.earnings), 1);
  return (
    <div className="flex items-end gap-3 h-32">
      {weeklyData.map((d, i) => {
        const pct = (d.earnings / max) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(pct, 4)}%` }}
              transition={{ delay: i * 0.08, type: 'spring', stiffness: 200 }}
              className="w-full rounded-t-lg bg-gradient-to-t from-violet-600 to-indigo-400 min-h-1 cursor-default relative group"
              style={{ height: `${Math.max(pct, 4)}%` }}
            >
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg border border-slate-700">
                ₹{d.earnings.toLocaleString('en-IN')}
              </div>
            </motion.div>
            <span className="text-xs text-slate-500 font-medium">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// Service Modal (Add/Edit)
function ServiceModal({ categories, initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || {
    title: '', description: '', price: '', categoryId: '', duration: '', city: '', isActive: true,
  });
  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-xl rounded-3xl p-8 border border-slate-700 shadow-2xl overflow-y-auto max-h-[90vh]"
        style={{ background: '#0f172a' }}>
        <h3 className="text-2xl font-black text-white mb-6">{initial ? 'Edit Service' : 'Add New Service'}</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Service Title *</label>
            <input value={form.title} onChange={e => upd('title', e.target.value)}
              placeholder="e.g. Expert Plumbing Services"
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:border-violet-500 outline-none transition-all text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Price *</label>
              <input value={form.price} onChange={e => upd('price', e.target.value)}
                placeholder="₹999 / ₹500-2000"
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:border-violet-500 outline-none transition-all text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Duration</label>
              <input value={form.duration} onChange={e => upd('duration', e.target.value)}
                placeholder="e.g. 1-2 hours"
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:border-violet-500 outline-none transition-all text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Category</label>
            <select value={form.categoryId} onChange={e => upd('categoryId', e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:border-violet-500 outline-none transition-all text-sm">
              <option value="">Select category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">City</label>
            <input value={form.city} onChange={e => upd('city', e.target.value)}
              placeholder="Mumbai, Delhi..."
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:border-violet-500 outline-none transition-all text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => upd('description', e.target.value)} rows={3}
              placeholder="Describe what's included in this service..."
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:border-violet-500 outline-none transition-all text-sm resize-none" />
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <div onClick={() => upd('isActive', !form.isActive)}
              className={`w-12 h-6 rounded-full transition-all flex items-center px-1 ${form.isActive ? 'bg-emerald-500' : 'bg-slate-700'}`}>
              <div className={`w-4 h-4 rounded-full bg-white shadow transition-all ${form.isActive ? 'translate-x-6' : ''}`} />
            </div>
            <span className="text-sm font-semibold text-slate-300">Service is Active (visible to customers)</span>
          </label>
        </div>
        <div className="flex gap-3 mt-8">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-400 font-bold hover:border-slate-500 transition-all">Cancel</button>
          <button onClick={() => onSave(form)}
            className="flex-1 py-3 rounded-xl text-white font-bold transition-all"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
            {initial ? 'Save Changes' : 'Create Service'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function ProviderDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState(null);

  // Data
  const [profile, setProfile]         = useState(null);
  const [bookings, setBookings]        = useState([]);
  const [services, setServices]        = useState([]);
  const [categories, setCategories]    = useState([]);
  const [earnings, setEarnings]        = useState(null);

  // UI state
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService]     = useState(null);
  const [availability, setAvailability]         = useState({});
  const [isAvailable, setIsAvailable]           = useState(true);
  const [savingAvail, setSavingAvail]           = useState(false);

  const [profileForm, setProfileForm] = useState({ tagline:'', bio:'', yearsOfExperience:'', serviceRadius:'' });
  const [editingProfile, setEditingProfile] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [bData, sData, cData, pData, eData] = await Promise.allSettled([
        api.get('/bookings'),
        api.get('/services/my-services'),
        api.get('/categories'),
        api.get('/providers/profile'),
        api.get('/providers/earnings'),
      ]);

      if (bData.status === 'fulfilled') setBookings(bData.value || []);
      if (sData.status === 'fulfilled') setServices(sData.value || []);
      if (cData.status === 'fulfilled') setCategories(cData.value || []);
      if (pData.status === 'fulfilled' && pData.value) {
        setProfile(pData.value);
        setIsAvailable(pData.value.isAvailable);
        setAvailability(pData.value.availabilitySlots || {});
        setProfileForm({
          tagline: pData.value.tagline || '',
          bio: pData.value.bio || '',
          yearsOfExperience: pData.value.yearsOfExperience || '',
          serviceRadius: pData.value.serviceRadius || '',
        });
      }
      if (eData.status === 'fulfilled') setEarnings(eData.value);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const updateBookingStatus = async (id, status) => {
    try {
      await api.put(`/bookings/${id}/status`, { status });
      addToast(`Booking status updated to "${status}"`, 'success');
      fetchAll();
    } catch (e) {
      addToast('Failed to update status', 'error');
    }
  };

  const handleCreateService = async (form) => {
    try {
      await api.post('/services', {
        ...form,
        categoryId: form.categoryId ? parseInt(form.categoryId) : null,
      });
      addToast('Service created successfully!', 'success');
      setShowServiceModal(false);
      fetchAll();
    } catch (e) {
      addToast(e.message || 'Failed to create service', 'error');
    }
  };

  const handleEditService = async (form) => {
    try {
      await api.put(`/services/${editingService.id}`, {
        ...form,
        categoryId: form.categoryId ? parseInt(form.categoryId) : null,
      });
      addToast('Service updated successfully!', 'success');
      setEditingService(null);
      fetchAll();
    } catch (e) {
      addToast(e.message || 'Failed to update service', 'error');
    }
  };

  const handleDeleteService = async (id) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
      await api.delete(`/services/${id}`);
      addToast('Service deleted', 'success');
      fetchAll();
    } catch (e) {
      addToast('Failed to delete service', 'error');
    }
  };

  const handleToggleAvailability = async () => {
    const next = !isAvailable;
    setIsAvailable(next);
    try {
      await api.put('/providers/availability', { isAvailable: next, availabilitySlots: availability });
      addToast(next ? '✅ You are now marked as Available' : '🔴 You are now marked as Unavailable', 'success');
    } catch (e) {
      setIsAvailable(!next);
      addToast('Failed to update availability', 'error');
    }
  };

  const handleSaveAvailability = async () => {
    setSavingAvail(true);
    try {
      await api.put('/providers/availability', { availabilitySlots: availability, isAvailable });
      addToast('Availability slots saved!', 'success');
    } catch (e) {
      addToast('Failed to save availability', 'error');
    } finally {
      setSavingAvail(false);
    }
  };

  const toggleSlot = (day, slot) => {
    const existing = availability[day] || [];
    const updated = existing.includes(slot)
      ? existing.filter(s => s !== slot)
      : [...existing, slot].sort();
    setAvailability(a => ({ ...a, [day]: updated }));
  };

  const handleSaveProfile = async () => {
    try {
      await api.put('/providers/profile', profileForm);
      addToast('Profile updated!', 'success');
      setEditingProfile(false);
      fetchAll();
    } catch (e) {
      addToast('Failed to save profile', 'error');
    }
  };

  // Stats
  const pendingCount = bookings.filter(b => b.status === 'Upcoming').length;
  const completedCount = bookings.filter(b => b.status === 'Completed').length;
  const avgRating = services.length > 0
    ? (services.reduce((s, v) => s + v.rating, 0) / services.length).toFixed(1)
    : '—';

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0f1e' }}>
      <div className="text-center">
        <div className="w-14 h-14 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400 font-medium">Loading your dashboard…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: '#070d1a' }}>
      {/* ── Sidebar ──────────────────────────────────────────────────────────── */}
      <div className="flex">
        <div className="hidden lg:flex flex-col w-64 min-h-screen border-r border-slate-800/60 sticky top-0 h-screen overflow-y-auto" style={{ background: 'rgba(10,15,30,0.95)', backdropFilter: 'blur(20px)' }}>
          {/* Logo */}
          <div className="p-6 border-b border-slate-800/60">
            <Link to="/" className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-violet-600 to-indigo-600 p-2 rounded-xl shadow-lg shadow-violet-500/30">
                <Wrench size={18} className="text-white" />
              </div>
              <span className="font-black text-white text-lg">LocalFinds <span className="text-violet-400">Pro</span></span>
            </Link>
          </div>

          {/* Provider badge */}
          <div className="px-4 py-4 mx-4 mt-4 rounded-2xl border border-slate-700/50" style={{ background: 'rgba(124,58,237,0.1)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow">
                {user?.name?.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-white text-sm truncate">{user?.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {profile?.subscriptionPlan === 'premium' ? <Crown size={11} className="text-amber-400" /> :
                   profile?.subscriptionPlan === 'pro' ? <Zap size={11} className="text-violet-400" /> :
                   <Shield size={11} className="text-slate-400" />}
                  <span className="text-xs text-slate-400 capitalize">{profile?.subscriptionPlan || 'basic'} plan</span>
                </div>
              </div>
            </div>
            {/* Available toggle */}
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Available for jobs</span>
              <button onClick={handleToggleAvailability}
                className={`w-10 h-5 rounded-full transition-all flex items-center px-0.5 ${isAvailable ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                <div className={`w-4 h-4 rounded-full bg-white shadow transition-all ${isAvailable ? 'translate-x-5' : ''}`} />
              </button>
            </div>
            <div className={`mt-2 text-xs font-bold flex items-center gap-1.5 ${isAvailable ? 'text-emerald-400' : 'text-slate-500'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
              {isAvailable ? 'Accepting bookings' : 'Not accepting bookings'}
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-4 mt-6 space-y-1">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    active
                      ? 'text-white shadow-lg'
                      : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                  }`}
                  style={active ? { background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(79,70,229,0.2))', borderLeft: '3px solid #7c3aed' } : {}}
                >
                  <Icon size={18} className={active ? 'text-violet-400' : ''} />
                  {tab.label}
                  {tab.id === 'jobs' && pendingCount > 0 && (
                    <span className="ml-auto bg-amber-500 text-white text-xs font-black px-2 py-0.5 rounded-full">{pendingCount}</span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="px-4 pb-6 mt-auto">
            <button onClick={() => { logout(); navigate('/login'); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all font-bold text-sm">
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>

        {/* ── Mobile top nav ────────────────────────────────────────────── */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-40 border-b border-slate-800" style={{ background: 'rgba(10,15,30,0.95)', backdropFilter: 'blur(20px)' }}>
          <div className="flex items-center justify-between px-4 py-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-violet-600 to-indigo-600 p-1.5 rounded-lg">
                <Wrench size={16} className="text-white" />
              </div>
              <span className="font-black text-white text-base">Pro Dashboard</span>
            </Link>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
              <button onClick={() => { logout(); navigate('/login'); }} className="p-2 text-slate-400">
                <LogOut size={18} />
              </button>
            </div>
          </div>
          <div className="flex overflow-x-auto px-2 pb-2 gap-1">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                    active ? 'text-white' : 'text-slate-500'
                  }`}
                  style={active ? { background: 'linear-gradient(135deg, rgba(124,58,237,0.4), rgba(79,70,229,0.3))' } : {}}>
                  <Icon size={14} /> {tab.label}
                  {tab.id === 'jobs' && pendingCount > 0 && (
                    <span className="bg-amber-500 text-white text-[10px] px-1.5 rounded-full">{pendingCount}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Main Content ─────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 lg:ml-0 pt-[90px] lg:pt-0">
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">

            {/* ── OVERVIEW ─────────────────────────────────────────────────── */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-black text-white mb-1">Good evening, {user?.name?.split(' ')[0]} 👋</h1>
                  <p className="text-slate-400">Here's what's happening with your business today.</p>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard icon={IndianRupee} label="Total Earnings" value={`₹${(earnings?.totalEarnings || 0).toLocaleString('en-IN')}`} color="violet" delta={12} />
                  <StatCard icon={Briefcase}   label="Completed Jobs"  value={earnings?.completedJobs || completedCount} sub="All time" color="emerald" />
                  <StatCard icon={Star}         label="Avg Rating"       value={avgRating} sub={`${services.reduce((s, v) => s + v.reviewCount, 0)} reviews`} color="amber" />
                  <StatCard icon={Clock}        label="Pending Jobs"     value={pendingCount} sub="Awaiting action" color="blue" />
                </div>

                {/* Earnings Chart */}
                <div className="rounded-2xl p-6 border border-slate-800/60" style={{ background: 'rgba(15,23,42,0.8)' }}>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="font-black text-white text-lg">Weekly Earnings</h2>
                      <p className="text-slate-500 text-sm">Last 7 days revenue</p>
                    </div>
                    <BarChart3 size={20} className="text-violet-400" />
                  </div>
                  <EarningsBar weeklyData={earnings?.weeklyData} />
                </div>

                {/* Recent Bookings */}
                <div className="rounded-2xl border border-slate-800/60 overflow-hidden" style={{ background: 'rgba(15,23,42,0.8)' }}>
                  <div className="p-6 flex items-center justify-between border-b border-slate-800/60">
                    <h2 className="font-black text-white text-lg">Recent Bookings</h2>
                    <button onClick={() => setActiveTab('jobs')} className="text-violet-400 text-sm font-semibold flex items-center gap-1 hover:text-violet-300">
                      View all <ChevronRight size={14} />
                    </button>
                  </div>
                  <div className="divide-y divide-slate-800/60">
                    {bookings.slice(0, 3).map(booking => (
                      <div key={booking.id} className="p-5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                            {booking.user?.name?.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-white text-sm truncate">{booking.user?.name}</p>
                            <p className="text-xs text-slate-500 truncate">{booking.service?.title}</p>
                            <p className="text-xs text-slate-600 mt-0.5">{booking.date} at {booking.time}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border flex-shrink-0 ${STATUS_COLORS[booking.status] || ''}`}>
                          {booking.status}
                        </span>
                      </div>
                    ))}
                    {bookings.length === 0 && (
                      <div className="p-8 text-center text-slate-500 text-sm">No bookings yet. Share your profile to get started!</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── JOB QUEUE ─────────────────────────────────────────────────── */}
            {activeTab === 'jobs' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-black text-white">Job Queue</h1>
                    <p className="text-slate-400 text-sm mt-1">{bookings.length} total bookings · {pendingCount} pending action</p>
                  </div>
                  <button onClick={fetchAll} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-all text-sm font-semibold">
                    <RefreshCw size={14} /> Refresh
                  </button>
                </div>

                <div className="space-y-4">
                  {bookings.length === 0 ? (
                    <div className="text-center py-16 rounded-2xl border border-slate-800" style={{ background: 'rgba(15,23,42,0.5)' }}>
                      <Briefcase size={40} className="mx-auto text-slate-700 mb-3" />
                      <p className="text-slate-500 font-semibold">No bookings yet</p>
                      <p className="text-slate-600 text-sm mt-1">New bookings will appear here</p>
                    </div>
                  ) : bookings.map(booking => (
                    <motion.div key={booking.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl border border-slate-800/60 overflow-hidden"
                      style={{ background: 'rgba(15,23,42,0.8)' }}>
                      <div className="p-5 flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg flex-shrink-0 shadow-lg shadow-violet-500/20">
                            {booking.user?.name?.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h3 className="font-black text-white">{booking.user?.name}</h3>
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${STATUS_COLORS[booking.status] || ''}`}>{booking.status}</span>
                            </div>
                            <p className="text-sm text-slate-400 mb-1">{booking.service?.title}</p>
                            <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                              <span className="flex items-center gap-1"><Calendar size={11} /> {booking.date} at {booking.time}</span>
                              <span className="flex items-center gap-1"><MapPin size={11} /> {booking.address || 'Address not set'}</span>
                              {booking.user?.phone && <span className="flex items-center gap-1"><Phone size={11} /> {booking.user.phone}</span>}
                            </div>
                            {booking.notes && <p className="mt-2 text-xs text-slate-500 bg-slate-800 px-3 py-1.5 rounded-lg">📝 {booking.notes}</p>}
                          </div>
                        </div>

                        <div className="flex flex-row md:flex-col gap-2 min-w-[160px]">
                          {booking.status !== 'Completed' && booking.status !== 'Cancelled' && (
                            <select value={booking.status} onChange={e => updateBookingStatus(booking.id, e.target.value)}
                              className="flex-1 px-3 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl text-sm font-bold outline-none focus:border-violet-500">
                              <option value="Upcoming">Upcoming</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Completed">Completed</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          )}
                          <button onClick={() => setActiveChat(activeChat === booking.id ? null : booking.id)}
                            className={`flex-1 px-3 py-2.5 rounded-xl text-sm font-bold border transition-all flex items-center justify-center gap-1.5 ${
                              activeChat === booking.id
                                ? 'bg-violet-600 border-violet-600 text-white'
                                : 'border-slate-700 text-slate-400 hover:border-violet-500 hover:text-violet-400'
                            }`}>
                            <MessageSquare size={14} /> {activeChat === booking.id ? 'Close' : 'Chat'}
                          </button>
                        </div>
                      </div>

                      <div className="px-5 pb-4">
                        <BookingTimeline currentStatus={booking.status} />
                      </div>

                      {activeChat === booking.id && (
                        <div className="border-t border-slate-800 p-4" style={{ background: 'rgba(10,15,30,0.5)' }}>
                          <ChatWindow
                            bookingId={booking.id}
                            providerId={booking.service?.provider?.id || booking.service?.providerId || user?.id}
                            customerId={booking.user?.id || booking.userId}
                          />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* ── MY SERVICES ──────────────────────────────────────────────── */}
            {activeTab === 'services' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-black text-white">My Services</h1>
                    <p className="text-slate-400 text-sm mt-1">{services.length} service{services.length !== 1 ? 's' : ''} listed</p>
                  </div>
                  <button onClick={() => setShowServiceModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm transition-all shadow-lg shadow-violet-500/20"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
                    <Plus size={16} /> Add Service
                  </button>
                </div>

                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {services.map(service => (
                    <motion.div key={service.id} whileHover={{ y: -4 }}
                      className="rounded-2xl border border-slate-800/60 overflow-hidden group"
                      style={{ background: 'rgba(15,23,42,0.9)' }}>
                      {/* Status bar */}
                      <div className={`h-1 ${service.isActive ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-slate-700'}`} />
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-black text-white text-base leading-tight mb-1">{service.title}</h3>
                            <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">{service.category?.name || 'Uncategorized'}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${service.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700 text-slate-500'}`}>
                            {service.isActive ? 'Active' : 'Hidden'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mb-4">
                          <span className="text-xl font-black text-violet-400">{service.price}</span>
                          <div className="flex items-center gap-1 text-amber-400 text-sm font-bold">
                            <Star size={14} fill="currentColor" /> {service.rating.toFixed(1)}
                            <span className="text-slate-500 font-normal">({service.reviewCount})</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                          {service.duration && <span className="flex items-center gap-1"><Clock size={11} /> {service.duration}</span>}
                          {service.city && <span className="flex items-center gap-1"><MapPin size={11} /> {service.city}</span>}
                        </div>

                        <div className="flex gap-2 pt-3 border-t border-slate-800">
                          <button onClick={() => { setEditingService(service); }}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all border border-slate-700/50">
                            <Edit3 size={13} /> Edit
                          </button>
                          <Link to={`/services/${service.id}`}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold text-violet-400 hover:bg-violet-500/10 transition-all border border-slate-700/50">
                            <Eye size={13} /> View
                          </Link>
                          <button onClick={() => handleDeleteService(service.id)}
                            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-red-400 hover:bg-red-500/10 transition-all border border-slate-700/50">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Add new card */}
                  <button onClick={() => setShowServiceModal(true)}
                    className="rounded-2xl border-2 border-dashed border-slate-700 p-8 flex flex-col items-center justify-center gap-3 text-slate-600 hover:text-slate-400 hover:border-slate-500 transition-all group">
                    <Plus size={28} className="group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-sm">Add New Service</span>
                  </button>
                </div>
              </div>
            )}

            {/* ── EARNINGS ─────────────────────────────────────────────────── */}
            {activeTab === 'earnings' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-black text-white">Earnings</h1>
                  <p className="text-slate-400 text-sm mt-1">Your revenue and payout history</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="col-span-2 md:col-span-1 rounded-2xl p-6 border border-violet-500/20" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(79,70,229,0.1))' }}>
                    <p className="text-slate-400 text-sm mb-1">Total Lifetime Earnings</p>
                    <p className="text-4xl font-black text-white">₹{(earnings?.totalEarnings || 0).toLocaleString('en-IN')}</p>
                    <p className="text-violet-400 text-xs font-semibold mt-2">After {earnings?.completedJobs || 0} completed jobs</p>
                  </div>
                  <StatCard icon={Target}  label="Jobs Completed" value={earnings?.completedJobs || 0} color="emerald" />
                  <StatCard icon={Award}   label="Avg per Job"    value={`₹${earnings?.completedJobs ? Math.round((earnings.totalEarnings || 0) / earnings.completedJobs) : 0}`} color="amber" />
                </div>

                {/* Weekly chart */}
                <div className="rounded-2xl p-6 border border-slate-800/60" style={{ background: 'rgba(15,23,42,0.8)' }}>
                  <h2 className="font-black text-white mb-1">Weekly Revenue</h2>
                  <p className="text-slate-500 text-sm mb-6">Last 7 days</p>
                  <EarningsBar weeklyData={earnings?.weeklyData} />
                </div>

                {/* Recent payments */}
                <div className="rounded-2xl border border-slate-800/60 overflow-hidden" style={{ background: 'rgba(15,23,42,0.8)' }}>
                  <div className="p-6 border-b border-slate-800/60">
                    <h2 className="font-black text-white">Recent Payments</h2>
                  </div>
                  <div className="divide-y divide-slate-800/60">
                    {(earnings?.recentPayments || []).length === 0 ? (
                      <p className="text-center text-slate-500 py-8 text-sm">No payments yet. Complete your first job!</p>
                    ) : (earnings?.recentPayments || []).map(p => (
                      <div key={p.id} className="p-5 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-white text-sm">{p.service}</p>
                          <p className="text-xs text-slate-500">{new Date(p.date).toLocaleDateString('en-IN')}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-emerald-400">{p.amount}</p>
                          <p className={`text-xs ${p.paymentStatus === 'completed' ? 'text-emerald-500' : p.paymentStatus === 'deposit_paid' ? 'text-amber-500' : 'text-slate-500'}`}>
                            {p.paymentStatus?.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── AVAILABILITY ──────────────────────────────────────────────── */}
            {activeTab === 'availability' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-black text-white">Availability</h1>
                    <p className="text-slate-400 text-sm mt-1">Set your working hours so customers can book at the right time.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-400 font-medium">Accepting jobs</span>
                    <button onClick={handleToggleAvailability}
                      className={`w-12 h-6 rounded-full transition-all flex items-center px-1 ${isAvailable ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                      <div className={`w-4 h-4 rounded-full bg-white shadow transition-all ${isAvailable ? 'translate-x-6' : ''}`} />
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800/60 overflow-hidden" style={{ background: 'rgba(15,23,42,0.8)' }}>
                  {DAYS.map((day, di) => {
                    const slots = availability[day] || [];
                    const hasSlots = slots.length > 0;
                    return (
                      <div key={day} className={`${di < DAYS.length - 1 ? 'border-b border-slate-800/60' : ''}`}>
                        <div className="flex items-center gap-4 p-4">
                          <div className="w-20 font-bold text-sm text-slate-400">{DAY_LABELS[day]}</div>
                          <div className="flex-1 flex flex-wrap gap-2">
                            {TIME_SLOTS.map(slot => {
                              const sel = slots.includes(slot);
                              return (
                                <button key={slot} onClick={() => toggleSlot(day, slot)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    sel ? 'bg-violet-500 text-white shadow shadow-violet-500/30' : 'bg-slate-800 text-slate-500 hover:bg-slate-700 hover:text-slate-300'
                                  }`}>{slot}</button>
                              );
                            })}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {hasSlots && <span className="text-xs text-violet-400 font-semibold">{slots.length}</span>}
                            <button onClick={() => {
                              setAvailability(a => ({
                                ...a,
                                [day]: hasSlots ? [] : ['09:00','10:00','11:00','14:00','15:00','16:00'],
                              }));
                            }} className={`text-xs font-bold px-3 py-1 rounded-lg border transition-all ${hasSlots ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'}`}>
                              {hasSlots ? 'Clear' : 'Add'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button onClick={handleSaveAvailability} disabled={savingAvail}
                  className="px-8 py-3.5 rounded-xl text-white font-black transition-all shadow-lg shadow-violet-500/20 disabled:opacity-70 flex items-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
                  {savingAvail ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</> : <><CheckCircle size={18} /> Save Availability</>}
                </button>
              </div>
            )}

            {/* ── PROFILE SETTINGS ─────────────────────────────────────────── */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-black text-white">Profile Settings</h1>
                  <p className="text-slate-400 text-sm mt-1">Manage your professional profile visible to customers.</p>
                </div>

                <div className="rounded-2xl border border-slate-800/60 p-8" style={{ background: 'rgba(15,23,42,0.8)' }}>
                  <div className="flex items-start gap-6 mb-8">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-3xl font-black flex-shrink-0 shadow-xl shadow-violet-500/30">
                      {user?.name?.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white">{user?.name}</h2>
                      <p className="text-slate-400 mt-1">{user?.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                          <CheckCircle size={11} /> Verified Provider
                        </span>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                          profile?.subscriptionPlan === 'premium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          profile?.subscriptionPlan === 'pro' ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20' :
                          'bg-slate-700 text-slate-400'
                        }`}>
                          {profile?.subscriptionPlan === 'premium' ? <><Crown size={11} /> Premium</> :
                           profile?.subscriptionPlan === 'pro' ? <><Zap size={11} /> Pro</> :
                           <><Shield size={11} /> Basic</>}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    {[
                      { key: 'tagline',          label: 'Professional Tagline',    type: 'text',   placeholder: 'Expert in...' },
                      { key: 'yearsOfExperience', label: 'Years of Experience',   type: 'number', placeholder: '5' },
                      { key: 'serviceRadius',     label: 'Service Radius (km)',    type: 'number', placeholder: '10' },
                    ].map(({ key, label, type, placeholder }) => (
                      <div key={key}>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
                        <input type={type} value={profileForm[key]} disabled={!editingProfile}
                          onChange={e => setProfileForm(f => ({ ...f, [key]: e.target.value }))}
                          placeholder={placeholder}
                          className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all disabled:opacity-60"
                          style={{ background: 'rgba(15,23,42,0.8)', borderColor: '#334155', color: '#f1f5f9' }} />
                      </div>
                    ))}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Bio</label>
                      <textarea value={profileForm.bio} disabled={!editingProfile} rows={4}
                        onChange={e => setProfileForm(f => ({ ...f, bio: e.target.value }))}
                        placeholder="Tell customers about yourself..."
                        className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all resize-none disabled:opacity-60"
                        style={{ background: 'rgba(15,23,42,0.8)', borderColor: '#334155', color: '#f1f5f9' }} />
                    </div>
                  </div>

                  {/* Certifications display */}
                  {profile?.certifications?.length > 0 && (
                    <div className="mt-6">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Certifications</p>
                      <div className="flex flex-wrap gap-2">
                        {profile.certifications.map((cert, i) => (
                          <span key={i} className="px-3 py-1.5 bg-violet-500/10 border border-violet-500/20 rounded-full text-violet-300 text-sm font-medium flex items-center gap-1.5">
                            <Award size={12} /> {cert}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 mt-8">
                    {editingProfile ? (
                      <>
                        <button onClick={() => setEditingProfile(false)}
                          className="px-6 py-3 rounded-xl border border-slate-700 text-slate-400 font-bold hover:border-slate-500 transition-all">
                          Cancel
                        </button>
                        <button onClick={handleSaveProfile}
                          className="px-6 py-3 rounded-xl text-white font-bold transition-all"
                          style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
                          Save Changes
                        </button>
                      </>
                    ) : (
                      <button onClick={() => setEditingProfile(true)}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-700 text-slate-300 font-bold hover:border-violet-500 hover:text-violet-400 transition-all">
                        <Edit3 size={16} /> Edit Profile
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Service Modals */}
      {showServiceModal && (
        <ServiceModal categories={categories} onSave={handleCreateService} onClose={() => setShowServiceModal(false)} />
      )}
      {editingService && (
        <ServiceModal categories={categories} initial={editingService} onSave={handleEditService} onClose={() => setEditingService(null)} />
      )}
    </div>
  );
}

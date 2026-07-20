import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserCog, Calendar, DollarSign,
  Shield, AlertCircle, LogOut, Search, Trash2, ArrowUp, ArrowDown, Wrench
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { useToast } from '../components/Toast';

const TABS = [
  { id: 'overview',      label: 'Overview',      icon: LayoutDashboard },
  { id: 'providers',     label: 'Providers',     icon: UserCog },
  { id: 'customers',     label: 'Customers',     icon: Users },
  { id: 'bookings',      label: 'Bookings',      icon: Calendar },
];

function StatCard({ icon: Icon, label, value, sub, color = 'violet' }) {
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
    </motion.div>
  );
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState(null);
  const [providers, setProviders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [sData, pData, cData, bData] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/providers'),
        api.get('/admin/customers'),
        api.get('/admin/bookings'),
      ]);
      setStats(sData);
      setProviders(pData);
      setCustomers(cData);
      setBookings(bData);
    } catch (err) {
      console.error(err);
      addToast('Failed to load admin data', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${name}"? This action cannot be undone and will delete all their bookings, services, and profile.`)) {
      return;
    }
    try {
      await api.delete(`/admin/users/${id}`);
      addToast(`User ${name} deleted successfully`, 'success');
      fetchAll();
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to delete user', 'error');
    }
  };

  const filteredProviders = providers.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.email.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredCustomers = customers.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.email.toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0f1e' }}>
      <div className="text-center">
        <div className="w-14 h-14 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400 font-medium">Loading Admin Panel…</p>
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
              <div className="bg-gradient-to-br from-rose-600 to-orange-600 p-2 rounded-xl shadow-lg shadow-rose-500/30">
                <Wrench size={18} className="text-white" />
              </div>
              <span className="font-black text-white text-lg">LocalFinds <span className="text-rose-400">Admin</span></span>
            </Link>
          </div>

          {/* Admin badge */}
          <div className="px-4 py-4 mx-4 mt-4 rounded-2xl border border-slate-700/50" style={{ background: 'rgba(225,29,72,0.1)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-500 to-orange-600 flex items-center justify-center text-white font-black text-lg shadow">
                {user?.name?.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-white text-sm truncate">{user?.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                   <Shield size={11} className="text-rose-400" />
                  <span className="text-xs text-rose-400 font-bold">Super Admin</span>
                </div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-4 mt-6 space-y-1">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSearchQuery(''); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    active
                      ? 'text-white shadow-lg'
                      : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                  }`}
                  style={active ? { background: 'linear-gradient(135deg, rgba(225,29,72,0.3), rgba(249,115,22,0.2))', borderLeft: '3px solid #e11d48' } : {}}
                >
                  <Icon size={18} className={active ? 'text-rose-400' : ''} />
                  {tab.label}
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

        {/* ── Main Content ─────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 lg:ml-0 pt-[90px] lg:pt-0">
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">

            {/* ── OVERVIEW ─────────────────────────────────────────────────── */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-black text-white mb-1">Admin Dashboard</h1>
                  <p className="text-slate-400">Platform metrics and global oversight.</p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard icon={DollarSign} label="Platform Revenue" value={`₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`} color="emerald" />
                  <StatCard icon={Users}      label="Total Customers" value={stats?.totalUsers || 0} color="blue" />
                  <StatCard icon={UserCog}    label="Total Providers" value={stats?.totalProviders || 0} color="violet" />
                  <StatCard icon={Calendar}   label="Total Bookings"  value={stats?.totalBookings || 0} color="amber" />
                </div>

                {/* Recent Bookings */}
                <div className="rounded-2xl border border-slate-800/60 overflow-hidden" style={{ background: 'rgba(15,23,42,0.8)' }}>
                  <div className="p-6 flex items-center justify-between border-b border-slate-800/60">
                    <h2 className="font-black text-white text-lg">Recent Platform Activity</h2>
                  </div>
                  <div className="divide-y divide-slate-800/60">
                    {bookings.slice(0, 5).map(booking => (
                      <div key={booking.id} className="p-5 flex items-center justify-between gap-4">
                        <div>
                          <p className="font-bold text-white text-sm">{booking.service?.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">By {booking.user?.name} → {booking.service?.provider?.name}</p>
                        </div>
                        <div className="text-right flex items-center gap-3">
                           <span className={`px-2 py-1 rounded-full text-[10px] font-bold border flex-shrink-0 bg-slate-800 border-slate-700 text-slate-300`}>
                             {booking.status}
                           </span>
                           <span className="font-black text-emerald-400">₹{booking.payment?.amount || 0}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── PROVIDERS ─────────────────────────────────────────────────── */}
            {activeTab === 'providers' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-black text-white">Manage Providers</h1>
                    <p className="text-slate-400 text-sm mt-1">{providers.length} registered providers</p>
                  </div>
                </div>

                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="text" placeholder="Search providers by name or email..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:border-rose-500 outline-none transition-all text-sm" />
                </div>

                <div className="rounded-2xl border border-slate-800/60 overflow-hidden" style={{ background: 'rgba(15,23,42,0.8)' }}>
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800/60 text-xs uppercase tracking-wider text-slate-500 font-bold bg-slate-900/50">
                        <th className="p-4">Provider</th>
                        <th className="p-4">Contact</th>
                        <th className="p-4">Plan</th>
                        <th className="p-4 text-center">Services</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredProviders.map(p => (
                        <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center font-bold text-sm">
                                {p.name.charAt(0)}
                              </div>
                              <div>
                                <p className="text-white font-bold text-sm">{p.name}</p>
                                <p className="text-xs text-slate-500">{new Date(p.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-sm text-slate-400">
                            <div>{p.email}</div>
                            <div className="text-xs">{p.phone || 'No phone'}</div>
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-1 bg-slate-800 text-slate-300 rounded text-xs capitalize font-semibold border border-slate-700">{p.providerProfile?.subscriptionPlan || 'N/A'}</span>
                          </td>
                          <td className="p-4 text-center text-slate-400 font-bold">
                            {p.services?.length || 0}
                          </td>
                          <td className="p-4 text-right">
                            <button onClick={() => handleDeleteUser(p.id, p.name)} className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Delete Provider">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredProviders.length === 0 && (
                        <tr><td colSpan="5" className="p-8 text-center text-slate-500">No providers found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── CUSTOMERS ─────────────────────────────────────────────────── */}
            {activeTab === 'customers' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-black text-white">Manage Customers</h1>
                    <p className="text-slate-400 text-sm mt-1">{customers.length} registered customers</p>
                  </div>
                </div>

                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="text" placeholder="Search customers by name or email..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:border-rose-500 outline-none transition-all text-sm" />
                </div>

                <div className="rounded-2xl border border-slate-800/60 overflow-hidden" style={{ background: 'rgba(15,23,42,0.8)' }}>
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800/60 text-xs uppercase tracking-wider text-slate-500 font-bold bg-slate-900/50">
                        <th className="p-4">Customer</th>
                        <th className="p-4">Contact</th>
                        <th className="p-4 text-center">Bookings</th>
                        <th className="p-4 text-center">Reviews</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredCustomers.map(c => (
                        <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">
                                {c.name.charAt(0)}
                              </div>
                              <div>
                                <p className="text-white font-bold text-sm">{c.name}</p>
                                <p className="text-xs text-slate-500">Joined {new Date(c.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-sm text-slate-400">
                            <div>{c.email}</div>
                            <div className="text-xs">{c.phone || 'No phone'}</div>
                          </td>
                          <td className="p-4 text-center text-slate-400 font-bold">
                            {c._count?.bookings || 0}
                          </td>
                          <td className="p-4 text-center text-slate-400 font-bold">
                            {c._count?.reviews || 0}
                          </td>
                          <td className="p-4 text-right">
                            <button onClick={() => handleDeleteUser(c.id, c.name)} className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Delete Customer">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredCustomers.length === 0 && (
                        <tr><td colSpan="5" className="p-8 text-center text-slate-500">No customers found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── BOOKINGS ─────────────────────────────────────────────────── */}
            {activeTab === 'bookings' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-black text-white">Global Bookings</h1>
                  <p className="text-slate-400 text-sm mt-1">All bookings made on the platform.</p>
                </div>

                <div className="rounded-2xl border border-slate-800/60 overflow-hidden" style={{ background: 'rgba(15,23,42,0.8)' }}>
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800/60 text-xs uppercase tracking-wider text-slate-500 font-bold bg-slate-900/50">
                        <th className="p-4">Service</th>
                        <th className="p-4">Provider</th>
                        <th className="p-4">Customer</th>
                        <th className="p-4 text-center">Status</th>
                        <th className="p-4 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {bookings.map(b => (
                        <tr key={b.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="p-4">
                            <p className="text-white font-bold text-sm">{b.service?.title}</p>
                            <p className="text-xs text-slate-500">{b.date} at {b.time}</p>
                          </td>
                          <td className="p-4 text-sm text-slate-300">{b.service?.provider?.name}</td>
                          <td className="p-4 text-sm text-slate-300">{b.user?.name}</td>
                          <td className="p-4 text-center">
                            <span className="px-2 py-1 bg-slate-800 text-slate-300 rounded text-xs font-semibold border border-slate-700">{b.status}</span>
                          </td>
                          <td className="p-4 text-right font-black text-emerald-400">
                            ₹{b.payment?.amount || 0}
                          </td>
                        </tr>
                      ))}
                      {bookings.length === 0 && (
                        <tr><td colSpan="5" className="p-8 text-center text-slate-500">No bookings yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

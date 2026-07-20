import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wrench, User, MapPin, Clock, FileText, CheckCircle,
  ChevronRight, ChevronLeft, Star, Briefcase, Phone,
  Plus, X, Shield, Zap, Crown, Search, Navigation
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { useToast } from '../components/Toast';

// Fix leaflet default marker icon issue with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const STEPS = [
  { id: 1, label: 'Professional Info', icon: User },
  { id: 2, label: 'Your Services',     icon: Briefcase },
  { id: 3, label: 'Service Area',      icon: MapPin },
  { id: 4, label: 'Availability',      icon: Clock },
  { id: 5, label: 'Documents',         icon: FileText },
];

const DAYS = ['mon','tue','wed','thu','fri','sat','sun'];
const DAY_LABELS = { mon:'Monday', tue:'Tuesday', wed:'Wednesday', thu:'Thursday', fri:'Friday', sat:'Saturday', sun:'Sunday' };
const TIME_SLOTS = [
  '06:00','07:00','08:00','09:00','10:00','11:00',
  '12:00','13:00','14:00','15:00','16:00','17:00',
  '18:00','19:00','20:00','21:00',
];

const SERVICE_CATEGORIES = [
  { id: 1, slug: 'plumbing',       label: 'Plumbing',         icon: '🔧' },
  { id: 2, slug: 'electrical',     label: 'Electrical',       icon: '⚡' },
  { id: 3, slug: 'cleaning',       label: 'House Cleaning',   icon: '🧹' },
  { id: 4, slug: 'painting',       label: 'Painting',         icon: '🎨' },
  { id: 5, slug: 'carpentry',      label: 'Carpentry',        icon: '🪚' },
  { id: 6, slug: 'ac-repair',      label: 'AC Repair',        icon: '❄️' },
  { id: 7, slug: 'pest-control',   label: 'Pest Control',     icon: '🐛' },
  { id: 8, slug: 'appliance',      label: 'Appliances',       icon: '🔌' },
  { id: 9, slug: 'security',       label: 'Security',         icon: '🔒' },
  { id:10, slug: 'landscaping',    label: 'Landscaping',      icon: '🌳' },
];

// ── Map Click Handler ─────────────────────────────────────────────────────────
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      try {
        const resp = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data = await resp.json();
        const area = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        onLocationSelect({ lat, lng, address: area });
      } catch {
        onLocationSelect({ lat, lng, address: `${lat.toFixed(4)}, ${lng.toFixed(4)}` });
      }
    },
  });
  return null;
}

export default function ProviderOnboarding() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // India center
  const [mapMarker, setMapMarker] = useState(null);

  // ── Form state ─────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    // Step 1
    tagline: '',
    bio: '',
    yearsOfExperience: '',
    phone: user?.phone || '',
    city: user?.city || '',
    // Step 2
    selectedCategories: [],
    serviceTitle: '',
    serviceDescription: '',
    servicePrice: '',
    serviceDuration: '',
    // Step 3
    serviceArea: '',
    serviceLatitude: null,
    serviceLongitude: null,
    serviceRadius: '10',
    // Step 4 — { mon: ['09:00','10:00'...], ... }
    availabilitySlots: {},
    // Step 5
    certifications: [''],
    documents: [{ name: '', url: '' }],
    subscriptionPlan: 'basic',
  });

  const update = (key, value) => setForm(f => ({ ...f, [key]: value }));

  // ── Geocode search ─────────────────────────────────────────────────────────
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=5`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await resp.json();
      setSearchResults(data);
    } catch {
      addToast('Search failed. Try clicking on the map directly.', 'error');
    } finally {
      setSearching(false);
    }
  };

  const handleLocationSelect = ({ lat, lng, address }) => {
    setMapCenter([lat, lng]);
    setMapMarker([lat, lng]);
    update('serviceLatitude', lat);
    update('serviceLongitude', lng);
    update('serviceArea', address);
    setSearchResults([]);
    setSearchQuery('');
  };

  const selectSearchResult = (result) => {
    handleLocationSelect({
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      address: result.display_name,
    });
  };

  // ── Availability helpers ───────────────────────────────────────────────────
  const toggleSlot = (day, slot) => {
    const existing = form.availabilitySlots[day] || [];
    const updated = existing.includes(slot)
      ? existing.filter(s => s !== slot)
      : [...existing, slot].sort();
    update('availabilitySlots', { ...form.availabilitySlots, [day]: updated });
  };

  const toggleDay = (day) => {
    const existing = form.availabilitySlots[day] || [];
    update('availabilitySlots', {
      ...form.availabilitySlots,
      [day]: existing.length > 0 ? [] : ['09:00','10:00','11:00','14:00','15:00','16:00'],
    });
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        tagline: form.tagline,
        bio: form.bio,
        yearsOfExperience: form.yearsOfExperience,
        phone: form.phone,
        city: form.city,
        serviceArea: form.serviceArea,
        serviceLatitude: form.serviceLatitude,
        serviceLongitude: form.serviceLongitude,
        serviceRadius: form.serviceRadius,
        availabilitySlots: form.availabilitySlots,
        certifications: form.certifications.filter(c => c.trim()),
        documents: form.documents.filter(d => d.name.trim()),
        subscriptionPlan: form.subscriptionPlan,
      };

      await api.post('/providers/onboarding', payload);

      // Create the primary service listing if they filled it in
      if (form.serviceTitle && form.selectedCategories.length > 0) {
        try {
          await api.post('/services', {
            title: form.serviceTitle,
            description: form.serviceDescription,
            price: form.servicePrice ? `₹${form.servicePrice}` : '₹999',
            categoryId: form.selectedCategories[0],
            duration: form.serviceDuration,
            city: form.city,
          });
        } catch (e) {
          console.warn('Service creation failed:', e.message);
        }
      }

      addToast('🎉 Onboarding complete! Welcome to LocalFinds Pro!', 'success');
      navigate('/provider/dashboard');
    } catch (error) {
      addToast(error.message || 'Onboarding failed. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return form.tagline.trim() && form.bio.trim() && form.phone.trim() && form.city.trim();
    if (step === 2) return form.selectedCategories.length > 0;
    if (step === 3) return true; // optional but recommended
    if (step === 4) return Object.values(form.availabilitySlots).some(slots => slots.length > 0);
    if (step === 5) return true;
    return true;
  };

  const nextStep = () => {
    if (step === 5) { handleSubmit(); return; }
    if (canProceed()) setStep(s => s + 1);
    else addToast('Please fill in the required fields before proceeding.', 'error');
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}>
      {/* Header */}
      <div className="px-6 py-5 flex items-center justify-between max-w-5xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-emerald-400 to-teal-500 p-2.5 rounded-xl shadow-lg shadow-emerald-500/30">
            <Wrench size={22} className="text-white" />
          </div>
          <span className="font-black text-2xl text-white tracking-tight">LocalFinds <span className="text-emerald-400">Pro</span></span>
        </div>
        <span className="text-slate-400 text-sm hidden md:block">Complete your profile to start earning</span>
      </div>

      {/* Step Indicator */}
      <div className="max-w-3xl mx-auto px-6 mb-8">
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = step > s.id;
            const active = step === s.id;
            return (
              <div key={s.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1.5">
                  <motion.div
                    animate={{ scale: active ? 1.1 : 1 }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      done ? 'bg-emerald-500 border-emerald-500' :
                      active ? 'border-violet-400 bg-violet-400/20' :
                      'border-slate-700 bg-slate-800'
                    }`}
                  >
                    {done ? <CheckCircle size={18} className="text-white" /> : <Icon size={16} className={active ? 'text-violet-300' : 'text-slate-500'} />}
                  </motion.div>
                  <span className={`text-[10px] font-semibold hidden sm:block whitespace-nowrap ${active ? 'text-violet-300' : done ? 'text-emerald-400' : 'text-slate-600'}`}>{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 rounded-full transition-all ${done ? 'bg-emerald-500' : 'bg-slate-800'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Card */}
      <div className="max-w-3xl mx-auto px-6 pb-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
            className="rounded-3xl p-8 md:p-10 border border-slate-700/50 shadow-2xl"
            style={{ background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(24px)' }}
          >
            {/* ── Step 1: Professional Info ─────────────────────────────── */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-black text-white mb-1">Professional Profile</h2>
                  <p className="text-slate-400">Tell customers why they should hire you.</p>
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2">Phone Number *</label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2">City *</label>
                    <input type="text" value={form.city} onChange={e => update('city', e.target.value)}
                      placeholder="Mumbai, Delhi, Bangalore..."
                      className="w-full px-4 py-3.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">Professional Tagline *</label>
                  <input type="text" value={form.tagline} onChange={e => update('tagline', e.target.value)}
                    placeholder="e.g. Expert Plumber with 10+ years in Mumbai residential projects"
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">About You *</label>
                  <textarea value={form.bio} onChange={e => update('bio', e.target.value)} rows={4}
                    placeholder="Describe your expertise, approach, and what makes you different from others..."
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">Years of Experience</label>
                  <div className="flex gap-3 flex-wrap">
                    {[1,2,3,5,7,10,15,20].map(yr => (
                      <button key={yr} type="button"
                        onClick={() => update('yearsOfExperience', yr)}
                        className={`px-5 py-2.5 rounded-full text-sm font-bold border transition-all ${
                          form.yearsOfExperience === yr
                            ? 'bg-violet-500 border-violet-500 text-white shadow-lg shadow-violet-500/30'
                            : 'border-slate-700 text-slate-400 hover:border-slate-500'
                        }`}
                      >{yr}+ yrs</button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 2: Services ─────────────────────────────────────── */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-black text-white mb-1">Your Services</h2>
                  <p className="text-slate-400">Select the service categories you offer.</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {SERVICE_CATEGORIES.map(cat => {
                    const selected = form.selectedCategories.includes(cat.id);
                    return (
                      <button key={cat.id} type="button"
                        onClick={() => {
                          const updated = selected
                            ? form.selectedCategories.filter(c => c !== cat.id)
                            : [...form.selectedCategories, cat.id];
                          update('selectedCategories', updated);
                        }}
                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                          selected
                            ? 'border-violet-500 bg-violet-500/10 shadow-lg shadow-violet-500/20'
                            : 'border-slate-700 bg-slate-800/50 hover:border-slate-500'
                        }`}
                      >
                        <span className="text-2xl">{cat.icon}</span>
                        <span className={`text-xs font-bold text-center leading-tight ${selected ? 'text-violet-300' : 'text-slate-400'}`}>{cat.label}</span>
                        {selected && <CheckCircle size={14} className="text-violet-400" />}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 p-6 rounded-2xl bg-slate-800/50 border border-slate-700 space-y-4">
                  <h3 className="font-bold text-white">Primary Service Listing</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Service Title</label>
                      <input value={form.serviceTitle} onChange={e => update('serviceTitle', e.target.value)}
                        placeholder="e.g. Emergency Plumbing Service"
                        className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:border-violet-500 outline-none transition-all text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Starting Price (₹)</label>
                      <input type="number" value={form.servicePrice} onChange={e => update('servicePrice', e.target.value)}
                        placeholder="e.g. 499"
                        className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:border-violet-500 outline-none transition-all text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Service Duration</label>
                    <input value={form.serviceDuration} onChange={e => update('serviceDuration', e.target.value)}
                      placeholder="e.g. 1-2 hours, Half day, By appointment"
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:border-violet-500 outline-none transition-all text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Service Description</label>
                    <textarea value={form.serviceDescription} onChange={e => update('serviceDescription', e.target.value)} rows={3}
                      placeholder="Describe your service, what's included, what customers should expect..."
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:border-violet-500 outline-none transition-all text-sm resize-none" />
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 3: Service Area Map ──────────────────────────────── */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-3xl font-black text-white mb-1">Service Area</h2>
                  <p className="text-slate-400">Pin where you operate. Customers nearby will find you first.</p>
                </div>

                {/* Search bar */}
                <div className="relative">
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                        placeholder="Search your locality, street, or city..."
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:border-violet-500 outline-none transition-all"
                      />
                    </div>
                    <button onClick={handleSearch} disabled={searching}
                      className="px-5 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold transition-all disabled:opacity-50 flex items-center gap-2">
                      {searching ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Navigation size={16} />}
                      Search
                    </button>
                  </div>
                  {searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-[9999] overflow-hidden">
                      {searchResults.map((r, i) => (
                        <button key={i} onClick={() => selectSearchResult(r)}
                          className="w-full text-left px-4 py-3 hover:bg-slate-700 text-sm text-slate-300 border-b border-slate-700/50 last:border-0 transition-colors flex items-start gap-3">
                          <MapPin size={14} className="text-violet-400 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-2">{r.display_name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Map */}
                <div className="rounded-2xl overflow-hidden border border-slate-700 shadow-2xl" style={{ height: '350px' }}>
                  <MapContainer
                    center={mapCenter}
                    zoom={5}
                    style={{ height: '100%', width: '100%' }}
                    key={mapCenter.join(',')}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <MapClickHandler onLocationSelect={handleLocationSelect} />
                    {mapMarker && <Marker position={mapMarker} />}
                  </MapContainer>
                </div>

                {form.serviceArea && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                    <CheckCircle size={18} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-emerald-400 font-bold text-sm mb-0.5">Location Pinned!</p>
                      <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">{form.serviceArea}</p>
                    </div>
                  </motion.div>
                )}

                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">Service Radius</label>
                  <div className="flex gap-3 flex-wrap">
                    {[5,10,15,20,30,50].map(km => (
                      <button key={km} type="button" onClick={() => update('serviceRadius', km)}
                        className={`px-5 py-2.5 rounded-full text-sm font-bold border transition-all ${
                          form.serviceRadius == km
                            ? 'bg-violet-500 border-violet-500 text-white'
                            : 'border-slate-700 text-slate-400 hover:border-slate-500'
                        }`}
                      >{km} km</button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 4: Availability ──────────────────────────────────── */}
            {step === 4 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-3xl font-black text-white mb-1">Your Availability</h2>
                  <p className="text-slate-400">Set when you're available. Customers will book within these slots.</p>
                </div>
                <div className="space-y-3">
                  {DAYS.map(day => {
                    const slots = form.availabilitySlots[day] || [];
                    const isActive = slots.length > 0;
                    return (
                      <div key={day} className={`rounded-2xl border transition-all ${isActive ? 'border-violet-500/50 bg-violet-500/5' : 'border-slate-700 bg-slate-800/40'}`}>
                        <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => toggleDay(day)}>
                          <span className={`font-bold ${isActive ? 'text-white' : 'text-slate-500'}`}>{DAY_LABELS[day]}</span>
                          <div className="flex items-center gap-3">
                            {isActive && <span className="text-xs text-violet-400 font-semibold">{slots.length} slots selected</span>}
                            <div className={`w-12 h-6 rounded-full transition-all flex items-center px-1 ${isActive ? 'bg-violet-500' : 'bg-slate-700'}`}>
                              <div className={`w-4 h-4 rounded-full bg-white shadow transition-all ${isActive ? 'translate-x-6' : 'translate-x-0'}`} />
                            </div>
                          </div>
                        </div>
                        <AnimatePresence>
                          {isActive && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden px-4 pb-4">
                              <div className="flex flex-wrap gap-2">
                                {TIME_SLOTS.map(slot => {
                                  const selected = slots.includes(slot);
                                  return (
                                    <button key={slot} type="button" onClick={() => toggleSlot(day, slot)}
                                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                        selected ? 'bg-violet-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                      }`}>{slot}</button>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Step 5: Documents & Subscription ─────────────────────── */}
            {step === 5 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-black text-white mb-1">Documents & Plan</h2>
                  <p className="text-slate-400">Add your certifications and choose a subscription plan.</p>
                </div>

                {/* Certifications */}
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-3">Certifications & Skills</label>
                  <div className="space-y-2">
                    {form.certifications.map((cert, i) => (
                      <div key={i} className="flex gap-2">
                        <input value={cert} onChange={e => {
                          const updated = [...form.certifications];
                          updated[i] = e.target.value;
                          update('certifications', updated);
                        }}
                          placeholder={`e.g. ITI Electrician, Certified HVAC Technician`}
                          className="flex-1 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:border-violet-500 outline-none transition-all text-sm" />
                        {form.certifications.length > 1 && (
                          <button onClick={() => update('certifications', form.certifications.filter((_, j) => j !== i))}
                            className="p-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button onClick={() => update('certifications', [...form.certifications, ''])}
                      className="flex items-center gap-2 text-sm text-violet-400 font-semibold mt-2 hover:text-violet-300 transition-colors">
                      <Plus size={16} /> Add Certification
                    </button>
                  </div>
                </div>

                {/* Documents */}
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-3">Documents</label>
                  <div className="space-y-3">
                    {form.documents.map((doc, i) => (
                      <div key={i} className="grid grid-cols-2 gap-2">
                        <input value={doc.name} onChange={e => {
                          const updated = [...form.documents];
                          updated[i] = { ...updated[i], name: e.target.value };
                          update('documents', updated);
                        }}
                          placeholder="Document name (e.g. Aadhar Card)"
                          className="px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:border-violet-500 outline-none transition-all text-sm" />
                        <input value={doc.url} onChange={e => {
                          const updated = [...form.documents];
                          updated[i] = { ...updated[i], url: e.target.value };
                          update('documents', updated);
                        }}
                          placeholder="Document URL or Reference #"
                          className="px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:border-violet-500 outline-none transition-all text-sm" />
                      </div>
                    ))}
                    <button onClick={() => update('documents', [...form.documents, { name: '', url: '' }])}
                      className="flex items-center gap-2 text-sm text-violet-400 font-semibold hover:text-violet-300 transition-colors">
                      <Plus size={16} /> Add Document
                    </button>
                  </div>
                </div>

                {/* Subscription Plan */}
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-3">Subscription Plan</label>
                  <div className="grid md:grid-cols-3 gap-4">
                    {[
                      { id: 'basic', label: 'Basic', price: 'Free', icon: Shield, color: 'slate', perks: ['Standard listing', 'Basic analytics', 'Up to 10 bookings/mo'] },
                      { id: 'pro', label: 'Pro', price: '₹999/mo', icon: Zap, color: 'violet', perks: ['Priority listing', 'Full analytics', 'Verified badge', 'Unlimited bookings'] },
                      { id: 'premium', label: 'Premium', price: '₹2499/mo', icon: Crown, color: 'amber', perks: ['Top of search', 'Featured provider', 'Gold verified badge', 'Dedicated support'] },
                    ].map(plan => {
                      const Icon = plan.icon;
                      const selected = form.subscriptionPlan === plan.id;
                      const colorMap = { slate: 'slate', violet: 'violet', amber: 'amber' };
                      return (
                        <button key={plan.id} type="button" onClick={() => update('subscriptionPlan', plan.id)}
                          className={`p-5 rounded-2xl border-2 text-left transition-all ${
                            selected
                              ? plan.color === 'amber' ? 'border-amber-500 bg-amber-500/10' : plan.color === 'violet' ? 'border-violet-500 bg-violet-500/10' : 'border-slate-400 bg-slate-700'
                              : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                          }`}
                        >
                          <Icon size={22} className={selected ? (plan.color === 'amber' ? 'text-amber-400' : plan.color === 'violet' ? 'text-violet-400' : 'text-slate-300') : 'text-slate-500'} />
                          <p className={`font-black text-lg mt-3 mb-0.5 ${selected ? 'text-white' : 'text-slate-400'}`}>{plan.label}</p>
                          <p className={`text-sm font-bold mb-3 ${selected ? (plan.color === 'amber' ? 'text-amber-400' : plan.color === 'violet' ? 'text-violet-400' : 'text-slate-300') : 'text-slate-500'}`}>{plan.price}</p>
                          <ul className="space-y-1">
                            {plan.perks.map((perk, j) => (
                              <li key={j} className="flex items-center gap-1.5 text-xs text-slate-400">
                                <CheckCircle size={12} className={selected ? 'text-emerald-400' : 'text-slate-600'} />
                                {perk}
                              </li>
                            ))}
                          </ul>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between items-center mt-10 pt-6 border-t border-slate-700/50">
              <button
                onClick={() => setStep(s => s - 1)}
                disabled={step === 1}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-slate-400 border border-slate-700 hover:border-slate-500 transition-all disabled:opacity-0 font-semibold"
              >
                <ChevronLeft size={18} /> Back
              </button>

              <div className="flex items-center gap-2">
                {STEPS.map(s => (
                  <div key={s.id} className={`w-2 h-2 rounded-full transition-all ${step === s.id ? 'w-6 bg-violet-500' : step > s.id ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                ))}
              </div>

              <button
                onClick={nextStep}
                disabled={submitting}
                className="flex items-center gap-2 px-7 py-3 rounded-xl font-bold transition-all shadow-lg disabled:opacity-70"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', boxShadow: '0 8px 24px rgba(124,58,237,0.35)' }}
              >
                {submitting ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                ) : step === 5 ? (
                  <><CheckCircle size={18} className="text-white" /> <span className="text-white">Complete Setup</span></>
                ) : (
                  <><span className="text-white">Continue</span> <ChevronRight size={18} className="text-white" /></>
                )}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

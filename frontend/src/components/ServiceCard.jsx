import { Link } from 'react-router-dom';
import { Star, Clock, MapPin, Heart, ShieldCheck, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

// Map category → gradient color
const CAT_COLORS = {
  electrician:    { from: '#FEF3C7', to: '#FDE68A', icon: '#D97706', badge: '#FBBF24' },
  plumber:        { from: '#DBEAFE', to: '#BFDBFE', icon: '#2563EB', badge: '#3B82F6' },
  'house-cleaning': { from: '#D1FAE5', to: '#A7F3D0', icon: '#059669', badge: '#10B981' },
  'ac-repair':    { from: '#CFFAFE', to: '#A5F3FC', icon: '#0891B2', badge: '#06B6D4' },
  painting:       { from: '#EDE9FE', to: '#DDD6FE', icon: '#7C3AED', badge: '#8B5CF6' },
  carpentry:      { from: '#FEF3C7', to: '#FDE68A', icon: '#92400E', badge: '#B45309' },
  'pest-control': { from: '#FEE2E2', to: '#FECACA', icon: '#DC2626', badge: '#EF4444' },
  security:       { from: '#F0FDF4', to: '#BBF7D0', icon: '#16A34A', badge: '#22C55E' },
};

function getColors(slug) {
  return CAT_COLORS[slug] || { from: '#F1F5F9', to: '#E2E8F0', icon: '#2563EB', badge: '#3B82F6' };
}

export default function ServiceCard({ service, isDark }) {
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const colors = getColors(service.category?.slug);

  useEffect(() => {
    if (user?.role === 'customer') {
      api.get(`/favorites/check/${service.id}`)
        .then(res => setIsFavorited(res.isFavorited))
        .catch(() => {});
    }
  }, [user, service.id]);

  const toggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user || user.role !== 'customer') return;
    try {
      const res = await api.post(`/favorites/toggle/${service.id}`);
      setIsFavorited(res.isFavorited);
    } catch (err) {
      console.error(err);
    }
  };

  const numericPrice = parseInt(String(service.price).replace(/[^\d]/g, '')) || 0;

  return (
    <Link
      to={`/services/${service.id}`}
      className="group flex flex-col rounded-3xl overflow-hidden border transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl"
      style={{
        backgroundColor: isDark ? 'var(--bg-card)' : '#FFFFFF',
        borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}
    >
      {/* Image / Gradient Banner */}
      <div
        className="relative h-44 w-full overflow-hidden flex items-center justify-center"
        style={{ background: `linear-gradient(135deg, ${colors.from}, ${colors.to})` }}
      >
        {service.image ? (
          <img
            src={service.image}
            alt={service.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 opacity-80">
            <span className="text-5xl">{service.category?.icon || '🔧'}</span>
            <span className="text-xs font-semibold" style={{ color: colors.icon }}>{service.category?.name}</span>
          </div>
        )}

        {/* Rating badge top-left */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl flex items-center gap-1 shadow-sm">
          <Star size={13} fill="#F59E0B" color="#F59E0B" />
          <span className="text-xs font-black text-slate-800">{Number(service.rating).toFixed(1)}</span>
          <span className="text-xs text-slate-500">({service.reviewCount || 0})</span>
        </div>

        {/* Favourite button */}
        {user?.role === 'customer' && (
          <button
            onClick={toggleFavorite}
            className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-md rounded-full shadow-sm hover:scale-110 transition-transform"
          >
            <Heart size={15} fill={isFavorited ? '#ef4444' : 'transparent'} color={isFavorited ? '#ef4444' : '#64748b'} />
          </button>
        )}

        {/* Verified badge bottom-left */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-white/90 backdrop-blur-md shadow-sm">
          <ShieldCheck size={13} className="text-emerald-500" />
          <span className="text-xs font-semibold text-slate-700">Verified Pro</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Category pill */}
        <span
          className="inline-flex items-center gap-1 self-start text-xs font-bold px-2.5 py-1 rounded-full mb-2"
          style={{ backgroundColor: `${colors.badge}20`, color: colors.icon }}
        >
          {service.category?.icon} {service.category?.name}
        </span>

        <h3
          className="font-black text-base mb-1 line-clamp-2 leading-snug"
          style={{ color: isDark ? 'var(--text-primary)' : '#0F172A' }}
        >
          {service.title}
        </h3>

        {/* Provider row */}
        {service.provider && (
          <div className="flex items-center gap-2 mb-2">
            <img
              src={service.provider.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(service.provider.name)}&background=2563EB&color=fff&size=80`}
              alt={service.provider.name}
              className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-200"
            />
            <span className="text-xs font-medium text-slate-500">By {service.provider.name}</span>
          </div>
        )}

        <p
          className="text-xs line-clamp-2 mb-4 flex-grow leading-relaxed"
          style={{ color: isDark ? 'var(--text-secondary)' : '#64748B' }}
        >
          {service.description}
        </p>

        {/* Meta row */}
        <div className="flex items-center gap-3 mb-4 text-xs text-slate-500">
          {service.city && (
            <span className="flex items-center gap-1">
              <MapPin size={11} className="text-royal-blue" /> {service.city}
            </span>
          )}
          {service.duration && (
            <span className="flex items-center gap-1">
              <Clock size={11} /> {service.duration}
            </span>
          )}
        </div>

        {/* Price + CTA */}
        <div
          className="flex items-center justify-between pt-4 border-t"
          style={{ borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)' }}
        >
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Starting at</p>
            <p
              className="font-black text-xl"
              style={{ color: isDark ? 'var(--text-primary)' : '#0F172A' }}
            >
              {service.price}
            </p>
          </div>
          <div
            className="flex items-center gap-1 px-4 py-2.5 rounded-2xl text-sm font-bold text-white transition-all group-hover:scale-105"
            style={{ backgroundColor: colors.badge }}
          >
            Book <ChevronRight size={16} />
          </div>
        </div>
      </div>
    </Link>
  );
}

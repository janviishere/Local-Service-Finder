import { Link } from 'react-router-dom';
import { Star, ChevronRight, MapPin, Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function ServiceCard({ service, isDark }) {
  const cardBg = isDark ? 'var(--bg-card)' : '#FFFFFF';
  const cardBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const textPri = isDark ? 'var(--text-primary)' : '#0F172A';
  const textSec = isDark ? 'var(--text-secondary)' : '#475569';

  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    if (user?.role === 'customer') {
      api.get(`/favorites/check/${service.id}`)
        .then(res => setIsFavorited(res.isFavorited))
        .catch(console.error);
    }
  }, [user, service.id]);

  const toggleFavorite = async (e) => {
    e.preventDefault(); // Prevent navigating to the service detail page
    if (!user || user.role !== 'customer') return;
    try {
      const res = await api.post(`/favorites/toggle/${service.id}`);
      setIsFavorited(res.isFavorited);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Link
      to={`/services/${service.id}`}
      className="group flex flex-col rounded-2xl overflow-hidden border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-royal-blue/30"
      style={{ backgroundColor: cardBg, borderColor: cardBorder }}
    >
      <div className="relative h-48 w-full overflow-hidden bg-slate-200">
        {service.image ? (
          <img src={service.image} alt={service.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-royal-blue/20 to-emerald/20">
            <span className="text-4xl">{service.category?.icon || '🔧'}</span>
          </div>
        )}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
          <Star size={14} fill="#F59E0B" color="#F59E0B" />
          <span className="text-xs font-bold text-deep-navy">{service.rating.toFixed(1)}</span>
        </div>
        {user?.role === 'customer' && (
          <button 
            onClick={toggleFavorite}
            className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-md rounded-full shadow-sm hover:scale-110 transition-transform"
          >
            <Heart size={16} fill={isFavorited ? '#ef4444' : 'transparent'} color={isFavorited ? '#ef4444' : '#64748b'} />
          </button>
        )}
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-royal-blue bg-royal-blue/10 px-2 py-1 rounded-md">
            {service.category?.name || 'Service'}
          </span>
          {service.city && (
            <span className="text-xs flex items-center gap-1 text-slate-500">
              <MapPin size={12} /> {service.city}
            </span>
          )}
        </div>
        
        <h3 className="font-bold text-lg mb-1 line-clamp-1" style={{ color: textPri }}>
          {service.title}
        </h3>
        
        <p className="text-sm line-clamp-2 mb-4 flex-grow" style={{ color: textSec }}>
          {service.description}
        </p>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Starting at</p>
            <p className="font-black text-lg" style={{ color: textPri }}>{service.price}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-royal-blue text-white flex items-center justify-center group-hover:scale-110 transition-transform">
            <ChevronRight size={20} />
          </div>
        </div>
      </div>
    </Link>
  );
}

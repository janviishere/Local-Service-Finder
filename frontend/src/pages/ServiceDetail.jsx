import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Clock, MapPin, CheckCircle2, User, ChevronLeft, Heart, Shield, CheckCircle, ChevronRight, ThumbsUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { useTheme } from '../context/ThemeContext';
import ReviewCard from '../components/ReviewCard';
import PortfolioGallery from '../components/PortfolioGallery';

export default function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const data = await api.get(`/services/${id}`);
        setService(data);
        if (user) {
          const favorites = await api.get('/favorites');
          setIsFavorited(favorites.some(f => f.service_id === parseInt(id)));
        }
      } catch (error) {
        console.error("Failed to fetch service detail", error);
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [id, user]);

  const toggleFavorite = async () => {
    try {
      if (isFavorited) {
        await api.delete(`/favorites/${id}`);
      } else {
        await api.post('/favorites', { service_id: id });
      }
      setIsFavorited(!isFavorited);
      addToast(isFavorited ? 'Removed from favorites' : 'Added to favorites', 'success');
    } catch (error) {
      addToast('Failed to update favorites', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-28 flex items-center justify-center bg-primary">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen pt-28 flex flex-col items-center justify-center bg-primary text-primary">
        <h1 className="text-3xl font-black mb-4">Service not found</h1>
        <button onClick={() => navigate('/services')} className="text-blue-500 hover:underline">Return to Services</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 bg-primary text-primary">
      
      <div className="max-w-6xl mx-auto px-4 md:px-6 pt-28">
        {/* Hero Section */}
        <div className="relative h-64 md:h-96 rounded-3xl overflow-hidden mb-8 shadow-sm">
          {service.image ? (
            <img src={service.image} alt={service.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
              <span className="text-white text-xl font-bold opacity-50">No Image Provided</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
            <div>
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white rounded-lg text-sm font-bold mb-3 inline-block">
                {service.category?.name}
              </span>
              <h1 className="text-3xl md:text-5xl font-black text-white">{service.title}</h1>
            </div>
            {user?.role === 'customer' && (
              <button 
                onClick={toggleFavorite}
                className="p-4 bg-white/20 backdrop-blur-md rounded-full shadow-lg hover:scale-110 transition-transform"
              >
                <Heart size={24} fill={isFavorited ? '#ef4444' : 'transparent'} color={isFavorited ? '#ef4444' : 'white'} />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          
          <div className="flex-1 min-w-0">
            
            {/* About Section */}
            <section className="mb-12">
              <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
                About this service
              </h2>
              <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
                <p className="text-secondary leading-relaxed mb-8">{service.description}</p>
                
                <h3 className="text-xl font-bold mb-6">Service Details</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center shrink-0">
                      <Clock size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-sm">Duration</p>
                      <p className="text-slate-500">{service.duration || 'Flexible'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center shrink-0">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-sm">Location Area</p>
                      <p className="text-slate-500">{service.city || 'Anywhere'}</p>
                    </div>
                  </div>
                </div>

                <hr className="my-8 border-slate-100 dark:border-slate-700" />
                
                <h3 className="text-xl font-bold mb-4">Portfolio</h3>
                <PortfolioGallery images={service.portfolioImages ? JSON.parse(service.portfolioImages) : []} />
              </div>
            </section>

            {/* What's Included */}
            <section className="mb-12">
              <h2 className="text-2xl font-black mb-6">What's Included</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['Thorough inspection of the problem area', 'Professional equipment and tools included', 'Post-service cleanup', '30-day service warranty'].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl shadow-sm">
                    <CheckCircle size={20} className="text-emerald-500 shrink-0" />
                    <span className="font-medium text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Provider Section */}
            <section className="mb-12">
              <h2 className="text-2xl font-black mb-6">Your Professional</h2>
              <div className="bg-card border border-border p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900 border-4 border-alt overflow-hidden flex items-center justify-center text-3xl font-black text-blue-600 shrink-0 shadow-inner">
                  {service.provider?.avatar ? (
                    <img src={service.provider.avatar} className="w-full h-full object-cover" />
                  ) : (
                    service.provider?.name.charAt(0)
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold">{service.provider?.name}</h3>
                    <Shield size={16} className="text-blue-500" />
                  </div>
                  <p className="text-secondary text-sm mb-3">Top Rated {service.category?.name} Professional</p>
                  <div className="flex gap-4 text-sm font-medium">
                    <div className="flex items-center gap-1.5"><Star size={16} className="text-amber-500 fill-amber-500"/> 4.9 Average</div>
                    <div className="flex items-center gap-1.5"><CheckCircle size={16} className="text-emerald-500"/> 200+ Jobs</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Reviews Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black flex items-center gap-2">
                  Customer Reviews
                  <span className="text-lg font-bold text-secondary bg-alt px-3 py-1 rounded-lg">{service.reviews.length}</span>
                </h2>
                <div className="flex items-center gap-1 text-lg font-black text-amber-500">
                  <Star size={24} fill="currentColor" />
                  <span>{service.rating.toFixed(1)}</span>
                </div>
              </div>
              
              {service.reviews.length > 0 ? (
                <div className="space-y-6">
                  {service.reviews.map(review => (
                    <div key={review.id} className="bg-card border border-border p-6 rounded-2xl shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold shrink-0">
                            <User size={18} />
                          </div>
                          <div>
                            <p className="font-bold text-sm leading-tight">{review.customer?.name}</p>
                            <div className="flex items-center gap-1 mt-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={12} fill={i < review.rating ? "#F59E0B" : "transparent"} color={i < review.rating ? "#F59E0B" : "var(--border-color)"} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-secondary font-medium bg-alt px-2 py-1 rounded">Verified</span>
                      </div>
                      <p className="text-secondary leading-relaxed mb-4 text-sm">{review.comment}</p>
                      <button className="flex items-center gap-1.5 text-xs font-bold text-secondary hover:text-blue-500 transition-colors">
                        <ThumbsUp size={14} /> Helpful
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-alt rounded-3xl border border-border border-dashed">
                  <p className="text-secondary italic">No reviews yet for this service.</p>
                </div>
              )}
            </section>

          </div>

          {/* ══════════════════ 3. RIGHT: STICKY BOOKING WIDGET ══════════════════ */}
          <div className="w-full lg:w-96 shrink-0">
            <div className="sticky top-28 bg-card border border-border rounded-3xl p-6 shadow-2xl shadow-slate-200/50 dark:shadow-none">
              
              {/* Header */}
              <div className="flex justify-between items-start mb-6 pb-6 border-b border-border">
                <div>
                  <p className="text-secondary font-bold text-sm uppercase tracking-wide mb-1">Starting Price</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-blue-600 dark:text-blue-400">{service.price}</span>
                  </div>
                </div>
              </div>

              {/* Booking Form (Mockup) */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-xs font-bold text-secondary uppercase mb-2 block">Date & Time</label>
                  <button className="w-full flex items-center justify-between p-4 rounded-xl border border-border bg-alt hover:border-blue-500 transition-colors text-left text-sm font-medium">
                    <span className="text-secondary">Select your preferred slot</span>
                    <ChevronRight size={16} className="text-slate-400" />
                  </button>
                </div>
                <div>
                  <label className="text-xs font-bold text-secondary uppercase mb-2 block">Location</label>
                  <button className="w-full flex items-center justify-between p-4 rounded-xl border border-border bg-alt hover:border-blue-500 transition-colors text-left text-sm font-medium">
                    {location?.name ? (
                      <span className="text-primary flex items-center gap-2"><MapPin size={16} className="text-blue-500"/> {location.name}</span>
                    ) : (
                      <span className="text-secondary">Enter service location</span>
                    )}
                    <ChevronRight size={16} className="text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl text-sm">
                <div className="flex justify-between text-secondary">
                  <span>Base Service</span>
                  <span>{service.price}</span>
                </div>
                <div className="flex justify-between text-secondary">
                  <span>Trust & Safety Fee</span>
                  <span>₹49</span>
                </div>
                <div className="border-t border-blue-500/20 pt-3 flex justify-between font-black text-primary text-base">
                  <span>Total (Approx)</span>
                  <span className="text-blue-600 dark:text-blue-400">
                    ₹{parseInt(service.price.replace('₹', '').replace(',', '')) + 49}
                  </span>
                </div>
              </div>
              
              {/* CTA */}
              <button 
                onClick={() => navigate(`/booking/${service.id}`)}
                className="btn-ripple w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-black text-lg shadow-lg shadow-blue-500/30 hover:scale-[1.02] transition-transform"
              >
                Proceed to Book
              </button>
              
              <p className="text-center text-xs text-secondary mt-4 font-medium">
                You won't be charged yet
              </p>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}

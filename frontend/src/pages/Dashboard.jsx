import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { LogOut, User, MapPin, Calendar, Clock, Star } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Mock data for UI presentation
  const bookings = [
    { id: 1, service: 'AC Repair & Cleaning', provider: 'CoolBreeze Tech', date: '2026-07-15', time: '10:00 AM', status: 'Upcoming' },
    { id: 2, service: 'Deep House Cleaning', provider: 'Sparkle Cleaners', date: '2026-07-02', time: '02:00 PM', status: 'Completed' }
  ];

  const providerServices = [
    { id: 101, title: 'Expert Electrician Services', price: '$50/hr', rating: 4.8, bookingsCount: 24 },
    { id: 102, title: 'Smart Home Installation', price: '$120 fixed', rating: 5.0, bookingsCount: 8 }
  ];

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 bg-warm-white text-deep-navy">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Profile Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[32px] p-8 shadow-xl shadow-blue-900/5 flex flex-col md:flex-row items-center md:items-start gap-8"
        >
          <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center text-royal-blue text-4xl font-bold shadow-inner">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
            <p className="text-slate-500 mb-4 flex items-center justify-center md:justify-start gap-2">
              <User size={18} /> {user.role === 'provider' ? 'Service Provider' : 'Customer'}
            </p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <button className="px-5 py-2 rounded-full bg-slate-100 font-medium hover:bg-slate-200 transition-colors">
                Edit Profile
              </button>
              <button 
                onClick={logout}
                className="px-5 py-2 rounded-full bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-colors flex items-center gap-2"
              >
                <LogOut size={18} /> Sign Out
              </button>
            </div>
          </div>
        </motion.div>

        {/* Dynamic Content based on Role */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {user.role === 'customer' ? (
            <div className="col-span-1 md:col-span-3 space-y-6">
              <h2 className="text-2xl font-bold">Your Bookings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {bookings.map(booking => (
                  <div key={booking.id} className="bg-white rounded-2xl p-6 shadow-lg shadow-blue-900/5 border border-slate-100 hover:border-royal-blue/30 transition-all cursor-pointer group">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-bold text-lg group-hover:text-royal-blue transition-colors">{booking.service}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        booking.status === 'Upcoming' ? 'bg-blue-100 text-royal-blue' : 'bg-green-100 text-green-700'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                    <p className="text-slate-500 mb-4">{booking.provider}</p>
                    <div className="flex gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1.5"><Calendar size={16} className="text-slate-400" /> {booking.date}</span>
                      <span className="flex items-center gap-1.5"><Clock size={16} className="text-slate-400" /> {booking.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Provider View */}
              <div className="col-span-1 md:col-span-2 space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Your Services</h2>
                  <button className="px-4 py-2 bg-royal-blue text-white rounded-full text-sm font-bold shadow-md hover:bg-blue-700 hover:scale-105 transition-all">
                    + Add New
                  </button>
                </div>
                <div className="space-y-4">
                  {providerServices.map(service => (
                    <div key={service.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex justify-between items-center hover:shadow-md transition-shadow">
                      <div>
                        <h3 className="font-bold text-lg mb-1">{service.title}</h3>
                        <div className="flex gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1 text-yellow-500 font-medium"><Star size={14} fill="currentColor" /> {service.rating}</span>
                          <span>{service.bookingsCount} bookings</span>
                        </div>
                      </div>
                      <div className="font-bold text-royal-blue">{service.price}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="col-span-1 space-y-6">
                <h2 className="text-2xl font-bold">Stats</h2>
                <div className="bg-white rounded-3xl p-6 shadow-xl shadow-blue-900/5 bg-gradient-to-br from-royal-blue to-blue-600 text-white">
                  <h3 className="text-blue-100 mb-1 font-medium">Total Earnings</h3>
                  <div className="text-4xl font-bold mb-6">$1,240</div>
                  <div className="space-y-3">
                    <div className="flex justify-between border-b border-white/20 pb-2">
                      <span className="text-blue-100">Pending</span>
                      <span className="font-bold">$150</span>
                    </div>
                    <div className="flex justify-between pb-2">
                      <span className="text-blue-100">Completed jobs</span>
                      <span className="font-bold">32</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </motion.div>

      </div>
    </div>
  );
}

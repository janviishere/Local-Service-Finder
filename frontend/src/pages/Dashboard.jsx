import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, MapPin, Calendar, Clock, Star, Edit, CheckCircle, XCircle } from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../components/Toast';
import ChatWindow from '../components/ChatWindow';
import BookingTimeline from '../components/BookingTimeline';

export default function Dashboard() {
  const { user, logout, updateProfile } = useAuth();
  const { addToast } = useToast();
  
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState('bookings'); // bookings, services, profile, favorites
  const [activeChat, setActiveChat] = useState(null); // active booking ID for chat
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({ name: user?.name, phone: user?.phone || '', city: user?.city || '', address: user?.address || '' });

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const bData = await api.get('/bookings');
      setBookings(bData);
      
      if (user?.role === 'provider') {
        const sData = await api.get('/services/my-services');
        setServices(sData);
      } else if (user?.role === 'customer') {
        const fData = await api.get('/favorites');
        setFavorites(fData);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSave = async () => {
    try {
      await updateProfile(profileData);
      addToast('Profile updated successfully', 'success');
      setIsEditing(false);
    } catch (error) {
      addToast('Failed to update profile', 'error');
    }
  };

  const updateBookingStatus = async (id, status) => {
    try {
      await api.put(`/bookings/${id}/status`, { status });
      addToast(`Booking marked as ${status}`, 'success');
      fetchData(); // Refresh
    } catch (error) {
      addToast('Failed to update status', 'error');
    }
  };

  if (loading) return <div className="min-h-screen pt-28 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-royal-blue border-t-transparent"></div></div>;

  return (
    <div className="min-h-screen pt-28 pb-20 px-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Profile Header */}
        <div className="bg-white dark:bg-[#1E293B] rounded-[32px] p-8 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-royal-blue/5 rounded-bl-full -z-10" />
          
          <div className="w-32 h-32 rounded-full bg-royal-blue text-white flex items-center justify-center text-5xl font-bold shadow-lg">
            {user?.avatar ? <img src={user.avatar} className="rounded-full w-full h-full object-cover"/> : user?.name.charAt(0)}
          </div>
          
          <div className="flex-1 text-center md:text-left z-10">
            <h1 className="text-3xl font-black mb-2">{user?.name}</h1>
            <p className="text-slate-500 mb-4 flex justify-center md:justify-start items-center gap-2">
              <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-bold uppercase tracking-wider">
                {user?.role}
              </span>
            </p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5"><MapPin size={16} className="text-royal-blue" /> {user?.city || 'City not set'}</span>
              <span className="flex items-center gap-1.5">📧 {user?.email}</span>
              <span className="flex items-center gap-1.5">📞 {user?.phone || 'No phone'}</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800">
          <button 
            onClick={() => setActiveTab('bookings')}
            className={`pb-4 px-4 font-bold transition-colors ${activeTab === 'bookings' ? 'text-royal-blue border-b-2 border-royal-blue' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
          >
            {user?.role === 'provider' ? 'Booking Requests' : 'My Bookings'}
          </button>
          {user?.role === 'provider' && (
            <button 
              onClick={() => setActiveTab('services')}
              className={`pb-4 px-4 font-bold transition-colors ${activeTab === 'services' ? 'text-royal-blue border-b-2 border-royal-blue' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
            >
              My Services
            </button>
          )}
          {user?.role === 'customer' && (
            <button 
              onClick={() => setActiveTab('favorites')}
              className={`pb-4 px-4 font-bold transition-colors ${activeTab === 'favorites' ? 'text-royal-blue border-b-2 border-royal-blue' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
            >
              Saved
            </button>
          )}
          <button 
            onClick={() => setActiveTab('profile')}
            className={`pb-4 px-4 font-bold transition-colors ${activeTab === 'profile' ? 'text-royal-blue border-b-2 border-royal-blue' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
          >
            Profile Settings
          </button>
        </div>

        {/* Tab Content */}
        <div>
          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div className="space-y-6">
              {bookings.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl">
                  <Calendar className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                  <p className="text-slate-500">No bookings found.</p>
                </div>
              ) : (
                bookings.map(booking => (
                  <div key={booking.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col overflow-hidden">
                    <div className="p-6 flex flex-col md:flex-row justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            booking.status === 'Completed' ? 'bg-emerald/10 text-emerald' : 
                            booking.status === 'Cancelled' ? 'bg-red-100 text-red-600' : 
                            'bg-amber-100 text-amber-600'
                          }`}>
                            {booking.status}
                          </span>
                          <span className="text-sm font-semibold text-slate-500">{booking.date} at {booking.time}</span>
                        </div>
                        <h3 className="font-bold text-lg mb-1">{booking.service?.title}</h3>
                        {user?.role === 'customer' ? (
                          <p className="text-sm text-slate-500 mb-2">Provider: {booking.service?.provider?.name}</p>
                        ) : (
                          <p className="text-sm text-slate-500 mb-2">Customer: {booking.user?.name} ({booking.user?.phone})</p>
                        )}
                        <p className="text-sm flex items-center gap-1 text-slate-500 mt-2"><MapPin size={14}/> {booking.address}</p>
                      </div>
                      
                      <div className="flex flex-col justify-center gap-2 min-w-[140px]">
                        {user?.role === 'provider' && booking.status !== 'Completed' && booking.status !== 'Cancelled' && (
                          <select 
                            value={booking.status} 
                            onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                            className="w-full p-2 bg-slate-50 border rounded-lg text-sm font-bold outline-none"
                          >
                            <option value="Upcoming">Upcoming</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        )}
                        {user?.role === 'customer' && booking.status === 'Upcoming' && (
                          <button onClick={() => updateBookingStatus(booking.id, 'Cancelled')} className="w-full py-2 border border-red-200 text-red-600 rounded-lg text-sm font-bold hover:bg-red-50">Cancel Booking</button>
                        )}
                        {user?.role === 'customer' && booking.status === 'Completed' && (
                          <button className="w-full py-2 bg-royal-blue/10 text-royal-blue rounded-lg text-sm font-bold">Leave Review</button>
                        )}
                        
                        <button 
                          onClick={() => setActiveChat(activeChat === booking.id ? null : booking.id)}
                          className="w-full py-2 border border-royal-blue text-royal-blue rounded-lg text-sm font-bold hover:bg-royal-blue/5"
                        >
                          {activeChat === booking.id ? 'Close Chat' : 'Open Chat'}
                        </button>
                      </div>
                    </div>

                    <div className="px-6 pb-4">
                      <BookingTimeline currentStatus={booking.status} />
                    </div>

                    {activeChat === booking.id && (
                      <div className="bg-slate-50 dark:bg-slate-900 p-4 border-t border-slate-100 dark:border-slate-800">
                        <ChatWindow 
                          bookingId={booking.id} 
                          providerId={booking.service?.provider?.id || booking.service?.providerId} 
                          customerId={booking.user?.id || booking.userId} 
                        />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Favorites Tab */}
          {activeTab === 'favorites' && user?.role === 'customer' && (
            <div className="space-y-4">
              {favorites.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl">
                  <Star className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                  <p className="text-slate-500">You haven't saved any services yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favorites.map(fav => (
                    <div key={fav.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700">
                      <h4 className="font-bold mb-2">{fav.service.title}</h4>
                      <p className="text-sm text-slate-500 mb-4">{fav.service.price}</p>
                      <div className="flex gap-2">
                        <a href={`/services/${fav.service.id}`} className="flex-1 text-center py-2 bg-royal-blue text-white rounded-lg text-sm font-semibold">View</a>
                        <button 
                          onClick={async () => {
                            await api.post(`/favorites/toggle/${fav.service.id}`);
                            fetchData(); // Refresh list
                          }}
                          className="flex-1 py-2 text-red-600 bg-red-50 rounded-lg text-sm font-semibold"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-100 dark:border-slate-700 max-w-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Personal Information</h3>
                <button onClick={() => setIsEditing(!isEditing)} className="text-royal-blue font-semibold text-sm flex items-center gap-1">
                  <Edit size={16}/> {isEditing ? 'Cancel' : 'Edit'}
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">Full Name</label>
                  <input type="text" disabled={!isEditing} value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} className="w-full p-3 rounded-lg border dark:bg-slate-900 dark:border-slate-700 disabled:opacity-70 disabled:bg-slate-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">Phone Number</label>
                  <input type="text" disabled={!isEditing} value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} className="w-full p-3 rounded-lg border dark:bg-slate-900 dark:border-slate-700 disabled:opacity-70 disabled:bg-slate-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">City</label>
                  <input type="text" disabled={!isEditing} value={profileData.city} onChange={e => setProfileData({...profileData, city: e.target.value})} className="w-full p-3 rounded-lg border dark:bg-slate-900 dark:border-slate-700 disabled:opacity-70 disabled:bg-slate-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">Full Address</label>
                  <textarea disabled={!isEditing} value={profileData.address} onChange={e => setProfileData({...profileData, address: e.target.value})} rows={3} className="w-full p-3 rounded-lg border dark:bg-slate-900 dark:border-slate-700 disabled:opacity-70 disabled:bg-slate-50" />
                </div>
                
                {isEditing && (
                  <button onClick={handleProfileSave} className="px-6 py-3 bg-royal-blue text-white rounded-xl font-bold mt-4">Save Changes</button>
                )}
              </div>
            </div>
          )}

          {/* Services Tab (Provider Only) */}
          {activeTab === 'services' && user?.role === 'provider' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Your Service Listings</h3>
                <button className="px-4 py-2 bg-royal-blue text-white rounded-lg text-sm font-bold">Add New Service</button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map(service => (
                  <div key={service.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <h4 className="font-bold mb-2">{service.title}</h4>
                    <p className="text-sm text-slate-500 mb-4">{service.price}</p>
                    <div className="flex items-center gap-1 mb-4 text-amber-500 text-sm font-bold">
                      <Star size={14} fill="currentColor" /> {service.rating.toFixed(1)} ({service.reviewCount})
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm font-semibold">Edit</button>
                      <button className="flex-1 py-2 text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm font-semibold">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

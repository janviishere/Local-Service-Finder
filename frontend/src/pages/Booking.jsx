import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Calendar, Clock, MapPin, CreditCard, CheckCircle, ArrowRight } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useLocationContext } from '../context/LocationContext';
import LocationSearch from '../components/LocationSearch';
import { useToast } from '../components/Toast';

const steps = [
  { id: 1, label: 'Schedule' },
  { id: 2, label: 'Address' },
  { id: 3, label: 'Confirm' }
];

export default function Booking() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { location, setLocation } = useLocationContext();
  const { addToast } = useToast();

  const [service, setService] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form State
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    notes: '',
    address: user?.address || ''
  });

  useEffect(() => {
    const fetchService = async () => {
      try {
        const data = await api.get(`/services/${serviceId}`);
        setService(data);
      } catch (error) {
        addToast('Service not found', 'error');
        navigate('/services');
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [serviceId, navigate, addToast]);

  const handleNext = () => {
    if (currentStep === 1 && (!bookingData.date || !bookingData.time)) {
      return addToast('Please select date and time', 'error');
    }
    if (currentStep === 2 && (!bookingData.address && !location)) {
      return addToast('Please provide an address', 'error');
    }
    setCurrentStep(c => c + 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const fullAddress = bookingData.address 
        ? `${bookingData.address}, ${location?.name || ''}`
        : location?.full || '';

      await api.post('/bookings', {
        serviceId,
        date: bookingData.date,
        time: bookingData.time,
        notes: bookingData.notes,
        address: fullAddress,
        latitude: location?.lat,
        longitude: location?.lon,
      });
      setIsSuccess(true);
    } catch (error) {
      addToast(error.message || 'Failed to book', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen pt-28 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-royal-blue border-t-transparent"></div></div>;

  if (isSuccess) {
    return (
      <div className="min-h-screen pt-28 pb-20 px-4 flex items-center justify-center bg-slate-50 dark:bg-[#0A0F1E]">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-[#1E293B] p-10 rounded-3xl text-center max-w-lg shadow-xl border border-slate-100 dark:border-slate-800">
          <CheckCircle className="w-24 h-24 text-emerald mx-auto mb-6" />
          <h2 className="text-3xl font-black mb-4">Booking Confirmed!</h2>
          <p className="text-slate-500 mb-8">
            Your booking for <strong>{service?.title}</strong> is confirmed for {bookingData.date} at {bookingData.time}. Our professional will arrive at your address.
          </p>
          <div className="flex gap-4 justify-center">
            <button onClick={() => navigate('/dashboard')} className="px-6 py-3 bg-royal-blue text-white rounded-xl font-bold">Go to Dashboard</button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 bg-slate-50 dark:bg-[#0A0F1E]">
      <div className="max-w-4xl mx-auto">
        
        <h1 className="text-3xl font-black mb-8 text-center">Book {service?.title}</h1>
        
        {/* Progress Bar */}
        <div className="flex items-center justify-center mb-12">
          {steps.map((step, idx) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex flex-col items-center relative z-10`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${currentStep >= step.id ? 'bg-royal-blue text-white' : 'bg-slate-200 text-slate-500'}`}>
                  {currentStep > step.id ? <Check size={20} /> : step.id}
                </div>
                <span className="absolute top-12 text-xs font-semibold whitespace-nowrap">{step.label}</span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`h-1 w-16 md:w-32 -mx-2 transition-colors ${currentStep > step.id ? 'bg-royal-blue' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 p-6 md:p-10">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: Schedule */}
            {currentStep === 1 && (
              <motion.div key="step1" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
                <h3 className="text-xl font-bold mb-6">When do you need the service?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Select Date</label>
                    <input 
                      type="date" 
                      min={new Date().toISOString().split('T')[0]}
                      value={bookingData.date}
                      onChange={e => setBookingData({...bookingData, date: e.target.value})}
                      className="w-full p-4 rounded-xl border focus:border-royal-blue outline-none dark:bg-slate-800 dark:border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Select Time</label>
                    <select 
                      value={bookingData.time}
                      onChange={e => setBookingData({...bookingData, time: e.target.value})}
                      className="w-full p-4 rounded-xl border focus:border-royal-blue outline-none dark:bg-slate-800 dark:border-slate-700"
                    >
                      <option value="">Choose a slot</option>
                      <option value="09:00 AM">09:00 AM</option>
                      <option value="11:00 AM">11:00 AM</option>
                      <option value="02:00 PM">02:00 PM</option>
                      <option value="04:00 PM">04:00 PM</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button onClick={handleNext} className="flex items-center gap-2 px-8 py-4 bg-royal-blue text-white rounded-xl font-bold">
                    Continue <ArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Address */}
            {currentStep === 2 && (
              <motion.div key="step2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
                <h3 className="text-xl font-bold mb-6">Where should we come?</h3>
                <div className="space-y-6 mb-8">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Search Location/City</label>
                    <LocationSearch 
                      onSelect={setLocation} 
                      initialValue={location?.name || ''} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Detailed Address (House/Flat, Street)</label>
                    <textarea 
                      rows={3}
                      value={bookingData.address}
                      onChange={e => setBookingData({...bookingData, address: e.target.value})}
                      placeholder="e.g. 101, A Block, Sunshine Apartments"
                      className="w-full p-4 rounded-xl border focus:border-royal-blue outline-none dark:bg-slate-800 dark:border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Any notes for the provider? (Optional)</label>
                    <input 
                      type="text"
                      value={bookingData.notes}
                      onChange={e => setBookingData({...bookingData, notes: e.target.value})}
                      className="w-full p-4 rounded-xl border focus:border-royal-blue outline-none dark:bg-slate-800 dark:border-slate-700"
                    />
                  </div>
                </div>
                <div className="flex justify-between">
                  <button onClick={() => setCurrentStep(1)} className="px-8 py-4 bg-slate-200 dark:bg-slate-800 rounded-xl font-bold">Back</button>
                  <button onClick={handleNext} className="flex items-center gap-2 px-8 py-4 bg-royal-blue text-white rounded-xl font-bold">
                    Continue <ArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Confirm */}
            {currentStep === 3 && (
              <motion.div key="step3" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
                <h3 className="text-xl font-bold mb-6">Review Booking</h3>
                
                <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl mb-8 space-y-4">
                  <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-700 pb-4">
                    <div>
                      <h4 className="font-bold text-lg">{service?.title}</h4>
                      <p className="text-sm text-slate-500">{service?.category?.name}</p>
                    </div>
                    <div className="text-xl font-black text-royal-blue">{service?.price}</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 py-2">
                    <div className="flex gap-3">
                      <Calendar className="text-royal-blue" size={20} />
                      <div>
                        <p className="text-xs text-slate-500">Date</p>
                        <p className="font-semibold text-sm">{bookingData.date}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Clock className="text-royal-blue" size={20} />
                      <div>
                        <p className="text-xs text-slate-500">Time</p>
                        <p className="font-semibold text-sm">{bookingData.time}</p>
                      </div>
                    </div>
                    <div className="flex gap-3 col-span-2">
                      <MapPin className="text-royal-blue shrink-0" size={20} />
                      <div>
                        <p className="text-xs text-slate-500">Address</p>
                        <p className="font-semibold text-sm">
                          {bookingData.address}{bookingData.address && location ? ', ' : ''}{location?.name}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 p-4 rounded-xl mb-8 text-sm font-medium">
                  <CreditCard size={20} />
                  Pay securely after the service is completed.
                </div>

                <div className="flex justify-between">
                  <button onClick={() => setCurrentStep(2)} className="px-8 py-4 bg-slate-200 dark:bg-slate-800 rounded-xl font-bold">Back</button>
                  <button 
                    onClick={handleSubmit} 
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-8 py-4 bg-emerald text-white rounded-xl font-bold disabled:opacity-70"
                  >
                    {isSubmitting ? 'Confirming...' : 'Confirm Booking'}
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

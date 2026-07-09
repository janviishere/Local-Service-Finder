import { motion } from 'framer-motion';
import { Smartphone, CheckCircle, Apple, Play } from 'lucide-react';

export default function Booking() {
  return (
    <div className="w-full bg-warm-white min-h-screen">
      {/* App Promotion Section */}
      <section className="pt-32 pb-24 relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-8">
          <div className="bg-deep-navy rounded-[3rem] p-8 md:p-16 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between shadow-2xl">
            {/* Background Glows */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-royal-blue/30 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald/20 rounded-full blur-[100px] pointer-events-none" />
            
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="md:w-1/2 relative z-10 mb-12 md:mb-0"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm font-medium mb-6">
                <Smartphone size={16} /> Get the App
              </span>
              <h1 className="text-4xl md:text-6xl font-bold font-heading mb-6 leading-tight">
                Book Services <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-royal-blue to-emerald">On The Go</span>
              </h1>
              <p className="text-lg text-white/70 mb-8 max-w-md">
                Download the LocalFinds app to book professionals, track them in real-time, and manage your payments securely from your phone.
              </p>

              <ul className="space-y-4 mb-10">
                {['Real-time Booking', 'Live Tracking', 'Instant Chat', 'Digital Payments'].map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-white/90 font-medium">
                    <CheckCircle className="text-emerald" size={20} />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-4">
                <button className="flex items-center gap-3 bg-white text-deep-navy px-6 py-3 rounded-2xl hover:bg-white/90 transition-colors shadow-xl">
                  <Apple size={28} />
                  <div className="text-left">
                    <div className="text-[10px] font-bold uppercase tracking-wider opacity-60">Download on the</div>
                    <div className="text-sm font-bold font-heading leading-tight">App Store</div>
                  </div>
                </button>
                <button className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-2xl hover:bg-white/20 transition-colors">
                  <Play size={28} />
                  <div className="text-left">
                    <div className="text-[10px] font-bold uppercase tracking-wider opacity-60">Get it on</div>
                    <div className="text-sm font-bold font-heading leading-tight">Google Play</div>
                  </div>
                </button>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="md:w-[45%] relative z-10 flex justify-center"
            >
              {/* Phone Mockup Placeholder */}
              <div className="w-[300px] h-[600px] bg-warm-white rounded-[3rem] border-8 border-white/10 shadow-2xl relative overflow-hidden flex flex-col">
                <div className="absolute top-0 inset-x-0 h-7 bg-white/10 rounded-b-3xl mx-16 z-20" />
                <div className="flex-1 bg-white p-6 relative">
                  {/* Mock UI */}
                  <div className="w-full h-12 bg-deep-navy/5 rounded-full mb-6 mt-4" />
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="h-24 bg-royal-blue/10 rounded-2xl" />
                    <div className="h-24 bg-emerald/10 rounded-2xl" />
                  </div>
                  <div className="space-y-4">
                    <div className="h-16 bg-deep-navy/5 rounded-2xl" />
                    <div className="h-16 bg-deep-navy/5 rounded-2xl" />
                    <div className="h-16 bg-deep-navy/5 rounded-2xl" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Booking Form CTA */}
      <section className="pb-24">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl">
          <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-xl border border-deep-navy/5 text-center">
            <h2 className="text-3xl font-bold font-heading text-deep-navy mb-4">Book Your Service</h2>
            <p className="text-deep-navy/60 mb-8 max-w-lg mx-auto">Fill out the form below and we'll match you with the best available professional in your area.</p>
            
            <form className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-deep-navy">Service Category</label>
                <select className="p-4 rounded-xl bg-warm-white border-none outline-none focus:ring-2 focus:ring-royal-blue">
                  <option>Electrician</option>
                  <option>Plumber</option>
                  <option>House Cleaning</option>
                  <option>AC Repair</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-deep-navy">Location/Zip Code</label>
                <input type="text" placeholder="e.g. 10001" className="p-4 rounded-xl bg-warm-white border-none outline-none focus:ring-2 focus:ring-royal-blue" />
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm font-bold text-deep-navy">Service Details</label>
                <textarea rows={4} placeholder="Describe what you need help with..." className="p-4 rounded-xl bg-warm-white border-none outline-none focus:ring-2 focus:ring-royal-blue resize-none" />
              </div>
              <button type="button" className="md:col-span-2 bg-royal-blue text-white font-bold py-4 rounded-xl hover:bg-royal-blue/90 transition-colors shadow-lg hover:shadow-royal-blue/30">
                Continue to Booking
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

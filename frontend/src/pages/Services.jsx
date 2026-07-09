import { motion } from 'framer-motion';
import { MapPin, Star, Shield, Search } from 'lucide-react';
import { cn } from '../lib/utils';

const categories = ["All", "Cleaning", "Electrical", "Plumbing", "Painting", "Carpentry", "AC Repair"];

const professionals = [
  { name: "Michael Chen", role: "Master Electrician", rating: "4.9", jobs: "340", exp: "12 years", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150", available: true },
  { name: "Sarah Jenkins", role: "Expert Plumber", rating: "5.0", jobs: "512", exp: "8 years", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150", available: true },
  { name: "David Rodriguez", role: "HVAC Specialist", rating: "4.8", jobs: "289", exp: "15 years", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150", available: false },
  { name: "Emily Watson", role: "Interior Painter", rating: "4.9", jobs: "156", exp: "5 years", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150&h=150", available: true }
];

export default function Services() {
  return (
    <div className="w-full pt-32 pb-24 bg-warm-white">
      <div className="container mx-auto px-4 md:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold font-heading text-deep-navy mb-4">Our Services</h1>
            <p className="text-deep-navy/60 text-lg">Browse our comprehensive list of premium local services.</p>
          </motion.div>
          <div className="w-full md:w-auto overflow-x-auto pb-2 flex gap-2 hide-scrollbar">
            {categories.map((cat, idx) => (
              <button 
                key={idx}
                className={cn(
                  "px-5 py-2.5 rounded-full font-medium whitespace-nowrap transition-all text-sm",
                  idx === 0 ? "bg-deep-navy text-white shadow-lg" : "bg-white text-deep-navy hover:bg-royal-blue/10 border border-deep-navy/5"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Masonry Gallery Placeholder */}
        <section className="mb-32">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px]">
            {/* Main large item */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="md:col-span-2 md:row-span-2 rounded-[2rem] overflow-hidden relative group cursor-pointer">
              <img src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80" alt="Plumbing" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-deep-navy/80 to-transparent flex items-end p-8">
                <div>
                  <h3 className="text-white text-2xl font-bold font-heading mb-2">Premium Plumbing</h3>
                  <p className="text-white/80">Expert repairs and installations</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="rounded-[2rem] overflow-hidden relative group cursor-pointer">
              <img src="https://images.unsplash.com/photo-1527515637-edbc25a3a1f8?auto=format&fit=crop&q=80" alt="Cleaning" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-deep-navy/80 to-transparent flex items-end p-6">
                <h3 className="text-white text-xl font-bold font-heading">Deep Cleaning</h3>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="rounded-[2rem] overflow-hidden relative group cursor-pointer">
              <img src="https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&q=80" alt="Electrical" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-deep-navy/80 to-transparent flex items-end p-6">
                <h3 className="text-white text-xl font-bold font-heading">Electrical Systems</h3>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Featured Professionals */}
        <section>
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-deep-navy mb-4">Featured Professionals</h2>
            <p className="text-deep-navy/60">Top-rated experts ready to help you today.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {professionals.map((pro, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-3xl p-6 border border-deep-navy/5 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
              >
                <div className="relative mb-6">
                  <div className="w-24 h-24 rounded-full overflow-hidden mx-auto border-4 border-warm-white shadow-lg">
                    <img src={pro.img} alt={pro.name} className="w-full h-full object-cover" />
                  </div>
                  <div className={cn(
                    "absolute top-0 right-1/4 w-4 h-4 rounded-full border-2 border-white",
                    pro.available ? "bg-emerald" : "bg-soft-gray"
                  )} />
                </div>
                
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold font-heading text-deep-navy mb-1">{pro.name}</h3>
                  <p className="text-royal-blue text-sm font-medium mb-3">{pro.role}</p>
                  <div className="flex items-center justify-center gap-4 text-sm text-deep-navy/60">
                    <span className="flex items-center gap-1"><Star size={14} className="text-accent-gold" /> {pro.rating}</span>
                    <span>{pro.jobs} jobs</span>
                  </div>
                </div>

                <button className="w-full py-3 rounded-xl bg-warm-white text-deep-navy font-bold hover:bg-royal-blue hover:text-white transition-colors">
                  Hire Now
                </button>
              </motion.div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}

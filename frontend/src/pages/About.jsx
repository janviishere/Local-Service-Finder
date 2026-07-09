import { motion } from 'framer-motion';
import { Shield, Users, Star, Award, CheckCircle } from 'lucide-react';

export default function About() {
  return (
    <div className="w-full pt-32 pb-24 bg-warm-white">
      <div className="container mx-auto px-4 md:px-8">
        
        {/* Story Section */}
        <section className="mb-32">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-royal-blue font-bold tracking-wider uppercase text-sm mb-4 block">Our Story</span>
              <h1 className="text-4xl md:text-6xl font-bold font-heading text-deep-navy mb-6">
                Redefining Local Services
              </h1>
              <p className="text-lg text-deep-navy/70 mb-6 leading-relaxed">
                Finding a reliable professional shouldn't be a gamble. We started LocalFinds with a simple mission: to connect homeowners and businesses with vetted, high-quality local experts through a seamless, transparent platform.
              </p>
              <p className="text-lg text-deep-navy/70 leading-relaxed mb-8">
                Today, we empower thousands of skilled professionals while giving our customers peace of mind, knowing that their projects are in the best hands.
              </p>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-emerald" size={20} />
                  <span className="font-medium text-deep-navy">Fully Vetted</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-emerald" size={20} />
                  <span className="font-medium text-deep-navy">Insured</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative h-[500px] rounded-[2rem] overflow-hidden shadow-2xl"
            >
              <img 
                src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80" 
                alt="Professional at work" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-deep-navy/80 to-transparent flex items-end p-8">
                <div className="glassmorphism p-4 rounded-xl text-white">
                  <p className="font-bold text-xl">100% Satisfaction</p>
                  <p className="text-sm opacity-80">Guaranteed on every job.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="mb-32 bg-white rounded-3xl p-12 border border-deep-navy/5 shadow-xl shadow-deep-navy/5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: <Users className="text-royal-blue mb-4" size={32} />, stat: "10,000+", label: "Verified Pros" },
              { icon: <Star className="text-accent-gold mb-4" size={32} />, stat: "50,000+", label: "Happy Customers" },
              { icon: <Award className="text-emerald mb-4" size={32} />, stat: "100+", label: "Categories" },
              { icon: <Shield className="text-royal-blue mb-4" size={32} />, stat: "4.9★", label: "Average Rating" },
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="text-center flex flex-col items-center"
              >
                {item.icon}
                <h3 className="text-4xl font-bold font-heading text-deep-navy mb-2">{item.stat}</h3>
                <p className="text-deep-navy/60 font-medium">{item.label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Why Choose Us */}
        <section>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold font-heading text-deep-navy mb-6">Why Choose Us</h2>
            <p className="text-lg text-deep-navy/70">Experience the premium standard of local services.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: "Verified Professionals", desc: "Every professional undergoes strict background checks and skill verification before joining.", color: "from-blue-500/10 to-royal-blue/10" },
              { title: "Transparent Pricing", desc: "No hidden fees. You see the exact price or accurate estimates before booking.", color: "from-emerald-500/10 to-teal-500/10" },
              { title: "Fast Response Time", desc: "Get matched with a pro within minutes and schedule same-day services easily.", color: "from-purple-500/10 to-pink-500/10" },
              { title: "Secure Online Payments", desc: "Pay safely through our platform only after the job is completed to your satisfaction.", color: "from-orange-500/10 to-accent-gold/10" }
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`p-8 rounded-3xl bg-gradient-to-br ${item.color} border border-white bg-white hover:shadow-xl transition-shadow`}
              >
                <CheckCircle className="text-royal-blue mb-6" size={32} />
                <h3 className="text-2xl font-bold font-heading text-deep-navy mb-3">{item.title}</h3>
                <p className="text-deep-navy/70 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}

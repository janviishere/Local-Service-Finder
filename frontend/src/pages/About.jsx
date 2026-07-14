import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Shield,
  Users,
  Star,
  Award,
  CheckCircle,
  Heart,
  ArrowRight,
  MapPin,
  TrendingUp,
  Lock,
  Clock,
  DollarSign,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

/* ─────────────────────────── helpers ─────────────────────────── */

function FadeIn({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function useCountUp(target, duration = 2000, inView = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration]);
  return count;
}

/* ─────────────────────────── data ─────────────────────────────── */

const stats = [
  { label: 'Happy Customers', value: 50000, suffix: '+', prefix: '' },
  { label: 'Verified Pros', value: 2000, suffix: '+', prefix: '' },
  { label: 'Service Categories', value: 100, suffix: '+', prefix: '' },
  { label: 'Average Rating', value: 4.9, suffix: '★', prefix: '', isFloat: true },
];

const values = [
  {
    icon: Shield,
    title: 'Transparency',
    description:
      "We believe every customer deserves to know exactly what they're paying for. No hidden fees, no surprises — just clear pricing and honest communication from start to finish.",
    color: '#3b82f6',
  },
  {
    icon: Award,
    title: 'Quality First',
    description:
      'Every professional on our platform is rigorously vetted through background checks, skill assessments, and ongoing performance reviews so you always receive exceptional service.',
    color: '#8b5cf6',
  },
  {
    icon: Heart,
    title: 'Community Impact',
    description:
      "We're proud to empower local professionals and small businesses, creating meaningful economic opportunities while strengthening the communities we serve.",
    color: '#ec4899',
  },
];

const team = [
  {
    initials: 'AK',
    name: 'Arjun Kapoor',
    role: 'Co-Founder & CEO',
    bio: 'Former product lead at Zomato. Passionate about connecting people with reliable local services.',
    color: '#3b82f6',
  },
  {
    initials: 'PS',
    name: 'Priya Sharma',
    role: 'Co-Founder & CTO',
    bio: 'Full-stack engineer with 10+ years building scalable platforms. Loves clean code and great UX.',
    color: '#8b5cf6',
  },
  {
    initials: 'RV',
    name: 'Rohit Verma',
    role: 'Head of Operations',
    bio: 'Expert in service delivery and quality assurance. Ensures every interaction exceeds expectations.',
    color: '#10b981',
  },
  {
    initials: 'SN',
    name: 'Sneha Nair',
    role: 'Head of Marketing',
    bio: 'Brand storyteller who has grown audiences for top D2C startups across India.',
    color: '#f59e0b',
  },
];

const features = [
  {
    icon: Shield,
    title: 'Verified Professionals',
    description:
      'Every provider undergoes thorough background checks, license verification, and skill assessments before joining our platform.',
    color: '#3b82f6',
  },
  {
    icon: DollarSign,
    title: 'Transparent Pricing',
    description:
      'See upfront pricing before you book. No hidden charges or surprise fees — what you see is exactly what you pay.',
    color: '#10b981',
  },
  {
    icon: Clock,
    title: 'Fast Response',
    description:
      'Our pros respond within minutes. Get confirmations quickly and schedule services at your convenience.',
    color: '#f59e0b',
  },
  {
    icon: Lock,
    title: 'Secure Payments',
    description:
      'All transactions are protected with bank-grade encryption. Pay confidently with multiple secure payment options.',
    color: '#8b5cf6',
  },
];

const timeline = [
  {
    year: '2020',
    title: 'Founded in Bangalore',
    description:
      'LocalFinds was born in a small co-working space with a simple idea: make finding trusted local professionals effortless for every Indian household.',
    icon: MapPin,
    color: '#3b82f6',
  },
  {
    year: '2021',
    title: '500 Verified Pros',
    description:
      'We crossed 500 verified service providers across 5 cities, onboarding electricians, plumbers, beauticians, and more through our rigorous vetting process.',
    icon: Users,
    color: '#8b5cf6',
  },
  {
    year: '2022',
    title: '10,000 Happy Customers',
    description:
      'A milestone moment — 10,000 bookings completed with a 4.8-star average. We expanded to 20 cities and launched our mobile app.',
    icon: Star,
    color: '#10b981',
  },
  {
    year: '2024',
    title: 'Nationwide Expansion',
    description:
      "Now serving 50,000+ customers across 100+ cities with 2,000+ verified professionals. We're just getting started on our mission to transform local services in India.",
    icon: TrendingUp,
    color: '#f59e0b',
  },
];

/* ─────────────────────────── stat counter card ─────────────────── */

function StatCard({ stat, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const count = useCountUp(stat.isFloat ? stat.value * 10 : stat.value, 1800, inView);
  const display = stat.isFloat ? (count / 10).toFixed(1) : count.toLocaleString();

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, delay: index * 0.12 }}
      className="text-center p-8 glassmorphism-card m-2 border border-white/10 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />
      <div className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-md">
        {stat.prefix}{display}{stat.suffix}
      </div>
      <div className="text-blue-100 mt-2 font-medium">
        {stat.label}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════ MAIN PAGE ════════════════════════════ */

export default function About() {
  const { isDark } = useTheme();

  return (
    <div className="bg-primary text-primary overflow-x-hidden pt-20">

      {/* ══════════════════ 1. HERO BANNER ══════════════════ */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900" />
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] bg-blue-600/30 blur-[120px] rounded-full mix-blend-screen aurora-glow pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[60%] bg-purple-600/30 blur-[120px] rounded-full mix-blend-screen aurora-glow pointer-events-none" style={{ animationDelay: '2s' }} />
        
        {/* Grid noise */}
        <div className="absolute inset-0 pattern-grid opacity-20 pointer-events-none" />

        <div className="relative z-10 text-center max-w-4xl mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-5 py-2 text-blue-200 font-semibold text-sm tracking-wide uppercase mb-8 shadow-lg shadow-blue-500/10"
          >
            <MapPin size={16} className="text-blue-400" />
            Trusted Across India
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-5xl md:text-7xl font-black text-white leading-[1.1] tracking-tight mb-6 drop-shadow-xl"
          >
            About{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              LocalFinds
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-lg md:text-xl text-blue-100/90 leading-relaxed max-w-2xl mx-auto mb-10 font-medium"
          >
            We're on a mission to connect every household with trusted, skilled local professionals — making quality home services accessible, affordable, and stress-free across India.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex gap-4 justify-center flex-wrap"
          >
            <Link
              to="/services"
              className="btn-ripple flex items-center gap-2 bg-white text-blue-900 px-8 py-4 rounded-full font-bold text-lg shadow-xl shadow-white/20 hover:scale-105 transition-all"
            >
              Explore Services <ArrowRight size={18} />
            </Link>
            <Link
              to="/contact"
              className="flex items-center gap-2 bg-transparent text-white border-2 border-white/30 px-8 py-4 rounded-full font-bold text-lg hover:bg-white/10 backdrop-blur-sm transition-all"
            >
              Contact Us
            </Link>
          </motion.div>
        </div>

        {/* Bottom Fade */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-primary to-transparent" />
      </section>

      {/* ══════════════════ 2. KEY STATS ══════════════════ */}
      <section className="relative -mt-16 z-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <StatCard key={i} stat={stat} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 3. OUR STORY ══════════════════ */}
      <section className="py-24 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left — text */}
            <div>
              <FadeIn delay={0}>
                <div className="inline-block bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full px-4 py-1.5 text-sm font-bold tracking-wider uppercase mb-6 border border-blue-200 dark:border-blue-800">
                  Our Story
                </div>
              </FadeIn>
              <FadeIn delay={0.1}>
                <h2 className="text-4xl md:text-5xl font-black leading-tight tracking-tight mb-6">
                  Born from a{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
                    real need
                  </span>
                </h2>
              </FadeIn>
              <FadeIn delay={0.2}>
                <p className="text-secondary text-lg leading-relaxed mb-6">
                  It started with a leaking pipe and a phone full of unreliable contacts. Our founders, frustrated with the guesswork of finding trustworthy local help, decided to build the platform they always wished existed.
                </p>
              </FadeIn>
              <FadeIn delay={0.3}>
                <p className="text-secondary text-lg leading-relaxed mb-8">
                  LocalFinds was founded in 2020 with a single purpose: bridge the gap between skilled local professionals and the households that need them — with transparency, trust, and technology at its core.
                </p>
              </FadeIn>
              <FadeIn delay={0.4}>
                <div className="flex flex-col gap-4">
                  {['Rigorous background verification for every pro', 'Real-time booking & service tracking', '100% satisfaction or money-back guarantee'].map((point, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-card border border-border">
                      <CheckCircle size={22} className="text-blue-500 shrink-0" />
                      <span className="font-medium">{point}</span>
                    </div>
                  ))}
                </div>
              </FadeIn>
            </div>

            {/* Right — image with overlay card */}
            <FadeIn delay={0.25} className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-border">
                <img
                  src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80"
                  alt="Professional handyman at work"
                  className="w-full h-[500px] object-cover hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
              </div>

              {/* floating card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="absolute -bottom-6 -right-6 md:-right-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 shadow-2xl shadow-blue-500/30 max-w-[240px] border border-white/20 text-white"
              >
                <div className="text-3xl mb-2">🏅</div>
                <div className="font-bold text-lg leading-tight mb-1">
                  100% Satisfaction
                </div>
                <div className="text-blue-100 text-sm">
                  or your money back guaranteed
                </div>
              </motion.div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ══════════════════ 4. MISSION & VALUES ══════════════════ */}
      <section className="py-24 px-6 bg-alt border-y border-border">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <div className="inline-block bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full px-4 py-1.5 text-sm font-bold tracking-wider uppercase mb-4 border border-blue-200 dark:border-blue-800">
                What We Stand For
              </div>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6">
                Our Mission & Values
              </h2>
              <p className="text-secondary max-w-2xl mx-auto text-lg">
                Three core pillars guide every decision we make, every professional we onboard, and every customer we serve.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((val, i) => (
              <FadeIn key={i} delay={i * 0.15}>
                <motion.div
                  whileHover={{ y: -8 }}
                  className="bg-card border border-border p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all h-full flex flex-col relative overflow-hidden group"
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-10 -mt-10 opacity-10 group-hover:opacity-20 transition-opacity`} style={{ backgroundColor: val.color }} />
                  
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-sm" style={{ background: `linear-gradient(135deg, ${val.color}15, ${val.color}30)` }}>
                    <val.icon size={32} style={{ color: val.color }} />
                  </div>
                  <h3 className="font-bold text-2xl mb-4">{val.title}</h3>
                  <p className="text-secondary leading-relaxed flex-grow">{val.description}</p>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 5. WHY CHOOSE US ══════════════════ */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6">
                Why Choose LocalFinds?
              </h2>
              <p className="text-secondary max-w-2xl mx-auto text-lg">
                We've built every feature with one goal: giving you peace of mind from the moment you book to the moment the job is done.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feat, i) => (
              <FadeIn key={i} delay={i * 0.12}>
                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-card border border-border p-6 rounded-2xl hover:border-blue-500/30 transition-all shadow-sm"
                >
                  <div className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center" style={{ background: `${feat.color}15` }}>
                    <feat.icon size={24} style={{ color: feat.color }} />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{feat.title}</h3>
                  <p className="text-secondary text-sm leading-relaxed">{feat.description}</p>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 6. MEET THE TEAM ══════════════════ */}
      <section className="py-24 px-6 bg-alt border-y border-border">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <div className="inline-block bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full px-4 py-1.5 text-sm font-bold tracking-wider uppercase mb-4 border border-blue-200 dark:border-blue-800">
                The Team
              </div>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6">
                Meet the Founders
              </h2>
              <p className="text-secondary max-w-2xl mx-auto text-lg">
                A passionate team united by the belief that great local service is a right, not a luxury.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, i) => (
              <FadeIn key={i} delay={i * 0.12}>
                <div className="bg-card border border-border p-8 rounded-3xl text-center group hover:border-blue-500/30 transition-all shadow-sm">
                  <div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center text-3xl font-black text-white shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300" style={{ background: `linear-gradient(135deg, ${member.color}, ${member.color}aa)` }}>
                    {member.initials}
                  </div>
                  <h3 className="font-bold text-xl mb-1">{member.name}</h3>
                  <div className="text-sm font-semibold mb-4 px-3 py-1 rounded-full inline-block" style={{ color: member.color, backgroundColor: `${member.color}15` }}>
                    {member.role}
                  </div>
                  <p className="text-secondary text-sm leading-relaxed">{member.bio}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 7. TIMELINE / JOURNEY ══════════════════ */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2 hidden md:block" />
        
        <div className="max-w-4xl mx-auto relative z-10">
          <FadeIn>
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6">
                Our Journey
              </h2>
            </div>
          </FadeIn>

          <div className="space-y-16">
            {timeline.map((item, i) => {
              const isEven = i % 2 === 0;
              return (
                <div key={i} className={`flex flex-col md:flex-row items-center justify-between w-full ${isEven ? 'md:flex-row-reverse' : ''}`}>
                  <div className="md:w-5/12" />
                  
                  {/* Center Dot */}
                  <div className="w-12 h-12 absolute left-1/2 -translate-x-1/2 rounded-full border-4 border-primary bg-card flex items-center justify-center shadow-lg z-20 hidden md:flex" style={{ borderColor: 'var(--bg-primary)' }}>
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                  </div>
                  
                  <FadeIn delay={0.1} className="w-full md:w-5/12">
                    <div className="bg-card border border-border p-8 rounded-3xl shadow-sm relative group hover:shadow-xl hover:-translate-y-1 transition-all">
                      {/* Mobile Dot */}
                      <div className="md:hidden w-4 h-4 rounded-full absolute -top-2 left-8 border-2 border-primary" style={{ backgroundColor: item.color }} />
                      
                      <div className="text-5xl font-black mb-4 opacity-10" style={{ color: item.color }}>
                        {item.year}
                      </div>
                      <div className="flex items-center gap-3 mb-3">
                        <item.icon size={24} style={{ color: item.color }} />
                        <h3 className="font-bold text-xl">{item.title}</h3>
                      </div>
                      <p className="text-secondary leading-relaxed">{item.description}</p>
                    </div>
                  </FadeIn>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════ 8. CTA SECTION ══════════════════ */}
      <section className="py-24 px-6 relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-90" />
        <div className="absolute inset-0 pattern-grid opacity-20 pointer-events-none" />
        
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <FadeIn>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
              Ready to experience better local service?
            </h2>
            <p className="text-blue-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
              Join thousands of happy customers who have already simplified their lives with LocalFinds.
            </p>
            <Link
              to="/services"
              className="btn-ripple inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-10 py-5 rounded-full font-black text-lg shadow-xl shadow-white/10 hover:scale-105 transition-transform"
            >
              Book a Service Now <ArrowRight size={20} />
            </Link>
          </FadeIn>
        </div>
      </section>

    </div>
  );
}

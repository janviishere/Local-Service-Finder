import { useState, useRef, useEffect, useCallback } from "react";
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Search, Shield, Clock, CreditCard, Star, ChevronRight, ArrowRight,
  MapPin, Zap, Droplets, Home as HomeIcon, Wind, Paintbrush, Hammer, Bug,
  Tv, Scissors, Package, Phone, Download, CheckCircle2, PlayCircle,
  ChevronLeft, Quote, Users, Award, Sparkles, TrendingUp, HeartHandshake,
} from "lucide-react";
import { FaApple, FaGooglePlay } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectCards } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-cards";
import { useTheme } from "../context/ThemeContext";
import { useLocationContext } from "../context/LocationContext";
import { api } from "../lib/api";
import LocationSearch from "../components/LocationSearch";

/* ─── Helpers ─── */
function cn(...c) { return c.filter(Boolean).join(" "); }

/* ─── Fade In on Scroll ─── */
function FadeIn({ children, delay = 0, className = "", y = 40, once = true }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Animated Counter ─── */
function AnimatedCounter({ target, suffix = "", prefix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const end = parseInt(target.replace(/\D/g, ""));
    const duration = 1800;
    const step = Math.ceil(end / (duration / 16));
    const timer = setInterval(() => {
      start = Math.min(start + step, end);
      setCount(start);
      if (start >= end) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString("en-IN")}{suffix}
    </span>
  );
}

/* ─── Static Data ─── */
const SERVICES = [
  { id: "electrician",    icon: <Zap size={28} />,        label: "Electrician",       desc: "Wiring, fans, switchboards",  from: "₹299", rating: 4.8, slug: "electrician",    color: "#F59E0B", bg: "#FEF3C7" },
  { id: "plumber",        icon: <Droplets size={28} />,   label: "Plumber",           desc: "Leaks, pipes, fittings",      from: "₹199", rating: 4.9, slug: "plumber",        color: "#3B82F6", bg: "#DBEAFE" },
  { id: "house-cleaning", icon: <HomeIcon size={28} />,       label: "House Cleaning",    desc: "Deep clean & sanitise",       from: "₹899", rating: 4.9, slug: "house-cleaning", color: "#10B981", bg: "#D1FAE5" },
  { id: "ac-repair",      icon: <Wind size={28} />,       label: "AC Repair",         desc: "Service, gas refill, install", from: "₹599", rating: 4.8, slug: "ac-repair",      color: "#06B6D4", bg: "#CFFAFE" },
  { id: "painter",        icon: <Paintbrush size={28} />, label: "Painter",           desc: "Interior & exterior paint",   from: "₹999", rating: 4.7, slug: "painting",       color: "#8B5CF6", bg: "#EDE9FE" },
  { id: "carpenter",      icon: <Hammer size={28} />,     label: "Carpenter",         desc: "Furniture & woodwork",        from: "₹399", rating: 4.8, slug: "carpentry",      color: "#92400E", bg: "#FEF3C7" },
  { id: "pest-control",   icon: <Bug size={28} />,        label: "Pest Control",      desc: "Cockroach, termite, rodent",  from: "₹699", rating: 4.7, slug: "pest-control",   color: "#DC2626", bg: "#FEE2E2" },
  { id: "appliance",      icon: <Tv size={28} />,         label: "Appliance Repair",  desc: "TV, fridge, washing machine", from: "₹349", rating: 4.6, slug: "appliance-repair",color: "#6366F1", bg: "#EEF2FF" },
  { id: "beauty",         icon: <Scissors size={28} />,   label: "Beauty & Salon",    desc: "Hair, makeup, facial",        from: "₹299", rating: 4.9, slug: "beauty-salon",   color: "#EC4899", bg: "#FCE7F3" },
  { id: "moving",         icon: <Package size={28} />,    label: "Moving & Packing",  desc: "Home shifting, transport",    from: "₹999", rating: 4.6, slug: "moving-packing", color: "#0EA5E9", bg: "#E0F2FE" },
];

const WHY_CHOOSE = [
  { icon: <Shield size={32} />,        title: "Verified Professionals",  desc: "Every professional is background-checked, ID-verified, and skill-tested before joining our platform.",                    color: "#2563EB", bg: "rgba(37,99,235,0.1)"  },
  { icon: <CreditCard size={32} />,    title: "Transparent Pricing",     desc: "No hidden charges. See exact pricing before booking — what you see is exactly what you pay.",                             color: "#10B981", bg: "rgba(16,185,129,0.1)" },
  { icon: <Clock size={32} />,         title: "Fast Response Time",      desc: "Our professionals respond within 60 minutes and arrive on your scheduled time — every single time.",                       color: "#FBBF24", bg: "rgba(251,191,36,0.1)"  },
  { icon: <HeartHandshake size={32} />, title: "Satisfaction Guarantee", desc: "Not happy with the service? We offer a free re-service or full refund — no questions asked.",                            color: "#EC4899", bg: "rgba(236,72,153,0.1)"  },
];

const STEPS = [
  { num: "01", icon: <Search size={28} />,       title: "Search Your Service",           desc: "Browse from 100+ categories or simply type what you need." },
  { num: "02", icon: <Star size={28} />,          title: "Choose a Verified Pro",        desc: "Compare ratings, reviews, experience, and pricing side-by-side." },
  { num: "03", icon: <CheckCircle2 size={28} />,  title: "Book & Relax",                 desc: "Schedule at your convenience. The expert arrives, you relax." },
];

const PROFESSIONALS = [
  { name: "Rajesh Kumar",   role: "Master Electrician",   exp: "8 yrs", rating: 4.9, jobs: 412, available: true,  avatar: "https://i.pravatar.cc/150?img=12", badge: "Top Rated"  },
  { name: "Priya Verma",    role: "Senior Home Cleaner",  exp: "5 yrs", rating: 4.8, jobs: 328, available: true,  avatar: "https://i.pravatar.cc/150?img=47", badge: "Expert"     },
  { name: "Suresh Sharma",  role: "Professional Plumber", exp: "10 yrs",rating: 4.9, jobs: 576, available: false, avatar: "https://i.pravatar.cc/150?img=15", badge: "Top Rated"  },
  { name: "Anil Verma",     role: "Interior Painter",     exp: "6 yrs", rating: 4.7, jobs: 241, available: true,  avatar: "https://i.pravatar.cc/150?img=51", badge: "Verified"   },
];

const TESTIMONIALS = [
  { name: "Anita Sharma",  service: "House Cleaning", city: "Bhopal",   rating: 5, avatar: "https://i.pravatar.cc/150?img=5",  text: "Absolutely amazing service! Priya and her team cleaned every corner of our 3BHK spotlessly. The kitchen looks brand new. Booking was so easy and they were punctual. 10/10 would recommend!" },
  { name: "Vikram Mehta",  service: "AC Repair",      city: "Indore",   rating: 5, avatar: "https://i.pravatar.cc/150?img=8",  text: "Mohan fixed our AC in under an hour. He explained the issue clearly, refilled the gas, and even cleaned the filters at no extra charge. Very professional and fair pricing. Highly satisfied!" },
  { name: "Kavya Reddy",   service: "Electrician",    city: "Bhopal",   rating: 5, avatar: "https://i.pravatar.cc/150?img=25", text: "Rajesh rewired our entire flat safely and efficiently. He worked neatly, cleaned up after himself, and even gave tips to prevent future issues. An absolute pro — our go-to electrician!" },
  { name: "Sneha Patel",   service: "Beauty & Salon", city: "Indore",   rating: 5, avatar: "https://i.pravatar.cc/150?img=23", text: "Sunita came home for my bridal makeup and did a flawless job! Everyone at the wedding kept asking who did my makeup. The convenience of at-home service is unbeatable. Thank you LocalFinds!" },
  { name: "Rohit Gupta",   service: "Painting",       city: "Jabalpur", rating: 4, avatar: "https://i.pravatar.cc/150?img=11", text: "The painting team finished our 2BHK in just 2 days. Clean lines, great finish, and they used premium paint as quoted. The price was very competitive. Will use again for sure." },
];

const GALLERY = [
  { img: "/gallery_cleaning.png",    label: "Home Cleaning",     span: "row-span-2" },
  { img: "/gallery_electrical.png",  label: "Electrical Work",   span: "" },
  { img: "/gallery_plumbing.png",    label: "Plumbing Repairs",  span: "" },
  { img: "/gallery_painting.png",    label: "Interior Painting", span: "row-span-2" },
  { img: "/professionals_grid.png",  label: "Our Professionals", span: "" },
  { img: "/hero_bg.png",             label: "Quality Service",   span: "" },
];

const CITIES = ["Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Dewas", "Satna", "Ratlam", "Rewa"];

const QUICK_TAGS = ["Electrician", "Plumber", "House Cleaning", "AC Repair", "Painting"];

const STATS = [
  { value: "10000", suffix: "+", label: "Verified Professionals", icon: <Users size={24} />,     color: "#2563EB" },
  { value: "50000", suffix: "+", label: "Happy Customers",         icon: <Star size={24} />,      color: "#10B981" },
  { value: "100",   suffix: "+", label: "Service Categories",      icon: <Award size={24} />,     color: "#FBBF24" },
  { value: "4.9",   suffix: "★", label: "Customer Rating",         icon: <Sparkles size={24} />, color: "#EC4899", prefix: "" },
];

/* ═══════════════════════════════════════════
   LOADING SCREEN
═══════════════════════════════════════════ */
function LoadingScreen({ onDone }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(onDone, 2200);
    const interval = setInterval(() => {
      setProgress(p => Math.min(p + Math.random() * 12, 100));
    }, 80);
    return () => { clearTimeout(timer); clearInterval(interval); };
  }, [onDone]);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-deep-navy"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        className="flex flex-col items-center gap-6"
      >
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-royal-blue flex items-center justify-center shadow-2xl glow-blue">
            <Zap size={38} className="text-white" />
          </div>
          <div className="absolute -inset-3 rounded-3xl border-2 border-royal-blue/30 animate-ping" />
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-black text-white tracking-tight">
            Local<span className="text-royal-blue">Finds</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Trusted Professionals Near You</p>
        </div>
        <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-royal-blue to-emerald rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   MAIN HOME COMPONENT
═══════════════════════════════════════════ */
export default function Home() {
  const [service, setService] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { location, setLocation } = useLocationContext();

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  // Theme helpers
  const cardBg   = isDark ? "var(--bg-card)"       : "#FFFFFF";
  const cardBdr  = isDark ? "rgba(255,255,255,0.07)": "rgba(0,0,0,0.06)";
  const altBg    = isDark ? "var(--section-alt)"   : "#F1F5F9";
  const textPri  = isDark ? "var(--text-primary)"  : "#0F172A";
  const textSec  = isDark ? "var(--text-secondary)": "#475569";

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await api.get("/categories");
        setCategories(data.slice(0, 10));
      } catch (e) {
        console.error("Failed to fetch categories", e);
      }
    };
    fetchCategories();
  }, []);

  const handleSearch = useCallback(() => {
    navigate(`/services?search=${encodeURIComponent(service)}${location ? `&city=${encodeURIComponent(location.name)}` : ""}`);
  }, [service, location, navigate]);

  const cardBgCss = isDark
    ? "rgba(30,41,59,0.9)"
    : "rgba(255,255,255,0.95)";

  if (loading) {
    return (
      <AnimatePresence onExitComplete={() => {}}>
        {loading && <LoadingScreen onDone={() => setLoading(false)} />}
      </AnimatePresence>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}
    >

      {/* ══════════ 1. HERO ══════════ */}
      <section ref={heroRef} className="relative flex items-center justify-center w-full min-h-screen overflow-hidden">
        {/* Video Background */}
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="absolute inset-0 z-0">
          <video
            autoPlay muted loop playsInline
            className="absolute inset-0 w-full h-full object-cover"
            poster="/hero_bg.png"
          >
            <source src="/hero-video.mp4" type="video/mp4" />
          </video>
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/75" />
          {/* Animated aurora glows */}
          <div className="aurora-glow w-[600px] h-[600px] bg-royal-blue/20 top-1/4 left-1/4" style={{ position: 'absolute', left: '20%', top: '20%' }} />
          <div className="aurora-glow w-[400px] h-[400px] bg-emerald/15 top-1/2 right-1/4" style={{ position: 'absolute', right: '20%', top: '50%', animationDelay: '7s' }} />
        </motion.div>

        {/* Floating service icons */}
        {SERVICES.slice(0, 6).map((s, i) => (
          <motion.div
            key={s.id}
            className="absolute z-10 hidden lg:flex items-center justify-center w-14 h-14 rounded-2xl text-white shadow-2xl"
            style={{
              background: `${s.color}CC`,
              backdropFilter: 'blur(8px)',
              left: `${[8, 85, 5, 88, 12, 82][i]}%`,
              top:  `${[20, 25, 55, 60, 80, 75][i]}%`,
              animationDelay: `${i * 1.2}s`,
              animationDuration: `${4 + i * 0.7}s`,
            }}
            animate={{
              y: [0, -15 - i * 3, 0],
              rotate: [0, i % 2 === 0 ? 8 : -8, 0],
            }}
            transition={{ duration: 4 + i * 0.7, repeat: Infinity, ease: "easeInOut", delay: i * 0.8 }}
          >
            {s.icon}
          </motion.div>
        ))}

        {/* Hero Content */}
        <div className="relative z-20 flex flex-col items-center justify-center w-full min-h-screen px-4 text-center">
          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-4xl mx-auto"
          >
            <div className="rounded-[28px] border border-white/20 bg-white/5 backdrop-blur-xl p-2 shadow-[0_0_60px_rgba(37,99,235,0.15)]">
              <div className="bg-white/95 backdrop-blur-2xl rounded-2xl md:rounded-full p-2 flex flex-col md:flex-row items-stretch gap-2 shadow-2xl">
                <div className="flex flex-1 items-center gap-3 px-5 py-3 border-b md:border-b-0 md:border-r border-slate-200">
                  <Search className="text-royal-blue shrink-0" size={20} />
                  <input
                    type="text"
                    value={service}
                    onChange={e => setService(e.target.value)}
                    placeholder="What service do you need?"
                    className="w-full bg-transparent outline-none text-deep-navy placeholder:text-slate-400 font-medium text-sm"
                    onKeyDown={e => e.key === "Enter" && handleSearch()}
                    id="hero-service-input"
                  />
                </div>
                <div className="flex flex-1 items-center z-50 px-2">
                  <LocationSearch
                    placeholder="Enter your city..."
                    onSelect={setLocation}
                    initialValue={location?.name || ""}
                    className="w-full"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  id="hero-find-btn"
                  className="btn-ripple px-8 py-4 font-bold text-white transition-all duration-300 rounded-xl md:rounded-full bg-royal-blue hover:bg-blue-700 hover:scale-105 active:scale-95 shadow-lg hover:shadow-blue-500/40 whitespace-nowrap text-center"
                >
                  Find Service
                </button>
              </div>
            </div>
          </motion.div>

          {/* Quick Tags */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex flex-wrap justify-center gap-3 mt-7"
          >
            {QUICK_TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => { setService(tag); navigate(`/services?category=${tag.toLowerCase().replace(/ /g, "-")}`); }}
                className="px-5 py-2 text-sm font-medium text-white transition-all duration-300 border rounded-full cursor-pointer bg-white/10 border-white/20 backdrop-blur-md hover:bg-white/25 hover:border-white/50 hover:scale-105"
              >
                {tag}
              </button>
            ))}
          </motion.div>

          {/* Hero Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="flex flex-wrap justify-center gap-8 mt-12 pt-8 border-t border-white/10"
          >
            {[["10K+", "Verified Pros"], ["50K+", "Happy Customers"], ["4.9★", "Avg Rating"], ["60min", "Response Time"]].map(([val, lab]) => (
              <div key={lab} className="text-center">
                <div className="text-2xl font-black text-white">{val}</div>
                <div className="text-xs text-white/60 mt-0.5">{lab}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        >
          <div className="flex flex-col items-center gap-1 text-white/50">
            <span className="text-xs font-medium tracking-widest uppercase">Scroll</span>
            <div className="w-5 h-8 rounded-full border border-white/30 flex items-start justify-center p-1">
              <div className="w-1 h-2 bg-white/60 rounded-full animate-bounce" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* ══════════ 2. STATS ══════════ */}
      <section className="py-16 relative overflow-hidden" style={{ backgroundColor: "#0F172A" }}>
        <div className="absolute inset-0 bg-gradient-to-r from-royal-blue/5 via-transparent to-emerald/5" />
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, i) => (
              <FadeIn key={stat.label} delay={i * 0.1}>
                <div className="text-center group">
                  <div className="flex justify-center mb-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: `${stat.color}22`, color: stat.color }}>
                      {stat.icon}
                    </div>
                  </div>
                  <div className="text-4xl font-black text-white mb-1">
                    {stat.prefix !== undefined ? (
                      <>{stat.value}{stat.suffix}</>
                    ) : (
                      <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                    )}
                  </div>
                  <div className="text-slate-400 text-sm font-medium">{stat.label}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ 3. POPULAR SERVICES ══════════ */}
      <section className="py-24 px-4" style={{ backgroundColor: "var(--bg-primary)" }}>
        <div className="max-w-7xl mx-auto">
          <FadeIn className="text-center mb-16">
            <span className="text-sm font-bold text-royal-blue uppercase tracking-widest">What We Offer</span>
            <h2 className="text-3xl md:text-5xl font-black mt-3 mb-4" style={{ color: textPri }}>
              Popular Services
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: textSec }}>
              From electrical repairs to beauty treatments — all the services you need, booked in seconds.
            </p>
          </FadeIn>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
            {SERVICES.map((svc, i) => (
              <FadeIn key={svc.id} delay={i * 0.06}>
                <Link
                  to={`/services?category=${svc.slug}`}
                  className="service-card group flex flex-col items-center gap-3 p-6 rounded-3xl border cursor-pointer"
                  style={{ backgroundColor: cardBg, borderColor: cardBdr }}
                  id={`service-card-${svc.id}`}
                >
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                    style={{ background: isDark ? `${svc.color}22` : svc.bg, color: svc.color }}
                  >
                    {svc.icon}
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-sm mb-0.5" style={{ color: textPri }}>{svc.label}</p>
                    <p className="text-xs mb-2" style={{ color: textSec }}>{svc.desc}</p>
                    <div className="flex items-center justify-center gap-2 text-xs">
                      <span className="font-semibold text-royal-blue">From {svc.from}</span>
                    </div>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <Star size={11} className="fill-amber-400 text-amber-400" />
                      <span className="text-xs font-semibold" style={{ color: textSec }}>{svc.rating}</span>
                    </div>
                  </div>
                  <motion.span
                    className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full text-white"
                    style={{ background: svc.color }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                  >
                    Book Now <ChevronRight size={12} />
                  </motion.span>
                </Link>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.3} className="text-center mt-12">
            <Link
              to="/services"
              id="view-all-services-btn"
              className="btn-ripple inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-white bg-royal-blue hover:bg-blue-700 transition-all hover:scale-105 shadow-lg hover:shadow-blue-500/30"
            >
              View All Services <ArrowRight size={16} />
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* ══════════ 4. WHY CHOOSE US ══════════ */}
      <section className="py-24 px-4 relative overflow-hidden" style={{ backgroundColor: altBg }}>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-96 h-96 bg-royal-blue/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <FadeIn className="text-center mb-16">
            <span className="text-sm font-bold text-royal-blue uppercase tracking-widest">Our Promise</span>
            <h2 className="text-3xl md:text-5xl font-black mt-3 mb-4" style={{ color: textPri }}>
              Why Choose LocalFinds?
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: textSec }}>
              We've built the platform that sets the gold standard for home services in India.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_CHOOSE.map((f, i) => (
              <FadeIn key={f.title} delay={i * 0.12}>
                <div
                  className="group relative p-8 rounded-3xl border cursor-default overflow-hidden transition-all duration-300 hover:-translate-y-2"
                  style={{ backgroundColor: cardBg, borderColor: cardBdr }}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                       style={{ background: `radial-gradient(circle at 50% 0%, ${f.color}10 0%, transparent 70%)` }} />
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
                    style={{ background: f.bg, color: f.color }}
                  >
                    {f.icon}
                  </div>
                  <h3 className="font-black text-lg mb-3" style={{ color: textPri }}>{f.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: textSec }}>{f.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ 5. HOW IT WORKS ══════════ */}
      <section className="py-24 px-4" style={{ backgroundColor: "var(--bg-primary)" }}>
        <div className="max-w-6xl mx-auto">
          <FadeIn className="text-center mb-16">
            <span className="text-sm font-bold text-royal-blue uppercase tracking-widest">Simple Process</span>
            <h2 className="text-3xl md:text-5xl font-black mt-3 mb-4" style={{ color: textPri }}>
              How It Works
            </h2>
            <p className="text-base max-w-lg mx-auto" style={{ color: textSec }}>
              Book a verified professional in three effortless steps.
            </p>
          </FadeIn>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden lg:block absolute top-16 left-[16.66%] right-[16.66%] h-px bg-gradient-to-r from-royal-blue via-emerald to-royal-blue z-0 opacity-30" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
              {STEPS.map((step, i) => (
                <FadeIn key={step.num} delay={i * 0.18}>
                  <div className="flex flex-col items-center text-center p-8 rounded-3xl border group hover:-translate-y-2 transition-all duration-300"
                       style={{ backgroundColor: cardBg, borderColor: cardBdr }}>
                    <div className="relative mb-6">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-royal-blue to-emerald flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform duration-300">
                        {step.icon}
                      </div>
                      <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-accent-gold text-deep-navy text-xs font-black flex items-center justify-center">
                        {step.num}
                      </span>
                    </div>
                    <h3 className="text-xl font-black mb-3" style={{ color: textPri }}>{step.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: textSec }}>{step.desc}</p>
                    {i < STEPS.length - 1 && (
                      <div className="lg:hidden mt-6 text-royal-blue opacity-40">
                        <ArrowRight size={24} />
                      </div>
                    )}
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>

          <FadeIn delay={0.4} className="text-center mt-12">
            <Link
              to="/services"
              id="get-started-btn"
              className="btn-ripple inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-white bg-gradient-to-r from-royal-blue to-emerald hover:opacity-90 transition-all hover:scale-105 shadow-lg"
            >
              Get Started Now <ArrowRight size={16} />
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* ══════════ 6. FEATURED PROFESSIONALS ══════════ */}
      <section className="py-24 px-4" style={{ backgroundColor: altBg }}>
        <div className="max-w-7xl mx-auto">
          <FadeIn className="text-center mb-16">
            <span className="text-sm font-bold text-royal-blue uppercase tracking-widest">Meet the Experts</span>
            <h2 className="text-3xl md:text-5xl font-black mt-3 mb-4" style={{ color: textPri }}>
              Featured Professionals
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: textSec }}>
              Hand-picked, verified, and top-rated — these pros deliver excellence every time.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PROFESSIONALS.map((pro, i) => (
              <FadeIn key={pro.name} delay={i * 0.12}>
                <div
                  className="pro-card rounded-3xl border overflow-hidden group"
                  style={{ backgroundColor: cardBg, borderColor: cardBdr }}
                  id={`pro-card-${i}`}
                >
                  {/* Card image area */}
                  <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                    <img
                      src={pro.avatar}
                      alt={pro.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(pro.name)}&background=2563EB&color=fff&size=200`; }}
                    />
                    {/* Availability badge */}
                    <div className={cn(
                      "absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold",
                      pro.available ? "bg-emerald text-white" : "bg-slate-200 text-slate-600"
                    )}>
                      <span className={cn("w-1.5 h-1.5 rounded-full", pro.available ? "bg-white availability-dot" : "bg-slate-400")} />
                      {pro.available ? "Available" : "Busy"}
                    </div>
                    {/* Badge */}
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-royal-blue text-white text-xs font-bold">
                      {pro.badge}
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="font-black text-base mb-0.5" style={{ color: textPri }}>{pro.name}</h3>
                    <p className="text-sm font-medium text-royal-blue mb-3">{pro.role}</p>

                    <div className="flex items-center justify-between text-xs mb-4" style={{ color: textSec }}>
                      <span className="flex items-center gap-1">
                        <Award size={13} className="text-amber-500" /> {pro.exp} exp.
                      </span>
                      <span className="flex items-center gap-1">
                        <Star size={13} className="fill-amber-400 text-amber-400" /> {pro.rating}
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle2 size={13} className="text-emerald" /> {pro.jobs} jobs
                      </span>
                    </div>

                    <Link
                      to="/services"
                      id={`hire-btn-${i}`}
                      className="btn-ripple block w-full text-center py-2.5 rounded-2xl font-bold text-sm text-white bg-royal-blue hover:bg-blue-700 transition-all hover:scale-[1.02]"
                    >
                      Hire Now
                    </Link>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ 7. TESTIMONIALS ══════════ */}
      <section className="py-24 px-4 relative overflow-hidden" style={{ backgroundColor: "#0F172A" }}>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-royal-blue/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald/8 rounded-full blur-3xl" />
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          <FadeIn className="text-center mb-16">
            <span className="text-sm font-bold text-royal-blue uppercase tracking-widest">Customer Love</span>
            <h2 className="text-3xl md:text-5xl font-black mt-3 mb-4 text-white">
              What Our Customers Say
            </h2>
            <p className="text-slate-400 text-base max-w-xl mx-auto">
              Real reviews from real customers — unfiltered and authentic.
            </p>
          </FadeIn>

          <Swiper
            modules={[Autoplay, Pagination]}
            autoplay={{ delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true }}
            pagination={{ clickable: true }}
            slidesPerView={1}
            spaceBetween={24}
            loop
            breakpoints={{
              640:  { slidesPerView: 1 },
              768:  { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            className="pb-14"
          >
            {TESTIMONIALS.map((t, i) => (
              <SwiperSlide key={i}>
                <div className="glassmorphism-card rounded-3xl p-7 h-full flex flex-col min-h-[280px]">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} size={16} className={j < t.rating ? "fill-amber-400 text-amber-400" : "text-slate-600"} />
                    ))}
                  </div>
                  <Quote size={28} className="text-royal-blue/40 mb-3" />
                  <p className="text-slate-300 text-sm leading-relaxed flex-1 mb-5">"{t.text}"</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-royal-blue/30"
                      onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=2563EB&color=fff&size=80`; }}
                    />
                    <div>
                      <p className="font-bold text-white text-sm">{t.name}</p>
                      <p className="text-xs text-slate-400">{t.service} · {t.city}</p>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* ══════════ 8. GALLERY ══════════ */}
      <section className="py-24 px-4" style={{ backgroundColor: "var(--bg-primary)" }}>
        <div className="max-w-7xl mx-auto">
          <FadeIn className="text-center mb-16">
            <span className="text-sm font-bold text-royal-blue uppercase tracking-widest">Our Work</span>
            <h2 className="text-3xl md:text-5xl font-black mt-3 mb-4" style={{ color: textPri }}>
              Service Gallery
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: textSec }}>
              A glimpse of the quality work our professionals deliver across India every day.
            </p>
          </FadeIn>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-[200px]">
            {GALLERY.map((g, i) => (
              <FadeIn key={i} delay={i * 0.08} className={cn("gallery-item rounded-2xl relative overflow-hidden", g.span)}>
                <img src={g.img} alt={g.label} className="w-full h-full object-cover" />
                <div className="gallery-overlay absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-5">
                  <div>
                    <p className="text-white font-bold text-base">{g.label}</p>
                    <p className="text-white/60 text-xs">Premium service · Verified pros</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ 9. SERVICE COVERAGE ══════════ */}
      <section className="py-24 px-4" style={{ backgroundColor: altBg }}>
        <div className="max-w-7xl mx-auto">
          <FadeIn className="text-center mb-16">
            <span className="text-sm font-bold text-royal-blue uppercase tracking-widest">Service Area</span>
            <h2 className="text-3xl md:text-5xl font-black mt-3 mb-4" style={{ color: textPri }}>
              Serving Cities Across MP
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: textSec }}>
              Find verified professionals in your city with live availability.
            </p>
          </FadeIn>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {CITIES.map((city, i) => (
              <FadeIn key={city} delay={i * 0.06}>
                <button
                  onClick={() => navigate(`/services?city=${encodeURIComponent(city)}`)}
                  id={`city-btn-${city.toLowerCase()}`}
                  className="group relative p-5 rounded-2xl border text-center w-full transition-all duration-300 hover:-translate-y-1 hover:border-royal-blue"
                  style={{ backgroundColor: cardBg, borderColor: cardBdr }}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="pin-bounce text-2xl">📍</div>
                    <span className="font-bold text-sm" style={{ color: textPri }}>{city}</span>
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald availability-dot" />
                      <span className="text-xs text-emerald font-semibold">Active</span>
                    </div>
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-royal-blue/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.3} className="mt-12 p-8 rounded-3xl border relative overflow-hidden" style={{ backgroundColor: cardBg, borderColor: cardBdr }}>
            <div className="absolute inset-0 bg-gradient-to-r from-royal-blue/5 to-emerald/5" />
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-black mb-2" style={{ color: textPri }}>
                  <TrendingUp className="inline text-royal-blue mr-2" size={22} />
                  Can't find your city?
                </h3>
                <p style={{ color: textSec }} className="text-sm">
                  We're expanding rapidly. Register your interest and we'll notify you when we launch in your area.
                </p>
              </div>
              <Link
                to="/signup"
                id="notify-me-btn"
                className="btn-ripple shrink-0 px-8 py-3.5 rounded-full font-bold text-white bg-royal-blue hover:bg-blue-700 transition-all hover:scale-105 whitespace-nowrap"
              >
                Notify Me
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════ 10. MOBILE APP ══════════ */}
      <section className="py-24 px-4 relative overflow-hidden" style={{ backgroundColor: "#0F172A" }}>
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-royal-blue/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeIn>
              <span className="text-sm font-bold text-royal-blue uppercase tracking-widest">Mobile App</span>
              <h2 className="text-3xl md:text-5xl font-black mt-3 mb-6 text-white leading-tight">
                Book Services On The Go
              </h2>
              <p className="text-slate-400 mb-8 leading-relaxed">
                Download the LocalFinds app for the smoothest booking experience. Track your professional in real-time, chat instantly, and pay securely — all from your pocket.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { icon: <MapPin size={20} />, title: "Live Tracking", desc: "Track your pro's location" },
                  { icon: <Phone size={20} />,  title: "Instant Chat",  desc: "Connect with professionals" },
                  { icon: <Star size={20} />,   title: "Easy Booking",  desc: "Book in under 60 seconds"  },
                  { icon: <CreditCard size={20} />, title: "Secure Pay", desc: "Multiple payment options"  },
                ].map(f => (
                  <div key={f.title} className="glassmorphism-card rounded-2xl p-4 flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-royal-blue/20 text-royal-blue flex items-center justify-center shrink-0">
                      {f.icon}
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">{f.title}</p>
                      <p className="text-slate-400 text-xs">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-4">
                <a href="#" id="app-store-btn" className="btn-ripple flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-white text-deep-navy font-bold hover:opacity-90 transition-all hover:scale-105">
                  <FaApple size={22} /> App Store
                </a>
                <a href="#" id="play-store-btn" className="btn-ripple flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-white text-deep-navy font-bold hover:opacity-90 transition-all hover:scale-105">
                  <FaGooglePlay size={20} /> Google Play
                </a>
              </div>
            </FadeIn>

            <FadeIn delay={0.2} className="flex justify-center">
              <div className="relative">
                {/* Phone mockup */}
                <div className="w-72 h-[560px] bg-gradient-to-br from-slate-800 to-slate-900 rounded-[48px] border-4 border-slate-700 shadow-2xl overflow-hidden relative glow-blue">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-slate-900 rounded-b-2xl z-10" />
                  <div className="w-full h-full bg-gradient-to-b from-royal-blue/20 to-deep-navy flex flex-col">
                    {/* App UI preview */}
                    <div className="px-6 pt-10 pb-4">
                      <p className="text-white/50 text-xs mb-1">Good Morning 👋</p>
                      <p className="text-white font-bold text-lg">What do you need today?</p>
                    </div>
                    {/* Search bar */}
                    <div className="mx-4 mb-4 bg-white/10 rounded-2xl px-4 py-3 flex items-center gap-2">
                      <Search size={16} className="text-white/50" />
                      <span className="text-white/40 text-sm">Search services...</span>
                    </div>
                    {/* Service icons row */}
                    <div className="px-4 mb-4">
                      <p className="text-white/60 text-xs mb-3">Popular</p>
                      <div className="grid grid-cols-4 gap-3">
                        {SERVICES.slice(0, 8).map(s => (
                          <div key={s.id} className="flex flex-col items-center gap-1">
                            <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: `${s.color}33`, color: s.color }}>
                              {s.icon}
                            </div>
                            <span className="text-white/50 text-[9px] text-center leading-tight">{s.label.split(' ')[0]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Active booking card */}
                    <div className="mx-4 bg-royal-blue rounded-3xl p-4">
                      <p className="text-white/70 text-xs mb-1">Active Booking</p>
                      <p className="text-white font-bold text-sm">Rajesh Kumar · Electrician</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-2 h-2 rounded-full bg-emerald animate-pulse" />
                        <span className="text-white/70 text-xs">En route · Arrives in 15 min</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Floating notification cards */}
                <motion.div
                  className="absolute -right-8 top-24 glassmorphism-card rounded-2xl px-4 py-3 w-44"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <p className="text-white text-xs font-bold">✅ Booking Confirmed!</p>
                  <p className="text-white/50 text-[10px] mt-0.5">Rajesh arrives in 15 min</p>
                </motion.div>
                <motion.div
                  className="absolute -left-8 bottom-24 glassmorphism-card rounded-2xl px-4 py-3 w-40"
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                >
                  <p className="text-white text-xs font-bold">⭐ 4.9 Rating</p>
                  <p className="text-white/50 text-[10px] mt-0.5">50,000+ happy customers</p>
                </motion.div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ══════════ 11. CTA BANNER ══════════ */}
      <section className="py-24 px-4 relative overflow-hidden cta-gradient">
        <div className="absolute inset-0 opacity-20">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-72 h-72 rounded-full border border-white/10"
              style={{ left: `${i * 20}%`, top: `${i % 2 === 0 ? -50 : 50}%`, transform: `scale(${1 + i * 0.3})` }}
            />
          ))}
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <FadeIn>
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-sm font-semibold mb-6"
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              <Sparkles size={16} className="text-accent-gold" /> Limited spots available today
            </motion.div>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
              Need Help Today?
            </h2>
            <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
              Book a trusted professional near you in just a few clicks. Fast, reliable, and affordable.
            </p>
            <div className="flex flex-wrap justify-center gap-5">
              <Link
                to="/services"
                id="cta-book-now-btn"
                className="btn-ripple px-10 py-4 rounded-full font-black text-deep-navy bg-white hover:bg-white/90 transition-all hover:scale-105 text-lg shadow-2xl"
              >
                Book Now
              </Link>
              <Link
                to="/signup"
                id="cta-become-provider-btn"
                className="btn-ripple px-10 py-4 rounded-full font-black text-white border-2 border-white/40 hover:bg-white/10 transition-all hover:scale-105 text-lg backdrop-blur-md"
              >
                Become a Provider
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

    </motion.div>
  );
}
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Wrench, Mail, Lock, ArrowRight, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  
  // Navigate back to where they were, or dashboard
  const from = location.state?.from?.pathname || "/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await login(email, password);
      addToast('Logged in successfully', 'success');
      navigate(from, { replace: true });
    } catch (error) {
      addToast(error.message || 'Login failed. Please check your credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Left side: Visual & Services */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-royal-blue overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0">
          <img 
            src="/hero_bg.png" 
            alt="LocalFinds Services" 
            className="w-full h-full object-cover opacity-30 mix-blend-overlay"
            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=2070&auto=format&fit=crop'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-royal-blue via-royal-blue/80 to-transparent" />
        </div>
        
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="bg-white text-royal-blue p-2 rounded-xl group-hover:scale-110 transition-transform shadow-lg">
              <Wrench size={20} />
            </div>
            <span className="font-heading font-black text-2xl text-white">LocalFinds</span>
          </Link>
        </div>

        <div className="relative z-10 mt-auto">
          <h2 className="text-4xl font-black text-white mb-6 leading-tight">
            Your Trusted Network of<br/>Local Professionals.
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-md">
            Book verified experts instantly. Join thousands of users who trust LocalFinds for their daily needs.
          </p>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald animate-pulse" />
              Popular Services Available Now
            </h3>
            <div className="flex flex-wrap gap-3">
              {['Electrician', 'Plumber', 'House Cleaning', 'AC Repair', 'Painting', 'Carpentry'].map(service => (
                <span key={service} className="px-4 py-2 bg-white/10 rounded-full text-white text-sm font-medium border border-white/10 hover:bg-white/20 transition-colors cursor-default">
                  {service}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative">
        <div className="absolute top-0 right-0 w-full h-[400px] bg-gradient-to-b from-royal-blue/5 to-transparent -z-10 lg:hidden" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald/10 rounded-full blur-3xl -z-10 lg:hidden" />

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8">
            <Link to="/" className="inline-flex items-center gap-2 group">
              <div className="bg-royal-blue text-white p-1.5 rounded-lg group-hover:scale-110 transition-transform">
                <Wrench size={18} />
              </div>
              <span className="font-heading font-black text-xl text-deep-navy dark:text-white">LocalFinds</span>
            </Link>
          </div>
          
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-black mb-3 text-deep-navy dark:text-white">Welcome back</h1>
            <p className="text-slate-500 text-base">Please enter your details to sign in to your account.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold mb-2 text-deep-navy dark:text-white">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-royal-blue transition-colors" size={20} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:border-royal-blue dark:focus:bg-slate-800 focus:ring-4 focus:ring-royal-blue/10 outline-none transition-all text-base"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-deep-navy dark:text-white">Password</label>
                <Link to="#" className="text-sm font-bold text-royal-blue hover:text-blue-700 transition-colors">Forgot password?</Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-royal-blue transition-colors" size={20} />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:border-royal-blue dark:focus:bg-slate-800 focus:ring-4 focus:ring-royal-blue/10 outline-none transition-all text-base"
                  placeholder="••••••••"
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="btn-ripple w-full py-4 bg-royal-blue text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 hover:-translate-y-1 transition-all shadow-xl shadow-blue-500/20 disabled:opacity-70 disabled:hover:translate-y-0 mt-8 text-lg"
            >
              {loading ? 'Signing In...' : 'Sign In'} <ArrowRight size={20} />
            </button>
          </form>
          
          <div className="mt-10 text-center">
            <p className="text-slate-500 text-base font-medium">
              Don't have an account? <Link to="/signup" className="text-royal-blue font-bold hover:underline underline-offset-2 ml-1">Create one now</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

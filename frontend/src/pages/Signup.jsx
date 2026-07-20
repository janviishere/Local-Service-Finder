import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wrench, Mail, Lock, User, ArrowRight, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer' // default role
  });
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password.length < 8) {
      addToast('Password must be at least 8 characters long.', 'error');
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await register(formData.name, formData.email, formData.password, formData.role);
      addToast('Account created successfully! Welcome to LocalFinds 🎉', 'success');
      // Providers go to onboarding flow, customers go to dashboard
      if (formData.role === 'provider') {
        navigate('/provider/onboarding');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      addToast(error.message || 'Registration failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Left side: Visual & Services */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-emerald overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0">
          <img 
            src="/hero_bg.png" 
            alt="LocalFinds Services" 
            className="w-full h-full object-cover opacity-30 mix-blend-overlay"
            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=2070&auto=format&fit=crop'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald via-emerald/80 to-transparent" />
        </div>
        
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="bg-white text-emerald p-2 rounded-xl group-hover:scale-110 transition-transform shadow-lg">
              <Wrench size={20} />
            </div>
            <span className="font-heading font-black text-2xl text-white">LocalFinds</span>
          </Link>
        </div>

        <div className="relative z-10 mt-auto">
          <h2 className="text-4xl font-black text-white mb-6 leading-tight">
            Join the Fastest Growing<br/>Services Network.
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-md">
            Whether you need a quick repair or want to offer your expertise, LocalFinds is the place to be.
          </p>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Top Services In Demand
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

      {/* Right side: Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative overflow-y-auto">
        <div className="absolute top-0 right-0 w-full h-[400px] bg-gradient-to-b from-emerald/5 to-transparent -z-10 lg:hidden" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-royal-blue/10 rounded-full blur-3xl -z-10 lg:hidden" />

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md my-auto py-8"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8">
            <Link to="/" className="inline-flex items-center gap-2 group">
              <div className="bg-emerald text-white p-1.5 rounded-lg group-hover:scale-110 transition-transform">
                <Wrench size={18} />
              </div>
              <span className="font-heading font-black text-xl text-deep-navy dark:text-white">LocalFinds</span>
            </Link>
          </div>
          
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-black mb-3 text-deep-navy dark:text-white">Create an account</h1>
            <p className="text-slate-500 text-base">Join thousands of users on LocalFinds.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-4 mb-2">
              <button
                type="button"
                onClick={() => setFormData({...formData, role: 'customer'})}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                  formData.role === 'customer' 
                  ? 'border-royal-blue bg-royal-blue/5 text-royal-blue shadow-md' 
                  : 'border-slate-100 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <User size={24} />
                <span className="font-bold text-sm">Customer</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, role: 'provider'})}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                  formData.role === 'provider' 
                  ? 'border-emerald bg-emerald/5 text-emerald shadow-md' 
                  : 'border-slate-100 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Briefcase size={24} />
                <span className="font-bold text-sm">Professional</span>
              </button>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 text-deep-navy dark:text-white">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-royal-blue transition-colors" size={20} />
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:border-royal-blue dark:focus:bg-slate-800 focus:ring-4 focus:ring-royal-blue/10 outline-none transition-all text-base"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 text-deep-navy dark:text-white">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-royal-blue transition-colors" size={20} />
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:border-royal-blue dark:focus:bg-slate-800 focus:ring-4 focus:ring-royal-blue/10 outline-none transition-all text-base"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold mb-2 text-deep-navy dark:text-white">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-royal-blue transition-colors" size={20} />
                <input 
                  type="password" 
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:border-royal-blue dark:focus:bg-slate-800 focus:ring-4 focus:ring-royal-blue/10 outline-none transition-all text-base"
                  placeholder="Min. 8 characters"
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className={`btn-ripple w-full py-4 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:-translate-y-1 transition-all shadow-xl disabled:opacity-70 disabled:hover:translate-y-0 mt-8 text-lg ${
                formData.role === 'provider' ? 'bg-emerald hover:bg-emerald-600 shadow-emerald/20' : 'bg-royal-blue hover:bg-blue-700 shadow-blue-500/20'
              }`}
            >
              {loading ? 'Creating Account...' : 'Create Account'} <ArrowRight size={20} />
            </button>
          </form>
          
          <div className="mt-10 text-center">
            <p className="text-slate-500 text-base font-medium">
              Already have an account? <Link to="/login" className="text-royal-blue font-bold hover:underline underline-offset-2 ml-1">Log in here</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

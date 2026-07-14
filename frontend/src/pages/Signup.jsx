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
      await register(formData.name, formData.email, formData.password, formData.role);
      addToast('Account created successfully! Welcome to LocalFinds 🎉', 'success');
      navigate('/dashboard');
    } catch (error) {
      addToast(error.message || 'Registration failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-20" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-full h-[400px] bg-gradient-to-b from-emerald/10 to-transparent -z-10" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-royal-blue/10 rounded-full blur-3xl -z-10" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-[#1E293B] rounded-[32px] shadow-xl p-8 md:p-10 border border-slate-100 dark:border-slate-800"
      >
        <Link to="/" className="inline-flex items-center gap-2 mb-8 group">
          <div className="bg-emerald text-white p-1.5 rounded-lg group-hover:scale-110 transition-transform">
            <Wrench size={18} />
          </div>
          <span className="font-heading font-black text-lg text-deep-navy dark:text-white">LocalFinds</span>
        </Link>
        
        <h1 className="text-3xl font-black mb-2 text-deep-navy dark:text-white">Create an account</h1>
        <p className="text-slate-500 mb-8 text-sm">Join thousands of users on LocalFinds.</p>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              type="button"
              onClick={() => setFormData({...formData, role: 'customer'})}
              className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                formData.role === 'customer' 
                ? 'border-royal-blue bg-royal-blue/5 text-royal-blue' 
                : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <User size={24} />
              <span className="font-bold text-sm">Customer</span>
            </button>
            <button
              type="button"
              onClick={() => setFormData({...formData, role: 'provider'})}
              className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                formData.role === 'provider' 
                ? 'border-emerald bg-emerald/5 text-emerald' 
                : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Briefcase size={24} />
              <span className="font-bold text-sm">Professional</span>
            </button>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-deep-navy dark:text-white">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:border-royal-blue focus:bg-white outline-none transition-colors"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-deep-navy dark:text-white">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="email" 
                required
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:border-royal-blue focus:bg-white outline-none transition-colors"
                placeholder="you@example.com"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-2 text-deep-navy dark:text-white">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="password" 
                required
                minLength={8}
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:border-royal-blue focus:bg-white outline-none transition-colors"
                placeholder="Min. 8 characters"
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">Must be at least 8 characters long.</p>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-4 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg disabled:opacity-70 mt-4 ${
              formData.role === 'provider' ? 'bg-emerald hover:bg-emerald-600 shadow-emerald/30' : 'bg-royal-blue hover:bg-blue-700 shadow-blue-500/30'
            }`}
          >
            {loading ? 'Creating Account...' : 'Create Account'} <ArrowRight size={18} />
          </button>
        </form>
        
        <div className="mt-8 text-center border-t border-slate-100 dark:border-slate-800 pt-6">
          <p className="text-slate-500 text-sm">
            Already have an account? <Link to="/login" className="text-royal-blue font-bold hover:underline">Log in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

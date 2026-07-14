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
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-royal-blue/10 to-transparent -z-10" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald/10 rounded-full blur-3xl -z-10" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-[#1E293B] rounded-[32px] shadow-xl p-8 md:p-10 border border-slate-100 dark:border-slate-800 relative overflow-hidden"
      >
        <Link to="/" className="inline-flex items-center gap-2 mb-8 group">
          <div className="bg-royal-blue text-white p-1.5 rounded-lg group-hover:scale-110 transition-transform">
            <Wrench size={18} />
          </div>
          <span className="font-heading font-black text-lg text-deep-navy dark:text-white">LocalFinds</span>
        </Link>
        
        <h1 className="text-3xl font-black mb-2 text-deep-navy dark:text-white">Welcome back</h1>
        <p className="text-slate-500 mb-8 text-sm">Please enter your details to sign in.</p>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-2 text-deep-navy dark:text-white">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="email" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:border-royal-blue focus:bg-white outline-none transition-colors"
                placeholder="you@example.com"
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-2">
              <label className="block text-sm font-semibold text-deep-navy dark:text-white">Password</label>
              <Link to="#" className="text-sm font-semibold text-royal-blue hover:underline">Forgot password?</Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="password" 
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:border-royal-blue focus:bg-white outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-royal-blue text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 disabled:opacity-70 mt-4"
          >
            {loading ? 'Signing In...' : 'Sign In'} <ArrowRight size={18} />
          </button>
        </form>
        
        <div className="mt-8 text-center border-t border-slate-100 dark:border-slate-800 pt-6">
          <p className="text-slate-500 text-sm">
            Don't have an account? <Link to="/signup" className="text-royal-blue font-bold hover:underline">Sign up</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

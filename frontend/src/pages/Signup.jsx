import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Briefcase, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer'); // 'customer' or 'provider'
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    // TODO: Connect to actual backend registration API
    if (email && password && name) {
      login({ id: 2, name, role, email }, 'fake-jwt-token-signup');
      navigate('/dashboard');
    } else {
      setError('Please fill in all fields.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-20 pb-12 px-4 relative overflow-hidden bg-warm-white">
      {/* Background blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-royal-blue/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/10 blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/80 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border border-white/50">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-deep-navy mb-2">Create Account</h1>
            <p className="text-slate-500">Join us to discover or provide local services</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                type="button"
                onClick={() => setRole('customer')}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                  role === 'customer' 
                    ? 'border-royal-blue bg-blue-50/50 text-royal-blue' 
                    : 'border-slate-100 bg-transparent text-slate-400 hover:border-slate-200'
                }`}
              >
                <User className="mb-2" size={24} />
                <span className="font-semibold text-sm">Customer</span>
              </button>
              
              <button
                type="button"
                onClick={() => setRole('provider')}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                  role === 'provider' 
                    ? 'border-royal-blue bg-blue-50/50 text-royal-blue' 
                    : 'border-slate-100 bg-transparent text-slate-400 hover:border-slate-200'
                }`}
              >
                <Briefcase className="mb-2" size={24} />
                <span className="font-semibold text-sm">Provider</span>
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-deep-navy ml-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-royal-blue/20 focus:border-royal-blue transition-all"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-deep-navy ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-royal-blue/20 focus:border-royal-blue transition-all"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-deep-navy ml-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-royal-blue/20 focus:border-royal-blue transition-all"
                  placeholder="Create a strong password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full group relative flex items-center justify-center gap-2 bg-royal-blue text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:shadow-blue-500/50 transition-all active:scale-[0.98] mt-4"
            >
              Sign Up
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 text-center text-slate-500 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-royal-blue font-bold hover:underline">
              Sign in instead
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

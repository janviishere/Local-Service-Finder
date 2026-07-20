import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, CreditCard, Smartphone, Wallet, CheckCircle, Shield,
  IndianRupee, ChevronRight, Lock, AlertCircle, Receipt
} from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from './Toast';

const PAYMENT_METHODS = [
  { id: 'card',   label: 'Credit / Debit Card', icon: CreditCard,  color: '#3b82f6' },
  { id: 'upi',    label: 'UPI',                  icon: Smartphone,  color: '#10b981' },
  { id: 'wallet', label: 'Wallet',               icon: Wallet,      color: '#8b5cf6' },
];

export default function PaymentModal({ booking, onClose, onSuccess }) {
  const { addToast } = useToast();
  const [step, setStep] = useState('choose'); // choose | details | confirm | success
  const [paymentType, setPaymentType] = useState('full'); // 'deposit' | 'full'
  const [method, setMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [receipt, setReceipt] = useState(null);

  const [cardDetails, setCardDetails] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [upiId, setUpiId] = useState('');

  const rawPrice = parseFloat((booking?.totalPrice || '500').replace(/[^0-9.]/g, '')) || 500;
  const taxAmount = parseFloat((rawPrice * 0.18).toFixed(2));
  const totalAmount = rawPrice + taxAmount;
  const depositAmount = parseFloat((totalAmount * 0.5).toFixed(2));

  const formatCardNumber = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0,2)}/${digits.slice(2)}`;
    return digits;
  };

  const handleInitiate = async () => {
    setLoading(true);
    try {
      const data = await api.post('/payments/initiate', {
        bookingId: booking.id,
        paymentType,
      });
      setPaymentInfo(data);
      setStep('details');
    } catch (e) {
      addToast(e.message || 'Failed to initiate payment', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (method === 'card') {
      const num = cardDetails.number.replace(/\s/g, '');
      if (num.length < 13) { addToast('Please enter a valid card number', 'error'); return; }
      if (!cardDetails.name.trim()) { addToast('Please enter card holder name', 'error'); return; }
      if (!cardDetails.expiry.includes('/')) { addToast('Please enter expiry as MM/YY', 'error'); return; }
      if (cardDetails.cvv.length < 3) { addToast('Please enter a valid CVV', 'error'); return; }
    }
    if (method === 'upi' && !upiId.includes('@')) {
      addToast('Please enter a valid UPI ID (e.g. name@upi)', 'error'); return;
    }

    setLoading(true);
    try {
      const data = await api.post('/payments/confirm', {
        paymentId: paymentInfo.paymentId,
        paymentMethod: method,
        paymentType,
        cardDetails: method === 'card' ? cardDetails : null,
      });
      setReceipt(data);
      setStep('success');
      if (onSuccess) onSuccess(data);
    } catch (e) {
      addToast(e.message || 'Payment failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md rounded-3xl overflow-hidden border border-slate-700 shadow-2xl"
        style={{ background: '#0f172a' }}>

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600">
              <IndianRupee size={18} className="text-white" />
            </div>
            <div>
              <h3 className="font-black text-white text-lg">Secure Payment</h3>
              <p className="text-slate-500 text-xs">256-bit SSL encrypted</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-slate-800 transition-all">
            <X size={18} />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {/* ── Step 1: Choose payment type ── */}
          {step === 'choose' && (
            <motion.div key="choose" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 space-y-5">
              {/* Service summary */}
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50 space-y-2">
                <p className="font-bold text-white text-sm">{booking?.service?.title}</p>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Service fee</span>
                  <span className="text-white font-semibold">₹{rawPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">GST (18%)</span>
                  <span className="text-white font-semibold">₹{taxAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="border-t border-slate-700 pt-2 flex justify-between">
                  <span className="text-white font-black">Total</span>
                  <span className="text-violet-400 font-black text-lg">₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Payment split options */}
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Payment Option</p>
                <div className="space-y-3">
                  {[
                    { id: 'full', label: 'Pay Full Amount', sub: `₹${totalAmount.toLocaleString('en-IN')} now`, badge: 'Recommended' },
                    { id: 'deposit', label: 'Pay 50% Deposit', sub: `₹${depositAmount.toLocaleString('en-IN')} now · ₹${depositAmount.toLocaleString('en-IN')} after service` },
                  ].map(opt => (
                    <button key={opt.id} onClick={() => setPaymentType(opt.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                        paymentType === opt.id ? 'border-violet-500 bg-violet-500/10' : 'border-slate-700 hover:border-slate-600'
                      }`}>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        paymentType === opt.id ? 'border-violet-500' : 'border-slate-600'
                      }`}>
                        {paymentType === opt.id && <div className="w-2.5 h-2.5 rounded-full bg-violet-500" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{opt.label}</span>
                          {opt.badge && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">{opt.badge}</span>}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{opt.sub}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={handleInitiate} disabled={loading}
                className="w-full py-4 rounded-2xl text-white font-black transition-all shadow-lg shadow-violet-500/20 disabled:opacity-70 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Continue <ChevronRight size={18} /></>}
              </button>
            </motion.div>
          )}

          {/* ── Step 2: Payment Details ── */}
          {step === 'details' && (
            <motion.div key="details" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 space-y-5">
              <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center gap-2">
                <IndianRupee size={16} className="text-violet-400 flex-shrink-0" />
                <p className="text-sm text-violet-300 font-semibold">
                  Amount to pay: <span className="text-white font-black">₹{(paymentType === 'deposit' ? paymentInfo?.depositAmount : paymentInfo?.totalAmount)?.toLocaleString('en-IN')}</span>
                </p>
              </div>

              {/* Method selector */}
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Payment Method</p>
                <div className="grid grid-cols-3 gap-2">
                  {PAYMENT_METHODS.map(m => {
                    const Icon = m.icon;
                    const sel = method === m.id;
                    return (
                      <button key={m.id} onClick={() => setMethod(m.id)}
                        className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1.5 transition-all ${
                          sel ? 'border-violet-500 bg-violet-500/10' : 'border-slate-700 hover:border-slate-600'
                        }`}>
                        <Icon size={18} style={{ color: sel ? m.color : '#64748b' }} />
                        <span className={`text-xs font-bold ${sel ? 'text-white' : 'text-slate-500'}`}>{m.label.split('/')[0].trim()}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Card form */}
              {method === 'card' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5">Card Number</label>
                    <input value={cardDetails.number}
                      onChange={e => setCardDetails(d => ({ ...d, number: formatCardNumber(e.target.value) }))}
                      placeholder="0000 0000 0000 0000" maxLength={19}
                      className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:border-violet-500 outline-none transition-all text-sm font-mono" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5">Card Holder Name</label>
                    <input value={cardDetails.name}
                      onChange={e => setCardDetails(d => ({ ...d, name: e.target.value.toUpperCase() }))}
                      placeholder="JOHN DOE"
                      className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:border-violet-500 outline-none transition-all text-sm uppercase" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1.5">Expiry (MM/YY)</label>
                      <input value={cardDetails.expiry}
                        onChange={e => setCardDetails(d => ({ ...d, expiry: formatExpiry(e.target.value) }))}
                        placeholder="MM/YY" maxLength={5}
                        className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:border-violet-500 outline-none transition-all text-sm font-mono" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1.5">CVV</label>
                      <input type="password" value={cardDetails.cvv}
                        onChange={e => setCardDetails(d => ({ ...d, cvv: e.target.value.replace(/\D/g,'').slice(0,4) }))}
                        placeholder="•••" maxLength={4}
                        className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:border-violet-500 outline-none transition-all text-sm font-mono" />
                    </div>
                  </div>
                </div>
              )}

              {/* UPI form */}
              {method === 'upi' && (
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5">UPI ID</label>
                  <input value={upiId} onChange={e => setUpiId(e.target.value)}
                    placeholder="yourname@upi"
                    className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:border-violet-500 outline-none transition-all text-sm" />
                  <p className="text-xs text-slate-500 mt-2">You'll receive a payment request on your UPI app</p>
                </div>
              )}

              {/* Wallet */}
              {method === 'wallet' && (
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 text-center">
                  <Wallet size={28} className="mx-auto text-violet-400 mb-2" />
                  <p className="text-sm text-slate-300 font-semibold">LocalFinds Wallet</p>
                  <p className="text-xs text-slate-500 mt-1">Balance: ₹0.00</p>
                  <p className="text-xs text-slate-600 mt-3">Wallet payments will be enabled in a future update.</p>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Lock size={12} /> Payments are encrypted and secure. We never store your card details.
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep('choose')} className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-400 font-bold hover:border-slate-500 transition-all">
                  Back
                </button>
                <button onClick={handleConfirm} disabled={loading || method === 'wallet'}
                  className="flex-2 flex-1 py-3 rounded-2xl text-white font-black transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
                  {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Shield size={16} /> Pay Now</>}
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Success ── */}
          {step === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-8 text-center space-y-5">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/30">
                <CheckCircle size={36} className="text-white" />
              </motion.div>
              <div>
                <h3 className="text-2xl font-black text-white mb-2">Payment Successful!</h3>
                <p className="text-slate-400 text-sm">{receipt?.message}</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 text-left space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Invoice</span>
                  <span className="text-white font-mono font-bold">{receipt?.invoiceNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Transaction ID</span>
                  <span className="text-white font-mono text-xs">{receipt?.transactionId}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Status</span>
                  <span className="text-emerald-400 font-bold capitalize">{receipt?.status?.replace('_', ' ')}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={onClose}
                  className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-400 font-bold hover:border-slate-500 transition-all">
                  Close
                </button>
                <button onClick={onClose}
                  className="flex-1 py-3 rounded-xl text-white font-bold flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
                  <Receipt size={16} /> View Receipt
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

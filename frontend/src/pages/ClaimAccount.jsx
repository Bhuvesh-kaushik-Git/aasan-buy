import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';

const API_URL = import.meta.env.VITE_API_URL;

const ClaimAccount = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleClaim = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }
    if (password.length < 6) {
      showToast("Password must be at least 6 characters", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/claim-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Account claimed! Please login now. ✨", "success");
        navigate('/login');
      } else {
        showToast(data.error || "Claim failed", "error");
      }
    } catch (err) {
      showToast("Server error. Try again later.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <div className="bg-white rounded-[40px] shadow-premium border border-black/5 p-10 text-center">
        <div className="w-20 h-20 bg-secondary/10 text-secondary rounded-[24px] flex items-center justify-center text-3xl mx-auto mb-8">
           🛡️
        </div>
        <h1 className="text-3xl font-black text-dark tracking-tighter mb-4">Claim Your History</h1>
        <p className="text-gray-400 text-sm font-medium mb-10 leading-relaxed">
           Ordered as a guest? Set a password for your email to unlock your full order history and save addresses.
        </p>

        <form onSubmit={handleClaim} className="space-y-6 text-left">
           <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1 mb-2">Registration Email</label>
              <input 
                type="email" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="The email you used for checkout"
                className="w-full bg-gray-50 border border-transparent rounded-2xl px-6 py-4 text-sm focus:bg-white focus:border-secondary focus:outline-none transition-all"
              />
           </div>
           <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1 mb-2">New Password</label>
              <input 
                type="password" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full bg-gray-50 border border-transparent rounded-2xl px-6 py-4 text-sm focus:bg-white focus:border-secondary focus:outline-none transition-all"
              />
           </div>
           <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1 mb-2">Confirm Password</label>
              <input 
                type="password" 
                required 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-gray-50 border border-transparent rounded-2xl px-6 py-4 text-sm focus:bg-white focus:border-secondary focus:outline-none transition-all"
              />
           </div>

           <button 
             type="submit" 
             disabled={loading}
             className="w-full bg-secondary text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[13px] shadow-xl shadow-secondary/20 transform active:scale-95 transition-all hover:-translate-y-1 hover:brightness-110 disabled:opacity-50"
           >
             {loading ? 'Securing Account...' : 'Initialize My Account'}
           </button>
        </form>

        <p className="mt-8 text-xs font-bold text-gray-300 uppercase tracking-widest">
           Step into the AasanBuy community
        </p>
      </div>
    </div>
  );
};

export default ClaimAccount;

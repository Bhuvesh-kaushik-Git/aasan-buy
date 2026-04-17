import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.phone);
      navigate('/profile');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-dark tracking-tight">Create Account</h1>
            <p className="text-gray-500 text-sm mt-1">Join AasanBuy for a better shopping experience</p>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-xl mb-5">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: 'Full Name', key: 'name', type: 'text', placeholder: 'John Doe' },
              { label: 'Email Address', key: 'email', type: 'email', placeholder: 'you@example.com' },
              { label: 'Phone Number', key: 'phone', type: 'tel', placeholder: '+91 XXXX XXXXXX' },
              { label: 'Password', key: 'password', type: 'password', placeholder: '•••••••• (min. 6 chars)' },
              { label: 'Confirm Password', key: 'confirm', type: 'password', placeholder: '••••••••' },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">{label}</label>
                <input
                  type={type} required={key !== 'phone'}
                  value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-secondary focus:bg-white transition-all"
                  placeholder={placeholder}
                />
              </div>
            ))}
            <button
              type="submit" disabled={loading}
              className="w-full bg-secondary text-white font-bold py-3.5 rounded-xl hover:-translate-y-0.5 transition-all shadow-lg shadow-amber-200 disabled:opacity-50 disabled:transform-none mt-2"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-secondary font-bold hover:underline">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

const CouponModule = ({ adminToken }) => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: 0,
    minOrderValue: 0,
    maxUses: '',
    expiresAt: '',
    isActive: true
  });

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/coupons`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      const data = await res.json();
      setCoupons(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingCoupon ? 'PUT' : 'POST';
    const url = editingCoupon ? `${API_URL}/api/coupons/${editingCoupon._id}` : `${API_URL}/api/coupons`;
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
           ...form,
           maxUses: form.maxUses === '' ? null : parseInt(form.maxUses),
           expiresAt: form.expiresAt === '' ? null : form.expiresAt
        })
      });
      if (res.ok) {
        alert(editingCoupon ? "Coupon updated!" : "Coupon created!");
        setShowForm(false);
        setEditingCoupon(null);
        setForm({ code: '', discountType: 'percentage', discountValue: 0, minOrderValue: 0, maxUses: '', expiresAt: '', isActive: true });
        fetchCoupons();
      } else {
        const d = await res.json();
        alert(d.error || "Operation failed");
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      const res = await fetch(`${API_URL}/api/coupons/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (res.ok) {
        fetchCoupons();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEdit = (c) => {
    setEditingCoupon(c);
    setForm({
      code: c.code,
      discountType: c.discountType,
      discountValue: c.discountValue,
      minOrderValue: c.minOrderValue,
      maxUses: c.maxUses || '',
      expiresAt: c.expiresAt ? c.expiresAt.split('T')[0] : '',
      isActive: c.isActive
    });
    setShowForm(true);
  };

  return (
    <div className="max-w-[1000px] mx-auto animate-fade-in-up">
      <div className="flex justify-between items-center mb-8 bg-white p-8 rounded-[32px] border border-black/5 shadow-soft">
        <div>
          <h2 className="text-3xl font-black text-dark tracking-tighter">Coupon Codes</h2>
          <p className="text-sm text-gray-400 font-medium mt-1">Manage discounts and seasonal promotions.</p>
        </div>
        <button 
          onClick={() => { setShowForm(!showForm); setEditingCoupon(null); }}
          className="bg-primary text-white font-black text-[13px] uppercase tracking-widest px-8 py-3.5 rounded-2xl shadow-xl shadow-primary/20 hover:brightness-110 transition-all"
        >
          {showForm ? 'Close Form' : '+ New Coupon'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-8 rounded-[32px] border border-black/5 shadow-premium mb-12 animate-fade-in">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Code</label>
              <input required value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} placeholder="E.g. SUMMER50" className="w-full bg-gray-50 border border-transparent rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-primary focus:outline-none transition-all" />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Type</label>
              <select value={form.discountType} onChange={e => setForm({...form, discountType: e.target.value})} className="w-full bg-gray-50 border border-transparent rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-primary focus:outline-none transition-all">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Value</label>
              <input required type="number" value={form.discountValue} onChange={e => setForm({...form, discountValue: e.target.value})} className="w-full bg-gray-50 border border-transparent rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-primary focus:outline-none transition-all" />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Min Order (₹)</label>
              <input type="number" value={form.minOrderValue} onChange={e => setForm({...form, minOrderValue: e.target.value})} className="w-full bg-gray-50 border border-transparent rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-primary focus:outline-none transition-all" />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Max Uses (Optional)</label>
              <input type="number" value={form.maxUses} onChange={e => setForm({...form, maxUses: e.target.value})} placeholder="Unlimited" className="w-full bg-gray-50 border border-transparent rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-primary focus:outline-none transition-all" />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Expiry Date (Optional)</label>
              <input type="date" value={form.expiresAt} onChange={e => setForm({...form, expiresAt: e.target.value})} className="w-full bg-gray-50 border border-transparent rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-primary focus:outline-none transition-all" />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} className="w-4 h-4 accent-primary" />
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Active</label>
            </div>
            <div className="lg:col-span-2 pt-6 flex justify-end">
               <button type="submit" className="bg-emerald-500 text-white font-black text-xs uppercase tracking-widest px-10 py-3.5 rounded-2xl shadow-xl shadow-emerald-200 hover:brightness-110 transition-all">
                 {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
               </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-[32px] border border-black/5 shadow-soft overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Code</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Benefit</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Usage</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Expiry</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {coupons.map(c => (
              <tr key={c._id} className="group hover:bg-gray-50/30 transition-colors">
                <td className="px-8 py-5"><span className="font-black text-primary text-sm px-3 py-1.5 bg-primary/5 rounded-xl border border-primary/10">{c.code}</span></td>
                <td className="px-8 py-5 text-sm font-bold text-dark">{c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`}</td>
                <td className="px-8 py-5 text-[11px] font-medium text-gray-500">
                   {c.usedCount} / {c.maxUses === null ? '∞' : c.maxUses}
                </td>
                <td className="px-8 py-5 text-[11px] font-medium text-gray-500">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : 'Never'}</td>
                <td className="px-8 py-5">
                   <span className={`text-[9px] font-black uppercase px-2 py-1 rounded ${c.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                     {c.isActive ? 'Active' : 'Inactive'}
                   </span>
                </td>
                <td className="px-8 py-5 text-right">
                   <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(c)} className="w-9 h-9 flex items-center justify-center bg-white border border-gray-100 rounded-xl text-primary shadow-soft hover:bg-primary hover:text-white transition-all">✎</button>
                      <button onClick={() => handleDelete(c._id)} className="w-9 h-9 flex items-center justify-center bg-white border border-gray-100 rounded-xl text-red-500 shadow-soft hover:bg-red-500 hover:text-white transition-all">✕</button>
                   </div>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && !loading && (
              <tr><td colSpan="6" className="px-8 py-20 text-center text-gray-400 font-medium italic">No coupons found. Start by creating one!</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CouponModule;

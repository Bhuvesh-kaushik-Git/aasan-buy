import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
import OptimizedImage from '../components/OptimizedImage';

const statusColors = {
  Processing: 'bg-yellow-100 text-yellow-700',
  Shipped: 'bg-blue-100 text-blue-700 font-bold',
  Delivered: 'bg-green-100 text-green-700 font-bold',
  Cancelled: 'bg-red-100 text-red-700',
};

const Profile = () => {
  const { user, logout, login } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [referrals, setReferrals] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: 'Home', address: '', city: '', state: '', pincode: '', isDefault: false });

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchOrders();
    fetchReferrals();
    setAddresses(user.addresses || []);
  }, [user]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/api/orders/my-orders`, {
        credentials: 'include'
      });
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReferrals = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/referrals`, {
        credentials: 'include'
      });
      const data = await res.json();
      if (Array.isArray(data)) setReferrals(data);
    } catch (err) {
      console.error('Error fetching referrals:', err);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/auth/addresses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAddress),
        credentials: 'include'
      });
      const updatedAddresses = await res.json();
      setAddresses(updatedAddresses);
      setShowAddressForm(false);
      setNewAddress({ label: 'Home', address: '', city: '', state: '', pincode: '', isDefault: false });
    } catch (err) {
      alert("Error adding address");
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm("Delete this address?")) return;
    try {
      const res = await fetch(`${API_URL}/api/auth/addresses/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const updatedAddresses = await res.json();
      setAddresses(updatedAddresses);
    } catch (err) {
      alert("Error deleting address");
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Account Info Header */}
      <div className="bg-white rounded-[40px] shadow-premium border border-black/5 p-8 mb-12 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-black text-4xl shadow-xl shadow-primary/20">
            {user.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="space-y-1">
             <span className="text-[11px] font-black text-secondary uppercase tracking-[0.3em]">Customer Dashboard</span>
             <h1 className="text-3xl font-black text-dark tracking-tighter flex items-center gap-4">
               {user.name}
               <span className="text-[14px] bg-primary/10 text-primary px-3 py-1 rounded-xl flex items-center gap-1.5 border border-primary/10">
                 🪙 <span className="font-mono">{user.coins || 0}</span> Coins
               </span>
             </h1>
             <p className="text-gray-400 font-medium">{user.email}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
           <button onClick={handleLogout} className="bg-red-50 text-red-500 font-black text-[13px] uppercase tracking-widest px-6 py-4 rounded-2xl hover:bg-red-500 hover:text-white transition-all active:scale-95">
              Secure Logout
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Navigation Tabs */}
        <div className="space-y-2">
          {[
            { id: 'orders', label: 'Order History', icon: '📦' },
            { id: 'addresses', label: 'Delivery Addresses', icon: '📍' },
            { id: 'settings', label: 'Account Profile', icon: '👤' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-sm tracking-tight transition-all ${activeTab === tab.id ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-105' : 'text-gray-400 hover:bg-white hover:text-dark hover:shadow-soft'}`}
            >
              <span className="text-xl">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="lg:col-span-3">
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-dark tracking-tighter mb-8">Purchase History</h2>
              {loading ? (
                <div className="py-20 text-center animate-pulse text-gray-300 font-black tracking-widest uppercase text-xs">Authenticating Data...</div>
              ) : orders.length === 0 ? (
                <div className="bg-white rounded-[32px] p-20 text-center border border-black/5">
                   <div className="text-6xl mb-6 opacity-20">📦</div>
                   <h3 className="text-xl font-bold text-dark mb-2">No orders found</h3>
                   <p className="text-gray-400 mb-8">You haven't placed any orders with this account yet.</p>
                   <Link to="/products" className="bg-primary text-white px-8 py-3 rounded-xl font-black text-[13px] uppercase tracking-widest">Start Shopping</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order._id} className="bg-white rounded-[32px] border border-black/5 p-6 hover:shadow-premium transition-all group">
                       <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                          <div>
                             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order ID: {order._id.slice(-8)}</p>
                             <p className="text-sm font-bold text-dark">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${statusColors[order.orderStatus]}`}>
                             {order.orderStatus}
                          </div>
                       </div>
                       
                       <div className="flex flex-wrap gap-4 mb-6">
                          {(order.items || []).map((item, idx) => (
                             <OptimizedImage key={idx} src={item.image} className="w-16 h-16 rounded-xl border border-gray-100 overflow-hidden bg-gray-50 flex-shrink-0" alt="" />
                          ))}
                       </div>

                       <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                          <div>
                             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Paid</p>
                             <p className="text-lg font-black text-primary">₹{order.totalAmount.toLocaleString()}</p>
                          </div>
                          {order.tracking && order.tracking.trackingId ? (
                             <a 
                                href={order.tracking.trackingUrl || '#'} 
                                target="_blank" 
                                className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-secondary bg-secondary/5 px-5 py-2.5 rounded-xl border border-secondary/10 hover:bg-secondary hover:text-white transition-all shadow-sm"
                             >
                                <span>Track Order</span>
                                <span className="font-mono">{order.tracking.trackingId}</span>
                             </a>
                          ) : (
                             <p className="text-[10px] font-bold text-gray-300 uppercase tracking-tight italic">Tracking will be available once shipped</p>
                          )}
                       </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-dark tracking-tighter">Saved Addresses</h2>
                <button onClick={() => setShowAddressForm(!showAddressForm)} className="bg-secondary text-white px-6 py-2.5 rounded-xl font-black text-[13px] uppercase">+ New Address</button>
              </div>

              {showAddressForm && (
                <form onSubmit={handleAddAddress} className="bg-gray-50 p-8 rounded-[32px] border border-black/5 space-y-4 animate-fade-in-up">
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Address Label</label>
                         <input type="text" value={newAddress.label} onChange={e => setNewAddress({...newAddress, label: e.target.value})} className="w-full bg-white border border-black/5 rounded-xl px-4 py-3 text-sm" placeholder="Home, Office..." />
                      </div>
                      <div>
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Pincode</label>
                         <input type="text" value={newAddress.pincode} onChange={e => setNewAddress({...newAddress, pincode: e.target.value})} className="w-full bg-white border border-black/5 rounded-xl px-4 py-3 text-sm" />
                      </div>
                   </div>
                   <div className="col-span-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Full Address</label>
                        <textarea value={newAddress.address} onChange={e => setNewAddress({...newAddress, address: e.target.value})} className="w-full bg-white border border-black/5 rounded-xl px-4 py-3 text-sm h-24" />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <input type="text" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} className="w-full bg-white border border-black/5 rounded-xl px-4 py-3 text-sm" placeholder="City" />
                      <input type="text" value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} className="w-full bg-white border border-black/5 rounded-xl px-4 py-3 text-sm" placeholder="State" />
                   </div>
                   <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={newAddress.isDefault} onChange={e => setNewAddress({...newAddress, isDefault: e.target.checked})} className="w-4 h-4 accent-primary" />
                      <span className="text-xs font-bold text-gray-500">Set as default address</span>
                   </label>
                   <button type="submit" className="w-full bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[13px] shadow-lg shadow-primary/20">Save Delivery Point</button>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(addresses || []).map(addr => (
                  <div key={addr._id} className="bg-white border border-black/5 p-6 rounded-[32px] relative group hover:border-secondary/20 transition-all">
                    <div className="flex justify-between items-start mb-4">
                       <span className="bg-gray-100 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-500">{addr.label}</span>
                       <button onClick={() => handleDeleteAddress(addr._id)} className="text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                    </div>
                    <p className="text-sm font-medium text-dark line-clamp-2 mb-2">{addr.address}</p>
                    <p className="text-[11px] text-gray-400 font-bold uppercase">{addr.city}, {addr.state} - {addr.pincode}</p>
                    {addr.isDefault && (
                       <span className="absolute -top-1 -right-1 bg-secondary text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest shadow-md">Default</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-8 animate-fade-in-up">
              <h2 className="text-2xl font-black text-dark tracking-tighter">Profile Mastery</h2>
              <div className="bg-white rounded-[40px] border border-black/5 p-10 space-y-8">
                 <div className="space-y-4">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block ml-1">Identity</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                          <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">Full Name</p>
                          <p className="text-sm font-bold text-dark">{user.name}</p>
                       </div>
                       <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                          <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">Email Connection</p>
                          <p className="text-sm font-bold text-dark">{user.email}</p>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block ml-1">Security</label>
                    <button className="bg-gray-900 text-white w-full py-4 rounded-2xl font-black text-[13px] uppercase tracking-widest shadow-xl transform active:scale-95 transition-all">Change Account Password</button>
                 </div>

                 {user.isGuest && (
                    <div className="bg-secondary/5 border border-secondary/20 p-6 rounded-[24px]">
                       <h3 className="text-sm font-black text-secondary uppercase tracking-widest mb-2 text-center">Claim Your Account</h3>
                       <p className="text-xs text-secondary/70 text-center mb-6">You're currently using a guest profile. Set a password to unlock advanced order tracking and rewards.</p>
                       <Link to="/claim-account" className="block text-center bg-secondary text-white py-3 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all hover:shadow-lg">Upgrade Now</Link>
                    </div>
                 )}

                 {/* Referral Card */}
                 <div className="bg-gradient-to-br from-primary to-indigo-600 rounded-[32px] p-8 text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700" />
                    <div className="relative z-10">
                       <h3 className="text-xl font-black tracking-tighter mb-2">Share the Joy, Get Rewarded</h3>
                       <p className="text-white/70 text-[13px] font-medium mb-8 max-w-xs">Invite your friends to AasanBuy. When they make their first purchase, you'll receive a ₹100 reward coupon!</p>
                       
                       <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-4 flex-1 flex items-center justify-between">
                             <span className="text-[10px] font-black uppercase tracking-widest text-white/50">My Referral Code</span>
                             <span className="text-lg font-black tracking-widest">{user.referralCode || 'GENERATING...'}</span>
                          </div>
                          <button 
                             onClick={() => { navigator.clipboard.writeText(user.referralCode); alert("Code copied to clipboard!"); }}
                             className="bg-white text-primary px-8 py-4 rounded-2xl font-black text-[13px] uppercase tracking-widest hover:shadow-xl transition-all active:scale-95 whitespace-nowrap"
                          >
                             Copy Link
                          </button>
                       </div>
                    </div>
                 </div>

                 {/* Referral Network List */}
                 {referrals.length > 0 && (
                    <div className="mt-12 space-y-6">
                       <div className="flex items-center justify-between">
                          <h3 className="text-lg font-black text-dark tracking-tight">My Referral Network</h3>
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{referrals.length} Members Joined</span>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {referrals.map((ref, idx) => (
                             <div key={idx} className="bg-white border border-gray-100 p-5 rounded-2xl flex items-center justify-between hover:shadow-soft transition-all">
                                <div className="flex items-center gap-4">
                                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${ref.hasPlacedOrder ? 'bg-secondary/10 text-secondary' : 'bg-gray-50 text-gray-400'}`}>
                                      {ref.name[0].toUpperCase()}
                                   </div>
                                   <div>
                                      <p className="text-sm font-bold text-dark">{ref.name}</p>
                                      <p className="text-[10px] text-gray-400 font-medium">Joined {new Date(ref.dateJoined).toLocaleDateString()}</p>
                                   </div>
                                </div>
                                {ref.hasPlacedOrder ? (
                                   <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg flex items-center gap-1.5 border border-emerald-100">
                                      <span className="text-[10px] font-black uppercase tracking-widest">✨ Order Placed</span>
                                   </div>
                                ) : (
                                   <div className="bg-gray-50 text-gray-400 px-3 py-1 rounded-lg border border-gray-100">
                                      <span className="text-[10px] font-black uppercase tracking-widest">Pending Order</span>
                                   </div>
                                )}
                             </div>
                          ))}
                       </div>
                    </div>
                 )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

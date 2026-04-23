import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const UsersModule = ({ adminToken }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedUserOrders, setSelectedUserOrders] = useState(null); // { user, orders }
  const [ordersLoading, setOrdersLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/users?page=${page}&search=${search}&limit=10`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      const data = await res.json();
      setUsers(data.users || []);
      setPages(data.pages || 1);
      setTotal(data.totalItems || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [page, search]);

  const fetchUserOrders = async (u) => {
     setOrdersLoading(true);
     try {
        const res = await fetch(`${API_URL}/api/users/${u._id}/orders`, {
           headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const data = await res.json();
        setSelectedUserOrders({ user: u, orders: data });
     } catch (err) {
        alert("Failed to fetch user orders");
     } finally {
        setOrdersLoading(false);
     }
  };

  const toggleStatus = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/users/${id}/toggle-status`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (res.ok) {
        setUsers(users.map(u => u._id === id ? { ...u, isActive: !u.isActive } : u));
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const updatePaymentStatus = async (orderId, newStatus) => {
    try {
       const res = await fetch(`${API_URL}/api/orders/${orderId}/payment`, {
          method: 'PUT',
          headers: { 
             'Authorization': `Bearer ${adminToken}`,
             'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: newStatus })
       });
       if (res.ok) {
          // Refresh orders for the modal
          if (selectedUserOrders) {
             const updatedOrders = selectedUserOrders.orders.map(o => 
                o._id === orderId ? { ...o, paymentStatus: newStatus } : o
             );
             setSelectedUserOrders({ ...selectedUserOrders, orders: updatedOrders });
          }
          fetchUsers(); // Refresh main list to update 'Spent' amount
       }
    } catch (err) {
       alert("Failed to update payment status");
    }
 };

  const updateCoins = async (id, currentCoins) => {
    const newVal = window.prompt("Set AasanCoins for this user:", currentCoins);
    if (newVal === null) return;
    const coins = parseInt(newVal);
    if (isNaN(coins) || coins < 0) return alert("Invalid amount. Coins must be a non-negative number.");

    try {
      const res = await fetch(`${API_URL}/api/users/${id}/update-coins`, {
        method: 'PUT',
        headers: { 
           'Authorization': `Bearer ${adminToken}`,
           'Content-Type': 'application/json'
        },
        body: JSON.stringify({ coins })
      });
      if (res.ok) {
        setUsers(users.map(u => u._id === id ? { ...u, aasanCoins: coins } : u));
      } else {
        const err = await res.json();
        alert(err.error || "Update failed");
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Danger: Deleting a user will also orphan their order history. Proceed?")) return;
    try {
      const res = await fetch(`${API_URL}/api/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (res.ok) fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[32px] border border-black/5 shadow-soft mb-8">
        <div>
          <h2 className="text-3xl font-black text-dark tracking-tighter">Customer Directory</h2>
          <p className="text-sm text-gray-400 font-medium mt-1">Manage user accounts and access permissions ({total} total).</p>
        </div>
        <div className="relative">
          <input 
            type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or email..."
            className="w-full md:w-[300px] bg-gray-50 border border-gray-100 rounded-2xl px-12 py-3.5 text-sm focus:outline-none focus:bg-white focus:border-primary focus:shadow-soft transition-all"
          />
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-black/5 shadow-soft overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Customer</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Joined</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Coins</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Orders</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Spent</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Account State</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map(u => (
              <tr key={u._id} className="group hover:bg-gray-50/30 transition-colors">
                <td className="px-8 py-5">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-primary/5 text-primary font-black flex items-center justify-center border border-primary/10">
                        {u.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-black text-dark text-sm leading-none">{u.name}</p>
                        <p className="text-[11px] text-gray-400 font-medium mt-1">{u.email}</p>
                      </div>
                   </div>
                </td>
                <td className="px-8 py-5 text-[11px] font-bold text-gray-500 uppercase tracking-widest">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-8 py-5">
                   <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-secondary/5 text-secondary flex items-center justify-center font-black text-[12px]">🪙</span>
                      <span className="font-black text-dark text-sm">{u.aasanCoins || 0}</span>
                      <button 
                        onClick={() => updateCoins(u._id, u.aasanCoins || 0)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-primary transition-all"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>
                      </button>
                   </div>
                </td>
                <td className="px-8 py-5">
                   <button 
                      onClick={() => fetchUserOrders(u)}
                      className="group/btn flex flex-col hover:bg-gray-100 p-2 rounded-xl transition-all"
                   >
                      <span className="font-black text-dark text-sm group-hover/btn:text-primary">{u.orderCount || 0}</span>
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">View List →</span>
                   </button>
                </td>
                <td className="px-8 py-5">
                   <span className="font-black text-emerald-600 text-sm">₹{(u.totalSpent || 0).toLocaleString()}</span>
                </td>
                <td className="px-8 py-5">
                   <button 
                     onClick={() => toggleStatus(u._id)}
                     className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-xl transition-all ${u.isActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-red-500 hover:text-white hover:border-red-500' : 'bg-red-50 text-red-600 border border-red-100 hover:bg-emerald-500 hover:text-white hover:border-emerald-500'}`}
                   >
                     {u.isActive ? 'Active User' : 'Deactivated'}
                   </button>
                </td>
                <td className="px-8 py-5 text-right">
                   <button onClick={() => deleteUser(u._id)} className="opacity-0 group-hover:opacity-100 w-9 h-9 flex items-center justify-center bg-white border border-gray-100 rounded-xl text-red-400 shadow-soft hover:bg-red-500 hover:text-white transition-all ml-auto">✕</button>
                </td>
              </tr>
            ))}
            {loading && <tr><td colSpan="7" className="px-8 py-10 text-center animate-pulse text-primary font-black uppercase tracking-widest text-xs">Synchronizing users...</td></tr>}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-12 bg-white p-6 rounded-[24px] border border-black/5 shadow-soft w-fit mx-auto">
          <button 
            disabled={page === 1} onClick={() => setPage(p => p - 1)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-dark disabled:opacity-20 hover:bg-primary hover:text-white transition-all shadow-sm"
          >←</button>
          <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Page {page} of {pages}</span>
          <button 
            disabled={page === pages} onClick={() => setPage(p => p + 1)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-dark disabled:opacity-20 hover:bg-primary hover:text-white transition-all shadow-sm"
          >→</button>
        </div>
      )}

      {selectedUserOrders && (
         <OrdersModal 
            isOpen={!!selectedUserOrders} 
            onClose={() => setSelectedUserOrders(null)} 
            user={selectedUserOrders.user} 
            orders={selectedUserOrders.orders} 
            onMarkPaid={updatePaymentStatus}
         />
      )}
    </div>
  );
};

export default UsersModule;

// Modal Overlay for User Orders
const OrdersModal = ({ isOpen, onClose, user, orders, onMarkPaid }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12">
       <div className="absolute inset-0 bg-dark/60 backdrop-blur-sm" onClick={onClose} />
       <div className="relative bg-white w-full max-w-5xl rounded-[40px] shadow-2xl overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">
          <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
             <div>
                <h3 className="text-2xl font-black text-dark tracking-tighter">Customer Intelligence Report</h3>
                <p className="text-gray-400 text-sm font-medium uppercase tracking-widest mt-1">{user.name} · {orders.length} Orders Synchronized</p>
             </div>
             <button onClick={onClose} className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl shadow-soft hover:bg-red-50 hover:text-red-500 transition-all text-xl">✕</button>
          </div>
          <div className="flex-1 overflow-y-auto p-8 space-y-8">
             {orders.length === 0 ? (
                <div className="text-center py-20">
                   <div className="text-4xl mb-4">📦</div>
                   <p className="text-gray-400 font-black uppercase tracking-widest text-xs">No transaction records found</p>
                </div>
             ) : (
                orders.map(order => (
                  <div key={order._id} className="bg-white border border-gray-100 rounded-[40px] p-8 flex flex-col gap-8 shadow-soft hover:shadow-premium transition-all">
                     
                     {/* Header: ID and Primary Status */}
                     <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-gray-50 pb-8">
                       <div className="space-y-3">
                          <div className="flex items-center gap-3">
                             <span className="text-[12px] font-black text-primary bg-primary/5 px-4 py-1.5 rounded-xl border border-primary/10 uppercase tracking-widest">Order ID: {order._id.toUpperCase()}</span>
                             <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-xl shadow-sm ${order.paymentStatus === 'paid' ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-white'}`}>
                                {order.paymentStatus}
                             </span>
                             <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-100 text-gray-500`}>
                                {order.orderStatus}
                             </span>
                          </div>
                          <h4 className="text-xl font-black text-dark tracking-tight">{new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'full' })}</h4>
                       </div>
                       
                       <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-3xl font-black text-dark tracking-tighter">₹{order.totalAmount.toLocaleString()}</p>
                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mt-1">{order.paymentMethod} protocol</p>
                          </div>
                          {order.paymentStatus !== 'paid' && (
                           <button 
                              onClick={() => onMarkPaid(order._id, 'paid')}
                              className="px-8 py-4 bg-emerald-500 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-emerald-600 shadow-xl shadow-emerald-500/20 transition-all transform hover:-translate-y-1 active:translate-y-0"
                           >
                              Settle Payment
                           </button>
                         )}
                       </div>
                     </div>

                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        
                        {/* 1. Item Manifest */}
                        <div className="lg:col-span-2 space-y-6">
                           <h5 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Inventory Allocation</h5>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {order.items?.map((item, iIdx) => (
                                 <div key={iIdx} className="flex items-center gap-4 bg-gray-50/50 p-4 rounded-3xl border border-gray-100 hover:bg-white transition-colors">
                                    <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-gray-200 shadow-sm">
                                       <img src={item.image} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="min-w-0">
                                       <p className="text-[13px] font-black text-dark truncate">{item.name}</p>
                                       <div className="flex gap-2 mt-1">
                                          <span className="text-[10px] text-gray-400 font-bold uppercase">{item.quantity} Unit{item.quantity > 1 ? 's' : ''}</span>
                                          <span className="text-[10px] text-primary font-black uppercase">₹{item.price.toLocaleString()}</span>
                                       </div>
                                       {(item.selectedSize || item.selectedColor) && (
                                          <p className="text-[9px] text-gray-400 font-black uppercase tracking-tighter mt-1">
                                             {item.selectedSize && `Size: ${item.selectedSize}`} {item.selectedColor && `· Color: ${item.selectedColor.name}`}
                                          </p>
                                       )}
                                       {item.giftWrap?.title && (
                                          <p className="text-[9px] bg-rose-50 text-rose-500 px-2 py-0.5 rounded font-black uppercase tracking-tighter mt-1">
                                             🎁 Gift Wrap: {item.giftWrap.title} (+₹{item.giftWrap.price})
                                          </p>
                                       )}
                                    </div>
                                 </div>
                              ))}
                           </div>

                           {/* Financial Summary */}
                           <div className="bg-gray-50 rounded-[32px] p-6 space-y-4">
                              <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-gray-400">
                                 <span>Subtotal</span>
                                 <span>₹{(order.originalAmount || order.totalAmount + (order.discountAmount || 0)).toLocaleString()}</span>
                              </div>
                              {order.discountAmount > 0 && (
                                 <div className="space-y-2">
                                    {(order.discountAmount - (order.aasanCoinsUsed || 0)) > 0 && (
                                       <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-50 p-3 rounded-xl">
                                          <span>Coupon Applied ({order.couponCode || 'PROMO'})</span>
                                          <span>- ₹{(order.discountAmount - (order.aasanCoinsUsed || 0)).toLocaleString()}</span>
                                       </div>
                                    )}
                                    {(order.aasanCoinsUsed || 0) > 0 && (
                                       <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-secondary bg-secondary/5 p-3 rounded-xl border border-secondary/10">
                                          <span>AasanCoins Redeemed</span>
                                          <span>- ₹{order.aasanCoinsUsed.toLocaleString()}</span>
                                       </div>
                                    )}
                                 </div>
                              )}
                              <div className="flex justify-between pt-4 border-t border-gray-200">
                                 <span className="text-xs font-black text-dark uppercase tracking-widest">Final Settlement</span>
                                 <span className="text-xl font-black text-primary tracking-tighter">₹{order.totalAmount.toLocaleString()}</span>
                              </div>
                           </div>
                        </div>

                        {/* 2. Logistics & References */}
                        <div className="space-y-8">
                           {/* Shipping Logistics */}
                           <div className="space-y-4">
                              <h5 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Shipping Logistics</h5>
                              <div className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-soft space-y-4">
                                 <div>
                                    <p className="text-[14px] font-black text-dark">{order.customerDetails?.fullName}</p>
                                    <p className="text-[11px] text-gray-400 font-medium mt-0.5">{order.customerDetails?.phone} · {order.customerDetails?.email}</p>
                                 </div>
                                 <div className="pt-4 border-t border-gray-50">
                                    <p className="text-[12px] text-gray-500 font-medium leading-relaxed">
                                       {order.customerDetails?.address}<br />
                                       {order.customerDetails?.city}, {order.customerDetails?.state} - <span className="font-black text-dark">{order.customerDetails?.pincode}</span>
                                    </p>
                                 </div>
                              </div>
                           </div>

                           {/* Payment Intelligence */}
                           <div className="space-y-4">
                              <h5 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Payment Intelligence</h5>
                              <div className="bg-gray-900 rounded-[32px] p-6 text-white space-y-4 shadow-xl">
                                 <div>
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Method</p>
                                    <p className="text-sm font-black uppercase tracking-widest">{order.paymentMethod}</p>
                                 </div>
                                 {order.razorpayOrderId && (
                                    <div className="pt-4 border-t border-white/10">
                                       <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Razorpay Order ID</p>
                                       <p className="text-[11px] font-mono text-white/80 break-all">{order.razorpayOrderId}</p>
                                    </div>
                                 )}
                                 {order.razorpayPaymentId && (
                                    <div className="pt-2">
                                       <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Razorpay Payment ID</p>
                                       <p className="text-[11px] font-mono text-white/80 break-all">{order.razorpayPaymentId}</p>
                                    </div>
                                 )}
                                 <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Integrity Check</p>
                                    <div className={`w-2 h-2 rounded-full ${order.paymentStatus === 'paid' ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]' : 'bg-amber-400 shadow-[0_0_10px_#fbbf24]'}`} />
                                 </div>
                              </div>
                           </div>
                        </div>

                     </div>
                  </div>
                ))
             )}
          </div>
       </div>
    </div>
  );
};

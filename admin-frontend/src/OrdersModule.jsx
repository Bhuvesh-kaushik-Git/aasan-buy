import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const PAGE_SIZE = 15;

const statusColors = {
  Processing: 'bg-amber-50 text-amber-600 border-amber-100',
  Shipped: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  Delivered: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  Cancelled: 'bg-rose-50 text-rose-600 border-rose-100',
};

const OrdersModule = ({ adminToken }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerTarget = React.useRef(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Bulk actions
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkStatus, setBulkStatus] = useState('Shipped');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [allProducts, setAllProducts] = useState([]);

  // Modals / Specific context
  const [editingOrder, setEditingOrder] = useState(null); // For details edit
  const [addingToOrder, setAddingToOrder] = useState(null); // For adding items
  const [addingForm, setAddingForm] = useState({ productId: '', quantity: 1, selectedSize: '', selectedColor: null });

  const fetchOrders = async (p = 1, append = false) => {
    if (loadingMore) return;
    if (append) setLoadingMore(true);
    else setLoading(true);

    try {
      const res = await fetch(`${API_URL}/orders?page=${p}&limit=${PAGE_SIZE}&search=${searchQuery}&status=${statusFilter}`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      const data = await res.json();
      setOrders(prev => append ? [...prev, ...(data.orders || [])] : (data.orders || []));
      setPages(data.pages || 1);
      setTotal(data.totalItems || 0);
      setPage(p);

      if (allProducts.length === 0) {
        const pRes = await fetch(`${API_URL}/products?limit=1000`, { headers: { 'Authorization': `Bearer ${adminToken}` } });
        const pData = await pRes.json();
        setAllProducts(pData.products || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => { 
    setPage(1);
    fetchOrders(1, false); 
  }, [statusFilter, searchQuery]);

  // Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !loading && !loadingMore && page < pages) {
          fetchOrders(page + 1, true);
        }
      },
      { threshold: 0.1 }
    );
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => { if (observerTarget.current) observer.unobserve(observerTarget.current); };
  }, [loading, loadingMore, page, pages, statusFilter, searchQuery]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await fetch(`${API_URL}/orders/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ status: newStatus }),
      });
      setOrders(prev => prev.map(o => o._id === id ? { ...o, orderStatus: newStatus } : o));
    } catch (err) { console.error(err); }
  };

  const handlePaymentStatusChange = async (id, newStatus) => {
    try {
      await fetch(`${API_URL}/orders/${id}/payment`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ status: newStatus }),
      });
      setOrders(prev => prev.map(o => o._id === id ? { ...o, paymentStatus: newStatus } : o));
    } catch (err) { console.error(err); }
  };

  const handleBulkUpdate = async () => {
    if (!selectedIds.length) return;
    setBulkLoading(true);
    try {
      await Promise.all(
        selectedIds.map(id => fetch(`${API_URL}/orders/${id}/status`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          },
          body: JSON.stringify({ status: bulkStatus }),
        }))
      );
      setOrders(prev => prev.map(o => selectedIds.includes(o._id) ? { ...o, orderStatus: bulkStatus } : o));
      setSelectedIds([]);
    } catch (err) { console.error(err); }
    setBulkLoading(false);
  };

  const handleRollback = async (id) => {
    if (!window.confirm("CRITICAL: This will return all items to stock and cancel the order permanently. Proceed?")) return;
    try {
      const res = await fetch(`${API_URL}/orders/${id}/rollback`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (res.ok) {
        alert("Inventory Rolled Back Successfully.");
        fetchOrders();
      }
    } catch (e) { alert("Rollback failed"); }
  };

  const handleUpdateDetails = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/orders/${editingOrder._id}/details`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
        body: JSON.stringify({ customerDetails: editingOrder.customerDetails })
      });
      if (res.ok) {
        setEditingOrder(null);
        fetchOrders();
      }
    } catch (e) { alert("Update failed"); }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/orders/${addingToOrder._id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
        body: JSON.stringify(addingForm)
      });
      if (res.ok) {
        setAddingToOrder(null);
        setAddingForm({ productId: '', quantity: 1, selectedSize: '', selectedColor: null });
        fetchOrders();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to add item");
      }
    } catch (e) { alert("Error adding item"); }
  };

  const toggleSelect = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleSelectAll = (pageOrders) => {
    const ids = pageOrders.map(o => o._id);
    const allSelected = ids.every(id => selectedIds.includes(id));
    if (allSelected) setSelectedIds(prev => prev.filter(id => !ids.includes(id)));
    else setSelectedIds(prev => [...new Set([...prev, ...ids])]);
  };

  const totalPages = pages;
  const pageOrders = orders;

  if (loading) return <div className="flex justify-center items-center h-64 text-gray-400 font-bold">Loading Orders...</div>;

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-fade-in-up font-sans pb-20">

      {/* Header */}
      <div className="bg-white p-8 rounded-[40px] shadow-soft border border-black/5 flex flex-wrap gap-6 items-center justify-between relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary opacity-5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10">
          <span className="text-[11px] font-black text-secondary uppercase tracking-[0.4em] mb-1 block">Live Logistics</span>
          <h2 className="text-4xl font-black font-heading text-dark tracking-tighter">Orders Intelligence</h2>
          <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-widest">{total} Orders Synchronized · Page {page} of {pages}</p>
        </div>
        <button onClick={fetchOrders} className="relative z-10 flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-primary bg-primary/5 hover:bg-primary hover:text-white px-8 py-4 rounded-2xl transition-all shadow-soft border border-primary/10">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
          Refresh Feed
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white/70 backdrop-blur-xl p-6 rounded-[32px] shadow-premium border border-black/5 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[300px] relative">
           <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
           <input
             type="text" placeholder="Search customer, ID or email..."
             value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
             className="w-full bg-gray-50 border-0 rounded-2xl pl-12 pr-4 py-3.5 text-xs font-black focus:bg-white focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all"
           />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="bg-gray-50 border-0 rounded-2xl px-6 py-3.5 text-[10px] font-black uppercase tracking-widest focus:bg-white focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all appearance-none cursor-pointer text-gray-500">
          {['All Status', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => <option key={s} value={s === 'All Status' ? 'All' : s}>{s}</option>)}
        </select>
        <div className="flex items-center gap-3 bg-gray-50 px-6 py-3.5 rounded-2xl">
          <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Timeframe</span>
          <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }} className="bg-transparent border-0 text-[10px] font-black focus:outline-none" />
          <span className="text-gray-200">/</span>
          <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }} className="bg-transparent border-0 text-[10px] font-black focus:outline-none" />
        </div>
        {(statusFilter !== 'All' || dateFrom || dateTo || searchQuery) && (
          <button onClick={() => { setStatusFilter('All'); setDateFrom(''); setDateTo(''); setSearchQuery(''); setPage(1); }} className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline ml-2">Reset</button>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="bg-primary/5 border border-primary/10 rounded-[32px] px-8 py-4 flex items-center gap-6 flex-wrap animate-fade-in">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-black text-xs shadow-lg">{selectedIds.length}</div>
             <span className="text-[11px] font-black text-primary uppercase tracking-widest">Selected Entities</span>
          </div>
          <div className="h-6 w-[1px] bg-primary/10 mx-2" />
          <select value={bulkStatus} onChange={e => setBulkStatus(e.target.value)} className="bg-white border-0 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest focus:outline-none shadow-soft">
            {['Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => <option key={s}>{s}</option>)}
          </select>
          <button onClick={handleBulkUpdate} disabled={bulkLoading} className="bg-primary text-white text-[11px] font-black uppercase tracking-widest px-8 py-2.5 rounded-xl hover:brightness-110 transition-all shadow-xl shadow-primary/20 disabled:opacity-50">
            {bulkLoading ? 'Updating Pipeline...' : `Execute: Mark as ${bulkStatus}`}
          </button>
          <button onClick={() => setSelectedIds([])} className="text-[10px] text-gray-400 font-black uppercase tracking-widest hover:text-dark ml-auto">Cancel</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-[40px] shadow-premium border border-black/5 overflow-hidden">
        {pageOrders.length === 0 ? (
          <div className="text-center py-24">
             <div className="text-6xl mb-6 opacity-20">📫</div>
             <p className="font-heading font-black text-2xl text-gray-300">Clean Slate — No Orders Found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  <th className="px-8 py-6">
                    <input type="checkbox"
                      checked={pageOrders.every(o => selectedIds.includes(o._id))}
                      onChange={() => toggleSelectAll(pageOrders)}
                      className="w-5 h-5 accent-primary rounded-lg border-gray-200 cursor-pointer"
                    />
                  </th>
                  <th className="px-6 py-6 font-black">Transaction ID</th>
                  <th className="px-6 py-6 font-black">Timeline</th>
                  <th className="px-6 py-6 font-black">Stakeholder</th>
                  <th className="px-6 py-6 font-black">Investment</th>
                  <th className="px-6 py-6 font-black text-center">Status Protocol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pageOrders.map(order => (
                  <React.Fragment key={order._id}>
                    <tr className="hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => setExpandedId(expandedId === order._id ? null : order._id)}>
                      <td className="px-4 py-4" onClick={e => { e.stopPropagation(); toggleSelect(order._id); }}>
                        <input type="checkbox" checked={selectedIds.includes(order._id)} onChange={() => toggleSelect(order._id)} className="w-4 h-4 accent-secondary" />
                      </td>
                      <td className="px-4 py-4 font-mono text-[13px] text-gray-500">#{order._id.slice(-6).toUpperCase()}</td>
                      <td className="px-4 py-4 text-[13px] text-gray-700">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-4">
                        <p className="text-[14px] font-bold text-dark">{order.customerDetails?.fullName}</p>
                        <p className="text-[11px] text-gray-500">{order.customerDetails?.email}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-black text-dark text-sm">₹ {order.totalAmount}</p>
                        {order.discountAmount > 0 && <p className="text-[10px] text-green-600 font-bold">-₹ {order.discountAmount} saved</p>}
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">{order.paymentMethod}</span>
                        <div className="flex items-center gap-2">
                           <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full w-max ${order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{order.paymentStatus}</span>
                           {order.paymentStatus !== 'paid' && (
                              <button 
                                 onClick={(e) => { e.stopPropagation(); handlePaymentStatusChange(order._id, 'paid'); }}
                                 className="text-[9px] font-black text-emerald-500 hover:underline uppercase"
                              >
                                 Mark Paid
                              </button>
                           )}
                        </div>
                      </td>
                      <td className="px-4 py-4" onClick={e => e.stopPropagation()}>
                        <select
                          value={order.orderStatus}
                          onChange={e => handleStatusChange(order._id, e.target.value)}
                          className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border focus:outline-none cursor-pointer w-full text-center appearance-none ${statusColors[order.orderStatus]}`}
                        >
                          {['Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => <option key={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>

                    {expandedId === order._id && (
                      <tr className="bg-gray-50/70 border-b border-gray-100 shadow-inner">
                        <td colSpan="7" className="px-8 py-10">
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                            
                            {/* Stakeholder Details */}
                            <div className="lg:col-span-1">
                              <div className="flex justify-between items-center mb-4">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Stakeholder Intelligence</h4>
                                <button onClick={() => setEditingOrder(order)} className="text-[9px] font-black text-primary hover:underline uppercase">Edit Logistics</button>
                              </div>
                              <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-soft space-y-4">
                                <div>
                                   <p className="text-[15px] font-black text-dark">{order.customerDetails?.fullName}</p>
                                   <p className="text-xs text-gray-400 font-bold">{order.customerDetails?.email} · {order.customerDetails?.phone}</p>
                                </div>
                                <div className="pt-4 border-t border-gray-50">
                                   <p className="text-xs text-gray-500 font-medium leading-relaxed">
                                      {order.customerDetails?.address}<br />
                                      {order.customerDetails?.city}, {order.customerDetails?.state}<br />
                                      <span className="font-black text-dark">{order.customerDetails?.pincode}</span>
                                   </p>
                                </div>
                              </div>
                            </div>

                            {/* Inventory Flow */}
                            <div className="lg:col-span-2">
                               <div className="flex justify-between items-center mb-4">
                                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Inventory Allocation</h4>
                                  <button onClick={() => setAddingToOrder(order)} className="bg-primary/5 text-primary text-[9px] font-black px-4 py-2 rounded-xl hover:bg-primary hover:text-white transition-all">+ Add New Resource</button>
                               </div>
                               <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-soft">
                                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {order.items?.map((item, idx) => (
                                      <div key={idx} className="flex gap-4 items-center border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                                         <div className="w-16 h-16 bg-gray-50 rounded-2xl overflow-hidden shadow-sm shrink-0">
                                            <img src={item.image} alt="" className="w-full h-full object-cover" />
                                         </div>
                                         <div className="flex-1">
                                            <div className="flex justify-between">
                                               <h5 className="text-[13px] font-black text-dark">{item.name}</h5>
                                               <p className="text-[13px] font-black text-primary">₹ {item.price * item.quantity}</p>
                                            </div>
                                            <div className="flex flex-col gap-2 mt-1.5">
                                              <div className="flex items-center gap-3">
                                                 <span className="text-[10px] bg-gray-50 px-2 py-0.5 rounded font-black text-gray-400 uppercase">QTY: {item.quantity}</span>
                                                 {item.selectedSize && <span className="text-[10px] bg-gray-50 px-2 py-0.5 rounded font-black text-gray-400 uppercase">SIZE: {item.selectedSize}</span>}
                                                 {item.selectedColor && <span className="w-4 h-4 rounded-full border border-gray-100" style={{ backgroundColor: item.selectedColor.hex }}></span>}
                                              </div>
                                              {item.giftWrap?.title && (
                                                 <div className="flex">
                                                    <span className="text-[10px] bg-rose-50 text-rose-500 px-3 py-1 rounded-lg font-black uppercase tracking-tighter border border-rose-100 animate-pulse">
                                                       🎁 Packing Gift: {item.giftWrap.title} (+₹{item.giftWrap.price})
                                                    </span>
                                                 </div>
                                              )}
                                           </div>
                                         </div>
                                      </div>
                                    ))}
                                  </div>

                                   {(() => {
                                      const itemsSubtotal = order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
                                      const gwTotal = order.items?.reduce((sum, item) => sum + (item.giftWrap?.price || 0), 0) || 0;

                                      return (
                                         <div className="mt-8 pt-8 border-t border-gray-50 grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                               <div>
                                                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Loyalty Intelligence</p>
                                                  <div className="flex gap-3">
                                                     <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-3 py-1.5 rounded-lg border border-emerald-100">Earned: +{order.aasanCoinsEarned || 0}</span>
                                                     {(order.aasanCoinsUsed || 0) > 0 && <span className="bg-secondary/5 text-secondary text-[10px] font-black px-3 py-1.5 rounded-lg border border-secondary/10">Spent: -{order.aasanCoinsUsed}</span>}
                                                  </div>
                                               </div>
                                               
                                               <div className="space-y-2">
                                                  <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-gray-400">
                                                     <span>Item Subtotal</span>
                                                     <span>₹{itemsSubtotal.toLocaleString()}</span>
                                                  </div>
                                                  {gwTotal > 0 && (
                                                     <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-rose-500 bg-rose-50 p-3 rounded-xl border border-rose-100">
                                                        <span>Packing Surcharge</span>
                                                        <span>+ ₹{gwTotal.toLocaleString()}</span>
                                                     </div>
                                                  )}
                                                  {(order.discountAmount - (order.aasanCoinsUsed || 0)) > 0 && (
                                                     <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                                                        <span>Coupon ({order.couponCode || 'PROMO'})</span>
                                                        <span>- ₹{(order.discountAmount - (order.aasanCoinsUsed || 0)).toLocaleString()}</span>
                                                     </div>
                                                  )}
                                                  {(order.aasanCoinsUsed || 0) > 0 && (
                                                     <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-secondary bg-secondary/5 p-3 rounded-xl border border-secondary/10">
                                                        <span>Coins Redeemed</span>
                                                        <span>- ₹{order.aasanCoinsUsed.toLocaleString()}</span>
                                                     </div>
                                                  )}
                                               </div>
                                            </div>

                                            <div className="text-right flex flex-col justify-end">
                                               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Final Settlement</p>
                                               <div className="space-y-1">
                                                  <p className="text-4xl font-black font-heading text-dark tracking-tighter leading-none">₹ {order.totalAmount.toLocaleString()}</p>
                                               </div>
                                            </div>
                                         </div>
                                      );
                                   })()}
                               </div>

                               {/* Manual Overrides */}
                               <div className="mt-8 flex justify-end gap-4">
                                  {order.paymentStatus !== 'paid' && (
                                     <button onClick={() => handlePaymentStatusChange(order._id, 'paid')} className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-8 py-4 rounded-2xl border border-emerald-100 hover:bg-emerald-500 hover:text-white transition-all shadow-xl shadow-emerald-500/10">Mark Order as Paid</button>
                                  )}
                                  {order.orderStatus !== 'Cancelled' && (
                                    <button onClick={() => handleRollback(order._id)} className="bg-rose-50 text-rose-600 text-[10px] font-black px-8 py-4 rounded-2xl border border-rose-100 hover:bg-rose-500 hover:text-white transition-all shadow-xl shadow-rose-500/10">⚡ Atomic Rollback (Inventory Leak Fix)</button>
                                  )}
                               </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div ref={observerTarget} className="h-20 w-full flex items-center justify-center mt-8">
        {loadingMore && (
          <div className="flex gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
          </div>
        )}
        {!loadingMore && page >= pages && orders.length > 0 && (
          <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">End of Intelligence Feed</span>
        )}
      </div>

      {/* Edit Details Modal */}
      {editingOrder && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-dark/60 backdrop-blur-md" onClick={() => setEditingOrder(null)} />
            <form onSubmit={handleUpdateDetails} className="relative bg-white rounded-[40px] p-10 w-full max-w-xl shadow-premium animate-fade-in-up">
               <h3 className="text-2xl font-black font-heading text-dark mb-8">Edit Logistics Protocol</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <input placeholder="Full Name" value={editingOrder.customerDetails.fullName} onChange={e => setEditingOrder({...editingOrder, customerDetails: {...editingOrder.customerDetails, fullName: e.target.value}})} className="bg-gray-50 p-4 rounded-2xl text-sm font-bold border-0 focus:ring-4 focus:ring-primary/10 w-full" />
                  <input placeholder="Phone" value={editingOrder.customerDetails.phone} onChange={e => setEditingOrder({...editingOrder, customerDetails: {...editingOrder.customerDetails, phone: e.target.value}})} className="bg-gray-50 p-4 rounded-2xl text-sm font-bold border-0 focus:ring-4 focus:ring-primary/10 w-full" />
                  <div className="md:col-span-2">
                    <textarea placeholder="Address" value={editingOrder.customerDetails.address} onChange={e => setEditingOrder({...editingOrder, customerDetails: {...editingOrder.customerDetails, address: e.target.value}})} className="bg-gray-50 p-4 rounded-2xl text-sm font-bold border-0 focus:ring-4 focus:ring-primary/10 w-full resize-none" rows={3} />
                  </div>
                  <input placeholder="City" value={editingOrder.customerDetails.city} onChange={e => setEditingOrder({...editingOrder, customerDetails: {...editingOrder.customerDetails, city: e.target.value}})} className="bg-gray-50 p-4 rounded-2xl text-sm font-bold border-0 focus:ring-4 focus:ring-primary/10 w-full" />
                  <input placeholder="Pincode" value={editingOrder.customerDetails.pincode} onChange={e => setEditingOrder({...editingOrder, customerDetails: {...editingOrder.customerDetails, pincode: e.target.value}})} className="bg-gray-50 p-4 rounded-2xl text-sm font-bold border-0 focus:ring-4 focus:ring-primary/10 w-full" />
               </div>
               <div className="flex gap-4">
                  <button type="button" onClick={() => setEditingOrder(null)} className="flex-1 py-4 font-black uppercase tracking-widest text-[11px] text-gray-400 bg-gray-50 rounded-2xl">Cancel</button>
                  <button type="submit" className="flex-[2] py-4 font-black uppercase tracking-widest text-[11px] text-white bg-primary rounded-2xl shadow-xl shadow-primary/20">Commit Changes</button>
               </div>
            </form>
         </div>
      )}

      {/* Add Items Modal */}
      {addingToOrder && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-dark/60 backdrop-blur-md" onClick={() => setAddingToOrder(null)} />
           <form onSubmit={handleAddItem} className="relative bg-white rounded-[40px] p-10 w-full max-w-xl shadow-premium animate-fade-in-up">
              <h3 className="text-2xl font-black font-heading text-dark mb-8">Resource Allocation</h3>
              <div className="space-y-6 mb-8">
                 <select required value={addingForm.productId} onChange={e => setAddingForm({...addingForm, productId: e.target.value})} className="w-full bg-gray-50 p-4 rounded-2xl text-sm font-bold border-0 focus:ring-4 focus:ring-primary/10 appearance-none">
                    <option value="">Select Resource...</option>
                    {allProducts.map(p => <option key={p._id} value={p._id}>{p.name} (₹{p.price})</option>)}
                 </select>
                 <div className="grid grid-cols-2 gap-6">
                    <input type="number" min="1" value={addingForm.quantity} onChange={e => setAddingForm({...addingForm, quantity: parseInt(e.target.value)})} className="bg-gray-50 p-4 rounded-2xl text-sm font-bold border-0 focus:ring-4 focus:ring-primary/10 w-full" placeholder="Quantity" />
                    <input type="text" value={addingForm.selectedSize} onChange={e => setAddingForm({...addingForm, selectedSize: e.target.value})} className="bg-gray-50 p-4 rounded-2xl text-sm font-bold border-0 focus:ring-4 focus:ring-primary/10 w-full" placeholder="Size (Optional)" />
                 </div>
              </div>
              <div className="flex gap-4">
                 <button type="button" onClick={() => setAddingToOrder(null)} className="flex-1 py-4 font-black uppercase tracking-widest text-[11px] text-gray-400 bg-gray-50 rounded-2xl">Abort</button>
                 <button type="submit" className="flex-[2] py-4 font-black uppercase tracking-widest text-[11px] text-white bg-primary rounded-2xl shadow-xl shadow-primary/20">Inject to Order</button>
              </div>
           </form>
         </div>
      )}
    </div>
  );
}

export default OrdersModule;

import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;
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

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Bulk actions
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkStatus, setBulkStatus] = useState('Shipped');
  const [bulkLoading, setBulkLoading] = useState(false);

  useEffect(() => { fetchOrders(); }, [page, statusFilter, searchQuery]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/orders?page=${page}&limit=${PAGE_SIZE}&search=${searchQuery}&status=${statusFilter}`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      const data = await res.json();
      setOrders(data.orders || []);
      setPages(data.pages || 1);
      setTotal(data.totalItems || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await fetch(`${API_URL}/api/orders/${id}/status`, {
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

  const handleBulkUpdate = async () => {
    if (!selectedIds.length) return;
    setBulkLoading(true);
    try {
      await Promise.all(
        selectedIds.map(id => fetch(`${API_URL}/api/orders/${id}/status`, {
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

  const toggleSelect = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleSelectAll = (pageOrders) => {
    const ids = pageOrders.map(o => o._id);
    const allSelected = ids.every(id => selectedIds.includes(id));
    if (allSelected) setSelectedIds(prev => prev.filter(id => !ids.includes(id)));
    else setSelectedIds(prev => [...new Set([...prev, ...ids])]);
  };

  // Filtered logic removed (now handled by server)
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
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full w-max ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{order.paymentStatus}</span>
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
                      <tr className="bg-gray-50/70">
                        <td colSpan="7" className="px-8 py-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Shipping Details</h4>
                              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-[13px] text-gray-700 leading-relaxed">
                                <p className="font-bold text-dark mb-1">{order.customerDetails?.fullName}</p>
                                <p>{order.customerDetails?.email} · {order.customerDetails?.phone}</p>
                                <p className="mt-2 text-gray-500">{order.customerDetails?.address}<br />{order.customerDetails?.city}, {order.customerDetails?.state} – {order.customerDetails?.pincode}</p>
                              </div>
                            </div>
                            <div>
                              <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Order Items</h4>
                              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-2 max-h-[200px] overflow-y-auto">
                                {order.items?.map((item, idx) => (
                                  <div key={idx} className="flex justify-between text-[13px] border-b border-gray-50 pb-2 last:border-0">
                                    <div>
                                      <p className="font-bold text-dark">{item.name}</p>
                                      <p className="text-[11px] text-gray-500">Qty: {item.quantity} {item.selectedColor ? `· ${item.selectedColor.name}` : ''}</p>
                                    </div>
                                    <p className="font-bold text-dark">₹ {item.price * item.quantity}</p>
                                  </div>
                                ))}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:border-secondary hover:text-secondary disabled:opacity-30">← Prev</button>
          {[...Array(Math.min(totalPages, 7))].map((_, i) => (
            <button key={i} onClick={() => setPage(i + 1)} className={`w-9 h-9 rounded-xl text-sm font-bold transition-colors ${page === i + 1 ? 'bg-secondary text-white' : 'border border-gray-200 text-gray-600 hover:border-secondary'}`}>{i + 1}</button>
          ))}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:border-secondary hover:text-secondary disabled:opacity-30">Next →</button>
        </div>
      )}
    </div>
  );
};

export default OrdersModule;

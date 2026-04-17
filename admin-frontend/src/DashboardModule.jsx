import React, { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

const StatCard = ({ label, value, icon, color, sub }) => (
  <div className="bg-white rounded-3xl border border-gray-100 shadow-soft p-8 flex items-start gap-6 hover:shadow-premium transition-all duration-500">
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0 ${color} shadow-lg shadow-current/20`}>
      {icon}
    </div>
    <div>
      <p className="text-3xl font-black text-dark tracking-tighter">{value}</p>
      <p className="text-xs font-black text-gray-400 uppercase tracking-widest mt-1">{label}</p>
      {sub && <p className="text-[10px] text-primary/60 font-bold mt-2 bg-primary/5 px-2 py-0.5 rounded-lg inline-block uppercase tracking-wider">{sub}</p>}
    </div>
  </div>
);

const DashboardModule = () => {
  const [stats, setStats] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, productsRes] = await Promise.all([
          fetch(`${API_URL}/api/orders`),
          fetch(`${API_URL}/api/products?limit=100&page=1`),
        ]);
        const ordersData = await ordersRes.json();
        const productsData = await productsRes.json();

        const orders = ordersData || [];
        const products = productsData.products || [];

        const today = new Date().toDateString();
        const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === today);
        const totalRevenue = orders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + o.totalAmount, 0);
        const pendingOrders = orders.filter(o => o.orderStatus === 'Processing').length;

        setStats({
          totalOrders: orders.length,
          todayOrders: todayOrders.length,
          totalRevenue: totalRevenue.toFixed(2),
          pendingOrders,
          totalProducts: products.length,
        });

        setLowStock(products.filter(p => p.stock <= 5).sort((a, b) => a.stock - b.stock).slice(0, 8));
        setRecentOrders(orders.slice(0, 5));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400 font-bold">Loading Dashboard...</div>;

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 animate-fade-in-up">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Orders" value={stats.totalOrders} color="bg-primary" icon={
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" /></svg>
        } />
        <StatCard label="Today's Orders" value={stats.todayOrders} color="bg-secondary" icon={
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>
        } />
        <StatCard label="Total Revenue" value={`₹ ${stats.totalRevenue}`} color="bg-emerald-500" icon={
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
        } sub="From paid orders" />
        <StatCard label="Pending Orders" value={stats.pendingOrders} color="bg-amber-400" icon={
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
        } sub="Need action" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alert */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-red-50 border-b border-red-100 px-6 py-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-red-500"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>
            <h3 className="font-bold text-red-700 text-sm">⚡ Low Stock / Out of Stock Alerts</h3>
          </div>
          <div className="p-4 space-y-2 max-h-[320px] overflow-y-auto">
            {lowStock.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">All products are well stocked! 🎉</p>
            ) : lowStock.map(p => (
              <div key={p._id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-red-50/50 transition-colors">
                <img src={p.images?.[0]} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-dark truncate">{p.name}</p>
                  <p className="text-[11px] text-gray-500">SKU: {p.sku || '—'}</p>
                </div>
                <span className={`text-[12px] font-black px-3 py-1 rounded-full ${p.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                  {p.stock === 0 ? 'OUT' : `${p.stock} left`}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-soft overflow-hidden">
          <div className="bg-gray-50/50 border-b border-gray-100 px-8 py-6">
            <h3 className="font-black text-dark text-sm uppercase tracking-widest">Recent Activity</h3>
          </div>
          <div className="p-4 space-y-2">
            {recentOrders.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">No orders yet</p>
            ) : recentOrders.map(o => (
              <div key={o._id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex-1">
                  <p className="text-[13px] font-bold text-dark">{o.customerDetails?.fullName}</p>
                  <p className="text-[11px] text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</p>
                </div>
                <span className="font-black text-dark text-sm">₹ {o.totalAmount}</span>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                  o.orderStatus === 'Delivered' ? 'bg-green-100 text-green-700' :
                  o.orderStatus === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                  o.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>{o.orderStatus}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardModule;

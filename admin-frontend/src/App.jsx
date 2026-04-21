import React, { useState } from 'react';
import ProductsModule from './ProductsModule';
import CategoriesModule from './CategoriesModule';
import OrdersModule from './OrdersModule';
import DashboardModule from './DashboardModule';
import CMSModule from './CMSModule';
import CouponModule from './CouponModule';
import UsersModule from './UsersModule';
import ReviewsModule from './ReviewsModule';
import AdminLogin from './AdminLogin';

function App() {
  const [adminUser, setAdminUser] = useState(() => {
    const s = localStorage.getItem('aasanAdmin');
    return s ? JSON.parse(s) : null;
  });

  const [activeTab, setActiveTab] = useState('Dashboard');

  const handleLogin = (userData) => {
    setAdminUser(userData);
    localStorage.setItem('aasanAdmin', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setAdminUser(null);
    localStorage.removeItem('aasanAdmin');
  };

  if (!adminUser) return <AdminLogin onLogin={handleLogin} />;

  const sidebarItems = [
    { label: 'Dashboard', icon: '📊' },
    { label: 'Orders', icon: '📦' },
    { label: 'Products', icon: '🛒' },
    { label: 'Categories', icon: '🏷️' },
    { label: 'Storefront', icon: '🎨', key: 'CMS' },
    { label: 'Coupons', icon: '🏷️' },
    { label: 'Users', icon: '👥' },
    { label: 'Reviews', icon: '⭐' },
  ];

  return (
    <div className="flex h-screen bg-background font-sans overflow-hidden">
      {/* Sidebar */}
      <div className="w-[280px] bg-dark text-white shadow-2xl z-20 flex flex-col border-r border-white/5 shrink-0">
        <div className="p-8 border-b border-white/5 flex items-center gap-4">
          <div className="w-10 h-10 bg-secondary rounded-2xl flex items-center justify-center text-dark font-black text-xl shadow-lg shadow-secondary/20 transition-transform hover:rotate-12 duration-500">
            A
          </div>
          <h1 className="text-xl font-black font-heading tracking-tight">Aasan Buy <span className="text-secondary text-xs block uppercase tracking-widest mt-0.5 opacity-60">Admin Central</span></h1>
        </div>
        <nav className="flex-1 mt-8 px-4 overflow-y-auto no-scrollbar pb-8">
          <ul className="space-y-2">
            {sidebarItems.map(({ label, icon, key }) => {
              const tabKey = key || label;
              return (
                <li key={label}>
                  <button
                    onClick={() => setActiveTab(tabKey)}
                    className={`w-full text-left px-5 py-3.5 rounded-2xl text-[12px] font-black uppercase tracking-widest transition-all flex items-center gap-4
                    ${activeTab === tabKey ? 'bg-secondary text-dark shadow-xl shadow-secondary/20' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}
                  >
                    <span className="text-lg opacity-80">{icon}</span>{label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="p-6 border-t border-white/10">
          <button onClick={handleLogout} className="w-full text-left px-4 py-3 rounded-xl text-xs font-bold text-red-300 hover:bg-red-500/20 hover:text-white transition-all flex items-center gap-3">
             🚪 Logout System
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative bg-background overflow-hidden">
        <header className="bg-white/70 backdrop-blur-xl h-[80px] border-b border-gray-100 flex items-center justify-between px-10 z-10 shrink-0 shadow-soft">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-primary/40">
            {activeTab === 'CMS' ? 'Visual Intelligence' : activeTab}
          </h2>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Administrator</span>
              <span className="text-xs font-black text-dark">{adminUser.name}</span>
            </div>
            <div className="w-[44px] h-[44px] rounded-2xl bg-primary text-white flex items-center justify-center font-black shadow-lg shadow-primary/20 border-2 border-primary/10">{adminUser.name?.[0]?.toUpperCase()}</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50/30">
          {activeTab === 'CMS' ? (
            <CMSModule adminToken={adminUser.token} />
          ) : activeTab === 'Orders' ? (
            <OrdersModule adminToken={adminUser.token} />
          ) : activeTab === 'Products' ? (
            <ProductsModule adminToken={adminUser.token} />
          ) : activeTab === 'Categories' ? (
            <CategoriesModule adminToken={adminUser.token} />
          ) : activeTab === 'Dashboard' ? (
            <DashboardModule adminToken={adminUser.token} />
          ) : activeTab === 'Reviews' ? (
            <ReviewsModule adminToken={adminUser.token} />
          ) : activeTab === 'Coupons' ? (
            <CouponModule adminToken={adminUser.token} />
          ) : activeTab === 'Users' ? (
            <UsersModule adminToken={adminUser.token} />
          ) : (
            <div className="flex flex-col items-center justify-center h-[50vh] text-gray-400">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 mb-4 opacity-50"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
               <h3 className="font-serif text-xl tracking-tight text-gray-500">Module Under Construction</h3>
               <p className="text-sm">This section will be available soon.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import ProductsModule from './ProductsModule';
import CategoriesModule from './CategoriesModule';
import OrdersModule from './OrdersModule';
import DashboardModule from './DashboardModule';
import AdminLogin from './AdminLogin';
import ReviewsModule from './ReviewsModule';

const API_URL = import.meta.env.VITE_API_URL;

const ProductSearchSelector = ({ allProducts, selectedIds, onToggle }) => {
  const [search, setSearch] = useState('');
  const filtered = allProducts.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  const displayProducts = search ? filtered : filtered.slice(0, 6);

  return (
    <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl mt-4">
       <input 
          type="text" 
          placeholder="Search to add products..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full text-sm px-3 py-2 border rounded-lg mb-3 focus:outline-none focus:border-secondary"
       />
       <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
          {displayProducts.map(p => (
            <label key={p._id} className="flex items-center gap-3 p-2 border border-gray-100 bg-white rounded-xl cursor-pointer hover:bg-secondary/5 transition-colors">
              <input type="checkbox" checked={selectedIds.includes(p._id)} onChange={() => onToggle(p)} className="w-4 h-4 text-secondary accent-secondary" />
              <img src={p.images?.[0]} alt="" className="w-8 h-8 rounded shrink-0 object-cover" />
              <span className="text-xs font-medium truncate flex-1">{p.name}</span>
            </label>
          ))}
       </div>
       {!search && filtered.length > 6 && <div className="text-[10px] text-gray-400 mt-2 text-center">Search to find more products...</div>}
    </div>
  );
};

function App() {
  const [adminUser, setAdminUser] = useState(() => {
    const s = localStorage.getItem('aasanAdmin');
    return s ? JSON.parse(s) : null;
  });

  const handleLogin = (userData) => {
    setAdminUser(userData);
    localStorage.setItem('aasanAdmin', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setAdminUser(null);
    localStorage.removeItem('aasanAdmin');
  };

  const [activeTab, setActiveTab] = useState('Dashboard');
  const [formData, setFormData] = useState({
    heroBanners: [],
    navMenu: [],
    occasionSections: [],
    homeProductTabs: []
  });
  const [loading, setLoading] = useState(false);
  const [allProducts, setAllProducts] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/products?limit=200&page=1`)
      .then(res => res.json())
      .then(data => setAllProducts(data.products || []))
      .catch(err => console.error('Error fetching products:', err));
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/api/settings`)
      .then(res => res.json())
      .then(data => {
        if (data) {
          setFormData({
            heroBanners: data.heroBanners || [],
            navMenu: data.navMenu || [],
            occasionSections: data.occasionSections || [],
            homeProductTabs: data.homeProductTabs || []
          });
        }
      })
      .catch(err => console.error('Error fetching settings:', err));
  }, []);

  if (!adminUser) return <AdminLogin onLogin={handleLogin} />;

  // ── Hero Banner Handlers ──
  const handleAddBanner = () => {
    setFormData(prev => ({
      ...prev,
      heroBanners: [...prev.heroBanners, { title: '', subtitle: '', imageUrl: '', linkUrl: '#' }]
    }));
  };
  const handleRemoveBanner = (index) => {
    const updated = [...formData.heroBanners];
    updated.splice(index, 1);
    setFormData(prev => ({ ...prev, heroBanners: updated }));
  };
  const handleBannerChange = (index, field, value) => {
    const updated = [...formData.heroBanners];
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, heroBanners: updated }));
  };

  // ── Occasion Section Handlers (3-level: Sections → Occasions) ──
  const handleAddOccasionSection = () => {
    setFormData(prev => ({
      ...prev,
      occasionSections: [...prev.occasionSections, { sectionTitle: '', occasions: [] }]
    }));
  };
  const handleRemoveOccasionSection = (sIdx) => {
    const updated = [...formData.occasionSections];
    updated.splice(sIdx, 1);
    setFormData(prev => ({ ...prev, occasionSections: updated }));
  };
  const handleOccasionSectionTitleChange = (sIdx, value) => {
    const updated = [...formData.occasionSections];
    updated[sIdx].sectionTitle = value;
    setFormData(prev => ({ ...prev, occasionSections: updated }));
  };
  const handleAddOccasion = (sIdx) => {
    const updated = [...formData.occasionSections];
    updated[sIdx].occasions = [...(updated[sIdx].occasions || []), { label: '', imageUrl: '', redirectUrl: '' }];
    setFormData(prev => ({ ...prev, occasionSections: updated }));
  };
  const handleRemoveOccasion = (sIdx, oIdx) => {
    const updated = [...formData.occasionSections];
    updated[sIdx].occasions.splice(oIdx, 1);
    setFormData(prev => ({ ...prev, occasionSections: updated }));
  };
  const handleOccasionChange = (sIdx, oIdx, field, value) => {
    const updated = [...formData.occasionSections];
    updated[sIdx].occasions[oIdx][field] = value;
    setFormData(prev => ({ ...prev, occasionSections: updated }));
  };

  // ── Nav Menu Handlers ──
  const handleAddMenu = () => {
    setFormData(prev => ({ ...prev, navMenu: [...prev.navMenu, { label: '', sections: [] }] }));
  };
  const handleRemoveMenu = (index) => {
    const updated = [...formData.navMenu];
    updated.splice(index, 1);
    setFormData(prev => ({ ...prev, navMenu: updated }));
  };
  const handleMenuChange = (index, field, value) => {
    const updated = [...formData.navMenu];
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, navMenu: updated }));
  };
  const handleAddSection = (menuIndex) => {
    const updated = [...formData.navMenu];
    if (!updated[menuIndex].sections) updated[menuIndex].sections = [];
    updated[menuIndex].sections.push({ title: '', links: [] });
    setFormData(prev => ({ ...prev, navMenu: updated }));
  };
  const handleRemoveSection = (menuIndex, secIndex) => {
    const updated = [...formData.navMenu];
    updated[menuIndex].sections.splice(secIndex, 1);
    setFormData(prev => ({ ...prev, navMenu: updated }));
  };
  const handleSectionTitleChange = (menuIndex, secIndex, value) => {
    const updated = [...formData.navMenu];
    updated[menuIndex].sections[secIndex].title = value;
    setFormData(prev => ({ ...prev, navMenu: updated }));
  };
  const handleAddLink = (menuIndex, secIndex) => {
    const updated = [...formData.navMenu];
    if (!updated[menuIndex].sections[secIndex].links) updated[menuIndex].sections[secIndex].links = [];
    updated[menuIndex].sections[secIndex].links.push({ label: '', url: '' });
    setFormData(prev => ({ ...prev, navMenu: updated }));
  };
  const handleRemoveLink = (menuIndex, secIndex, linkIndex) => {
    const updated = [...formData.navMenu];
    updated[menuIndex].sections[secIndex].links.splice(linkIndex, 1);
    setFormData(prev => ({ ...prev, navMenu: updated }));
  };
  const handleLinkChange = (menuIndex, secIndex, linkIndex, field, value) => {
    const updated = [...formData.navMenu];
    updated[menuIndex].sections[secIndex].links[linkIndex][field] = value;
    setFormData(prev => ({ ...prev, navMenu: updated }));
  };

  // ── Home Product Tabs Handlers ──
  const handleAddProductTab = () => {
    setFormData(prev => ({
      ...prev,
      homeProductTabs: [...(prev.homeProductTabs || []), { tabTitle: '', products: [] }]
    }));
  };
  const handleRemoveProductTab = (tIdx) => {
    const updated = [...formData.homeProductTabs];
    updated.splice(tIdx, 1);
    setFormData(prev => ({ ...prev, homeProductTabs: updated }));
  };
  const handleProductTabTitleChange = (tIdx, value) => {
    const updated = [...formData.homeProductTabs];
    updated[tIdx].tabTitle = value;
    setFormData(prev => ({ ...prev, homeProductTabs: updated }));
  };
  const handleToggleProductInTab = (tIdx, productObj) => {
    const updated = [...formData.homeProductTabs];
    const existsIndex = updated[tIdx].products.findIndex(p => p.product === productObj._id || p.product?._id === productObj._id);
    if (existsIndex > -1) {
      updated[tIdx].products.splice(existsIndex, 1);
    } else {
      updated[tIdx].products.push({
        product: productObj._id,
        tagLabel: '',
        tagColor: '#ffbc00'
      });
    }
    setFormData(prev => ({ ...prev, homeProductTabs: updated }));
  };
  const handleProductTagChange = (tIdx, pIdx, field, value) => {
    const updated = [...formData.homeProductTabs];
    updated[tIdx].products[pIdx][field] = value;
    setFormData(prev => ({ ...prev, homeProductTabs: updated }));
  };

  // ── Save ──
  const handleSaveCMS = () => {
    setLoading(true);
    fetch(`${API_URL}/api/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        heroBanners: formData.heroBanners,
        navMenu: formData.navMenu,
        occasionSections: formData.occasionSections,
        homeProductTabs: formData.homeProductTabs
      })
    })
    .then(res => res.json())
    .then(() => alert("Settings saved and published!"))
    .catch(err => console.error(err))
    .finally(() => setLoading(false));
  };

  const sidebarItems = [
    { label: 'Dashboard', icon: '📊' },
    { label: 'Orders', icon: '📦' },
    { label: 'Products', icon: '🛒' },
    { label: 'Categories', icon: '🏷️' },
    { label: 'Storefront', icon: '🎨' },
    { label: 'Reviews', icon: '⭐' },
  ];

  return (
    <div className="flex h-screen bg-background font-sans">

      {/* Sidebar */}
      <div className="w-[280px] bg-dark text-white shadow-2xl z-20 flex flex-col border-r border-white/5">
        <div className="p-8 border-b border-white/5 flex items-center gap-4">
          <div className="w-10 h-10 bg-secondary rounded-2xl flex items-center justify-center text-dark font-black text-xl shadow-lg shadow-secondary/20 transition-transform hover:rotate-12 duration-500">
            A
          </div>
          <h1 className="text-xl font-black font-heading tracking-tight">Aasan Buy <span className="text-secondary">Admin Dashboard</span></h1>
        </div>
        <nav className="flex-1 mt-8 px-4">
          <ul className="space-y-2">
            {sidebarItems.map(({ label, icon }) => {
              const tabKey = label === 'Storefront' ? 'CMS' : label;
              return (
                <li key={label}>
                  <button
                    onClick={() => setActiveTab(tabKey)}
                    className={`w-full text-left px-5 py-3.5 rounded-2xl text-[13px] font-black uppercase tracking-widest transition-all flex items-center gap-4
                    ${activeTab === tabKey ? 'bg-secondary text-dark shadow-xl shadow-secondary/20' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}
                  >
                    <span className="text-lg opacity-80">{icon}</span>{label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="p-3 border-t border-white/10">
          <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-red-300 hover:bg-red-500/20 hover:text-white transition-all flex items-center gap-3">
            <span>🚪</span> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-background">
        <header className="bg-white/70 backdrop-blur-xl h-[80px] border-b border-gray-100 flex items-center justify-between px-10 z-10 sticky top-0 shadow-soft">
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-primary/40">
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

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {/* ── Storefront Management (Combined CMS & Occasions) ── */}
          {activeTab === 'CMS' ? (
            <div className="max-w-[1000px] mx-auto space-y-12 animate-fade-in-up pb-20">
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[32px] border border-black/5 shadow-soft mb-8">
                 <div className="space-y-1">
                    <span className="text-[11px] font-black text-secondary uppercase tracking-[0.3em]">Design Intelligence</span>
                    <h2 className="text-3xl font-black text-dark tracking-tighter">Storefront Experience</h2>
                 </div>
                 <button onClick={handleSaveCMS} disabled={loading} className="bg-primary text-white font-black text-[13px] uppercase tracking-widest px-10 py-4 rounded-2xl shadow-xl shadow-primary/20 hover:brightness-110 transition-all active:scale-95 disabled:opacity-50">
                    {loading ? 'Publishing...' : 'Save & Publish All'}
                 </button>
              </div>

              {/* Navigation & Structure */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Hero Banners */}
                <div className="bg-white rounded-[32px] shadow-soft border border-black/5 p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-heading font-black text-xl text-dark">Hero Banners</h3>
                    <button onClick={handleAddBanner} className="text-secondary hover:text-primary transition-colors hover:rotate-90 duration-500">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                    </button>
                  </div>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {formData.heroBanners.map((banner, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex gap-4 relative group">
                        <button onClick={() => handleRemoveBanner(index)} className="absolute -top-1 -right-1 bg-red-500 text-white w-5 h-5 rounded-full text-[10px] opacity-0 group-hover:opacity-100">✕</button>
                        <img src={banner.imageUrl} className="w-16 h-16 rounded-xl object-cover bg-white" alt="" />
                        <div className="flex-1 space-y-2">
                           <input type="text" value={banner.imageUrl} onChange={e => handleBannerChange(index, 'imageUrl', e.target.value)} placeholder="Image URL" className="w-full text-[10px] bg-white px-2 py-1 rounded border-0" />
                           <input type="text" value={banner.title} onChange={e => handleBannerChange(index, 'title', e.target.value)} placeholder="Title" className="w-full text-xs font-black bg-white px-2 py-1 rounded border-0" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Nav & Mega Menu */}
                <div className="bg-white rounded-[32px] shadow-soft border border-black/5 p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-heading font-black text-xl text-dark">Navigation Bar</h3>
                    <button onClick={handleAddMenu} className="text-emerald-500 hover:text-emerald-600 transition-colors">
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                    </button>
                  </div>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {formData.navMenu.map((menu, mIdx) => (
                      <div key={mIdx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                         <input type="text" value={menu.label} onChange={e => handleMenuChange(mIdx, 'label', e.target.value)} className="bg-white px-3 py-1.5 rounded-lg text-xs font-black border-0 w-[150px]" />
                         <span className="text-[10px] text-gray-400 font-bold">{(menu.sections || []).length} Columns</span>
                         <button onClick={() => handleRemoveMenu(mIdx)} className="text-red-400 hover:text-red-600">✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Occasion Manager */}
              <div className="bg-white rounded-[32px] shadow-soft border border-black/5 p-10">
                 <div className="flex justify-between items-center mb-10">
                    <div>
                      <h3 className="font-heading font-black text-2xl text-dark">Occasion Strategy</h3>
                      <p className="text-sm text-gray-400 font-medium">Manage the horizontal collection strips on the homepage.</p>
                    </div>
                    <button onClick={handleAddOccasionSection} className="bg-secondary/10 text-secondary font-black text-xs px-6 py-2.5 rounded-xl hover:bg-secondary hover:text-white transition-all">+ New Strip</button>
                 </div>
                 
                 <div className="space-y-8">
                    {formData.occasionSections.map((section, sIdx) => (
                      <div key={sIdx} className="p-6 bg-[#FAFBFC] rounded-[30px] border border-gray-100">
                         <div className="flex items-center gap-4 mb-6">
                            <input type="text" value={section.sectionTitle} onChange={e => handleOccasionSectionTitleChange(sIdx, e.target.value)} className="flex-1 bg-white px-6 py-3 rounded-2xl font-black text-sm border-0 shadow-soft focus:shadow-premium transition-shadow" placeholder="Section Name..." />
                            <button onClick={() => handleAddOccasion(sIdx)} className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider">+ Add Card</button>
                            <button onClick={() => handleRemoveOccasionSection(sIdx)} className="text-red-300 hover:text-red-600">✕</button>
                         </div>
                         <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                            {(section.occasions || []).map((occ, oIdx) => (
                               <div key={oIdx} className="w-[180px] shrink-0 bg-white p-3 rounded-2xl shadow-sm border border-gray-50 relative group">
                                  <button onClick={() => handleRemoveOccasion(sIdx, oIdx)} className="absolute -top-1 -right-1 bg-red-500 text-white w-5 h-5 rounded-full text-[9px] opacity-0 group-hover:opacity-100">✕</button>
                                  <img src={occ.imageUrl} className="w-full h-24 object-cover rounded-xl mb-3" />
                                  <input type="text" value={occ.label} onChange={e => handleOccasionChange(sIdx, oIdx, 'label', e.target.value)} className="w-full text-[11px] font-black border-0 mb-1" placeholder="Label" />
                                  <input type="text" value={occ.imageUrl} onChange={e => handleOccasionChange(sIdx, oIdx, 'imageUrl', e.target.value)} className="w-full text-[9px] text-gray-400 border-0" placeholder="Image URL" />
                               </div>
                            ))}
                         </div>
                      </div>
                    ))}
                 </div>
              </div>

              {/* Product Tabs */}
              <div className="bg-white rounded-[40px] shadow-premium border border-black/5 p-10">
                  <div className="flex justify-between items-center mb-10">
                    <div>
                      <h3 className="font-heading font-black text-2xl text-dark">Personalized Shelves</h3>
                      <p className="text-sm text-gray-400 font-medium">Curate products into beautiful tabbed carousels.</p>
                    </div>
                    <button onClick={handleAddProductTab} className="bg-primary text-white font-black text-xs px-6 py-2.5 rounded-xl transition-all hover:shadow-lg">+ New Shelf</button>
                 </div>
                 <div className="space-y-12">
                     {formData.homeProductTabs.map((tab, tIdx) => (
                        <div key={tIdx} className="space-y-6">
                           <div className="flex items-center gap-4">
                              <input type="text" value={tab.tabTitle} onChange={e => handleProductTabTitleChange(tIdx, e.target.value)} className="flex-1 bg-gray-50 px-6 py-3 rounded-2xl font-black text-dark text-lg border-0" placeholder="Shelf Title (e.g. For Him)" />
                              <button onClick={() => handleRemoveProductTab(tIdx)} className="text-red-400 font-black px-4 py-2 border rounded-xl hover:bg-red-50 transition-colors">Delete Shelf</button>
                           </div>
                           <ProductSearchSelector 
                              allProducts={allProducts}
                              selectedIds={(tab.products || []).map(p => p.product?._id || p.product)}
                              onToggle={(product) => handleToggleProductInTab(tIdx, product)}
                           />
                        </div>
                     ))}
                 </div>
              </div>
            </div>

          ) : activeTab === 'Orders' ? (
            <OrdersModule />
          ) : activeTab === 'Products' ? (
            <ProductsModule />
          ) : activeTab === 'Categories' ? (
            <CategoriesModule />
          ) : activeTab === 'Dashboard' ? (
            <DashboardModule />
          ) : activeTab === 'Reviews' ? (
            <ReviewsModule />
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

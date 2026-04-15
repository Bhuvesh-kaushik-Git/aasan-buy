import React, { useState, useEffect } from 'react';
import ProductsModule from './ProductsModule';
import CategoriesModule from './CategoriesModule';

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
  const [activeTab, setActiveTab] = useState('CMS');
  const [formData, setFormData] = useState({
    heroBanners: [],
    navMenu: [],
    occasionSections: [],
    homeProductTabs: []
  });
  const [loading, setLoading] = useState(false);
  const [allProducts, setAllProducts] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => setAllProducts(data))
      .catch(err => console.error("Error fetching products:", err));
  }, []);

  // Fetch Settings on Load
  useEffect(() => {
    fetch('http://localhost:5001/api/settings')
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
      .catch(err => console.error("Error fetching settings:", err));
  }, []);

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
    fetch('http://localhost:5001/api/settings', {
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

  const sidebarItems = ['Dashboard', 'Orders', 'Products', 'Categories', 'CMS / Pages', 'Occasions', 'Settings'];

  return (
    <div className="flex h-screen bg-background font-sans">

      {/* Sidebar */}
      <div className="w-64 bg-primary text-white shadow-xl z-20 flex flex-col">
        <div className="p-6 border-b border-primary/50 flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-secondary">
            <path d="M9.375 3a1.875 1.875 0 0 0 0 3.75h1.875v4.5H3.375A1.875 1.875 0 0 1 1.5 9.375v-.75c0-1.036.84-1.875 1.875-1.875h3.193A3.375 3.375 0 0 1 12 2.753a3.375 3.375 0 0 1 5.432 3.997h3.193c1.035 0 1.875.84 1.875 1.875v.75a1.875 1.875 0 0 1-1.875 1.875H12.75v-4.5h1.875a1.875 1.875 0 1 0-1.875-1.875V3zM12.75 12.75h7.5v6.375a2.625 2.625 0 0 1-2.625 2.625H6.375a2.625 2.625 0 0 1-2.625-2.625V12.75h7.5zm-1.5 0H3.75v6.375c0 .621.504 1.125 1.125 1.125h6.375v-7.5z"/>
          </svg>
          <h1 className="text-xl font-bold font-serif tracking-wide">Aasan<span className="text-secondary">Admin</span></h1>
        </div>
        <nav className="flex-1 mt-6 px-4">
          <ul className="space-y-2">
            {sidebarItems.map(item => (
              <li key={item}>
                <button
                  onClick={() => setActiveTab(item === 'CMS / Pages' ? 'CMS' : item)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 
                  ${activeTab === (item === 'CMS / Pages' ? 'CMS' : item)
                    ? 'bg-secondary text-white shadow-lg'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-[#fafafa]">
        <header className="bg-white/60 backdrop-blur-md h-[70px] border-b border-gray-200 flex items-center justify-between px-8 z-10 sticky top-0 shadow-sm">
          <h2 className="text-xl font-bold text-dark font-serif tracking-tight">
            {activeTab === 'CMS' ? 'CMS / Visual Settings' : activeTab}
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 font-medium">Welcome, Super Admin</span>
            <div className="w-[36px] h-[36px] rounded-full bg-secondary text-white flex items-center justify-center font-bold font-serif shadow-sm">A</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">

          {/* ── CMS Tab ── */}
          {activeTab === 'CMS' ? (
            <div className="max-w-[900px] mx-auto space-y-8 animate-fade-in-up">

              {/* Hero Banners */}
              <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                <div className="bg-[#fefaf4] p-6 border-b border-gray-100 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-dark font-serif tracking-wide mb-1">Storefront Hero Carousel</h3>
                    <p className="text-[13px] text-gray-500">Manage your full-width homepage banners.</p>
                  </div>
                  <button onClick={handleAddBanner} className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-opacity-90 transition-all flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                    Add Banner
                  </button>
                </div>
                <div className="p-8 space-y-6">
                  {formData.heroBanners.map((banner, index) => (
                    <div key={index} className="p-5 bg-gray-50/50 rounded-xl border border-gray-100 relative group flex gap-6">
                      <button onClick={() => handleRemoveBanner(index)} className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-600">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                      <div className="w-1/3 h-[100px] bg-white border rounded-lg overflow-hidden shrink-0">
                        {banner.imageUrl ? <img src={banner.imageUrl} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-300 italic">No Preview</div>}
                      </div>
                      <div className="flex-1 grid grid-cols-2 gap-4">
                        <input type="text" value={banner.imageUrl} onChange={e => handleBannerChange(index, 'imageUrl', e.target.value)} className="col-span-2 w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:border-secondary focus:outline-none" placeholder="Image URL" />
                        <input type="text" value={banner.linkUrl} onChange={e => handleBannerChange(index, 'linkUrl', e.target.value)} className="col-span-2 w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:border-secondary focus:outline-none" placeholder="Link URL (e.g. /product/...)" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nav Menu */}
              <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                <div className="bg-[#fefaf4] p-6 border-b border-gray-100 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-dark font-serif tracking-wide mb-1">Header Navigation & Mega-Menu</h3>
                    <p className="text-[13px] text-gray-500">Create the multi-level menu bar visible below the search bar.</p>
                  </div>
                  <button onClick={handleAddMenu} className="bg-secondary text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-opacity-90 transition-all flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                    Add Menu Section
                  </button>
                </div>
                <div className="p-8 space-y-10">
                  {formData.navMenu.map((menu, mIdx) => (
                    <div key={mIdx} className="border-l-4 border-secondary pl-6 space-y-4 relative group">
                      <button onClick={() => handleRemoveMenu(mIdx)} className="absolute -left-3 top-0 w-6 h-6 bg-red-400 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                      <div className="flex gap-4 items-center">
                        <div className="flex-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Main Label</label>
                          <input type="text" value={menu.label} onChange={e => handleMenuChange(mIdx, 'label', e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-bold focus:border-secondary focus:outline-none" />
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Dropdown Sections (Columns)</span>
                          <button onClick={() => handleAddSection(mIdx)} className="text-[10px] font-bold text-secondary hover:underline">+ Add Section</button>
                        </div>
                        <div className="space-y-4">
                          {(menu.sections || []).map((section, secIdx) => (
                            <div key={secIdx} className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                              <div className="flex items-center gap-2 mb-3">
                                <input type="text" value={section.title} onChange={e => handleSectionTitleChange(mIdx, secIdx, e.target.value)} placeholder="Section Title" className="flex-1 text-xs font-bold border-b border-gray-100 pb-1 focus:outline-none focus:border-secondary" />
                                <button onClick={() => handleRemoveSection(mIdx, secIdx)} className="text-red-300 hover:text-red-500">
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                              </div>
                              <div className="pl-2 space-y-2 border-l-2 border-gray-50">
                                {(section.links || []).map((link, lIdx) => (
                                  <div key={lIdx} className="flex gap-2 items-center group/link">
                                    <input type="text" value={link.label} onChange={e => handleLinkChange(mIdx, secIdx, lIdx, 'label', e.target.value)} placeholder="Link Label" className="flex-1 text-[11px] bg-gray-50 px-2 py-1.5 rounded focus:outline-none" />
                                    <input type="text" value={link.url} onChange={e => handleLinkChange(mIdx, secIdx, lIdx, 'url', e.target.value)} placeholder="Link URL" className="flex-1 text-[11px] bg-gray-50 px-2 py-1.5 rounded focus:outline-none" />
                                    <button onClick={() => handleRemoveLink(mIdx, secIdx, lIdx)} className="text-red-300 hover:text-red-500 opacity-0 group-hover/link:opacity-100">
                                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                  </div>
                                ))}
                                <button onClick={() => handleAddLink(mIdx, secIdx)} className="text-[10px] font-bold text-gray-400 hover:text-secondary mt-1 block w-full text-left bg-gray-50 hover:bg-gray-100 p-1.5 rounded transition-colors">
                                  + Add Link to {section.title || 'Section'}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Home Page Products Section (Tabs) */}
              <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                <div className="bg-[#fefaf4] p-6 border-b border-gray-100 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-dark font-serif tracking-wide mb-1">Home Page Product Tabs</h3>
                    <p className="text-[13px] text-gray-500">Create multiple tabs to organize products on the homepage.</p>
                  </div>
                  <button onClick={handleAddProductTab} className="bg-secondary text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-opacity-90 transition-all flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                    Add Tab
                  </button>
                </div>
                <div className="p-8 space-y-8">
                  {(formData.homeProductTabs || []).length === 0 && (
                     <div className="text-center py-6 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
                        No product tabs created yet.
                     </div>
                  )}
                  {(formData.homeProductTabs || []).map((tab, tIdx) => (
                    <div key={tIdx} className="border-2 border-gray-100 rounded-xl p-5 relative bg-white shadow-sm">
                      <button onClick={() => handleRemoveProductTab(tIdx)} className="absolute top-4 right-4 text-red-300 hover:text-red-500 transition-colors">
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                      <div className="mb-4 pr-12">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Tab Title (e.g. Best Sellers)</label>
                        <input type="text" value={tab.tabTitle} onChange={e => handleProductTabTitleChange(tIdx, e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm font-bold focus:border-secondary focus:outline-none" />
                      </div>
                      
                      {/* Render selected products so tags can be edited */}
                      {tab.products?.length > 0 && (
                        <div className="mb-6 bg-blue-50/30 p-4 rounded-xl border border-blue-100">
                           <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block mb-3">Selected Products & Tags</label>
                           <div className="space-y-3">
                             {tab.products.map((tp, pIdx) => {
                               let actualProduct = allProducts.find(p => p._id === tp.product || p._id === tp.product?._id);
                               if(!actualProduct) return null;
                               return (
                                 <div key={pIdx} className="flex flex-wrap md:flex-nowrap items-center gap-4 bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                                    <img src={actualProduct.images?.[0]} alt="" className="w-10 h-10 rounded shrink-0 object-cover" />
                                    <div className="flex-1 min-w-[120px]">
                                       <p className="text-xs font-bold truncate">{actualProduct.name}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <input type="text" value={tp.tagLabel || ''} onChange={e => handleProductTagChange(tIdx, pIdx, 'tagLabel', e.target.value)} placeholder="Badge Text" className="text-xs px-2 py-1.5 border border-gray-200 rounded w-[110px] focus:outline-none focus:border-secondary" />
                                      <input type="color" value={tp.tagColor || '#ffbc00'} onChange={e => handleProductTagChange(tIdx, pIdx, 'tagColor', e.target.value)} className="w-8 h-8 rounded shrink-0 cursor-pointer border-0 p-0" title="Tag Color" />
                                      <button onClick={() => handleToggleProductInTab(tIdx, actualProduct)} className="w-7 h-7 rounded bg-red-50 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors ml-2" title="Remove Product">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                      </button>
                                    </div>
                                 </div>
                               )
                             })}
                           </div>
                        </div>
                      )}

                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Add Products to Tab</label>
                        <ProductSearchSelector 
                           allProducts={allProducts}
                           selectedIds={(tab.products || []).map(p => p.product?._id || p.product)}
                           onToggle={(product) => handleToggleProductInTab(tIdx, product)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center pb-12">
                <button onClick={handleSaveCMS} disabled={loading} className="bg-primary text-white font-bold text-[14px] uppercase tracking-widest px-16 py-4 rounded-full shadow-2xl hover:bg-opacity-95 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50">
                  {loading ? 'Publishing Changes...' : 'Save & Publish Storefront Settings'}
                </button>
              </div>
            </div>

          /* ── Occasions Tab ── */
          ) : activeTab === 'Occasions' ? (
            <div className="max-w-[960px] mx-auto space-y-6 animate-fade-in-up">

              {/* Page header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-dark font-serif tracking-tight">Occasion Sections</h3>
                  <p className="text-[13px] text-gray-500 mt-0.5">Create sections (e.g. "Gifts for Every Occasion") and add multiple occasion cards inside each.</p>
                </div>
                <button
                  onClick={handleAddOccasionSection}
                  className="bg-primary text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-opacity-90 transition-all flex items-center gap-2 shadow-md"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                  Add Section
                </button>
              </div>

              {formData.occasionSections.length === 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-20">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-14 h-14 mx-auto mb-3 text-gray-200">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                  </svg>
                  <p className="text-gray-400 font-medium">No sections yet.</p>
                  <p className="text-gray-300 text-sm mt-1">Click "Add Section" to create your first occasion strip.</p>
                </div>
              )}

              {formData.occasionSections.map((section, sIdx) => (
                <div key={sIdx} className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.04)] overflow-hidden">

                  {/* Section header */}
                  <div className="bg-[#fefaf4] px-6 py-4 border-b border-gray-100 flex items-center gap-4">
                    <div className="w-7 h-7 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center font-bold text-sm shrink-0">
                      {sIdx + 1}
                    </div>
                    <input
                      type="text"
                      value={section.sectionTitle}
                      onChange={e => handleOccasionSectionTitleChange(sIdx, e.target.value)}
                      placeholder="Section Title (e.g. Gifts for Every Occasion)"
                      className="flex-1 bg-transparent text-[15px] font-bold text-dark focus:outline-none placeholder:text-gray-300"
                    />
                    <button
                      onClick={() => handleAddOccasion(sIdx)}
                      className="bg-secondary text-white text-xs font-bold px-3.5 py-2 rounded-lg hover:bg-opacity-90 transition-all flex items-center gap-1.5 shrink-0"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                      Add Occasion
                    </button>
                    <button
                      onClick={() => handleRemoveOccasionSection(sIdx)}
                      className="w-8 h-8 rounded-lg border border-red-100 text-red-400 hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition-colors shrink-0"
                      title="Remove section"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>

                  {/* Occasions grid */}
                  <div className="p-6">
                    {(section.occasions || []).length === 0 ? (
                      <div className="text-center py-8 text-gray-300 border-2 border-dashed border-gray-100 rounded-xl">
                        <p className="text-sm">No occasions in this section yet.</p>
                        <button onClick={() => handleAddOccasion(sIdx)} className="mt-2 text-secondary text-sm font-bold hover:underline">+ Add First Occasion</button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(section.occasions || []).map((occ, oIdx) => (
                          <div key={oIdx} className="p-4 bg-gray-50/70 rounded-xl border border-gray-100 relative group flex gap-3 items-start">
                            <button
                              onClick={() => handleRemoveOccasion(sIdx, oIdx)}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>

                            {/* Image preview */}
                            <div className="w-[60px] h-[60px] rounded-xl bg-white border border-gray-200 overflow-hidden shrink-0 shadow-sm">
                              {occ.imageUrl
                                ? <img src={occ.imageUrl} className="w-full h-full object-cover" alt={occ.label} />
                                : <div className="w-full h-full flex items-center justify-center text-[9px] text-gray-300 text-center px-1">No Image</div>
                              }
                            </div>

                            {/* Fields */}
                            <div className="flex-1 space-y-1.5 min-w-0">
                              <input
                                type="text"
                                value={occ.label}
                                onChange={e => handleOccasionChange(sIdx, oIdx, 'label', e.target.value)}
                                placeholder="Label (e.g. Birthday)"
                                className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-[12px] font-semibold focus:border-secondary focus:outline-none"
                              />
                              <input
                                type="text"
                                value={occ.imageUrl}
                                onChange={e => handleOccasionChange(sIdx, oIdx, 'imageUrl', e.target.value)}
                                placeholder="Image URL"
                                className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-[11px] focus:border-secondary focus:outline-none"
                              />
                              <input
                                type="text"
                                value={occ.redirectUrl}
                                onChange={e => handleOccasionChange(sIdx, oIdx, 'redirectUrl', e.target.value)}
                                placeholder="Redirect URL"
                                className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-[11px] focus:border-secondary focus:outline-none"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {formData.occasionSections.length > 0 && (
                <div className="flex justify-center pb-8">
                  <button
                    onClick={handleSaveCMS}
                    disabled={loading}
                    className="bg-secondary text-white font-bold text-[13px] uppercase tracking-widest px-14 py-4 rounded-full shadow-xl hover:bg-opacity-90 transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save & Publish Occasions'}
                  </button>
                </div>
              )}
            </div>

          ) : activeTab === 'Products' ? (
            <ProductsModule />
          ) : activeTab === 'Categories' ? (
            <CategoriesModule />
          ) : (
            <div className="flex flex-col items-center justify-center h-[50vh] text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 mb-4 opacity-50"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <h3 className="font-serif text-xl tracking-tight text-gray-500">Module Under Construction</h3>
              <p className="text-sm">This administrative section will be available soon.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

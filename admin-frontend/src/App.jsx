import React, { useState, useEffect } from 'react';

function App() {
  const [activeTab, setActiveTab] = useState('CMS');
  const [formData, setFormData] = useState({
    heroBanners: [],
    navMenu: []
  });
  const [loading, setLoading] = useState(false);

  // Fetch Settings on Load
  useEffect(() => {
    fetch('http://localhost:5001/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data) {
          setFormData({
            heroBanners: data.heroBanners || [],
            navMenu: data.navMenu || []
          });
        }
      })
      .catch(err => console.error("Error fetching settings:", err));
  }, []);

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

  // Nav Menu Handlers (3-Level Deep: Menu -> Sections -> Links)
  const handleAddMenu = () => {
    setFormData(prev => ({
      ...prev,
      navMenu: [...prev.navMenu, { label: '', sections: [] }]
    }));
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
    // Ensure sections array exists natively to prevent undefined errors on legacy data
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

  const handleSaveCMS = () => {
    setLoading(true);
    fetch('http://localhost:5001/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        heroBanners: formData.heroBanners,
        navMenu: formData.navMenu
      })
    })
    .then(res => res.json())
    .then(data => {
      alert("Storefront Updated! Header and Carousel changes are now live.");
    })
    .catch(err => console.error(err))
    .finally(() => setLoading(false));
  };

  const sidebarItems = ['Dashboard', 'Orders', 'Products', 'Categories', 'CMS / Pages', 'Settings'];

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

      {/* Main Content Space */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-[#fafafa]">
        {/* Soft Header */}
        <header className="bg-white/60 backdrop-blur-md h-[70px] border-b border-gray-200 flex items-center justify-between px-8 z-10 sticky top-0 shadow-sm">
           <h2 className="text-xl font-bold text-dark font-serif tracking-tight">{activeTab === 'CMS' ? 'CMS / Visual Settings' : activeTab}</h2>
           <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 font-medium">Welcome, Super Admin</span>
              <div className="w-[36px] h-[36px] rounded-full bg-secondary text-white flex items-center justify-center font-bold font-serif shadow-sm">A</div>
           </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          
          {activeTab === 'CMS' ? (
            <div className="max-w-[900px] mx-auto space-y-8 animate-fade-in-up">
              
              {/* Hero Banner Section */}
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
                          {banner.imageUrl ? <img src={banner.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-300 italic">No Preview</div>}
                        </div>
                        <div className="flex-1 grid grid-cols-2 gap-4">
                           <input type="text" value={banner.imageUrl} onChange={(e) => handleBannerChange(index, 'imageUrl', e.target.value)} className="col-span-2 w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:border-secondary focus:outline-none" placeholder="Image URL" />
                           <input type="text" value={banner.linkUrl} onChange={(e) => handleBannerChange(index, 'linkUrl', e.target.value)} className="col-span-2 w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:border-secondary focus:outline-none" placeholder="Link URL (e.g. /product/...)" />
                        </div>
                      </div>
                    ))}
                 </div>
              </div>

              {/* Navigation Menu Builder */}
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
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Main Label (e.g. Birthday)</label>
                              <input type="text" value={menu.label} onChange={(e) => handleMenuChange(mIdx, 'label', e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-bold focus:border-secondary focus:outline-none" />
                           </div>
                           <div className="flex-1">
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Menu Type</label>
                              <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[10px] font-bold text-gray-400 uppercase">Dropdown Panel</div>
                           </div>
                        </div>

                        {/* Sections & Links (3-Level Deep) */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-4">
                           <div className="flex justify-between items-center mb-2">
                              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Dropdown Sections (Columns)</span>
                              <button onClick={() => handleAddSection(mIdx)} className="text-[10px] font-bold text-secondary hover:underline">+ Add Section</button>
                           </div>
                           
                           {/* Render Sections */}
                           <div className="space-y-4">
                             {(menu.sections || []).map((section, secIdx) => (
                               <div key={secIdx} className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm relative group/sec">
                                  <div className="flex items-center gap-2 mb-3">
                                     <input 
                                       type="text" 
                                       value={section.title} 
                                       onChange={(e) => handleSectionTitleChange(mIdx, secIdx, e.target.value)} 
                                       placeholder="Section Title (e.g. Blossom Arrangement)" 
                                       className="flex-1 text-xs font-bold border-b border-gray-100 pb-1 focus:outline-none focus:border-secondary" 
                                     />
                                     <button onClick={() => handleRemoveSection(mIdx, secIdx)} className="text-red-300 hover:text-red-500 transition-opacity">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                     </button>
                                  </div>

                                  {/* Render Links within Section */}
                                  <div className="pl-2 space-y-2 border-l-2 border-gray-50">
                                     {(section.links || []).map((link, lIdx) => (
                                       <div key={lIdx} className="flex gap-2 items-center group/link">
                                          <input type="text" value={link.label} onChange={(e) => handleLinkChange(mIdx, secIdx, lIdx, 'label', e.target.value)} placeholder="Link Label" className="flex-1 text-[11px] bg-gray-50 px-2 py-1.5 rounded focus:outline-none" />
                                          <input type="text" value={link.url} onChange={(e) => handleLinkChange(mIdx, secIdx, lIdx, 'url', e.target.value)} placeholder="Link URL" className="flex-1 text-[11px] bg-gray-50 px-2 py-1.5 rounded focus:outline-none" />
                                          <button onClick={() => handleRemoveLink(mIdx, secIdx, lIdx)} className="text-red-300 hover:text-red-500 opacity-0 group-hover/link:opacity-100 transition-opacity">
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

              <div className="flex justify-center pb-12">
                 <button 
                   onClick={handleSaveCMS}
                   disabled={loading}
                   className="bg-primary text-white font-bold text-[14px] uppercase tracking-widest px-16 py-4 rounded-full shadow-2xl hover:bg-opacity-95 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50"
                 >
                   {loading ? 'Publishing Changes...' : 'Save & Publish Storefront Settings'}
                 </button>
              </div>

            </div>
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

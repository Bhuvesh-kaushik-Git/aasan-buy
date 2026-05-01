import React, { useState, useEffect, useRef } from 'react';
import ImageUploader from './components/ImageUploader';

const API_URL = import.meta.env.VITE_API_URL;

const CurationModal = ({ isOpen, onClose, onSave, allProducts, seedProduct, initialIds = [], adminToken }) => {
  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedIds(initialIds);
      setSearch('');
      setAiSuggestions([]);
      if (seedProduct && initialIds.length === 0) {
        handleFetchAI();
      }
    }
  }, [isOpen]);

  const handleFetchAI = async () => {
    if (!seedProduct) return;
    setLoadingAI(true);
    try {
      const res = await fetch(`${API_URL}/ai/suggest`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          productId: seedProduct._id,
          currentName: seedProduct.name,
          currentDescription: seedProduct.description,
          currentCategories: seedProduct.categories
        })
      });
      const data = await res.json();
      if (data.suggestedIds) {
        setAiSuggestions(data.suggestedIds);
        // Automatically select AI suggestions if list is empty
        setSelectedIds(prev => [...new Set([...prev, ...data.suggestedIds])]);
      }
    } catch (err) {
      console.error("AI fetch failed:", err);
    } finally {
      setLoadingAI(false);
    }
  };

  if (!isOpen) return null;

  const handleToggle = (productId) => {
    const pid = productId.toString();
    setSelectedIds(prev => prev.includes(pid) ? prev.filter(id => id !== pid) : [...prev, pid]);
  };

  const selectedProducts = allProducts.filter(p => selectedIds.includes(p._id?.toString()));
  const filtered = allProducts.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) && !selectedIds.includes(p._id?.toString()));
  const displayResults = search ? filtered : filtered.slice(0, 12);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-sans animate-fade-in">
      <div className="absolute inset-0 bg-dark/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white rounded-[40px] shadow-premium w-full max-w-5xl overflow-hidden animate-fade-in-up flex flex-col h-[85vh]">
        
        {/* Header */}
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
          <div>
            <h3 className="text-2xl font-black text-dark tracking-tighter flex items-center gap-2">
               ✨ AI-Powered Curation
               {seedProduct && <span className="text-sm font-bold text-primary bg-primary/5 px-3 py-1 rounded-full uppercase ml-2">Context: {seedProduct.name}</span>}
            </h3>
            <p className="text-sm text-gray-400 font-medium">Review AI recommendations or search for manual additions.</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl text-gray-400 hover:text-red-500 border border-gray-100 shadow-soft transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-10">
          
          <div className="relative group max-w-2xl">
              <input 
                type="text" 
                placeholder="Search catalog to add more..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-gray-50 border-2 border-transparent rounded-[24px] px-12 py-4 text-sm font-bold focus:bg-white focus:border-primary focus:outline-none transition-all shadow-soft group-hover:shadow-premium"
              />
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
             {/* Selected & AI Recs */}
             <div className="space-y-6">
                <div className="flex items-center justify-between">
                   <h4 className="text-[11px] font-black text-secondary uppercase tracking-[0.3em]">Current Selection ({selectedIds.length})</h4>
                   {seedProduct && !loadingAI && aiSuggestions.length === 0 && (
                      <button onClick={handleFetchAI} className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest">Re-Generate suggestions</button>
                   )}
                </div>
                
                <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                   {loadingAI && <div className="p-10 text-center animate-pulse"><p className="text-sm font-black text-primary">🧠 AI is analyzing best pairings...</p></div>}
                   {selectedProducts.map(p => (
                     <div key={p._id} className="flex items-center gap-4 p-4 bg-secondary/5 border-2 border-secondary/10 rounded-3xl group">
                        <img src={p.images?.[0]} className="w-12 h-12 rounded-xl object-cover bg-white" />
                        <div className="flex-1">
                           <p className="text-xs font-black text-dark truncate">{p.name}</p>
                           <p className="text-[10px] text-secondary font-bold">Recommended Pick</p>
                        </div>
                        <button onClick={() => handleToggle(p._id)} className="w-8 h-8 flex items-center justify-center bg-white text-secondary rounded-xl hover:bg-secondary hover:text-white transition-all shadow-sm">✕</button>
                     </div>
                   ))}
                   {!loadingAI && selectedProducts.length === 0 && (
                     <div className="p-10 text-center border-2 border-dashed border-gray-100 rounded-3xl">
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">No products selected yet</p>
                     </div>
                   )}
                </div>
             </div>

             {/* Catalog */}
             <div className="space-y-6">
                <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em]">{search ? 'Search Results' : 'Quick Add Catalog'}</h4>
                <div className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                   {displayResults.map(p => (
                     <div 
                        key={p._id} 
                        onClick={() => handleToggle(p._id)}
                        className="p-3 bg-white border-2 border-gray-50 rounded-[32px] hover:border-primary/20 hover:shadow-soft cursor-pointer transition-all group relative"
                     >
                        <div className="aspect-square rounded-2xl overflow-hidden mb-3">
                           <img src={p.images?.[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <h5 className="text-[10px] font-black text-dark truncate px-1">{p.name}</h5>
                        <div className="absolute top-4 right-4 w-6 h-6 bg-white/90 backdrop-blur rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm">
                           <span className="text-primary font-bold">+</span>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
           <div className="flex gap-4">
              <button 
                onClick={() => onSave(selectedIds)}
                className="bg-primary text-white font-black text-[13px] uppercase tracking-[0.2em] px-12 py-5 rounded-[24px] shadow-2xl shadow-primary/30 hover:brightness-110 transition-all transform active:scale-95"
              >
                Confirm Curation
              </button>
              <button onClick={onClose} className="px-8 py-5 rounded-[24px] text-xs font-black text-gray-400 hover:text-dark transition-all">Cancel</button>
           </div>
        </div>
      </div>
    </div>
  );
};

const ProductSearchSelector = ({ allProducts, selectedIds, onToggle }) => {
  const [search, setSearch] = useState('');
  
  const selectedProducts = allProducts.filter(p => selectedIds.some(sid => (sid?._id || sid)?.toString() === p._id?.toString()));
  const filtered = allProducts.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) && !selectedIds.some(sid => (sid?._id || sid)?.toString() === p._id?.toString()));
  const displayResults = search ? filtered : filtered.slice(0, 6);

  return (
    <div className="bg-white border-2 border-gray-50 p-6 rounded-[24px] mt-4 shadow-sm hover:shadow-premium transition-all duration-300">
       <div className="relative mb-6 group">
          <input 
             type="text" 
             placeholder="Search products to add..." 
             value={search}
             onChange={e => setSearch(e.target.value)}
             className="w-full text-xs font-bold px-10 py-3 bg-gray-50 border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-secondary/20 transition-all outline-none"
          />
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
       </div>

       <div className="space-y-6 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
          {/* Selected Section */}
          {selectedProducts.length > 0 && (
            <div className="space-y-3">
               <h4 className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-2 px-1">Currently Selected</h4>
               <div className="grid grid-cols-1 gap-2">
                  {selectedProducts.map(p => (
                    <div key={p._id} className="flex items-center gap-3 p-3 bg-secondary/5 border-2 border-secondary/10 rounded-2xl animate-fade-in group">
                       <img src={p.images?.[0]} className="w-10 h-10 rounded-lg object-cover bg-white" />
                       <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-black text-dark truncate">{p.name}</p>
                          <p className="text-[9px] text-secondary font-bold">₹{p.price.toLocaleString()}</p>
                       </div>
                       <button onClick={() => onToggle(p)} className="p-2 text-secondary hover:bg-secondary hover:text-white rounded-xl transition-all">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                       </button>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {/* Catalog/Search Section */}
          <div className="space-y-3">
             <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">
                {search ? `Results for "${search}"` : "Product Catalog"}
             </h4>
             <div className="grid grid-cols-1 gap-2">
                {displayResults.length === 0 ? (
                  <div className="p-10 text-center bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100">
                     <p className="text-xs font-black text-gray-300 uppercase tracking-widest">No matching products</p>
                  </div>
                ) : (
                  displayResults.map(p => (
                    <div 
                      key={p._id} 
                      onClick={() => onToggle(p)}
                      className="flex items-center gap-3 p-3 bg-white border-2 border-gray-50 rounded-2xl hover:border-secondary/20 hover:shadow-soft cursor-pointer transition-all group"
                    >
                       <img src={p.images?.[0]} className="w-10 h-10 rounded-lg object-cover bg-gray-50" />
                       <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-black text-dark group-hover:text-secondary transition-colors truncate">{p.name}</p>
                          <p className="text-[9px] text-gray-400 font-bold group-hover:text-secondary/60 transition-colors">₹{p.price.toLocaleString()}</p>
                       </div>
                       <div className="w-6 h-6 rounded-full border-2 border-gray-100 flex items-center justify-center group-hover:border-secondary transition-all">
                          <div className="w-2 h-2 rounded-full bg-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                       </div>
                    </div>
                  ))
                )}
             </div>
          </div>
       </div>

       {allProducts.length === 0 && (
         <div className="p-8 text-center bg-amber-50 rounded-3xl border border-amber-100">
            <p className="text-xs font-black text-amber-600 uppercase tracking-widest flex items-center justify-center gap-2">
               <span className="animate-pulse">⚠️</span> No Products Found
            </p>
            <p className="text-[10px] text-amber-500 mt-1 font-medium italic">Make sure products are added to your database.</p>
         </div>
       )}
    </div>
  );
};

const CMSModule = ({ adminToken }) => {
  const [formData, setFormData] = useState({
    heroBanners: [],
    navMenu: [],
    occasionSections: [],
    homeProductTabs: [],
    footer: { sections: [], socialLinks: {}, copyright: '' },
    productDetailsRows: []
  });
  const [loading, setLoading] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [editingNavIdx, setEditingNavIdx] = useState(null);

  // Modal State
  const [curationModal, setCurationModal] = useState({ open: false, rowIdx: null, initialIds: [], seedProduct: null });

  useEffect(() => {
    if (!adminToken) return;
    fetch(`${API_URL}/products?limit=200&page=1`, {
       headers: { 'Authorization': `Bearer ${adminToken}` }
    })
      .then(res => res.json())
      .then(data => setAllProducts(data.products || []))
      .catch(err => console.error('Error fetching products:', err));
  }, [adminToken]);

  useEffect(() => {
    fetch(`${API_URL}/settings`)
      .then(res => res.json())
      .then(data => {
        if (data) {
          setFormData({
            heroBanners: data.heroBanners || [],
            navMenu: data.navMenu || [],
            occasionSections: data.occasionSections || [],
            homeProductTabs: data.homeProductTabs || [],
            footer: data.footer || { sections: [], socialLinks: {}, copyright: '' },
            productDetailsRows: data.productDetailsRows || []
          });
        }
      })
      .catch(err => console.error('Error fetching settings:', err));
  }, []);

  const handleSaveCMS = () => {
    setLoading(true);
    fetch(`${API_URL}/settings`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(formData)
    })
    .then(res => res.json())
    .then((data) => {
      if (data.error) throw new Error(data.error);
      alert("Settings saved and published!");
    })
    .catch(err => alert("Error: " + err.message))
    .finally(() => setLoading(false));
  };

  // ── Handlers ──
  const handleAddBanner = () => setFormData(p => ({ ...p, heroBanners: [...p.heroBanners, { title: '', subtitle: '', imageUrl: '', linkUrl: '#' }] }));
  const handleRemoveBanner = (idx) => {
    const updated = [...formData.heroBanners]; updated.splice(idx, 1);
    setFormData(p => ({ ...p, heroBanners: updated }));
  };
  const handleBannerChange = (idx, f, v) => {
    const updated = [...formData.heroBanners]; updated[idx][f] = v;
    setFormData(p => ({ ...p, heroBanners: updated }));
  };

  const handleAddOccasionSection = () => setFormData(p => ({ ...p, occasionSections: [...p.occasionSections, { sectionTitle: '', occasions: [] }] }));
  const handleRemoveOccasionSection = (idx) => {
    const updated = [...formData.occasionSections]; updated.splice(idx, 1);
    setFormData(p => ({ ...p, occasionSections: updated }));
  };
  const handleOccasionSectionTitleChange = (idx, v) => {
    const updated = [...formData.occasionSections]; updated[idx].sectionTitle = v;
    setFormData(p => ({ ...p, occasionSections: updated }));
  };
  const handleAddOccasion = (sIdx) => {
    const updated = [...formData.occasionSections];
    updated[sIdx].occasions = [...(updated[sIdx].occasions || []), { label: '', imageUrl: '', redirectUrl: '', products: [] }];
    setFormData(p => ({ ...p, occasionSections: updated }));
  };
  const handleRemoveOccasion = (sIdx, oIdx) => {
    const updated = [...formData.occasionSections]; updated[sIdx].occasions.splice(oIdx, 1);
    setFormData(p => ({ ...p, occasionSections: updated }));
  };
  const handleOccasionChange = (sIdx, oIdx, f, v) => {
    const updated = [...formData.occasionSections]; updated[sIdx].occasions[oIdx][f] = v;
    setFormData(p => ({ ...p, occasionSections: updated }));
  };

  const handleToggleProductInOccasion = (sIdx, oIdx, productObj) => {
    const updated = [...formData.occasionSections];
    const products = updated[sIdx].occasions[oIdx].products || [];
    const existsIndex = products.findIndex(p => (p?._id || p)?.toString() === productObj._id?.toString());
    if (existsIndex > -1) products.splice(existsIndex, 1);
    else products.push(productObj._id);
    updated[sIdx].occasions[oIdx].products = products;
    setFormData(p => ({ ...p, occasionSections: updated }));
  };

  // Nav Menu Handlers
  const handleAddMenu = () => setFormData(p => ({ ...p, navMenu: [...p.navMenu, { label: '', sections: [] }] }));
  const handleRemoveMenu = (idx) => {
    const updated = [...formData.navMenu]; updated.splice(idx, 1);
    setFormData(p => ({ ...p, navMenu: updated }));
  };
  const handleMenuChange = (idx, f, v) => {
    const updated = [...formData.navMenu]; updated[idx][f] = v;
    setFormData(p => ({ ...p, navMenu: updated }));
  };
  const handleAddSection = (mIdx) => {
    const updated = [...formData.navMenu];
    if (!updated[mIdx].sections) updated[mIdx].sections = [];
    updated[mIdx].sections.push({ title: '', links: [] });
    setFormData(p => ({ ...p, navMenu: updated }));
  };
  const handleRemoveSection = (mIdx, sIdx) => {
    const updated = [...formData.navMenu]; updated[mIdx].sections.splice(sIdx, 1);
    setFormData(p => ({ ...p, navMenu: updated }));
  };
  const handleSectionTitleChange = (mIdx, sIdx, v) => {
    const updated = [...formData.navMenu]; updated[mIdx].sections[sIdx].title = v;
    setFormData(p => ({ ...p, navMenu: updated }));
  };
  const handleAddLink = (mIdx, sIdx) => {
    const updated = [...formData.navMenu];
    if (!updated[mIdx].sections[sIdx].links) updated[mIdx].sections[sIdx].links = [];
    updated[mIdx].sections[sIdx].links.push({ label: '', url: '' });
    setFormData(p => ({ ...p, navMenu: updated }));
  };
  const handleRemoveLink = (mIdx, sIdx, lIdx) => {
    const updated = [...formData.navMenu]; updated[mIdx].sections[sIdx].links.splice(lIdx, 1);
    setFormData(p => ({ ...p, navMenu: updated }));
  };
  const handleLinkChange = (mIdx, sIdx, lIdx, f, v) => {
    const updated = [...formData.navMenu]; updated[mIdx].sections[sIdx].links[lIdx][f] = v;
    setFormData(p => ({ ...p, navMenu: updated }));
  };

  // Home Product Tabs Handlers
  const handleAddProductTab = () => setFormData(p => ({ ...p, homeProductTabs: [...(p.homeProductTabs || []), { tabTitle: '', products: [] }] }));
  const handleRemoveProductTab = (tIdx) => {
    const updated = [...formData.homeProductTabs]; updated.splice(tIdx, 1);
    setFormData(p => ({ ...p, homeProductTabs: updated }));
  };
  const handleProductTabTitleChange = (tIdx, v) => {
    const updated = [...formData.homeProductTabs]; updated[tIdx].tabTitle = v;
    setFormData(p => ({ ...p, homeProductTabs: updated }));
  };
  const handleToggleProductInTab = (tIdx, productObj) => {
    const updated = [...formData.homeProductTabs];
    const products = updated[tIdx].products || [];
    const existsIndex = products.findIndex(p => (p.product?._id || p.product || p) === productObj._id);
    if (existsIndex > -1) products.splice(existsIndex, 1);
    else products.push({ product: productObj._id, tagLabel: '', tagColor: '#ffbc00' });
    updated[tIdx].products = products;
    setFormData(p => ({ ...p, homeProductTabs: updated }));
  };

  // Footer & Suggestion Rows Handlers
  const handleAddFooterSection = () => setFormData(p => ({ ...p, footer: { ...p.footer, sections: [...(p.footer.sections || []), { title: 'New Section', links: [] }] } }));
  const handleRemoveFooterSection = (idx) => {
    const updated = [...(formData.footer.sections || [])]; updated.splice(idx, 1);
    setFormData(p => ({ ...p, footer: { ...p.footer, sections: updated } }));
  };
  const handleAddFooterLink = (sIdx) => {
    const updated = [...(formData.footer.sections || [])];
    if (!updated[sIdx].links) updated[sIdx].links = [];
    updated[sIdx].links.push({ label: '', url: '' });
    setFormData(p => ({ ...p, footer: { ...p.footer, sections: updated } }));
  };
  const handleFooterLinkChange = (sIdx, lIdx, f, v) => {
    const updated = [...(formData.footer.sections || [])];
    updated[sIdx].links[lIdx][f] = v;
    setFormData(p => ({ ...p, footer: { ...p.footer, sections: updated } }));
  };

  const handleAddSuggestionRow = () => setFormData(p => ({ ...p, productDetailsRows: [...(p.productDetailsRows || []), { rowTitle: 'New Row', type: 'manual', seedProduct: '', items: [] }] }));
  const handleRemoveSuggestionRow = (idx) => {
    const updated = [...(formData.productDetailsRows || [])]; updated.splice(idx, 1);
    setFormData(p => ({ ...p, productDetailsRows: updated }));
  };

  const handleOpenCuration = (rIdx) => {
    const row = formData.productDetailsRows[rIdx];
    const seed = allProducts.find(p => p._id === row.seedProduct);
    setCurationModal({ open: true, rowIdx: rIdx, initialIds: row.items || [], seedProduct: seed });
  };

  const handleSaveCuration = (ids) => {
    const updated = [...formData.productDetailsRows];
    updated[curationModal.rowIdx].items = ids;
    setFormData(p => ({ ...p, productDetailsRows: updated }));
    setCurationModal({ open: false, rowIdx: null, initialIds: [], seedProduct: null });
  };

  return (
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
                   <div className="flex gap-2 w-full">
                       <input type="text" value={banner.imageUrl} onChange={e => handleBannerChange(index, 'imageUrl', e.target.value)} placeholder="Image URL" className="flex-1 text-[10px] bg-white px-2 py-1 rounded border-0 shadow-sm" />
                       <label className="cursor-pointer bg-primary/10 text-primary hover:bg-primary hover:text-white px-2 py-1 rounded text-[10px] font-bold transition-colors">
                         Upload
                         <input type="file" accept="image/*" className="hidden" 
                           onChange={async e => {
                              const file = e.target.files[0]; if(!file) return;
                              const fd = new FormData(); fd.append('image', file);
                              try{
                                 const r = await fetch(`${API_URL}/upload`, { method:'POST', headers:{'Authorization':`Bearer ${adminToken}`}, body:fd});
                                 const d = await r.json(); if(r.ok) handleBannerChange(index, 'imageUrl', d.url);
                              } catch(err) { console.error(err); }
                           }} 
                         />
                       </label>
                   </div>
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
          <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {formData.navMenu.map((menu, mIdx) => (
              <div key={mIdx} className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <input type="text" value={menu.label} onChange={e => handleMenuChange(mIdx, 'label', e.target.value)} className="bg-white px-3 py-1.5 rounded-lg text-xs font-black border-0 w-[150px]" />
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{(menu.sections || []).length} Columns</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <button onClick={() => setEditingNavIdx(editingNavIdx === mIdx ? null : mIdx)} className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${editingNavIdx === mIdx ? 'bg-primary text-white' : 'bg-white text-primary border border-primary/20'}`}>
                         {editingNavIdx === mIdx ? 'Close' : 'Manage Submenu'}
                      </button>
                      <button onClick={() => handleRemoveMenu(mIdx)} className="text-red-400 hover:text-red-600 px-2">✕</button>
                   </div>
                </div>

                {editingNavIdx === mIdx && (
                  <div className="ml-8 p-6 bg-white rounded-[24px] border-2 border-primary/5 space-y-6 animate-fade-in">
                     <div className="flex items-center justify-between">
                        <h4 className="text-[11px] font-black text-primary uppercase tracking-[0.2em]">{menu.label} Columns</h4>
                        <button onClick={() => handleAddSection(mIdx)} className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border border-emerald-100">+ Add Column</button>
                     </div>

                     <div className="grid grid-cols-1 gap-4">
                        {(menu.sections || []).map((sec, sIdx) => (
                          <div key={sIdx} className="p-5 bg-gray-50/50 rounded-2xl border border-gray-100 space-y-4">
                             <div className="flex items-center gap-4">
                                <input type="text" value={sec.title} onChange={e => handleSectionTitleChange(mIdx, sIdx, e.target.value)} className="flex-1 bg-white px-4 py-2 rounded-xl text-xs font-black border-0" placeholder="Column Title (e.g. Occasions)" />
                                <button onClick={() => handleRemoveSection(mIdx, sIdx)} className="text-red-300 hover:text-red-500">✕</button>
                             </div>

                             <div className="pl-4 space-y-3">
                                <div className="flex items-center justify-between mb-2">
                                   <button onClick={() => handleAddLink(mIdx, sIdx)} className="text-primary text-[9px] font-black uppercase tracking-widest hover:underline">+ Add Link</button>
                                </div>
                                {(sec.links || []).map((link, lIdx) => (
                                  <div key={lIdx} className="flex items-center gap-3 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
                                     <input type="text" value={link.label} onChange={e => handleLinkChange(mIdx, sIdx, lIdx, 'label', e.target.value)} className="w-1/3 bg-transparent text-[11px] font-bold border-0" placeholder="Label" />
                                     <input type="text" value={link.url} onChange={e => handleLinkChange(mIdx, sIdx, lIdx, 'url', e.target.value)} className="flex-1 bg-transparent text-[10px] text-gray-400 border-0" placeholder="/url" />
                                     <button onClick={() => handleRemoveLink(mIdx, sIdx, lIdx)} className="text-gray-300 hover:text-red-400">✕</button>
                                  </div>
                                ))}
                             </div>
                          </div>
                        ))}
                     </div>
                  </div>
                )}
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
                        <div key={oIdx} className="w-[300px] shrink-0 bg-white p-4 rounded-[32px] shadow-sm border border-gray-100 relative group flex flex-col gap-4">
                           <button onClick={() => handleRemoveOccasion(sIdx, oIdx)} className="absolute -top-1 -right-1 bg-red-500 text-white w-6 h-6 rounded-full text-[10px] opacity-0 group-hover:opacity-100 shadow-lg z-10">✕</button>
                           <img src={occ.imageUrl} className="w-full h-32 object-cover rounded-2xl" />
                           <div className="space-y-2">
                              <input type="text" value={occ.label} onChange={e => handleOccasionChange(sIdx, oIdx, 'label', e.target.value)} className="w-full text-sm font-black border-0 bg-gray-50 rounded-xl px-3 py-2" placeholder="Label (e.g. Birthdays)" />
                              <div className="flex gap-2">
                                 <input type="text" value={occ.imageUrl} onChange={e => handleOccasionChange(sIdx, oIdx, 'imageUrl', e.target.value)} className="flex-1 text-[10px] text-gray-400 border-0 bg-gray-50 rounded-xl px-3 py-1.5" placeholder="Image URL" />
                                 <label className="cursor-pointer flex items-center justify-center bg-gray-200 hover:bg-secondary hover:text-white px-3 rounded-xl text-[10px] font-bold transition-colors">
                                    Upload
                                    <input type="file" accept="image/*" className="hidden" 
                                      onChange={async e => {
                                         const file = e.target.files[0]; if(!file) return;
                                         const fd = new FormData(); fd.append('image', file);
                                         try{
                                            const r = await fetch(`${API_URL}/upload`, { method:'POST', headers:{'Authorization':`Bearer ${adminToken}`}, body:fd});
                                            const d = await r.json(); if(r.ok) handleOccasionChange(sIdx, oIdx, 'imageUrl', d.url);
                                         } catch(err) { console.error(err); }
                                      }} 
                                    />
                                 </label>
                              </div>
                           </div>
                           
                           <div className="border-t border-gray-50 pt-4">
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Curation ({(occ.products || []).length})</p>
                              <ProductSearchSelector 
                                 allProducts={allProducts}
                                 selectedIds={occ.products || []}
                                 onToggle={(product) => handleToggleProductInOccasion(sIdx, oIdx, product)}
                              />
                           </div>
                        </div>
                     ))}
                 </div>
              </div>
            ))}
         </div>
      </div>

      {/* Footer Designer */}
      <div className="bg-white rounded-[40px] shadow-premium border border-black/5 p-10">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="font-heading font-black text-2xl text-dark">Global Footer Designer</h3>
              <p className="text-sm text-gray-400 font-medium">Customize the footer links, social media, and copyright.</p>
            </div>
            <button onClick={handleAddFooterSection} className="bg-primary text-white font-black text-xs px-6 py-2.5 rounded-xl transition-all hover:shadow-lg">+ New Section</button>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {formData.footer?.sections?.map((sec, sIdx) => (
               <div key={sIdx} className="p-5 bg-gray-50 rounded-[24px] border border-gray-100 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                     <input type="text" value={sec.title} onChange={e => { const u = [...formData.footer.sections]; u[sIdx].title = e.target.value; setFormData(p => ({...p, footer: {...p.footer, sections: u}})); }} className="bg-white px-3 py-1.5 rounded-lg text-xs font-black border-0 w-full mr-2" placeholder="Section Title" />
                     <button onClick={() => handleRemoveFooterSection(sIdx)} className="text-red-400">✕</button>
                  </div>
                  <div className="space-y-2">
                     {(sec.links || []).map((link, lIdx) => (
                        <div key={lIdx} className="flex gap-2 bg-white p-2 rounded-xl text-[10px]">
                           <input type="text" value={link.label} onChange={e => handleFooterLinkChange(sIdx, lIdx, 'label', e.target.value)} placeholder="Label" className="w-1/3 border-0 p-0" />
                           <input type="text" value={link.url} onChange={e => handleFooterLinkChange(sIdx, lIdx, 'url', e.target.value)} placeholder="URL" className="flex-1 border-0 p-0 text-gray-400" />
                        </div>
                     ))}
                     <button onClick={() => handleAddFooterLink(sIdx)} className="text-[9px] font-black uppercase text-primary tracking-widest mt-2 hover:underline">+ Add Link</button>
                  </div>
               </div>
            ))}
         </div>
         <div className="bg-gray-50 p-6 rounded-[24px] grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
               <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block ml-1">Social Ecosystem</label>
               <div className="grid grid-cols-1 gap-2">
                  {['instagram', 'facebook', 'twitter', 'youtube'].map(plat => (
                     <div key={plat} className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-gray-100">
                        <span className="text-[10px] font-bold text-dark w-20 capitalize">{plat}</span>
                        <input 
                           type="text" 
                           value={formData.footer?.socialLinks?.[plat] || ''} 
                           onChange={e => setFormData(p => ({...p, footer: {...p.footer, socialLinks: {...p.footer.socialLinks, [plat]: e.target.value}}}))} 
                           placeholder="https://..." 
                           className="flex-1 text-[10px] text-gray-500 border-0 p-0" 
                        />
                     </div>
                  ))}
               </div>
            </div>
            <div className="space-y-4">
               <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block ml-1">Legal & Branding</label>
               <textarea 
                  value={formData.footer?.copyright || ''} 
                  onChange={e => setFormData(p => ({...p, footer: {...p.footer, copyright: e.target.value}}))} 
                  className="w-full h-32 bg-white px-4 py-4 rounded-[24px] border border-gray-100 text-xs font-medium focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                  placeholder="Copyright text..."
               />
            </div>
         </div>
      </div>

      {/* Product Detail Rows */}
      <div className="bg-white rounded-[40px] shadow-premium border border-black/5 p-10">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="font-heading font-black text-2xl text-dark">Detail Page Intelligence</h3>
              <p className="text-sm text-gray-400 font-medium">Configure recommendation strips for product pages.</p>
            </div>
            <button onClick={handleAddSuggestionRow} className="bg-emerald-50 text-emerald-600 font-black text-xs px-6 py-2.5 rounded-xl transition-all hover:bg-emerald-100 shadow-sm border border-emerald-100">+ New Suggestion Row</button>
         </div>
         <div className="space-y-8">
            {formData.productDetailsRows?.map((row, rIdx) => (
               <div key={rIdx} className="p-6 bg-gray-50 rounded-[32px] border border-gray-100 relative group">
                  <button onClick={() => handleRemoveSuggestionRow(rIdx)} className="absolute -top-1 -right-1 bg-red-500 text-white w-6 h-6 rounded-full text-[10px] opacity-0 group-hover:opacity-100 shadow-lg">✕</button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                     <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Title & Persona</label>
                        <input type="text" value={row.rowTitle} onChange={e => { const u = [...formData.productDetailsRows]; u[rIdx].rowTitle = e.target.value; setFormData(p => ({...p, productDetailsRows: u})); }} className="w-full bg-white px-6 py-3 rounded-2xl font-black text-sm border-0" placeholder="Row Title (e.g. Recently Viewed)" />
                     </div>
                     <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Intelligence Type</label>
                        <select value={row.type} onChange={e => { const u = [...formData.productDetailsRows]; u[rIdx].type = e.target.value; setFormData(p => ({...p, productDetailsRows: u})); }} className="w-full bg-white px-6 py-3 rounded-2xl font-black text-xs border-0 outline-none">
                           <option value="manual">Manual Curated (Static List)</option>
                           <option value="ai">AI Recommendation (Dynamic per product)</option>
                           <option value="category">Category Match (Same category)</option>
                           <option value="trending">Global Trending (Most sold)</option>
                        </select>
                     </div>
                  </div>

                  <div className="border-t border-gray-200/50 pt-8 flex items-center justify-between">
                     <div className="flex-1 space-y-4 pr-10">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Context Product (Source for AI)</label>
                        <select 
                           value={row.seedProduct || ''} 
                           onChange={e => { const u = [...formData.productDetailsRows]; u[rIdx].seedProduct = e.target.value; setFormData(p => ({...p, productDetailsRows: u})); }} 
                           className="w-full bg-white px-6 py-4 rounded-2xl font-black text-xs border-0 outline-none shadow-soft"
                        >
                           <option value="">No Context - Manual Search Only</option>
                           {allProducts.map(p => (
                              <option key={p._id} value={p._id}>{p.name}</option>
                           ))}
                        </select>
                     </div>
                     <div className="shrink-0 pt-6">
                        <button 
                           onClick={() => handleOpenCuration(rIdx)}
                           className="bg-primary text-white font-black text-[11px] uppercase tracking-widest px-8 py-5 rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-all flex items-center gap-3"
                        >
                           <span className="text-lg">✨</span> Curate Products 
                           <span className="bg-white/20 px-3 py-1 rounded-full text-[9px]">{(row.items || []).length} Items</span>
                        </button>
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </div>

      <CurationModal 
        isOpen={curationModal.open}
        onClose={() => setCurationModal({ ...curationModal, open: false })}
        onSave={handleSaveCuration}
        allProducts={allProducts}
        seedProduct={curationModal.seedProduct}
        initialIds={curationModal.initialIds}
        adminToken={adminToken}
      />
    </div>
  );
};

export default CMSModule;

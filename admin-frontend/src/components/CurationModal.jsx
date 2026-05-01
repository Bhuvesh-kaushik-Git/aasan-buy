import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

const CurationModal = ({ isOpen, onClose, onSave, allProducts, seedProduct, initialIds = [], adminToken }) => {
  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedIds(initialIds.map(id => id?._id || id));
      setSearch('');
      setAiSuggestions([]);
      if (seedProduct && initialIds.length === 0) {
        handleFetchAI();
      }
    }
  }, [isOpen, initialIds, seedProduct]);

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
      <div className="absolute inset-0 bg-[#0a0a0a]/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-5xl overflow-hidden animate-fade-in-up flex flex-col h-[85vh]">
        
        {/* Header */}
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
          <div>
            <h3 className="text-2xl font-black text-dark tracking-tighter flex items-center gap-2">
               ✨ Smart Curation Mode
               {seedProduct && <span className="text-sm font-bold text-primary bg-primary/5 px-3 py-1 rounded-full uppercase ml-2">Context: {seedProduct.name}</span>}
            </h3>
            <p className="text-sm text-gray-400 font-medium">Build your perfect collection with AI assistance.</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl text-gray-400 hover:text-red-500 border border-gray-100 shadow-sm transition-all focus:outline-none">
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
                className="w-full bg-gray-50 border-2 border-transparent rounded-[24px] px-12 py-4 text-sm font-bold focus:bg-white focus:border-primary focus:outline-none transition-all shadow-sm group-hover:shadow-md"
              />
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
             {/* Selected & AI Recs */}
             <div className="space-y-6">
                <div className="flex items-center justify-between">
                   <h4 className="text-[11px] font-black text-secondary uppercase tracking-[0.3em]">Current Selection ({selectedIds.length})</h4>
                   {seedProduct && !loadingAI && aiSuggestions.length === 0 && (
                      <button onClick={handleFetchAI} className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest">Refresh Suggestions</button>
                   )}
                </div>
                
                <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                   {loadingAI && <div className="p-10 text-center animate-pulse"><p className="text-sm font-black text-primary italic">Brainstorming combinations...</p></div>}
                   {selectedProducts.map(p => (
                     <div key={p._id} className="flex items-center gap-4 p-4 bg-secondary/5 border-2 border-secondary/10 rounded-3xl group">
                        <img src={p.images?.[0]} className="w-12 h-12 rounded-xl object-cover bg-white shadow-sm" />
                        <div className="flex-1">
                           <p className="text-xs font-black text-dark truncate">{p.name}</p>
                           <p className="text-[10px] text-secondary font-bold">In Collection</p>
                        </div>
                        <button onClick={() => handleToggle(p._id)} className="w-8 h-8 flex items-center justify-center bg-white text-secondary rounded-xl hover:bg-secondary hover:text-white transition-all shadow-sm">✕</button>
                     </div>
                   ))}
                   {!loadingAI && selectedProducts.length === 0 && (
                     <div className="p-10 text-center border-2 border-dashed border-gray-100 rounded-3xl">
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Basket is empty</p>
                     </div>
                   )}
                </div>
             </div>

             {/* Catalog */}
             <div className="space-y-6">
                <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em]">{search ? 'Search Results' : 'Inventory Quick Add'}</h4>
                <div className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                   {displayResults.map(p => (
                     <div 
                        key={p._id} 
                        onClick={() => handleToggle(p._id)}
                        className="p-3 bg-white border-2 border-gray-50 rounded-[32px] hover:border-primary/20 hover:shadow-lg cursor-pointer transition-all group relative"
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
                className="bg-primary text-white font-black text-[13px] uppercase tracking-[0.2em] px-12 py-5 rounded-[24px] shadow-xl hover:brightness-110 transition-all transform active:scale-95"
              >
                Apply Curation
              </button>
              <button onClick={onClose} className="px-8 py-5 rounded-[24px] text-xs font-black text-gray-400 hover:text-dark transition-all">Discard</button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default CurationModal;

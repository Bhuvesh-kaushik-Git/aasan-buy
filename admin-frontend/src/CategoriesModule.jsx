import React, { useState, useEffect } from 'react';

// A simple component to search through products and check off those belonging to a category
const CategoryProductAssigner = ({ categoryName, categoryId, onSaveCategoryProducts, adminToken }) => {
  const [allProducts, setAllProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  // Load a large chunk of products to allow selection (limit 1000 for admin ease-of-use MVP)
  useEffect(() => {
    fetch(`${API_URL}/api/products?limit=1000`, { headers: { 'Authorization': `Bearer ${adminToken}` } })
      .then(r => r.json())
      .then(d => {
         const prods = d.products || [];
         setAllProducts(prods);
         // Pre-select products that already have this category
         if (categoryName) {
            setSelectedIds(prods.filter(p => p.categories?.includes(categoryName)).map(p => p._id));
         }
      })
      .catch(e => console.error(e));
  }, [categoryName]);

  const filtered = allProducts.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || (p.sku && p.sku.toLowerCase().includes(search.toLowerCase())));
  const displayProducts = search ? filtered : filtered.slice(0, 10);

  const toggleProduct = (id) => {
     setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSave = async (e) => {
     e.preventDefault();
     setLoading(true);
     try {
       await fetch(`${API_URL}/api/categories/${categoryId}/products`, {
         method: 'POST',
         headers: { 
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${adminToken}`
         },
         body: JSON.stringify({ productIds: selectedIds })
       });
       onSaveCategoryProducts(); // Callback to parent
     } catch (err) {
       console.error(err);
     }
     setLoading(false);
  };

  if (!categoryId) return <div className="text-sm text-gray-500 mt-4">Save the category first to assign products.</div>

  return (
    <div className="mt-8 border-t border-gray-100 pt-6">
       <div className="flex justify-between items-center mb-4">
         <div>
            <h3 className="text-sm font-bold text-dark uppercase tracking-widest">Assign Products</h3>
            <p className="text-xs text-gray-500">Products assigned here will appear under this category block.</p>
         </div>
         <button onClick={handleSave} disabled={loading} className="bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white px-4 py-2 rounded-lg font-bold text-xs transition-colors border border-emerald-100 disabled:opacity-50">
            {loading ? 'Saving...' : 'Save Product Assignments'}
         </button>
       </div>

       <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl">
         <input 
            type="text" 
            placeholder="Search products to add..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full text-sm px-3 py-2 border rounded-lg mb-3 focus:outline-none focus:border-secondary"
         />
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {displayProducts.map(p => (
              <label key={p._id} className={`flex items-center gap-3 p-2 border ${selectedIds.includes(p._id) ? 'border-secondary bg-secondary/5' : 'border-gray-100 bg-white'} rounded-xl cursor-pointer hover:bg-secondary/10 transition-colors`}>
                <input type="checkbox" checked={selectedIds.includes(p._id)} onChange={() => toggleProduct(p._id)} className="w-4 h-4 text-secondary accent-secondary" />
                <img src={p.images?.[0]} alt="" className="w-8 h-8 rounded shrink-0 object-cover" />
                <div className="flex-1 min-w-0">
                   <p className="text-xs font-bold text-dark truncate">{p.name}</p>
                   <p className="text-[10px] text-gray-500 font-mono truncate">{p.sku || 'No SKU'}</p>
                </div>
              </label>
            ))}
         </div>
         {!search && filtered.length > 10 && <div className="text-[10px] text-gray-400 mt-3 text-center cursor-pointer hover:underline" onClick={() => setSearch(' ')}>Load more products...</div>}
       </div>
    </div>
  );
};

export default function CategoriesModule({ adminToken }) {
  const [activeSubTab, setActiveSubTab] = useState('categories'); // 'categories' or 'giftwraps'
  const [categories, setCategories] = useState([]);
  const [giftWraps, setGiftWraps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingGiftWrap, setEditingGiftWrap] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/categories`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (res.ok) setCategories(data);
      else console.error("Error fetching categories:", data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGiftWraps = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/giftwraps`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (res.ok) setGiftWraps(data);
      else console.error("Error fetching gift wraps:", data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'categories') fetchCategories();
    else fetchGiftWraps();
  }, [activeSubTab]);

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    setLoading(true);
    const isNew = !editingCategory._id;
    const url = isNew ? `${API_URL}/api/categories` : `${API_URL}/api/categories/${editingCategory._id}`;
    const method = isNew ? 'POST' : 'PUT';

    try {
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ name: editingCategory.name, image: editingCategory.image })
      });
      if(!res.ok) {
         const err = await res.json();
         alert(err.message);
         setLoading(false);
         return;
      }
      
      const savedCat = await res.json();
      if (isNew) setEditingCategory(savedCat);
      else alert("Category updated.");
      fetchCategories();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGiftWrap = async (e) => {
    e.preventDefault();
    setLoading(true);
    const isNew = !editingGiftWrap._id;
    const url = isNew ? `${API_URL}/api/giftwraps` : `${API_URL}/api/giftwraps/${editingGiftWrap._id}`;
    const method = isNew ? 'POST' : 'PUT';

    try {
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(editingGiftWrap)
      });
      if(!res.ok) return alert("Failed to save gift wrap");
      setEditingGiftWrap(null);
      fetchGiftWraps();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
     if(!window.confirm("Are you sure you want to delete this category?")) return;
     try {
         await fetch(`${API_URL}/api/categories/${id}`, { 
           method: 'DELETE',
           headers: { 'Authorization': `Bearer ${adminToken}` }
         });
         fetchCategories();
     } catch (e) {
         console.error(e);
     }
  };

  const handleDeleteGiftWrap = async (id) => {
    if(!window.confirm("Delete this gift wrap?")) return;
    try {
        await fetch(`${API_URL}/api/giftwraps/${id}`, { 
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        fetchGiftWraps();
    } catch (e) { console.error(e); }
  };

  if (editingCategory) {
    return (
      <div className="max-w-4xl mx-auto bg-white p-10 rounded-[40px] shadow-premium border border-black/5 animate-fade-in-up">
        <div className="flex justify-between items-center mb-10 border-b border-gray-50 pb-8">
           <div className="space-y-1">
              <span className="text-[10px] font-black text-secondary uppercase tracking-[0.4em]">Resource Editor</span>
              <h2 className="text-3xl font-black font-heading text-dark tracking-tighter">{editingCategory._id ? `Edit: ${editingCategory.name}` : 'New Category'}</h2>
           </div>
           <button onClick={() => setEditingCategory(null)} className="text-gray-400 hover:text-dark font-black text-[11px] uppercase tracking-widest bg-gray-50 px-6 py-3 rounded-2xl transition-all">✕ Cancel</button>
        </div>
        
        <form onSubmit={handleSaveCategory} className="space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block ml-1">Identity</label>
                <input required type="text" value={editingCategory.name || ''} onChange={e => setEditingCategory(p => ({...p, name: e.target.value}))} className="w-full border-0 rounded-2xl px-6 py-4 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-secondary/10 focus:outline-none transition-all font-black text-sm" placeholder="e.g. Wedding Luxe" />
              </div>
              <div className="space-y-3">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block ml-1">Visual Asset (URL)</label>
                <input type="text" value={editingCategory.image || ''} onChange={e => setEditingCategory(p => ({...p, image: e.target.value}))} className="w-full border-0 rounded-2xl px-6 py-4 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-secondary/10 focus:outline-none transition-all font-black text-sm" placeholder="https://..." />
              </div>
           </div>
           
           <div className="flex justify-end pt-4">
              <button disabled={loading} type="submit" className="bg-primary hover:brightness-110 text-white font-black px-12 py-4 rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 text-xs uppercase tracking-[0.2em]">
                 {loading ? 'Processing...' : (editingCategory._id ? 'Update Category' : 'Create & Assign Products')}
              </button>
           </div>
        </form>

        {editingCategory._id && (
           <div className="mt-12 pt-12 border-t border-gray-50">
             <CategoryProductAssigner 
                categoryName={editingCategory.name} 
                categoryId={editingCategory._id} 
                adminToken={adminToken}
                onSaveCategoryProducts={() => alert("Product synchronization complete! ✨")}
             />
           </div>
        )}
      </div>
    );
  }

  if (editingGiftWrap) {
    return (
      <div className="max-w-4xl mx-auto bg-white p-10 rounded-[40px] shadow-premium border border-black/5 animate-fade-in-up">
        <div className="flex justify-between items-center mb-10 border-b border-gray-50 pb-8">
           <div className="space-y-1">
              <span className="text-[10px] font-black text-secondary uppercase tracking-[0.4em]">Resource Editor</span>
              <h2 className="text-3xl font-black font-heading text-dark tracking-tighter">Gift Wrap: {editingGiftWrap.title || 'New'}</h2>
           </div>
           <button onClick={() => setEditingGiftWrap(null)} className="text-gray-400 hover:text-dark font-black text-[11px] uppercase tracking-widest bg-gray-50 px-6 py-3 rounded-2xl transition-all">✕ Cancel</button>
        </div>
        <form onSubmit={handleSaveGiftWrap} className="space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block ml-1">Title</label>
                <input required type="text" value={editingGiftWrap.title || ''} onChange={e => setEditingGiftWrap(p => ({...p, title: e.target.value}))} className="w-full border-0 rounded-2xl px-6 py-4 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-secondary/10 focus:outline-none transition-all font-black text-sm" />
              </div>
              <div className="space-y-3">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block ml-1">Price (₹)</label>
                <input required type="number" value={editingGiftWrap.price || 0} onChange={e => setEditingGiftWrap(p => ({...p, price: parseFloat(e.target.value)}))} className="w-full border-0 rounded-2xl px-6 py-4 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-secondary/10 focus:outline-none transition-all font-black text-sm" />
              </div>
              <div className="space-y-3 col-span-full">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block ml-1">Visual Asset URL</label>
                <input type="text" value={editingGiftWrap.image || ''} onChange={e => setEditingGiftWrap(p => ({...p, image: e.target.value}))} className="w-full border-0 rounded-2xl px-6 py-4 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-secondary/10 focus:outline-none transition-all font-black text-sm" />
              </div>
              <div className="flex items-center gap-3 ml-1">
                 <input type="checkbox" id="gift-active" checked={editingGiftWrap.isActive ?? true} onChange={e => setEditingGiftWrap(p => ({...p, isActive: e.target.checked}))} className="w-5 h-5 accent-secondary" />
                 <label htmlFor="gift-active" className="text-xs font-black text-dark uppercase tracking-widest cursor-pointer">Active in Storefront</label>
              </div>
           </div>
           <div className="flex justify-end pt-4">
              <button disabled={loading} type="submit" className="bg-primary hover:brightness-110 text-white font-black px-12 py-4 rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 text-xs uppercase tracking-[0.2em]">
                 {loading ? 'Processing...' : 'Save Gift Wrap'}
              </button>
           </div>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-fade-in-up max-w-[1200px] mx-auto pb-20">
      {/* Tab Switcher & Header */}
      <div className="bg-white p-10 rounded-[40px] shadow-soft border border-black/5 mb-8 flex flex-wrap gap-8 items-center justify-between relative overflow-hidden">
         <div className="absolute -right-10 -top-10 w-48 h-48 bg-secondary opacity-5 rounded-full blur-3xl pointer-events-none"></div>
         <div className="flex items-center gap-12">
            <div>
               <span className="text-[11px] font-black text-secondary uppercase tracking-[0.4em] mb-1 block">Catalog Assets</span>
               <div className="flex items-baseline gap-6">
                 <h2 onClick={() => setActiveSubTab('categories')} className={`text-3xl font-black font-heading tracking-tighter cursor-pointer transition-colors ${activeSubTab === 'categories' ? 'text-dark' : 'text-gray-200 hover:text-gray-400'}`}>Categories</h2>
                 <h2 onClick={() => setActiveSubTab('giftwraps')} className={`text-3xl font-black font-heading tracking-tighter cursor-pointer transition-colors ${activeSubTab === 'giftwraps' ? 'text-dark' : 'text-gray-200 hover:text-gray-400'}`}>Gift Wraps</h2>
               </div>
            </div>
         </div>
         <button onClick={() => activeSubTab === 'categories' ? setEditingCategory({}) : setEditingGiftWrap({ isActive: true, price: 50 })} className="bg-primary text-white font-black text-sm px-10 py-5 rounded-2xl transition-all shadow-xl shadow-primary/20 hover:-translate-y-1 active:scale-95 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            Add New {activeSubTab === 'categories' ? 'Category' : 'Wrap'}
         </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {activeSubTab === 'categories' ? categories.map(cat => (
          <div key={cat._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden flex flex-col">
             <div className="h-32 bg-gray-50 relative border-b border-gray-100">
                {cat.image ? (
                   <img src={cat.image} className="w-full h-full object-cover" alt="" />
                ) : (
                   <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold text-xs uppercase tracking-widest">No Image</div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                   <button onClick={() => setEditingCategory(cat)} className="w-8 h-8 bg-white text-dark rounded-full flex items-center justify-center shadow-lg hover:bg-secondary hover:text-white transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" /></svg>
                   </button>
                   <button onClick={() => handleDeleteCategory(cat._id)} className="w-8 h-8 bg-white text-red-500 rounded-full flex items-center justify-center shadow-lg hover:bg-red-500 hover:text-white transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                   </button>
                </div>
             </div>
             <div className="p-4 flex-1 flex flex-col justify-center items-center text-center">
                 <h3 className="font-bold text-dark text-sm">{cat.name}</h3>
             </div>
          </div>
        )) : giftWraps.map(wrap => (
          <div key={wrap._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden flex flex-col">
             <div className="h-32 bg-gray-50 relative border-b border-gray-100 p-2">
                {wrap.image ? (
                   <img src={wrap.image} className="w-full h-full object-contain rounded-lg" alt="" />
                ) : (
                   <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold text-[10px] uppercase tracking-widest bg-gray-50">🎁 No Wrap Image</div>
                )}
                {!wrap.isActive && <div className="absolute top-2 right-2 bg-rose-500 text-white text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-widest shadow-lg">Inactive</div>}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                   <button onClick={() => setEditingGiftWrap(wrap)} className="w-8 h-8 bg-white text-dark rounded-full flex items-center justify-center shadow-lg hover:bg-secondary hover:text-white transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" /></svg>
                   </button>
                   <button onClick={() => handleDeleteGiftWrap(wrap._id)} className="w-8 h-8 bg-white text-red-500 rounded-full flex items-center justify-center shadow-lg hover:bg-red-500 hover:text-white transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                   </button>
                </div>
             </div>
             <div className="p-4 flex-1 flex flex-col justify-center items-center text-center">
                 <h3 className="font-bold text-dark text-sm">{wrap.title}</h3>
                 <p className="text-[10px] font-black text-secondary">₹ {wrap.price}</p>
             </div>
          </div>
        ))}

        {(activeSubTab === 'categories' ? categories : giftWraps).length === 0 && !loading && (
           <div className="col-span-full text-center py-20 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
              No {activeSubTab} exist yet. Click "Add New" above.
           </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import * as XLSX from 'xlsx';
import TagInput from './components/TagInput';

export default function ProductsModule() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [search, setSearch] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [dbCategories, setDbCategories] = useState([]);
  useEffect(() => {
    fetch('http://localhost:5001/api/categories')
       .then(r => r.json())
       .then(d => setDbCategories(d))
       .catch(e => console.error(e));
  }, []);

  const [selectedIds, setSelectedIds] = useState([]);
  
  const [editingProduct, setEditingProduct] = useState(null); // null means list view, {} means add new, {...} means edit
  const fileInputRef = useRef(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5001/api/products?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
      const data = await res.json();
      setProducts(data.products || []);
      setTotalPages(data.totalPages || 1);
      setTotalItems(data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, limit, search]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1); // reset to first page on search
  };

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setPage(1);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(products.map(p => p._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} products?`)) return;
    try {
      await fetch('http://localhost:5001/api/products/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds })
      });
      setSelectedIds([]);
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        // Map Excel keys to product schema keys. Ensure names match your excel column headers.
        const mappedProducts = data.map(item => ({
          name: item.Name || item.name || 'Unnamed Product',
          description: item.Description || item.description || '',
          price: Number(item.Price || item.price) || 0,
          sku: item.SKU || item.sku || '',
          stock: Number(item.Stock || item.stock || item.Inventory || item.inventory) || 0,
          categories: item.Categories || item.categories || item.Category || item.category ? String(item.Categories || item.categories || item.Category || item.category).split(',').map(s => s.trim()) : [],
          images: item.Images || item.images ? String(item.Images || item.images).split(',').map(s => s.trim()) : [],
        }));

        if (!window.confirm(`Ready to import ${mappedProducts.length} products. Existing SKUs will have their stock updated. Proceed?`)) {
            if(fileInputRef.current) fileInputRef.current.value = null;    
            return;
        }

        setLoading(true);
        const res = await fetch('http://localhost:5001/api/products/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ products: mappedProducts })
        });
        const result = await res.json();
        alert(`Import Complete!\nAdded: ${result.added}\nUpdated (Stock): ${result.updated}`);
        if(fileInputRef.current) fileInputRef.current.value = null;
        fetchProducts();
      } catch (err) {
        alert("Error parsing excel file: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    const isNew = !editingProduct._id;
    const url = isNew ? 'http://localhost:5001/api/products' : `http://localhost:5001/api/products/${editingProduct._id}`;
    const method = isNew ? 'POST' : 'PUT';

    try {
      const payload = { ...editingProduct };
      
      // Ensure arrays are sent correctly (no extra mapping needed here as TagInput handles it)
      payload.images = Array.isArray(payload.images) ? payload.images : [];
      payload.categories = Array.isArray(payload.categories) ? payload.categories : [];
      payload.sizes = Array.isArray(payload.sizes) ? payload.sizes : [];
      payload.highlights = Array.isArray(payload.highlights) ? payload.highlights : [];
      
      if (payload.colors && payload.colors.length > 0) {
         payload.colors = payload.colors.map(col => ({
             ...col,
             images: Array.isArray(col.images) ? col.images : []
         }));
      }

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setEditingProduct(null);
      fetchProducts();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- Render Product Form ---
  if (editingProduct) {
    return (
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100 animate-fade-in-up">
        <div className="flex justify-between items-center mb-6">
           <h2 className="text-2xl font-bold font-serif text-dark">{editingProduct._id ? 'Edit Product' : 'Add New Product'}</h2>
           <button onClick={() => setEditingProduct(null)} className="text-gray-400 hover:text-gray-600 font-bold text-sm">✕ Cancel</button>
        </div>
        
        <form onSubmit={handleSaveProduct} className="space-y-6">
           <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">Product Name</label>
                <input required type="text" value={editingProduct.name || ''} onChange={e => setEditingProduct(p => ({...p, name: e.target.value}))} className="w-full border border-gray-200 rounded-lg px-4 py-2 bg-gray-50 focus:bg-white focus:outline-none focus:border-secondary transition-colors" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">SKU</label>
                <input type="text" value={editingProduct.sku || ''} onChange={e => setEditingProduct(p => ({...p, sku: e.target.value}))} className="w-full border border-gray-200 rounded-lg px-4 py-2 bg-gray-50 focus:bg-white focus:outline-none focus:border-secondary transition-colors" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">Price (INR/₹)</label>
                <input required type="number" min="0" step="0.01" value={editingProduct.price || ''} onChange={e => setEditingProduct(p => ({...p, price: Number(e.target.value)}))} className="w-full border border-gray-200 rounded-lg px-4 py-2 bg-gray-50 focus:bg-white focus:outline-none focus:border-secondary transition-colors" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">Original MRP (INR/₹)</label>
                <input type="number" min="0" step="0.01" value={editingProduct.mrp || ''} onChange={e => setEditingProduct(p => ({...p, mrp: Number(e.target.value)}))} className="w-full border border-gray-200 rounded-lg px-4 py-2 bg-gray-50 focus:bg-white focus:outline-none focus:border-secondary transition-colors" placeholder="Used to calc discount" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">Inventory Stock</label>
                <input type="number" min="0" value={editingProduct.stock || ''} onChange={e => setEditingProduct(p => ({...p, stock: Number(e.target.value)}))} className="w-full border border-gray-200 rounded-lg px-4 py-2 bg-gray-50 focus:bg-white focus:outline-none focus:border-secondary transition-colors" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">Brand</label>
                <input type="text" value={editingProduct.brand || ''} onChange={e => setEditingProduct(p => ({...p, brand: e.target.value}))} className="w-full border border-gray-200 rounded-lg px-4 py-2 bg-gray-50 focus:bg-white focus:outline-none focus:border-secondary transition-colors" placeholder="e.g. boAt, Sony" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">Select Categories</label>
                <div className="flex flex-wrap gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg max-h-32 overflow-y-auto custom-scrollbar">
                    {dbCategories.map(cat => (
                       <label key={cat._id} className={`flex items-center gap-2 text-sm bg-white border px-3 py-1.5 rounded-full cursor-pointer transition-colors ${(editingProduct.categories || []).includes(cat.name) ? 'border-secondary bg-secondary/5' : 'border-gray-100 hover:bg-gray-100'}`}>
                          <input 
                             type="checkbox" 
                             checked={(editingProduct.categories || []).includes(cat.name)}
                             onChange={(e) => {
                                const checked = e.target.checked;
                                setEditingProduct(p => {
                                   const current = Array.isArray(p.categories) ? p.categories : (p.categories ? String(p.categories).split(',').map(s=>s.trim()) : []);
                                   return {
                                      ...p,
                                      categories: checked ? [...new Set([...current, cat.name])] : current.filter(c => c !== cat.name)
                                   }
                                });
                             }}
                             className="accent-secondary w-3.5 h-3.5"
                          />
                          <span className="font-medium text-dark">{cat.name}</span>
                       </label>
                    ))}
                    {dbCategories.length === 0 && <span className="text-xs text-gray-400">No categories created yet. Go to Categories tab to add some.</span>}
                </div>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-3">Product Images (Gallery)</label>
                <TagInput tags={editingProduct.images || []} setTags={(tags) => setEditingProduct(p => ({...p, images: tags}))} placeholder="Enter image URL and press Enter" />
              </div>

              <div className="col-span-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-3">Available Sizes / Variants</label>
                <TagInput tags={editingProduct.sizes || []} setTags={(tags) => setEditingProduct(p => ({...p, sizes: tags}))} placeholder="e.g. S, M, L or 250g, 500g" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-3">Product Highlights (Key Benefits)</label>
                <TagInput tags={editingProduct.highlights || []} setTags={(tags) => setEditingProduct(p => ({...p, highlights: tags}))} placeholder="e.g. Organic, Fast Charging" />
              </div>
              
              <div className="col-span-2 bg-gray-50 border border-gray-200 p-4 rounded-xl">
                 <div className="flex justify-between items-center mb-4">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block">Colors & Variants Data</label>
                    <button type="button" onClick={() => setEditingProduct(p => ({...p, colors: [...(p.colors||[]), {name: '', hex: '#000000', images: []}]}))} className="text-[11px] font-bold bg-white border border-gray-200 px-3 py-1.5 rounded shadow-sm hover:bg-gray-100 transition-colors">+ Add Color Variant</button>
                 </div>
                 <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                    {(editingProduct.colors || []).map((col, idx) => (
                       <div key={idx} className="flex flex-col gap-2 bg-white p-3 rounded-lg border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.01)] relative">
                          <button type="button" onClick={() => { const newC = [...editingProduct.colors]; newC.splice(idx, 1); setEditingProduct(p => ({...p, colors: newC})); }} className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center bg-red-500 text-white rounded-full transition-colors text-[10px] shadow-sm z-10">✕</button>
                          
                           <div className="flex flex-col gap-4">
                              <div className="flex items-center gap-3">
                                 <input type="color" value={col.hex} onChange={e => { const newC = [...editingProduct.colors]; newC[idx].hex = e.target.value; setEditingProduct(p => ({...p, colors: newC})); }} className="w-10 h-10 rounded shrink-0 cursor-pointer border-0 p-0" title="Hex code" />
                                 <input type="text" placeholder="Color Name (e.g. Midnight Blue)" value={col.name} onChange={e => { const newC = [...editingProduct.colors]; newC[idx].name = e.target.value; setEditingProduct(p => ({...p, colors: newC})); }} className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] text-dark focus:outline-none focus:border-secondary" />
                              </div>
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Variant Images (URLs)</label>
                              <TagInput tags={col.images || []} setTags={(tags) => { const newC = [...editingProduct.colors]; newC[idx].images = tags; setEditingProduct(p => ({...p, colors: newC})); }} placeholder="Paste image URL and Enter" />
                           </div>
                       </div>
                    ))}
                    {(!editingProduct.colors || editingProduct.colors.length === 0) && <p className="text-xs text-gray-400 italic">No colors configured.</p>}
                 </div>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">Description</label>
                <div className="bg-white border-gray-200 rounded-lg overflow-hidden">
                    <ReactQuill 
                       theme="snow" 
                       value={editingProduct.description || ''} 
                       onChange={val => setEditingProduct(p => ({...p, description: val}))} 
                       className="h-64 mb-12"
                    />
                </div>
              </div>
           </div>
           
           <div className="flex justify-end pt-4 border-t border-gray-100">
              <button disabled={loading} type="submit" className="bg-secondary hover:bg-opacity-90 text-white font-bold px-8 py-3 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50">
                 {loading ? 'Saving...' : 'Save Product'}
              </button>
           </div>
        </form>
      </div>
    );
  }

  // --- Render Product List ---
  return (
    <div className="flex flex-col h-full animate-fade-in-up max-w-[1200px] mx-auto">
      
      {/* Top Header Actions */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-4 flex flex-wrap gap-4 items-center justify-between">
         <div className="flex items-center gap-4 flex-1">
            <h2 className="text-xl font-bold font-serif text-dark shrink-0">Products</h2>
            <div className="relative w-full max-w-sm">
                <input 
                  type="text" 
                  placeholder="Search by name or SKU..." 
                  value={search}
                  onChange={handleSearchChange}
                  className="w-full bg-gray-50 border border-gray-200 text-sm rounded-full pl-10 pr-4 py-2 focus:bg-white focus:outline-none focus:border-secondary transition-colors"
                />
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 absolute left-4 top-2.5 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
            </div>
         </div>
         <div className="flex items-center gap-3">
             <input type="file" accept=".xlsx, .xls" ref={fileInputRef} onChange={handleExcelUpload} className="hidden" />
             <button onClick={() => fileInputRef.current?.click()} className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-bold text-xs px-4 py-2.5 rounded-xl border border-emerald-100 transition-colors flex items-center gap-2 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>
                Import Excel
             </button>
             <button onClick={() => setEditingProduct({})} className="bg-primary text-white hover:bg-opacity-90 font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                Add New
             </button>
         </div>
      </div>

      {/* Filter / Bulk Actions Bar */}
      <div className="flex items-center justify-between mb-4 px-1">
         <div className="flex gap-4 items-center">
             <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{totalItems} Total Products</span>
             {selectedIds.length > 0 && (
                 <button onClick={handleDeleteSelected} className="bg-red-50 text-red-600 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm border border-red-100 hover:border-red-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                    Delete Selected ({selectedIds.length})
                 </button>
             )}
         </div>
         <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 font-medium">Per Page:</label>
            <select value={limit} onChange={handleLimitChange} className="text-xs bg-white border border-gray-200 rounded px-2 py-1 outline-none focus:border-secondary">
               <option value={10}>10</option>
               <option value={25}>25</option>
               <option value={50}>50</option>
               <option value={100}>100</option>
            </select>
         </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex-1 overflow-y-auto relative">
         {loading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
               <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
            </div>
         )}
         <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-[#fefaf4] sticky top-0 z-10 shadow-sm">
               <tr>
                  <th className="p-4 w-12 text-center">
                     <input 
                       type="checkbox" 
                       className="w-4 h-4 accent-secondary rounded"
                       checked={products.length > 0 && selectedIds.length === products.length}
                       onChange={handleSelectAll}
                     />
                  </th>
                  <th className="p-4 text-xs font-bold text-primary uppercase tracking-widest">Image</th>
                  <th className="p-4 text-xs font-bold text-primary uppercase tracking-widest">Name</th>
                  <th className="p-4 text-xs font-bold text-primary uppercase tracking-widest">SKU</th>
                  <th className="p-4 text-xs font-bold text-primary uppercase tracking-widest">Price</th>
                  <th className="p-4 text-xs font-bold text-primary uppercase tracking-widest">Categories</th>
                  <th className="p-4 text-xs font-bold text-primary uppercase tracking-widest">Sold</th>
                  <th className="p-4 text-xs font-bold text-primary uppercase tracking-widest">Stock</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
               {products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-16 text-center text-gray-400 font-medium">No products found.</td>
                  </tr>
               ) : products.map(product => (
                  <tr 
                    key={product._id} 
                    className="hover:bg-gray-50/70 transition-colors cursor-pointer group"
                    onClick={() => setEditingProduct(product)}
                  >
                     <td className="p-4 text-center cursor-default" onClick={e => e.stopPropagation()}>
                        <input 
                           type="checkbox" 
                           className="w-4 h-4 accent-secondary rounded" 
                           checked={selectedIds.includes(product._id)}
                           onChange={() => handleSelect(product._id)}
                        />
                     </td>
                     <td className="p-4">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200">
                           {product.images?.[0] ? <img src={product.images[0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-400">No Img</div>}
                        </div>
                     </td>
                     <td className="p-4 text-sm font-bold text-dark group-hover:text-secondary transition-colors line-clamp-2 leading-snug max-w-[250px]">{product.name}</td>
                     <td className="p-4 text-xs text-gray-500 font-medium font-mono">{product.sku || '—'}</td>
                     <td className="p-4 text-sm font-semibold text-dark">₹{product.price.toFixed(2)}</td>
                     <td className="p-4 text-xs text-gray-500 truncate max-w-[150px]">{product.categories?.length > 0 ? product.categories.join(', ') : '—'}</td>
                     <td className="p-4 text-sm text-gray-600 font-medium">{product.sold || 0}</td>
                     <td className="p-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${product.stock > 10 ? 'bg-emerald-50 text-emerald-600' : product.stock > 0 ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
                           {product.stock} left
                        </span>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>

      {/* Pagination Footer */}
      <div className="bg-white border border-gray-100 rounded-xl p-4 mt-4 flex justify-between items-center shadow-sm">
         <span className="text-sm font-medium text-gray-500">
            Page <span className="font-bold text-dark">{page}</span> of <span className="font-bold text-dark">{totalPages}</span>
         </span>
         <div className="flex gap-2">
            <button 
              disabled={page <= 1} 
              onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition-colors"
            >
               Prev
            </button>
            <button 
              disabled={page >= totalPages} 
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition-colors"
            >
               Next
            </button>
         </div>
      </div>

    </div>
  );
}

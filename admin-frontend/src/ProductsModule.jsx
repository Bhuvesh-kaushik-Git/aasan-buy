import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import * as XLSX from 'xlsx';
import TagInput from './components/TagInput';

export default function ProductsModule({ adminToken }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [search, setSearch] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerTarget = useRef(null);

  const [dbCategories, setDbCategories] = useState([]);
  
  const [selectedIds, setSelectedIds] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null); 
  const [activeTab, setActiveTab] = useState('basic'); // 'basic', 'media', 'variants', 'seo'
  
  // Temporary state for the Variant Builder
  const [variantBuilder, setVariantBuilder] = useState({ colors: [], sizes: [] });

  const fileInputRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  useEffect(() => {
    fetch(`${API_URL}/api/categories`, { headers: { 'Authorization': `Bearer ${adminToken}` } })
       .then(r => r.json())
       .then(d => setDbCategories(d))
       .catch(e => console.error(e));
  }, [adminToken]);

  const fetchProducts = async (p = 1, append = false) => {
    if (loadingMore) return;
    if (append) setLoadingMore(true);
    else setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/products?page=${p}&limit=${limit}&search=${encodeURIComponent(search)}`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (res.ok) {
         setProducts(prev => append ? [...prev, ...(data.products || [])] : (data.products || []));
         setTotalPages(data.totalPages || data.pages || 1);
         setTotalItems(data.total || 0);
         setPage(p);
      } else {
         console.error("Failed to fetch products:", data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Trigger search change
  useEffect(() => { 
    setPage(1);
    fetchProducts(1, false); 
  }, [limit, search]);

  // Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !loading && !loadingMore && page < totalPages) {
          fetchProducts(page + 1, true);
        }
      },
      { threshold: 0.1 }
    );
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => { if (observerTarget.current) observer.unobserve(observerTarget.current); };
  }, [loading, loadingMore, page, totalPages, limit, search]);

  const handleSearchChange = (e) => { setSearch(e.target.value); setPage(1); };
  const handleLimitChange = (e) => { setLimit(Number(e.target.value)); setPage(1); };

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedIds(products.map(p => p._id));
    else setSelectedIds([]);
  };

  const handleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleDeleteSelected = async () => {
    if (!window.confirm(`Delete ${selectedIds.length} products?`)) return;
    try {
      await fetch(`${API_URL}/api/products/bulk`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
        body: JSON.stringify({ ids: selectedIds })
      });
      setSelectedIds([]);
      fetchProducts();
    } catch (err) { console.error(err); }
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([{
      name: "Sample Product",
      sku: "SMPL-001",
      price: 999,
      mrp: 1499,
      stock: 50,
      description: "A great product",
      categories: "CategoryName1, CategoryName2",
      images: "https://example.com/img1.jpg, https://example.com/img2.jpg",
      brand: "Sample Brand",
      status: "Active",
      tags: "tag1, tag2",
      taxRate: 18,
      costPrice: 500,
      weight: 1.5,
      length: 10,
      width: 5,
      height: 2,
      colors: "Red, Blue, Green",
      sizes: "S, M, L, XL"
    }, {
      name: "Plain T-Shirt",
      sku: "TSH-002",
      price: 499,
      mrp: 799,
      stock: 100,
      description: "Cotton comfort",
      categories: "Clothing",
      images: "https://example.com/tshirt.jpg",
      brand: "Basic",
      status: "Active",
      tags: "casual",
      taxRate: 5,
      costPrice: 200,
      weight: 0.2,
      length: 5,
      width: 5,
      height: 1,
      colors: "Black, White",
      sizes: "M, L"
    }]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Products");
    XLSX.writeFile(wb, "Bulk_Product_Upload_Template.xlsx");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        // header: 1 returns an array of arrays (rows)
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
        if (rows.length < 2) return alert("Sheet is empty or missing data.");

        const headers = rows[0].map(h => String(h).toLowerCase().trim());
        const getIdx = (name) => headers.indexOf(name.toLowerCase());

        const idx = {
           name: getIdx('name'),
           sku: getIdx('sku'),
           price: getIdx('price'),
           mrp: getIdx('mrp'),
           stock: getIdx('stock'),
           description: getIdx('description'),
           categories: getIdx('categories'),
           images: getIdx('images'),
           brand: getIdx('brand'),
           status: getIdx('status'),
           tags: getIdx('tags'),
           taxRate: getIdx('taxRate'),
           costPrice: getIdx('costPrice'),
           weight: getIdx('weight'),
           length: getIdx('length'),
           width: getIdx('width'),
           height: getIdx('height'),
           colors: getIdx('colors'),
           sizes: getIdx('sizes')
        };

        if (idx.name === -1) return alert("Could not find 'name' column. Please use the template.");

        const formattedProducts = rows.slice(1).map(row => {
           const name = idx.name !== -1 ? row[idx.name] : undefined;
           if (!name || String(name).trim() === "") return null;

           const val = (i) => i !== -1 ? row[i] : undefined;

           const sku = val(idx.sku) || '';
           const price = Number(val(idx.price)) || 0;
           const mrp = Number(val(idx.mrp)) || 0;
           const stock = Number(val(idx.stock)) || 0;
           const description = val(idx.description) || '';
           const cats = val(idx.categories);
           const imgs = val(idx.images);
           const brand = val(idx.brand) || '';
           const status = val(idx.status) || 'Active';
           const tagsStr = val(idx.tags);
           const taxRate = Number(val(idx.taxRate)) || 0;
           const costPrice = Number(val(idx.costPrice)) || 0;
           const weight = Number(val(idx.weight)) || 0;
           const length = Number(val(idx.length)) || 0;
           const width = Number(val(idx.width)) || 0;
           const height = Number(val(idx.height)) || 0;
           const colorsStr = val(idx.colors);
           const sizesStr = val(idx.sizes);

           const catNames = cats ? String(cats).split(',').map(c => c.trim()) : [];
           const categoryIds = catNames.map(cname => {
              const match = dbCategories.find(c => c.name.toLowerCase() === cname.toLowerCase());
              return match ? match._id : null;
           }).filter(Boolean);

           return {
              name,
              sku,
              price,
              mrp,
              stock,
              description,
              categories: categoryIds,
              images: imgs ? String(imgs).split(',').map(i => i.trim()) : [],
              brand,
              status,
              tags: tagsStr ? String(tagsStr).split(',').map(t => t.trim()) : [],
              taxRate,
              costPrice,
              weight,
              dimensions: { length, width, height },
              variants: (() => {
                 const colors = colorsStr ? String(colorsStr).split(',').map(c => c.trim()) : [];
                 const sizes = sizesStr ? String(sizesStr).split(',').map(s => s.trim()) : [];
                 const baseSku = sku || 'SKU';
                 const vts = [];
                 if (colors.length && sizes.length) {
                    colors.forEach(c => sizes.forEach(s => vts.push({
                       sku: `${baseSku}-${c.substring(0,3).toUpperCase()}-${s.toUpperCase()}`,
                       attributes: { color: c, size: s },
                       stock: stock,
                       priceOverride: price
                    })));
                 } else if (colors.length) {
                    colors.forEach(c => vts.push({
                       sku: `${baseSku}-${c.substring(0,3).toUpperCase()}`,
                       attributes: { color: c, size: '' },
                       stock: stock,
                       priceOverride: price
                    }));
                 } else if (sizes.length) {
                    sizes.forEach(s => vts.push({
                       sku: `${baseSku}-${s.toUpperCase()}`,
                       attributes: { color: '', size: s },
                       stock: stock,
                       priceOverride: price
                    }));
                 }
                 return vts;
              })()
           };
        }).filter(Boolean);

        if (formattedProducts.length === 0) {
           setLoading(false);
           return alert("No valid products found in the sheet.");
        }

        const res = await fetch(`${API_URL}/api/products/bulk`, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
           body: JSON.stringify({ products: formattedProducts })
        });
        const result = await res.json();
        
        if (res.ok) {
           let msg = `Upload Complete!\nAdded: ${result.added}\nUpdated: ${result.updated}\nErrors: ${result.errors.length}`;
           if (result.errors.length > 0) {
              msg += `\n\nFirst Error: ${result.errors[0]}`;
              console.warn("Bulk Upload Errors:", result.errors);
           }
           alert(msg);
           fetchProducts();
        } else {
           alert("Bulk upload failed: " + result.message);
        }
      } catch (err) {
        console.error(err);
        alert("Error parsing or uploading file");
      } finally {
        setLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsBinaryString(file);
  };

  const generateVariants = () => {
     const { colors, sizes } = variantBuilder;
     const baseSku = editingProduct.sku || 'SKU';
     const basePrice = editingProduct.price || 0;
     const vars = [];

     if (colors.length && sizes.length) {
       colors.forEach(c => sizes.forEach(s => vars.push({
         sku: `${baseSku}-${c.substring(0,3).toUpperCase()}-${s.toUpperCase()}`, 
         attributes: { color: c, size: s }, 
         stock: 0, 
         priceOverride: basePrice
       })));
     } else if (colors.length) {
       colors.forEach(c => vars.push({
         sku: `${baseSku}-${c.substring(0,3).toUpperCase()}`, 
         attributes: { color: c, size: '' }, 
         stock: 0, 
         priceOverride: basePrice
       }));
     } else if (sizes.length) {
       sizes.forEach(s => vars.push({
         sku: `${baseSku}-${s.toUpperCase()}`, 
         attributes: { color: '', size: s }, 
         stock: 0, 
         priceOverride: basePrice
       }));
     } else {
       vars.push({
         sku: baseSku, 
         attributes: { color: '', size: '' }, 
         stock: 0, 
         priceOverride: basePrice
       });
     }

     // Merge existing variants if matching SKU
     const existingMap = {};
     (editingProduct.variants || []).forEach(v => { existingMap[v.sku] = v; });

     const finalVars = vars.map(v => existingMap[v.sku] ? { ...v, stock: existingMap[v.sku].stock, priceOverride: existingMap[v.sku].priceOverride } : v);

     setEditingProduct(p => ({ ...p, variants: finalVars }));
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (editingProduct.mrp && editingProduct.price > editingProduct.mrp) {
       return alert("Price cannot be greater than MRP.");
    }

    setLoading(true);
    const isNew = !editingProduct._id;
    const url = isNew ? `${API_URL}/api/products` : `${API_URL}/api/products/${editingProduct._id}`;
    const method = isNew ? 'POST' : 'PUT';

    try {
      const payload = { ...editingProduct };
      payload.images = Array.isArray(payload.images) ? payload.images : [];
      payload.categories = Array.isArray(payload.categories) ? payload.categories : [];
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
         const err = await res.json();
         alert("Error: " + err.message);
      } else {
         setEditingProduct(null);
         fetchProducts();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save product.");
    } finally {
      setLoading(false);
    }
  };

  // --- Render Product Form ---
  if (editingProduct) {
    return (
      <div className="max-w-5xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-gray-100 animate-fade-in-up flex">
        {/* Sidebar Nav */}
        <div className="w-1/4 border-r border-gray-100 pr-6 space-y-2">
           <h2 className="text-xl font-bold font-serif text-dark mb-6">{editingProduct._id ? 'Edit Product' : 'Add Product'}</h2>
           {['basic', 'media', 'variants', 'seo'].map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)} 
                className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === tab ? 'bg-secondary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                 {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
           ))}
           <div className="pt-8 border-t border-gray-100 mt-8 space-y-3">
              <button disabled={loading} onClick={handleSaveProduct} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-lg transition-colors">
                 {loading ? 'Saving...' : 'Save Product'}
              </button>
              <button onClick={() => setEditingProduct(null)} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-colors">Cancel</button>
           </div>
        </div>

        {/* Content Area */}
        <div className="w-3/4 pl-8 h-[70vh] overflow-y-auto custom-scrollbar">
           {activeTab === 'basic' && (
              <div className="space-y-6">
                 <h3 className="text-lg font-black uppercase tracking-widest text-dark mb-4">Basic Information</h3>
                 <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2">
                       <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Product Name</label>
                       <input required type="text" value={editingProduct.name || ''} onChange={e => setEditingProduct(p => ({...p, name: e.target.value}))} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50 focus:bg-white focus:outline-none focus:border-secondary" />
                    </div>
                    <div>
                       <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Price (₹)</label>
                       <input required type="number" min="0" value={editingProduct.price || ''} onChange={e => setEditingProduct(p => ({...p, price: Number(e.target.value)}))} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50 focus:bg-white focus:outline-none focus:border-secondary" />
                    </div>
                    <div>
                       <label className="text-xs font-bold text-gray-500 uppercase block mb-2">MRP (₹)</label>
                       <input type="number" min="0" value={editingProduct.mrp || ''} onChange={e => setEditingProduct(p => ({...p, mrp: Number(e.target.value)}))} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50 focus:bg-white focus:outline-none focus:border-secondary" />
                    </div>
                    <div>
                       <label className="text-xs font-bold text-gray-500 uppercase block mb-2">SKU (Base)</label>
                       <input type="text" value={editingProduct.sku || ''} onChange={e => setEditingProduct(p => ({...p, sku: e.target.value}))} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50 focus:bg-white focus:outline-none focus:border-secondary" />
                    </div>
                    <div>
                       <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Base Stock (if no variants)</label>
                       <input type="number" min="0" value={editingProduct.stock || ''} onChange={e => setEditingProduct(p => ({...p, stock: Number(e.target.value)}))} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50 focus:bg-white focus:outline-none focus:border-secondary" />
                    </div>
                    <div className="col-span-2">
                       <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Categories (Object IDs)</label>
                       <div className="flex flex-wrap gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg max-h-40 overflow-y-auto">
                           {dbCategories.map(cat => (
                              <label key={cat._id} className={`flex items-center gap-2 text-sm bg-white border px-3 py-1.5 rounded-full cursor-pointer transition-colors ${(editingProduct.categories || []).includes(cat._id) ? 'border-secondary bg-secondary/5' : 'border-gray-100'}`}>
                                 <input 
                                    type="checkbox" 
                                    checked={(editingProduct.categories || []).includes(cat._id)}
                                    onChange={(e) => {
                                       const checked = e.target.checked;
                                       setEditingProduct(p => {
                                          const current = Array.isArray(p.categories) ? p.categories : [];
                                          return { ...p, categories: checked ? [...new Set([...current, cat._id])] : current.filter(c => c !== cat._id) }
                                       });
                                    }}
                                    className="accent-secondary w-3.5 h-3.5"
                                 />
                                 <span className="font-medium text-dark">{cat.name}</span>
                              </label>
                           ))}
                       </div>
                    </div>
                    <div className="col-span-2">
                       <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Detailed Description</label>
                       <ReactQuill theme="snow" value={editingProduct.description || ''} onChange={val => setEditingProduct(p => ({...p, description: val}))} className="h-64 mb-10" />
                    </div>
                 </div>
              </div>
           )}

           {activeTab === 'media' && (
              <div className="space-y-6">
                 <h3 className="text-lg font-black uppercase tracking-widest text-dark mb-4">Media Assets</h3>
                 <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-3">Product Images (Gallery)</label>
                 <TagInput adminToken={adminToken} allowUpload={true} tags={editingProduct.images || []} setTags={(tags) => setEditingProduct(p => ({...p, images: tags}))} placeholder="Enter image URL and press Enter" />
              </div>
           )}

           {activeTab === 'variants' && (
              <div className="space-y-6">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-black uppercase tracking-widest text-dark">Variant Builder</h3>
                 </div>
                 
                 <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 grid grid-cols-2 gap-6">
                    <div>
                       <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Colors</label>
                       <TagInput tags={variantBuilder.colors} setTags={t => setVariantBuilder(p => ({...p, colors: t}))} placeholder="e.g. Red, Blue" />
                    </div>
                    <div>
                       <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Sizes</label>
                       <TagInput tags={variantBuilder.sizes} setTags={t => setVariantBuilder(p => ({...p, sizes: t}))} placeholder="e.g. S, M, L" />
                    </div>
                    <div className="col-span-2 flex justify-end">
                       <button type="button" onClick={generateVariants} className="bg-primary text-white font-bold px-6 py-2 rounded-xl shadow-md hover:bg-opacity-90">Generate Combinations</button>
                    </div>
                 </div>

                 {editingProduct.variants && editingProduct.variants.length > 0 && (
                    <div className="mt-8 border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                       <table className="w-full text-left text-sm">
                          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                             <tr>
                                <th className="p-3">Attributes</th>
                                <th className="p-3">SKU</th>
                                <th className="p-3">Price</th>
                                <th className="p-3">Stock</th>
                                <th className="p-3 w-10"></th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                             {editingProduct.variants.map((v, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                   <td className="p-3 font-medium text-dark">{[v.attributes.color, v.attributes.size].filter(Boolean).join(' / ') || 'Base'}</td>
                                   <td className="p-3">
                                      <input type="text" value={v.sku} onChange={e => { const vts = [...editingProduct.variants]; vts[idx].sku = e.target.value; setEditingProduct(p => ({...p, variants: vts})); }} className="w-full border-gray-300 rounded text-xs px-2 py-1" />
                                   </td>
                                   <td className="p-3">
                                      <input type="number" value={v.priceOverride || ''} onChange={e => { const vts = [...editingProduct.variants]; vts[idx].priceOverride = Number(e.target.value); setEditingProduct(p => ({...p, variants: vts})); }} className="w-20 border-gray-300 rounded text-xs px-2 py-1" />
                                   </td>
                                   <td className="p-3">
                                      <input type="number" min="0" value={v.stock} onChange={e => { const vts = [...editingProduct.variants]; vts[idx].stock = Number(e.target.value); setEditingProduct(p => ({...p, variants: vts})); }} className="w-16 border-gray-300 rounded text-xs px-2 py-1" />
                                   </td>
                                   <td className="p-3 text-right">
                                      <button onClick={() => { const vts = [...editingProduct.variants]; vts.splice(idx, 1); setEditingProduct(p => ({...p, variants: vts})); }} className="text-red-500 hover:text-red-700 font-bold text-xs">✕</button>
                                   </td>
                                </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                 )}
              </div>
           )}

           {activeTab === 'seo' && (
              <div className="space-y-6">
                 <h3 className="text-lg font-black uppercase tracking-widest text-dark mb-4">Search Engine Optimization</h3>
                 <div className="space-y-6">
                    <div>
                       <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Meta Title</label>
                       <input type="text" value={editingProduct.metaTitle || ''} onChange={e => setEditingProduct(p => ({...p, metaTitle: e.target.value}))} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50 focus:bg-white focus:outline-none focus:border-secondary" />
                    </div>
                    <div>
                       <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Meta Description</label>
                       <textarea value={editingProduct.metaDescription || ''} onChange={e => setEditingProduct(p => ({...p, metaDescription: e.target.value}))} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50 focus:bg-white focus:outline-none focus:border-secondary resize-none h-32" />
                    </div>
                    <div>
                       <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Search Tags</label>
                       <TagInput tags={editingProduct.tags || []} setTags={(tags) => setEditingProduct(p => ({...p, tags: tags}))} placeholder="e.g. summer-wear, electronics" />
                    </div>
                    <div className="flex items-center gap-3 mt-4">
                       <input type="checkbox" id="isFeatured" checked={editingProduct.isFeatured || false} onChange={e => setEditingProduct(p => ({...p, isFeatured: e.target.checked}))} className="w-5 h-5 accent-secondary" />
                       <label htmlFor="isFeatured" className="text-sm font-bold text-dark cursor-pointer">Feature on Homepage</label>
                    </div>
                 </div>
              </div>
           )}
        </div>
      </div>
    );
  }

  // --- Render Product List ---
  return (
    <div className="flex flex-col h-full animate-fade-in-up max-w-[1200px] mx-auto">
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-4 flex flex-wrap gap-4 items-center justify-between">
         <div className="flex items-center gap-4 flex-1">
            <h2 className="text-xl font-bold font-serif text-dark shrink-0">Products</h2>
            <div className="relative w-full max-w-sm">
                <input type="text" placeholder="Search by name or SKU..." value={search} onChange={handleSearchChange} className="w-full bg-gray-50 border border-gray-200 text-sm rounded-full pl-10 pr-4 py-2 focus:bg-white focus:outline-none focus:border-secondary" />
                <span className="absolute left-4 top-2.5 text-gray-400">🔍</span>
            </div>
         </div>
         <div className="flex items-center gap-3">
             <button onClick={downloadTemplate} className="bg-gray-100 text-dark hover:bg-gray-200 font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95">
                Download Template
             </button>
             <input type="file" accept=".xlsx, .xls" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
             <button onClick={() => fileInputRef.current?.click()} className="bg-white border border-gray-200 text-dark hover:bg-gray-50 font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95">
                Upload Excel
             </button>
             <button onClick={() => { setEditingProduct({}); setActiveTab('basic'); }} className="bg-primary text-white hover:bg-opacity-90 font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2">
                Add New Product
             </button>
         </div>
      </div>

      <div className="flex items-center justify-between mb-4 px-1">
         <div className="flex gap-4 items-center">
             <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{totalItems} Total Products</span>
             {selectedIds.length > 0 && (
                 <button onClick={handleDeleteSelected} className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold border border-red-100">
                    Delete Selected ({selectedIds.length})
                 </button>
             )}
         </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex-1 overflow-y-auto">
         <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-[#fefaf4] sticky top-0 z-10 shadow-sm">
               <tr>
                  <th className="p-4 w-12 text-center"><input type="checkbox" className="w-4 h-4 accent-secondary rounded" checked={products.length > 0 && selectedIds.length === products.length} onChange={handleSelectAll} /></th>
                  <th className="p-4 text-xs font-bold text-primary uppercase">Name</th>
                  <th className="p-4 text-xs font-bold text-primary uppercase">SKU</th>
                  <th className="p-4 text-xs font-bold text-primary uppercase">Price</th>
                  <th className="p-4 text-xs font-bold text-primary uppercase">Stock</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
               {products.length === 0 ? (
                  <tr><td colSpan={5} className="p-16 text-center text-gray-400">No products found.</td></tr>
               ) : products.map(product => (
                  <tr key={product._id} className="hover:bg-gray-50/70 transition-colors cursor-pointer" onClick={() => setEditingProduct(product)}>
                     <td className="p-4 text-center" onClick={e => e.stopPropagation()}><input type="checkbox" className="w-4 h-4 accent-secondary rounded" checked={selectedIds.includes(product._id)} onChange={() => handleSelect(product._id)} /></td>
                     <td className="p-4 text-sm font-bold text-dark">{product.name}</td>
                     <td className="p-4 text-xs text-gray-500 font-mono">{product.sku || '—'}</td>
                     <td className="p-4 text-sm font-semibold text-dark">₹{product.price.toFixed(2)}</td>
                     <td className="p-4 text-xs">{(product.variants && product.variants.length > 0) ? `${product.variants.length} vars` : product.stock}</td>
                  </tr>
               ))}
               {/* Infinite Scroll Sentinel */}
               <tr ref={observerTarget}>
                  <td colSpan={5} className="p-4 text-center">
                     {loadingMore && (
                        <div className="flex items-center justify-center gap-2 py-4">
                           <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                           <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                           <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce"></div>
                        </div>
                     )}
                     {!loadingMore && page >= totalPages && products.length > 0 && (
                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">End of List</span>
                     )}
                  </td>
               </tr>
            </tbody>
         </table>
      </div>
    </div>
  );
}

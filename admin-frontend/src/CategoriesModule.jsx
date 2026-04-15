import React, { useState, useEffect } from 'react';

// A simple component to search through products and check off those belonging to a category
const CategoryProductAssigner = ({ categoryName, categoryId, onSaveCategoryProducts }) => {
  const [allProducts, setAllProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load a large chunk of products to allow selection (limit 1000 for admin ease-of-use MVP)
  useEffect(() => {
    fetch('http://localhost:5001/api/products?limit=1000')
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
       await fetch(`http://localhost:5001/api/categories/${categoryId}/products`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
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

export default function CategoriesModule() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5001/api/categories');
      setCategories(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    setLoading(true);
    const isNew = !editingCategory._id;
    const url = isNew ? 'http://localhost:5001/api/categories' : `http://localhost:5001/api/categories/${editingCategory._id}`;
    const method = isNew ? 'POST' : 'PUT';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingCategory.name, image: editingCategory.image })
      });
      if(!res.ok) {
         const err = await res.json();
         alert(err.message);
         setLoading(false);
         return;
      }
      
      const savedCat = await res.json();
      // Keep edit window open if they want to mass-assign products, or close if new.
      if (isNew) {
         setEditingCategory(savedCat); // Switches context so they can immediately assign products
      } else {
         alert("Category updated.");
      }
      fetchCategories();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
     if(!window.confirm("Are you sure you want to delete this category? It will be removed from all attached products.")) return;
     try {
         await fetch(`http://localhost:5001/api/categories/${id}`, { method: 'DELETE' });
         fetchCategories();
     } catch (e) {
         console.error(e);
     }
  };

  if (editingCategory) {
    return (
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100 animate-fade-in-up">
        <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
           <h2 className="text-2xl font-bold font-serif text-dark">{editingCategory._id ? `Edit Category: ${editingCategory.name}` : 'Create New Category'}</h2>
           <button onClick={() => setEditingCategory(null)} className="text-gray-400 hover:text-gray-600 font-bold text-sm bg-gray-50 px-4 py-2 rounded-lg">✕ Return to list</button>
        </div>
        
        <form onSubmit={handleSaveCategory} className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">Category Name</label>
                <input required type="text" value={editingCategory.name || ''} onChange={e => setEditingCategory(p => ({...p, name: e.target.value}))} className="w-full border border-gray-200 rounded-lg px-4 py-2 bg-gray-50 focus:bg-white focus:outline-none focus:border-secondary transition-colors" placeholder="e.g. Occasion Cakes" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">Image URL</label>
                <input type="text" value={editingCategory.image || ''} onChange={e => setEditingCategory(p => ({...p, image: e.target.value}))} className="w-full border border-gray-200 rounded-lg px-4 py-2 bg-gray-50 focus:bg-white focus:outline-none focus:border-secondary transition-colors" placeholder="https://..." />
              </div>
           </div>
           
           <div className="flex justify-start">
              <button disabled={loading} type="submit" className="bg-primary hover:bg-opacity-90 text-white font-bold px-8 py-2.5 rounded-lg shadow-md transition-all active:scale-95 disabled:opacity-50 text-sm">
                 {loading ? 'Saving...' : (editingCategory._id ? 'Update Category Info' : 'Create Category & Proceed')}
              </button>
           </div>
        </form>

        {editingCategory._id && (
           <CategoryProductAssigner 
              categoryName={editingCategory.name} 
              categoryId={editingCategory._id} 
              onSaveCategoryProducts={() => alert("Product assignments wrapped!")}
           />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-fade-in-up max-w-[1000px] mx-auto">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-4 items-center justify-between relative overflow-hidden">
         {/* Decorative blob */}
         <div className="absolute -right-10 -top-10 w-32 h-32 bg-secondary opacity-10 rounded-full blur-2xl pointer-events-none"></div>
         <div>
            <h2 className="text-2xl font-bold font-serif text-dark shrink-0 mb-1">Categories</h2>
            <p className="text-sm text-gray-500">Manage store categories and manually bind products.</p>
         </div>
         <button onClick={() => setEditingCategory({})} className="bg-primary text-white hover:bg-opacity-90 font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-lg active:scale-95 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            Add New Category
         </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-12">
        {categories.map(cat => (
          <div key={cat._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden flex flex-col">
             <div className="h-32 bg-gray-50 relative border-b border-gray-100">
                {cat.image ? (
                   <img src={cat.image} className="w-full h-full object-cover" alt="" />
                ) : (
                   <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold text-xs uppercase tracking-widest">No Image</div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                   <button onClick={() => setEditingCategory(cat)} className="w-8 h-8 bg-white text-dark rounded-full flex items-center justify-center shadow-lg hover:bg-secondary hover:text-white transition-colors" title="Edit Category">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" /></svg>
                   </button>
                   <button onClick={() => handleDelete(cat._id)} className="w-8 h-8 bg-white text-red-500 rounded-full flex items-center justify-center shadow-lg hover:bg-red-500 hover:text-white transition-colors" title="Delete Category">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                   </button>
                </div>
             </div>
             <div className="p-4 flex-1 flex flex-col justify-center items-center text-center">
                 <h3 className="font-bold text-dark text-sm">{cat.name}</h3>
             </div>
          </div>
        ))}

        {categories.length === 0 && !loading && (
           <div className="col-span-full text-center py-20 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
              No categories exist yet. Click "Add New Category" above.
           </div>
        )}
      </div>
    </div>
  );
}

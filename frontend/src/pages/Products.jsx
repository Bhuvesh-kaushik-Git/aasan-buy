import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import OptimizedImage from '../components/OptimizedImage';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const LIMIT = 20;

const Products = () => {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const observerTarget = useRef(null);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search') || '';
  const categoryQuery = searchParams.get('category') || '';

  const fetchProducts = useCallback(async (p = 1, append = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: LIMIT });
      if (searchQuery) params.set('search', searchQuery);
      if (categoryQuery) params.set('category', categoryQuery);

      const res = await fetch(`${API_URL}/api/products?${params}`);
      const data = await res.json();
      
      setProducts(prev => append ? [...prev, ...(data.products || [])] : (data.products || []));
      setTotalPages(data.pages || 1);
      setTotal(data.total || 0);
      setPage(p);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [searchQuery, categoryQuery, loading]);

  // Initial fetch on search/category change
  useEffect(() => { 
    setProducts([]);
    setPage(1);
    setInitialLoading(true);
    fetchProducts(1, false); 
  }, [searchQuery, categoryQuery]);

  // Intersection Observer for Infinite Scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !loading && page < totalPages) {
          fetchProducts(page + 1, true);
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) observer.unobserve(observerTarget.current);
    };
  }, [loading, page, totalPages, fetchProducts]);

  const title = searchQuery
    ? `Results for "${searchQuery}"`
    : categoryQuery
    ? `${categoryQuery}`
    : 'All Collections';

  return (
    <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12 bg-[#FAFAFB] min-h-screen">
      
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-l-4 border-primary pl-6">
        <div>
          <h1 className="text-4xl font-black font-heading text-dark tracking-tight leading-tight">{title}</h1>
          {!initialLoading && <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mt-2">{total} hand-picked items</p>}
        </div>
      </div>

      {initialLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex flex-col gap-4">
                 <div className="bg-white rounded-[24px] aspect-square animate-pulse border border-gray-100 shadow-soft" />
                 <div className="h-4 bg-gray-200 rounded-full w-2/3 animate-pulse" />
                 <div className="h-4 bg-gray-100 rounded-full w-1/3 animate-pulse" />
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {products.map(p => (
              <Link 
                to={`/product/${p._id}`} 
                key={p._id} 
                className="group flex flex-col bg-white rounded-[32px] shadow-soft hover:shadow-premium transition-all duration-500 overflow-hidden border border-gray-100"
              >
                <div className="w-full aspect-square relative bg-[#F8F9FB] overflow-hidden">
                  <OptimizedImage
                    src={p.images?.[0]} 
                    alt={p.name} 
                    className="w-full h-full group-hover:scale-110 transition-transform duration-700 ease-out" 
                  />
                  
                  <button 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(p); }}
                    className={`absolute top-4 right-4 w-9 h-9 rounded-xl flex items-center justify-center z-10 transition-all border shadow-lg ${isInWishlist(p._id) ? 'bg-white border-rose-100 text-rose-500' : 'bg-white/30 backdrop-blur-md border-white/20 text-white hover:bg-white hover:text-rose-500'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill={isInWishlist(p._id) ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg>
                  </button>
                  {p.stock === 0 && (
                    <div className="absolute inset-0 bg-dark/40 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="bg-white text-dark text-[9px] font-black px-4 py-1.5 rounded-xl tracking-widest uppercase">Sold Out</span>
                    </div>
                  )}
                  {p.mrp > p.price && (
                    <div className="absolute top-4 left-4 bg-cta-buy text-white text-[10px] font-black px-3 py-1.5 rounded-xl shadow-lg">
                      {Math.round(((p.mrp - p.price) / p.mrp) * 100)}% OFF
                    </div>
                  )}
                </div>
                <div className="p-6 flex flex-col gap-2 flex-grow">
                   <div className="flex items-center gap-2 mb-1">
                      <span className="font-black text-primary text-[15px]">₹{p.price.toLocaleString()}</span>
                      {p.mrp > p.price && <span className="text-gray-300 line-through text-[11px] font-bold italic">₹{p.mrp.toLocaleString()}</span>}
                  </div>
                  <h3 className="text-[13px] font-bold text-dark group-hover:text-primary transition-colors leading-snug line-clamp-2 h-10">{p.name}</h3>
                  
                  {p.rating > 0 && (
                    <div className="flex items-center gap-1.5 mt-2 border-t border-gray-50 pt-3">
                      <div className="flex text-secondary text-[10px]">★★★★<span className="text-gray-200">★</span></div>
                      <span className="text-[10px] text-gray-400 font-black tracking-tighter">({p.reviewCount})</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* Infinite Scroll Trigger */}
          <div ref={observerTarget} className="h-20 w-full flex items-center justify-center mt-12">
            {loading && (
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="min-h-[50vh] flex flex-col items-center justify-center px-6 animate-fade-in text-center">
          <div className="w-24 h-24 bg-white rounded-[32px] shadow-soft flex items-center justify-center mb-6 border border-gray-100">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 text-gray-200"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
          </div>
          <h2 className="text-2xl font-black font-heading text-dark mb-2">Nothing Found</h2>
          <p className="text-sm text-gray-400 font-medium mb-8 max-w-xs">We couldn't find any items matching your search. Try another vibe or explore all.</p>
          <Link to="/products" className="bg-primary text-white px-10 py-4 rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all">Clear All Filters</Link>
        </div>
      )}
    </div>
  );
};

export default Products;

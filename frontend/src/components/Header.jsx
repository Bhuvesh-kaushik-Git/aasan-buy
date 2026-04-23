import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';

const Header = ({ settings, onOpenCart }) => {
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount } = useCart();
  const { user } = useAuth();
  const { wishlist } = useWishlist();
  const wishlistCount = wishlist.length;

  useEffect(() => {
    if (location.pathname !== '/products') {
      setSearchQuery('');
    }
  }, [location.pathname]);

  // Debounced search logic for suggestions
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2) {
        setIsSearching(true);
        const API_URL = import.meta.env.VITE_API_URL;
        fetch(`${API_URL}/api/products?search=${encodeURIComponent(searchQuery)}&limit=5`)
          .then(res => res.json())
          .then(data => {
            setSuggestions(data.products || []);
            setShowSuggestions(true);
          })
          .catch(err => console.error('Search error:', err))
          .finally(() => setIsSearching(false));
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const navMenu = settings?.navMenu || [
    { label: 'Flowers', sections: [{ title: 'Blossom', links: [{ label: 'All Flowers', url: '/products' }, { label: 'Hand Bouquets', url: '/products?category=bouquets' }] }] },
    { label: 'Combos', sections: [{ title: 'Popular', links: [{ label: 'Flowers & Cakes', url: '/products?category=combos' }] }] },
  ];

  return (
    <>
      {hoveredMenu !== null && (
        <div className="fixed inset-0 bg-primary/5 backdrop-blur-[4px] z-[45] transition-opacity duration-700 pointer-events-none animate-fade-in mt-[110px]" />
      )}

      <header className="fixed w-full top-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-black/5 font-sans transition-all duration-500">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between gap-12 h-16 md:h-20">
          {/* Row 1: Logo, Search, Actions */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
                 <path d="M9.375 3a1.875 1.875 0 0 0 0 3.75h1.875v4.5H3.375A1.875 1.875 0 0 1 1.5 9.375v-.75c0-1.036.84-1.875 1.875-1.875h3.193A3.375 3.375 0 0 1 12 2.753a3.375 3.375 0 0 1 5.432 3.997h3.193c1.035 0 1.875.84 1.875 1.875v.75a1.875 1.875 0 0 1-1.875 1.875H12.75v-4.5h1.875a1.875 1.875 0 1 0-1.875-1.875V3zM12.75 12.75h7.5v6.375a2.625 2.625 0 0 1-2.625 2.625H6.375a2.625 2.625 0 0 1-2.625-2.625V12.75h7.5zm-1.5 0H3.75v6.375c0 .621.504 1.125 1.125 1.125h6.375v-7.5z"/>
               </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black font-heading text-primary leading-none tracking-tight">AASAN<span className="text-secondary">BUY.</span></span>
              <span className="text-[8px] font-black text-gray-400 tracking-[0.3em] uppercase mt-0.5">Premium Curation</span>
            </div>
          </Link>

          {/* Search with Suggestions */}
          <div className="hidden md:flex flex-1 max-w-[700px] relative group px-2">
            <form onSubmit={handleSearch} className="w-full relative">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/30 group-focus-within:text-primary transition-colors">
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
              </div>
              <input
                type="text" value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search products, brands, occasions..."
                className="w-full h-12 bg-black/5 border border-transparent rounded-2xl pl-12 pr-6 text-[13px] font-black placeholder:text-gray-400 focus:bg-white focus:border-primary/10 focus:outline-none transition-all shadow-soft group-hover:bg-white"
              />
              {isSearching && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                   <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                </div>
              )}
            </form>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-[calc(100%+12px)] left-0 w-full bg-white/95 backdrop-blur-2xl rounded-3xl shadow-premium border border-black/5 overflow-hidden z-[100] animate-fade-in-up">
                <div className="p-3">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4 py-2 border-b border-gray-50 mb-2">Suggestions</p>
                  {suggestions.map((p, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => { navigate(`/product/${p._id}`); setShowSuggestions(false); setSearchQuery(''); }}
                      className="flex items-center gap-4 p-3 hover:bg-primary/5 rounded-2xl cursor-pointer transition-all group/s"
                    >
                      <img src={p.images?.[0]} className="w-10 h-10 rounded-xl object-cover shadow-sm group-hover/s:scale-110 transition-transform" alt={p.name} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-black text-dark truncate group-hover/s:text-primary transition-colors">{p.name}</p>
                        <p className="text-[10px] font-bold text-gray-400 italic">In {p.categories?.[0] || 'Uncategorized'}</p>
                      </div>
                      <span className="text-[11px] font-black text-primary opacity-0 group-hover/s:opacity-100 transition-opacity">View →</span>
                    </div>
                  ))}
                  <button onClick={handleSearch} className="w-full py-3 mt-2 text-[11px] font-black text-primary uppercase tracking-widest bg-primary/5 hover:bg-primary/10 rounded-2xl transition-colors">See all results for "{searchQuery}"</button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-6 md:gap-8 shrink-0">
            <div className="flex items-center gap-4 md:gap-6">
                
                {/* Track Order link for guests */}
                <Link to="/track-order" className="hidden xl:block text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-primary transition-colors">Track Order</Link>

                {/* Loyalty Balance */}
                {user && (
                    <div className="hidden sm:flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100/50 shadow-soft animate-fade-in group/coin">
                        <span className="text-sm group-hover:scale-125 transition-transform duration-500">🪙</span>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-amber-800 leading-none">{user.aasanCoins ?? user.coins ?? 0}</span>
                            <span className="text-[7px] font-black text-amber-600 uppercase tracking-tighter">AasanCoins</span>
                        </div>
                    </div>
                )}

                 {/* Account */}
                <Link to={user ? '/profile' : '/login'} className="flex items-center gap-2 group">
                    <div className="w-10 h-10 rounded-2xl bg-[#F8F9FB] flex items-center justify-center group-hover:bg-primary/5 transition-colors border border-gray-100/50 shadow-soft">
                        {user ? (
                            <span className="text-sm font-black text-primary">{user.name?.[0]?.toUpperCase()}</span>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0M4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>
                        )}
                    </div>
                </Link>

                {/* Wishlist */}
                <Link to="/wishlist" className="relative group">
                    <div className="w-10 h-10 rounded-2xl bg-[#F8F9FB] flex items-center justify-center group-hover:bg-rose-50 transition-colors border border-gray-100/50 shadow-soft">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-400 group-hover:text-rose-500 transition-colors"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg>
                    </div>
                    {wishlistCount > 0 && <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xl animate-fade-in">{wishlistCount}</span>}
                </Link>

                {/* Cart */}
                <button onClick={onOpenCart} className="relative group">
                    <div className="w-10 h-10 rounded-2xl bg-[#F8F9FB] flex items-center justify-center group-hover:bg-primary/5 transition-colors border border-gray-100/50 shadow-soft">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" /></svg>
                    </div>
                    {cartCount > 0 && <span className="absolute -top-1.5 -right-1.5 bg-cta-buy text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xl animate-fade-in">{cartCount}</span>}
                </button>
            </div>
          </div>
        </div>

        {/* Row 2: Navigation (Desktop Only) */}
        <div className="hidden lg:flex items-center justify-center border-t border-gray-50 h-12 bg-white/50 backdrop-blur-md">
          <nav className="flex items-center gap-10 h-full" onMouseLeave={() => setHoveredMenu(null)}>
            {navMenu.map((menu, idx) => (
              <div key={idx} className="relative h-full flex items-center" onMouseEnter={() => setHoveredMenu(idx)}>
                 <Link to={`/products?category=${menu.label.toLowerCase()}`} className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all ${hoveredMenu === idx ? 'text-primary' : 'text-gray-400 hover:text-dark'}`}>
                    {menu.label}
                 </Link>
                 {hoveredMenu === idx && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary rounded-full animate-fade-in" />}
              </div>
            ))}
          </nav>
        </div>

        {/* Mega Menu 2.0 */}
        {hoveredMenu !== null && navMenu[hoveredMenu] && (
          <div className="absolute top-full left-0 w-full bg-white/95 backdrop-blur-3xl shadow-premium border-t border-black/5 animate-fade-in-up" onMouseEnter={() => setHoveredMenu(hoveredMenu)} onMouseLeave={() => setHoveredMenu(null)}>
            <div className="max-w-[1400px] mx-auto px-10 py-16 flex gap-20 flex-wrap min-h-[350px]">
                {navMenu[hoveredMenu].sections?.map((sec, si) => (
                    <div key={si} className="flex flex-col min-w-[200px]">
                        <h4 className="text-[11px] font-black text-primary uppercase tracking-[0.3em] mb-8 border-b border-black/5 pb-3 font-heading">{sec.title}</h4>
                        <div className="flex flex-col gap-5">
                            {sec.links?.map((link, li) => (
                                <Link 
                                    key={li} to={link.url} 
                                    className="text-sm font-black text-gray-400 hover:text-dark transition-all flex items-center gap-3 group/link"
                                    onClick={() => setHoveredMenu(null)}
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-secondary opacity-0 group-hover/link:opacity-100 transition-all scale-0 group-hover/link:scale-100" />
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;

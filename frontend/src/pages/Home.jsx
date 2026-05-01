import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductSkeleton, BannerSkeleton } from '../components/Skeleton';
import { useWishlist } from '../context/WishlistContext';
import OptimizedImage from '../components/OptimizedImage';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ── Components ──────────────────────────────────────────────────────────────

const VerticalProductCard = ({ title, price, mrp, image, id, tagLabel, tagColor, rating = 4.5 }) => {
  const displayMrp = mrp || (price * 1.15); // Better fallback logic
  const discount = Math.round(((displayMrp - price) / displayMrp) * 100);
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({ _id: id, name: title, price, images: [image] });
  };
  
  return (
    <a 
      href={`/product/${id}`} 
      className="group flex flex-col w-[280px] snap-center shrink-0 bg-white rounded-3xl shadow-soft hover:shadow-premium transition-all duration-500 overflow-hidden border border-gray-100/50"
    >
      <div className="w-full h-[300px] relative bg-[#F8F9FB] overflow-hidden">
        <OptimizedImage 
          src={image} 
          alt={title} 
          className="w-full h-full group-hover:scale-110 transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]" 
        />
        {tagLabel && (
          <div 
            className="absolute top-4 left-4 text-[10px] text-white font-black px-3 py-1.5 rounded-xl shadow-lg z-10 uppercase tracking-widest backdrop-blur-md"
            style={{ backgroundColor: `${tagColor || '#1A237E'}CC` }}
          >
            {tagLabel}
          </div>
        )}
        <button 
          onClick={handleWishlist}
          className={`absolute top-4 right-4 w-9 h-9 rounded-xl flex items-center justify-center z-10 transition-all border shadow-lg ${isInWishlist(id) ? 'bg-white border-rose-100 text-rose-500' : 'bg-white/30 backdrop-blur-md border-white/20 text-white hover:bg-white hover:text-rose-500'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill={isInWishlist(id) ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg>
        </button>
        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
            <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl text-[12px] font-black text-primary shadow-2xl translate-y-6 group-hover:translate-y-0 transition-transform duration-700">
                View Collection
            </div>
        </div>
      </div>
      
      <div className="p-6 flex flex-col gap-3 flex-grow">
        <div className="flex items-center gap-2">
            <span className="text-[18px] font-black text-primary tracking-tighter">₹{price.toLocaleString()}</span>
            {discount > 0 && <span className="text-gray-300 line-through text-[13px] font-bold">₹{displayMrp.toLocaleString()}</span>}
            {discount > 5 && <span className="text-[10px] font-black text-secondary-dark ml-auto bg-secondary/10 px-2 py-1 rounded-lg">{discount}% OFF</span>}
        </div>
        
        <h3 className="text-[15px] font-black text-dark leading-[1.4] line-clamp-2 h-11 group-hover:text-primary transition-colors">
          {title}
        </h3>

        <div className="flex items-center gap-2 mt-1 border-t border-gray-50 pt-4">
          <div className="flex gap-0.5 text-secondary">
            {[1,2,3,4,5].map(i => (
              <span key={i} className={`text-[14px] ${i <= Math.round(rating) ? 'opacity-100' : 'opacity-20'}`}>★</span>
            ))}
          </div>
          <span className="text-[11px] text-gray-400 font-bold tracking-wider">(1.2k)</span>
        </div>
      </div>
    </a>
  );
};

const ValueProp = ({ icon, title, desc }) => (
    <div className="flex flex-col items-center text-center p-6 rounded-3xl bg-white border border-gray-100 shadow-soft">
        <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary mb-4 text-2xl">
            {icon}
        </div>
        <h4 className="font-heading font-bold text-dark mb-1">{title}</h4>
        <p className="text-[12px] text-gray-500 leading-relaxed font-medium">{desc}</p>
    </div>
);

const OccasionCard = ({ label, imageUrl, redirectUrl }) => (
  <a
    href={redirectUrl || '#'}
    className="flex flex-col items-center gap-3 snap-center shrink-0 group cursor-pointer"
    style={{ width: '100px' }}
  >
    <div className="w-[88px] h-[88px] rounded-3xl bg-white border border-gray-100 overflow-hidden shadow-soft group-hover:shadow-premium transition-all duration-500 group-hover:-translate-y-1.5">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={label}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-primary/5">
          <div className="w-8 h-8 rounded-full bg-primary/10 animate-pulse" />
        </div>
      )}
    </div>
    <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest text-center group-hover:text-primary transition-colors">
      {label}
    </span>
  </a>
);

// ── Main Component ─────────────────────────────────────────────────────────────

const Home = ({ settings }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [activeProductTab, setActiveProductTab] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/products?limit=20&page=1`);
        const data = await res.json();
        setProducts(data.products || []);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (settings?.heroBanners?.length > 1) {
      const timer = setInterval(() => {
        setCurrentBanner(prev => (prev + 1) % settings.heroBanners.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [settings?.heroBanners]);

  const heroBanners = settings?.heroBanners?.length > 0 ? settings.heroBanners : [{
    title: "ELEVATE YOUR EVERYDAY.",
    subtitle: "Curated Joy. Hand-picked essentials, delivered with love.",
    imageUrl: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=1600&h=800&fit=crop",
    linkUrl: "/products"
  }];

  const currentHero = heroBanners[currentBanner];

  if (loading) return (
    <div className="w-full bg-background min-h-screen">
      <BannerSkeleton />
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 px-4 md:px-8 py-12">
        <div className="h-40 bg-white rounded-3xl animate-pulse" />
        <div className="h-40 bg-white rounded-3xl animate-pulse" />
        <div className="h-40 bg-white rounded-3xl animate-pulse" />
      </div>
    </div>
  );

  return (
    <div className="w-full bg-[#FAFAFB] min-h-screen">
      
      {/* ── Hero Luxe ── */}
      <section className="relative w-full max-w-[1400px] mx-auto pt-6 px-4 md:px-8">
        <div className="relative overflow-hidden rounded-[40px] bg-dark group shadow-premium aspect-[21/10] md:aspect-[21/8]">
          <div className="absolute inset-0 z-0">
             <img
              key={currentHero.imageUrl}
              src={currentHero.imageUrl}
              alt="Promo"
              className="w-full h-full object-cover transition-transform duration-[3000ms] scale-100 group-hover:scale-105 opacity-50"
            />
          </div>

          <div className="relative z-10 w-full h-full flex items-center px-8 md:px-24 text-white">
            <div className="max-w-2xl animate-fade-in-up">
                <span className="inline-block px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md text-white text-[10px] font-black tracking-[0.3em] mb-6 shadow-xl border border-white/20">AASANBUY EXCLUSIVE</span>
                <h1 className="text-5xl md:text-7xl font-black font-heading leading-[1.1] mb-6 drop-shadow-2xl text-balance">
                    {currentHero.title}
                </h1>
                <p className="text-sm md:text-xl text-white/70 font-medium mb-10 max-w-md leading-relaxed">
                    {currentHero.subtitle}
                </p>
                <div className="flex items-center gap-6">
                  <a href={currentHero.linkUrl} className="bg-white text-primary px-10 py-5 rounded-2xl font-black text-sm hover:bg-secondary hover:text-white transition-all transform hover:-translate-y-1 shadow-2xl btn-premium">
                      Explore Collection
                  </a>
                  <div className="hidden md:flex items-center gap-4 px-6 py-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                      <div className="flex -space-x-3">
                        {[1,2,3].map(i => <div key={i} className="w-9 h-9 rounded-full border-2 border-primary bg-gray-600 shadow-lg" />)}
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-widest text-white/60">Loved by 1.2k+</span>
                  </div>
                </div>
            </div>
          </div>

          {/* Controls */}
          <div className="absolute bottom-10 right-12 hidden md:flex gap-3 z-20">
              <button 
                onClick={() => setCurrentBanner(prev => (prev - 1 + heroBanners.length) % heroBanners.length)}
                className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-primary transition-all"
              >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
              </button>
              <button 
                onClick={() => setCurrentBanner(prev => (prev + 1) % heroBanners.length)}
                className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-primary transition-all"
              >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
              </button>
          </div>
        </div>
      </section>

      {/* ── Value Propositions ── */}
      <section className="w-full max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 px-4 md:px-8 py-12">
        <ValueProp icon="💎" title="Premium Curation" desc="Hand-picked products that meet the highest standards of quality." />
        <ValueProp icon="⚡" title="Express Delivery" desc="Dispatched within 24 hours with real-time tracking to your door." />
        <ValueProp icon="🛡️" title="Secure Gifting" desc="Secure packaging and payment processing for total peace of mind." />
      </section>

      {/* Main Content Areas */}
      <div className="max-w-[1400px] mx-auto px-6 space-y-32 py-24">
        
        {/* Occasion Sections */}
        {settings?.occasionSections?.map((section, sIdx) => (
          <section key={sIdx} className="space-y-12 animate-fade-in-up">
            <div className="flex flex-col items-center text-center space-y-4">
               <h2 className="text-4xl md:text-5xl font-black text-dark leading-tight tracking-tighter">
                 {section.sectionTitle}
               </h2>
               <div className="w-20 h-1.5 bg-secondary rounded-full" />
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-12">
              {section.occasions?.map((occ, oIdx) => (
                <div key={oIdx} onClick={() => navigate(`/collection/${occ._id}`)} className="group relative aspect-[4/5] overflow-hidden rounded-[40px] cursor-pointer shadow-premium hover:shadow-2xl transition-all duration-700">
                  <img src={occ.imageUrl} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={occ.label} />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-8 left-8 right-8">
                     <h3 className="text-white text-2xl font-black font-heading mb-2 transform group-hover:-translate-y-2 transition-transform duration-500">{occ.label}</h3>
                     <span className="inline-flex items-center gap-2 text-[10px] font-black text-secondary uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                        Explore Collection <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
                     </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* Tabbed Product Showcase */}
        {settings?.homeProductTabs?.length > 0 && (
          <section className="space-y-12 animate-fade-in-up">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-gray-100 pb-8">
               <div className="space-y-2">
                 <span className="text-[12px] font-black text-secondary uppercase tracking-[0.4em]">Curated Picks</span>
                 <h2 className="text-4xl font-black text-dark tracking-tighter">Featured Treasures</h2>
               </div>
               <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 md:pb-0">
                 {settings.homeProductTabs.map((tab, idx) => (
                   <button 
                     key={idx}
                     onClick={() => setActiveProductTab(idx)}
                     className={`px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap
                     ${activeProductTab === idx ? 'bg-primary text-white shadow-xl shadow-primary/20 -translate-y-1' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                   >
                     {tab.tabTitle}
                   </button>
                 ))}
               </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
               {loading ? (
                 Array(4).fill(0).map((_, i) => <ProductSkeleton key={i} />)
               ) : (
                  settings.homeProductTabs[activeProductTab]?.products?.map((item, pIdx) => {
                    const productData = typeof item.product === 'object' ? item.product : null;
                    if (!productData) return null; // Skip if not populated correctly
                    
                    return (
                      <div key={pIdx} className="animate-fade-in" style={{ animationDelay: `${pIdx * 100}ms` }}>
                       <VerticalProductCard 
                         id={productData._id}
                         title={productData.name}
                         price={productData.price || 0}
                         mrp={productData.mrp}
                         image={productData.images?.[0]}
                         tagLabel={item.tagLabel}
                         tagColor={item.tagColor}
                         rating={productData.rating}
                       />
                      </div>
                    );
                  })
               )}
            </div>
          </section>
        )}
      </div>

    </div>
  );
};

export default Home;

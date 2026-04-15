import React, { useState, useEffect } from 'react';

// New Vertical Product Card matching the screenshot
const VerticalProductCard = ({ title, price, image, id, tagLabel, tagColor }) => {
  const mockOldPrice = (price * 1.2).toFixed(2);
  
  return (
    <a href={`/product/${id}`} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col w-[240px] snap-center shrink-0 border border-gray-200 overflow-hidden group">
      <div className="w-full h-[240px] relative bg-gray-50 overflow-hidden">
        <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        {tagLabel && (
          <div 
            className="absolute top-2 left-2 text-[10px] text-white font-bold px-2 py-0.5 rounded shadow-sm z-10"
            style={{ backgroundColor: tagColor || '#ffbc00' }}
          >
            {tagLabel}
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col gap-1.5 flex-grow">
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-gray-400 line-through text-[10px] font-medium">INR {mockOldPrice}</span>
          <span className="text-[13px] font-bold text-dark">INR {price.toFixed(2)}</span>
        </div>
        <div className="text-[10px] text-gray-500 flex items-center gap-1">
          4.75 <span className="text-[#ffbc00]">★</span> | 4.8 (4 reviews)
        </div>
        <h3 className="text-[13px] font-medium text-gray-800 leading-snug line-clamp-2 mt-1">{title}</h3>
      </div>
    </a>
  );
};

// Occasion card exactly like the reference screenshot
const OccasionCard = ({ label, imageUrl, redirectUrl }) => (
  <a
    href={redirectUrl || '#'}
    className="flex flex-col items-center gap-2.5 snap-center shrink-0 group cursor-pointer"
    style={{ width: '96px' }}
  >
    <div className="w-[84px] h-[84px] rounded-[20px] bg-[#f7f3ec] border border-[#ede8df] overflow-hidden shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:-translate-y-1">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={label}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-gray-200 opacity-40" />
        </div>
      )}
    </div>
    <span className="text-[12px] font-medium text-gray-700 text-center leading-tight group-hover:text-secondary transition-colors">
      {label}
    </span>
  </a>
);

const Home = ({ settings }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [activeProductTab, setActiveProductTab] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/products');
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Auto-slide
  useEffect(() => {
    if (settings?.heroBanners?.length > 1) {
      const timer = setInterval(() => {
        setCurrentBanner(prev => (prev + 1) % settings.heroBanners.length);
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [settings?.heroBanners]);

  const heroBanners = settings?.heroBanners?.length > 0 ? settings.heroBanners : [{
    title: "CURATED JOY. AASAN LIVING.",
    subtitle: "Hand-picked essentials, delivered fast.",
    imageUrl: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48",
    linkUrl: "#"
  }];

  const occasionSections = settings?.occasionSections || [];
  const currentHero = heroBanners[currentBanner];

  return (
    <div className="w-full font-sans bg-background relative overflow-hidden">
      {/* Subtle dot pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
           style={{ backgroundImage: 'radial-gradient(#0e4c92 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* ── Hero Banner ── */}
      <section className="relative w-full max-w-[1400px] mx-auto pt-4 pb-2 mt-12 px-4">
        <div className="relative overflow-hidden rounded-2xl aspect-[21/9] md:aspect-[3/1] bg-gray-100 group">
          <a href={currentHero.linkUrl} className="block w-full h-full relative">
            <img
              key={currentHero.imageUrl}
              src={currentHero.imageUrl}
              alt="Promotion Banner"
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
          </a>

          <button
            onClick={() => setCurrentBanner(prev => (prev - 1 + heroBanners.length) % heroBanners.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md shadow-lg flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
          </button>
          <button
            onClick={() => setCurrentBanner(prev => (prev + 1) % heroBanners.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md shadow-lg flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
          </button>

          {heroBanners.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {heroBanners.map((_, i) => (
                <button
                  key={i}
                  onClick={e => { e.preventDefault(); setCurrentBanner(i); }}
                  className={`h-2.5 rounded-full transition-all duration-300 shadow-sm ${i === currentBanner ? 'bg-secondary w-8' : 'bg-white/60 w-2.5 hover:bg-white'}`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="w-full mt-4">
          <p className="text-[9px] text-gray-400 italic text-center opacity-70">
            *Note: Final checkout will be completed on our trusted e-commerce partner's platform.
          </p>
        </div>
      </section>

      {/* ── Occasion Sections (one strip per section) ── */}
      {occasionSections.map((sec, sIdx) => (
        sec.occasions?.length > 0 && (
          <section key={sIdx} className="relative z-10 w-full max-w-[1400px] mx-auto px-4 md:px-12 py-6">
            {sec.sectionTitle && (
              <h2 className="text-[18px] md:text-[20px] font-bold text-dark mb-5 font-serif tracking-tight">
                {sec.sectionTitle}
              </h2>
            )}
            <div className="flex overflow-x-auto gap-4 pb-3 snap-x no-scrollbar">
              {sec.occasions.map((occ, oIdx) => (
                <OccasionCard
                  key={oIdx}
                  label={occ.label}
                  imageUrl={occ.imageUrl}
                  redirectUrl={occ.redirectUrl}
                />
              ))}
            </div>
          </section>
        )
      ))}

      {/* ── Products Carousel (Tabs) ── */}
      {settings?.homeProductTabs?.length > 0 && (
        <section className="relative z-10 w-full max-w-[1400px] mx-auto px-4 md:px-12 py-6 pb-16">
          <div className="flex flex-col mb-6">
             <div className="flex gap-6 overflow-x-auto no-scrollbar border-b border-gray-200 pb-2">
               {settings.homeProductTabs.map((tab, idx) => (
                 <button
                   key={idx}
                   onClick={() => setActiveProductTab(idx)}
                   className={`text-[16px] md:text-[18px] font-bold whitespace-nowrap pb-2 ${activeProductTab === idx ? 'text-dark border-b-2 border-dark' : 'text-gray-400 hover:text-gray-600'}`}
                 >
                   {tab.tabTitle}
                 </button>
               ))}
             </div>
          </div>
          <div className="flex overflow-x-auto gap-4 pb-6 snap-x no-scrollbar pt-2">
            {settings.homeProductTabs[activeProductTab]?.products?.map((item, index) => {
              const p = item.product;
              if (!p) return null;
              return (
                <VerticalProductCard
                  key={item._id || index}
                  id={p._id}
                  title={p.name}
                  price={p.price || 0}
                  image={p.images?.[0]}
                  tagLabel={item.tagLabel}
                  tagColor={item.tagColor}
                />
              );
            })}
            {settings.homeProductTabs[activeProductTab]?.products?.length === 0 && (
              <div className="text-gray-400 font-medium py-10 w-full text-center border-2 border-dashed border-gray-200 rounded-xl">
                No products found in this tab.
              </div>
            )}
          </div>
          
          {/* View All Button */}
          {settings.homeProductTabs[activeProductTab]?.products?.length > 0 && (
            <div className="flex justify-center mt-2">
               <a href="/products" className="bg-[#788a63] hover:bg-[#687a53] text-white text-[13px] font-bold px-8 py-2.5 rounded-full transition-colors shadow-sm">
                  View all
               </a>
            </div>
          )}
        </section>
      )}

      {/* Fallback old product carousel rendering if no tabs configured yet to prevent breaking */}
      {(!settings?.homeProductTabs || settings.homeProductTabs.length === 0) && (
          <section className="relative z-10 w-full max-w-[1400px] mx-auto px-4 md:px-12 py-6 pb-16">
            <h2 className="text-[18px] md:text-[20px] font-bold text-dark font-serif tracking-tight mb-5">
               All Products
            </h2>
            <div className="text-gray-400 font-medium py-10 w-full text-center border-2 border-dashed border-gray-200 rounded-xl">
              No product tabs created. Please add them in Admin Panel.
            </div>
          </section>
      )}
    </div>
  );
};

export default Home;

import React, { useState, useEffect } from 'react';

const SplitCard = ({ title, text, image, id }) => (
  <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_15px_40px_rgb(0,0,0,0.1)] transition-shadow p-3 flex w-[320px] md:w-[380px] h-[160px] snap-center shrink-0 border border-gray-50 flex-row gap-4 group">
    {/* Image Left */}
    <div className="w-[120px] h-full rounded-xl overflow-hidden bg-gray-50 relative flex-shrink-0">
      <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
    </div>
    
    {/* Content Right */}
    <div className="flex flex-col justify-between py-1 flex-grow">
      <div>
        <h3 className="text-[14px] md:text-[15px] font-bold text-dark leading-snug line-clamp-2">{title}</h3>
        <p className="text-[10px] md:text-[11px] text-gray-500 mt-1.5 line-clamp-3 leading-relaxed">{text}</p>
      </div>
      <a href={`/product/${id}`} className="bg-secondary text-white text-[11px] font-bold px-5 py-2 rounded-full w-max hover:-translate-y-0.5 hover:shadow-md transition-all uppercase tracking-wide inline-block text-center">
        Buy Now
      </a>
    </div>
  </div>
);

const Home = ({ settings }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsRes = await fetch('http://localhost:5000/api/products');
        const productsData = await productsRes.json();
        setProducts(productsData);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Auto-slide effect
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
    subtitle: "Hand-picked essentials, delivered to your door. Your easiest online experience.",
    imageUrl: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48",
    linkUrl: "#"
  }];

  const currentHero = heroBanners[currentBanner];

  return (
    <div className="w-full font-sans bg-background relative overflow-hidden">
      {/* Fake Background Pattern (Subtle Doodles) */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#0e4c92 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      {/* Hero Section - Full Width Banner */}
      <section className="relative w-full max-w-[1400px] mx-auto pt-4 pb-2 mt-12 px-4 shadow-sm">
        <div className="relative overflow-hidden rounded-2xl aspect-[21/9] md:aspect-[3/1] bg-gray-100 group">
          
          {/* Banner Image (Full width Clickable) */}
          <a 
            href={currentHero.linkUrl}
            className="block w-full h-full relative"
          >
            <img 
              key={currentHero.imageUrl}
              src={currentHero.imageUrl} 
              alt="Promotion Banner" 
              className="w-full h-full object-cover animate-fade-in transition-transform duration-1000 group-hover:scale-[1.02]"
            />
            
            {/* Subtle Overlay for Visibility of dots if needed, though they are outside now */}
            <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
          </a>

          {/* Navigation Arrows (Optional but helpful for full width) */}
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

          {/* Carousel Dots (Integrated inside for sleek look) */}
          {heroBanners.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {heroBanners.map((_, i) => (
                <button 
                  key={i} 
                  onClick={(e) => { e.preventDefault(); setCurrentBanner(i); }}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 shadow-sm ${i === currentBanner ? 'bg-secondary w-8' : 'bg-white/60 hover:bg-white'}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Note (Integrated and more compact) */}
        <div className="relative z-10 w-full mt-4">
           <p className="text-[9px] text-gray-400 italic text-center opacity-70">
             *Note: Final checkout will be completed on our trusted e-commerce partner's platform.
           </p>
        </div>
      </section>

      {/* Horizontal Carousel Section (Cards) - Brought closer */}
      <section className="py-4 pb-16 relative z-10">
        <div className="flex overflow-x-auto gap-6 px-6 md:px-12 pb-10 snap-x no-scrollbar">
          {products.map((item) => (
             <SplitCard 
               key={item._id} 
               id={item._id}
               title={item.name} 
               text={item.description} 
               image={item.images[0]} 
             />
          ))}
          {products.length === 0 && !loading && (
            <div className="text-gray-400 font-medium py-10">No products found. Run seed script.</div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;

import React from 'react';

const BoxItem = ({ image, title, price }) => (
  <div className="group cursor-pointer bg-white rounded shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-lg transition-shadow p-2.5 flex flex-col h-full min-w-[160px] snap-center">
    <div className="relative aspect-square rounded overflow-hidden bg-gray-50 mb-3 group-hover:opacity-95 transition-opacity">
      <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
      <div className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full text-gray-300 hover:text-primary transition-colors shadow">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-[18px] h-[18px]">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
        </svg>
      </div>
    </div>
    <div className="flex flex-col flex-grow justify-between px-1 pb-1">
      <h3 className="text-[13px] font-semibold text-dark line-clamp-2 leading-snug">{title}</h3>
      <div className="mt-2.5">
        <span className="font-bold text-[14px] text-dark font-sans">QAR {price}</span>
        <div className="text-[11px] text-primary flex items-center gap-1 mt-1 font-bold">
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3"><path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" /></svg>
           Earliest Delivery: Today
        </div>
      </div>
    </div>
  </div>
);

const Home = () => {
  return (
    <div className="w-full font-sans bg-gray-50/30">
      {/* Hero Banner Section (FNP exact style: full width on mobile, max-w bounded on desktop) */}
      <section className="px-0 sm:px-4 py-4 md:px-8 max-w-[1400px] mx-auto pt-2">
        <div className="relative w-full h-[220px] md:h-[420px] rounded-none sm:rounded-lg overflow-hidden bg-gray-100 flex items-center px-8 md:px-20 shadow-sm group cursor-pointer">
          <img src="https://images.unsplash.com/photo-1563241598-6bbdb1e96723?q=80&w=2000&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover brightness-[0.85] group-hover:scale-[1.02] transition-transform duration-1000 ease-out" alt="FNP Banner" />
          <div className="z-10 text-white drop-shadow-md">
             <h1 className="text-3xl md:text-5xl font-black mb-3 leading-tight tracking-tight mt-10">Make Every Moment <br/> <span className="text-white">Unforgettable</span></h1>
             <p className="font-semibold text-sm md:text-lg opacity-90 max-w-lg mb-6">Order premium flowers and gifts for your loved ones.</p>
             <button className="bg-white text-dark px-8 py-3.5 rounded font-black text-sm hover:bg-gray-100 transition-colors uppercase tracking-wider">
               Shop Now
             </button>
          </div>
          {/* FNP Pagination Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            <div className="w-[30px] h-[4px] bg-white rounded-full"></div>
            <div className="w-[10px] h-[4px] bg-white/50 rounded-full"></div>
            <div className="w-[10px] h-[4px] bg-white/50 rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Quick Category Icons (Strict FNP round styling) */}
      <section className="py-6 bg-white shadow-sm border-y border-gray-100 relative z-10">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="flex items-start justify-between gap-2 overflow-x-auto pb-4 snap-x no-scrollbar md:-mx-4 font-sans">
            {[
              { name: 'Flowers', img: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=150&h=150&fit=crop' },
              { name: 'Cakes', img: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=150&h=150&fit=crop' },
              { name: 'Personalised', img: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=150&h=150&fit=crop' },
              { name: 'Plants', img: 'https://images.unsplash.com/photo-1459156212016-c812468e2115?w=150&h=150&fit=crop' },
              { name: 'Chocolates', img: 'https://images.unsplash.com/photo-1511381939415-e440c9c36ba3?w=150&h=150&fit=crop' },
              { name: 'Combos', img: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=150&h=150&fit=crop' },
              { name: 'Anniversary', img: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=150&h=150&fit=crop' },
              { name: 'Birthday', img: 'https://images.unsplash.com/photo-1530103862676-de8892bf309c?w=150&h=150&fit=crop' }
            ].map((cat, i) => (
              <div key={i} className="flex flex-col items-center gap-2 cursor-pointer group snap-start min-w-[70px] md:min-w-[90px] px-2">
                <div className="w-[60px] h-[60px] md:w-[75px] md:h-[75px] rounded-full overflow-hidden p-[3px] border-[2px] border-transparent group-hover:border-primary transition-all duration-300 bg-white">
                  <img src={cat.img} alt={cat.name} className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-500" />
                </div>
                <span className="text-[12px] font-bold text-gray-700 text-center whitespace-nowrap">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Carousel Section */}
      <section className="py-12 px-4 md:px-8 max-w-[1400px] mx-auto bg-gray-50/20">
        <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-2">
          <h2 className="text-[22px] md:text-[26px] font-black text-dark tracking-tight">Best Sellers</h2>
          <button className="text-[13px] font-bold text-secondary hover:underline">View All</button>
        </div>
        
        <div className="flex overflow-x-auto gap-4 pb-6 snap-x no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
          {[
            { title: "Red Roses Elegance With Glass Vase", price: "249", img: "https://images.unsplash.com/photo-1563241598-6bbdb1e96723?w=300&h=300&fit=crop" },
            { title: "Black Forest Cake (1 Kg)", price: "159", img: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&h=300&fit=crop" },
            { title: "Personalised Magic Mug", price: "49", img: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=300&h=300&fit=crop" },
            { title: "Mix Roses Bouquet", price: "199", img: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=300&h=300&fit=crop" },
            { title: "Ferrero Rocher Box - 16 Pcs", price: "89", img: "https://images.unsplash.com/photo-1511381939415-e440c9c36ba3?w=300&h=300&fit=crop" },
            { title: "Lucky Bamboo Plant", price: "69", img: "https://images.unsplash.com/photo-1459156212016-c812468e2115?w=300&h=300&fit=crop" },
          ].map((item, i) => (
             <div key={i} className="w-[170px] md:w-[220px] flex-shrink-0">
               <BoxItem title={item.title} price={item.price} image={item.img} />
             </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;

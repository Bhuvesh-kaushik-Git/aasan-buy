import React from 'react';

const SplitCard = ({ title, text, image }) => (
  <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_15px_40px_rgb(0,0,0,0.1)] transition-shadow p-3 flex w-[320px] md:w-[380px] h-[160px] snap-center shrink-0 border border-gray-50 flex-row gap-4 group">
    {/* Image Left */}
    <div className="w-[120px] h-full rounded-xl overflow-hidden bg-gray-50 relative flex-shrink-0">
      <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
    </div>
    
    {/* Content Right */}
    <div className="flex flex-col justify-between py-1 flex-grow">
      <div>
        <h3 className="text-[14px] md:text-[15px] font-bold text-dark leading-snug">{title}</h3>
        <p className="text-[10px] md:text-[11px] text-gray-500 mt-1.5 line-clamp-3 leading-relaxed">{text}</p>
      </div>
      <button className="bg-secondary text-white text-[11px] font-bold px-5 py-2 rounded-full w-max hover:-translate-y-0.5 hover:shadow-md transition-all uppercase tracking-wide">
        Buy Now
      </button>
    </div>
  </div>
);

const Home = () => {
  return (
    <div className="w-full font-sans bg-background relative overflow-hidden">
      {/* Fake Background Pattern (Subtle Doodles) */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#0e4c92 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 flex flex-col items-center text-center max-w-[1200px] mx-auto px-4 z-10 min-h-[75vh] justify-center">
        
        {/* Floating Box Graphic Placement */}
        <div className="relative w-full max-w-[400px] aspect-square flex items-center justify-center mb-6 animate-float">
          {/* We use a mask over a premium curated photo to create a central focused blob that floats */}
          <div className="absolute w-[80%] h-[80%] bg-primary/5 rounded-full blur-3xl -z-10"></div>
          <img 
            src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop" 
            alt="Curated Box" 
            className="w-[85%] h-[85%] object-cover rounded-full shadow-2xl border-8 border-white mask-image-blob"
            style={{ borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%' }}
          />
        </div>

        {/* Hero Text */}
        <div className="max-w-xl mx-auto flex flex-col items-center">
           <h1 className="text-4xl md:text-5xl lg:text-[64px] font-black tracking-tight leading-[1.1] mb-5">
             <span className="font-serif text-primary block sm:inline">CURATED JOY.</span>
             <span className="font-sans text-secondary block sm:inline sm:ml-4">AASAN LIVING.</span>
           </h1>
           <p className="text-gray-600 font-medium text-base md:text-[18px] max-w-[400px]">
             Hand-picked essentials, delivered to your door. Your easiest online experience.
           </p>

           {/* Main CTA */}
           <button className="mt-8 bg-secondary text-white text-[18px] font-bold px-12 py-4 rounded-full shadow-[0_10px_30px_rgb(245,156,26,0.35)] hover:shadow-[0_15px_40px_rgb(245,156,26,0.5)] hover:-translate-y-1 transition-all uppercase tracking-wider relative group">
             Buy Now
             <span className="absolute w-full h-full rounded-full border-2 border-secondary/50 -inset-2 opacity-0 group-hover:opacity-100 group-hover:animate-ping"></span>
           </button>
           
           <p className="text-[10px] text-gray-400 mt-4 max-w-[280px] italic">
             *Note: Final checkout will be completed on our trusted e-commerce partner's platform.
           </p>

           {/* Scroll Indicator */}
           <div className="flex flex-col items-center mt-12 text-primary opacity-60">
             <span className="text-[10px] font-bold tracking-widest uppercase mb-2">Scroll</span>
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 animate-bounce">
               <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 5.25h-15m15 4.5h-15m15 4.5h-15m15 4.5h-15" />
             </svg>
           </div>
        </div>
      </section>

      {/* Horizontal Carousel Section (Cards) */}
      <section className="py-10 pb-20 relative z-10">
        {/* We use negative margins to allow the scrollbar to bleed off screen edges smoothly */}
        <div className="flex overflow-x-auto gap-6 px-6 md:px-12 pb-10 snap-x no-scrollbar">
          {[
            { 
              title: "The Writer's Essentials Box", 
              text: "The Writer's essentials box fountains penta-sorms and write pourier essentials.",
              img: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&h=400&fit=crop"
            },
            { 
              title: "The Executive Pantry Box", 
              text: "The executive pantry promotes handlersprins sany artisanal sacce and procils, fine art coasts and product cisentns.",
              img: "https://images.unsplash.com/photo-1563241598-6bbdb1e96723?w=400&h=400&fit=crop"
            },
            { 
              title: "The Morning Routine Sets", 
              text: "A perfectly curated collection of morning essentials including artisanal coffee, a ceramic mug, and a daily planner.",
              img: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&h=400&fit=crop"
            },
            { 
              title: "The Relaxation Kit", 
              text: "Unwind with our premium bath salts, artisanal candle, and a relaxing playlist card.",
              img: "https://images.unsplash.com/photo-1559981421-3e0c0d5cb1ef?w=400&h=400&fit=crop"
            }
          ].map((item, i) => (
             <SplitCard key={i} title={item.title} text={item.text} image={item.img} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;

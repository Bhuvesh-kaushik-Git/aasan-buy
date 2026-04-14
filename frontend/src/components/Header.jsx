import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Header = ({ settings, onOpenCart }) => {
  const [hoveredMenu, setHoveredMenu] = useState(null);

  const navMenu = settings?.navMenu || [
    { 
      label: 'Flowers', 
      sections: [
        { title: 'Blossom Arrangement', links: [{ label: 'All Flowers', url: '#' }, { label: 'Hand Bouquets', url: '#' }] },
        { title: 'Floral Types', links: [{ label: 'Roses', url: '#' }, { label: 'Lilies', url: '#' }] }
      ] 
    },
    { 
      label: 'Combos', 
      sections: [
        { title: 'Popular Combos', links: [{ label: 'Flowers & Cakes', url: '#' }] }
      ] 
    },
  ];

  return (
    <>
      {/* Dynamic Backdrop Overlay - Dims the page when menu is open */}
      {hoveredMenu !== null && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[45] transition-opacity duration-300 pointer-events-none animate-fade-in mt-[115px]" 
        />
      )}

      <header className="fixed w-full top-0 z-50 bg-white shadow-sm font-sans">
        {/* Tier 1: Logo, Search, Actions */}
        <div className="border-b border-gray-100 bg-white">
          <div className="px-6 py-3 flex items-center justify-between max-w-[1400px] mx-auto gap-8">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-secondary">
                <path d="M9.375 3a1.875 1.875 0 0 0 0 3.75h1.875v4.5H3.375A1.875 1.875 0 0 1 1.5 9.375v-.75c0-1.036.84-1.875 1.875-1.875h3.193A3.375 3.375 0 0 1 12 2.753a3.375 3.375 0 0 1 5.432 3.997h3.193c1.035 0 1.875.84 1.875 1.875v.75a1.875 1.875 0 0 1-1.875 1.875H12.75v-4.5h1.875a1.875 1.875 0 1 0-1.875-1.875V3zM12.75 12.75h7.5v6.375a2.625 2.625 0 0 1-2.625 2.625H6.375a2.625 2.625 0 0 1-2.625-2.625V12.75h7.5zm-1.5 0H3.75v6.375c0 .621.504 1.125 1.125 1.125h6.375v-7.5z"/>
              </svg>
              <div className="flex flex-col">
                <span className="text-[20px] font-bold text-primary tracking-tight leading-none uppercase">Aasan<span className="text-secondary font-black">Buy</span></span>
                <span className="text-[7px] text-primary tracking-[0.2em] font-bold uppercase mt-0.5">Your Easy Online Store</span>
              </div>
            </Link>

            {/* Centered Search Bar */}
            <div className="flex-1 max-w-[600px] relative">
              <input 
                type="text" 
                placeholder="What are you looking for?" 
                className="w-full h-11 bg-gray-50 border border-gray-200 rounded-lg px-5 pr-12 text-sm focus:outline-none focus:border-secondary/50 focus:bg-white transition-all shadow-inner"
              />
              <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-secondary transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </button>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-7 shrink-0">
               <button className="flex flex-col items-center gap-1 group">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-700 group-hover:text-secondary transition-colors">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0M4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                  <span className="text-[10px] uppercase font-bold text-gray-500 group-hover:text-secondary transition-colors">Account</span>
               </button>
               
               <button onClick={onOpenCart} className="flex flex-col items-center gap-1 group relative">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-700 group-hover:text-secondary transition-colors">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                  </svg>
                  <span className="text-[10px] uppercase font-bold text-gray-500 group-hover:text-secondary transition-colors">Cart</span>
                  <span className="absolute -top-1 right-0 bg-secondary text-white text-[9px] font-bold w-[16px] h-[16px] rounded-full flex items-center justify-center border-2 border-white shadow-sm">0</span>
               </button>
            </div>
          </div>
        </div>

        {/* Tier 2: Dynamic Navigation Bar */}
      <div 
        className="bg-white shadow-sm relative z-50"
        onMouseLeave={() => setHoveredMenu(null)}
      >
        <div className="px-6 overflow-x-auto no-scrollbar border-t border-gray-50">
          <nav className="flex items-center justify-start max-w-[1400px] mx-auto gap-x-8 h-12">
             {navMenu.map((menu, idx) => (
               <div 
                 key={idx}
                 className="h-full flex items-center relative cursor-default group/nav"
                 onMouseEnter={() => setHoveredMenu(idx)}
               >
                 <span className={`text-[13px] font-bold flex items-center gap-1.5 uppercase tracking-wide h-full transition-colors ${hoveredMenu === idx ? 'text-secondary' : 'text-gray-700 hover:text-secondary'}`}>
                   {menu.label}
                   {menu.subOptions?.length > 0 && (
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className={`w-3 h-3 text-gray-400 transition-transform ${hoveredMenu === idx ? 'rotate-180 text-secondary' : ''}`}>
                       <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                     </svg>
                   )}
                 </span>

                 {/* Active bar indicator */}
                 <div className={`absolute bottom-0 left-0 w-full h-[3px] bg-secondary transition-transform origin-center ${hoveredMenu === idx ? 'scale-x-100' : 'scale-x-0'}`}></div>
               </div>
             ))}
          </nav>
        </div>

        {/* Full-Width Mega Menu Dropdown */}
        {hoveredMenu !== null && navMenu[hoveredMenu] && (() => {
             const currentMenu = navMenu[hoveredMenu];
             // Backward-compatibility: if legacy `subOptions` exist but no `sections`, map them over.
             const mappedSections = (currentMenu?.sections && currentMenu.sections.length > 0) 
               ? currentMenu.sections 
               : (currentMenu?.subOptions && currentMenu.subOptions.length > 0) 
                 ? [{ title: 'Options', links: currentMenu.subOptions.map(opt => ({ label: opt.label, url: opt.link || '#' })) }]
                 : [];

             if (mappedSections.length === 0) return null;

             return (
               <div className="absolute top-full left-0 w-full bg-[#faf5ec] shadow-[0_20px_40px_rgba(0,0,0,0.08)] border-t border-gray-100 animate-fade-in origin-top z-[60]">
                 <div className="max-w-[1400px] mx-auto px-6 py-12 flex gap-x-16 gap-y-12 flex-wrap min-h-[300px]">
                    {mappedSections.map((section, secIdx) => (
                      <div key={secIdx} className="flex flex-col min-w-[160px]">
                         {/* Section Header */}
                         {section?.title && (
                           <h4 className="text-[14px] font-bold text-dark pb-3 mb-3">{section.title}</h4>
                         )}
                         
                         {/* Section Links */}
                         <div className="flex flex-col gap-2">
                           {(section?.links || []).map((link, lIdx) => (
                              <Link key={lIdx} to={link?.url || link?.link || '#'} className="text-[13px] font-medium text-gray-500 hover:text-secondary hover:translate-x-1 transition-all">
                                {link?.label || 'Option'}
                              </Link>
                           ))}
                         </div>
                      </div>
                    ))}
                 </div>
               </div>
             );
          })()}
      </div>
      </header>
    </>
  );
};

export default Header;

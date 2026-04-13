import React from 'react';
import { Link } from 'react-router-dom';

const Header = ({ onOpenCart }) => {
  return (
    <header className="fixed w-full top-0 z-50 bg-white shadow-[0_2px_4px_rgba(0,0,0,0.05)] transition-all duration-300 font-sans">
      {/* Top Utility Nav - FNP Style */}
      <div className="bg-[#f5f5f5] text-gray-600 text-[11px] py-1.5 px-6 flex justify-end items-center hidden sm:flex border-b border-gray-200">
        <div className="flex gap-5 font-medium">
          <a href="#" className="hover:text-primary transition-colors cursor-pointer">Help Center</a>
          <a href="#" className="hover:text-primary transition-colors cursor-pointer">Track Order</a>
          <div className="flex items-center gap-1 cursor-pointer">
            <span>Currency : QAR</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3"><path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" /></svg>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="px-6 py-3 flex items-center justify-between gap-8 max-w-[1400px] mx-auto">
        {/* Logo - FNP cloned style */}
        <Link to="/" className="flex-shrink-0 cursor-pointer flex items-center gap-2">
            <span className="text-[28px] font-black tracking-tight text-secondary" style={{ fontFamily: 'Montserrat', wordSpacing: '-2px' }}>
              fnp<span className="text-[12px] align-top text-gray-500 font-bold ml-1">.qa</span>
            </span>
        </Link>

        {/* Search Bar - Center */}
        <div className="flex-grow max-w-[700px] relative hidden lg:block">
          <input 
            type="text" 
            placeholder="Search flowers, cakes, gifts etc." 
            className="w-full py-2.5 px-4 pr-12 rounded bg-gray-100/80 text-[13px] text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300 transition-all font-medium placeholder-gray-500"
          />
          <button className="absolute right-0 top-0 h-full w-12 flex items-center justify-center bg-transparent rounded-r text-secondary hover:bg-gray-200 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </button>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-7">
          <button className="flex flex-col items-center text-gray-800 hover:text-primary transition-colors group">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-[22px] h-[22px] mb-0.5 group-hover:-translate-y-0.5 transition-transform duration-300">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
            <span className="text-[11px] font-bold">Account</span>
          </button>
          
          <button onClick={onOpenCart} className="flex flex-col items-center text-gray-800 hover:text-primary transition-colors relative group">
            <div className="relative group-hover:-translate-y-0.5 transition-transform duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-[22px] h-[22px] mb-0.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
              </svg>
              <span className="absolute -top-1.5 -right-2 bg-secondary text-white text-[9px] font-bold w-[16px] h-[16px] rounded-full flex items-center justify-center">1</span>
            </div>
            <span className="text-[11px] font-bold text-secondary">Cart</span>
          </button>
        </div>
      </div>

      {/* Mega Menu / Categories - FNP style thin crisp border */}
      <nav className="border-t border-gray-200 hidden lg:block shadow-sm">
        <ul className="flex justify-center gap-10 text-[13px] font-bold text-gray-800 max-w-[1400px] mx-auto uppercase tracking-wide">
          {['Flowers', 'Cakes', 'Personalised', 'Plants', 'Chocolates', 'Combos', 'New Arrivals', 'Offers'].map((item) => (
            <li key={item}>
              <a href="#" className="hover:text-primary transition-colors py-3.5 block relative group">
                {item}
                <span className="absolute bottom-0 left-0 w-0 h-[3px] bg-primary transition-all duration-300 group-hover:w-full"></span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
};

export default Header;

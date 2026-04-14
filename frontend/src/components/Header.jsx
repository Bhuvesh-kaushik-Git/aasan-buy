import React from 'react';
import { Link } from 'react-router-dom';

const Header = ({ onOpenCart }) => {
  return (
    <header className="fixed w-full top-0 z-50 bg-background/90 backdrop-blur-md transition-all duration-300 font-sans border-b border-gray-100">
      <div className="px-6 py-4 flex items-center justify-between max-w-[1400px] mx-auto">
        
        {/* Left: Logo */}
        <Link to="/" className="flex flex-col items-start cursor-pointer hover:opacity-80 transition-opacity">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-secondary">
              <path d="M9.375 3a1.875 1.875 0 0 0 0 3.75h1.875v4.5H3.375A1.875 1.875 0 0 1 1.5 9.375v-.75c0-1.036.84-1.875 1.875-1.875h3.193A3.375 3.375 0 0 1 12 2.753a3.375 3.375 0 0 1 5.432 3.997h3.193c1.035 0 1.875.84 1.875 1.875v.75a1.875 1.875 0 0 1-1.875 1.875H12.75v-4.5h1.875a1.875 1.875 0 1 0-1.875-1.875V3zM12.75 12.75h7.5v6.375a2.625 2.625 0 0 1-2.625 2.625H6.375a2.625 2.625 0 0 1-2.625-2.625V12.75h7.5zm-1.5 0H3.75v6.375c0 .621.504 1.125 1.125 1.125h6.375v-7.5z"/>
            </svg>
            <div className="flex flex-col">
              <span className="text-[20px] font-bold text-primary tracking-tight leading-none uppercase">Aasan<span className="text-secondary font-black">Buy</span></span>
              <span className="text-[8px] text-primary tracking-widest font-semibold uppercase mt-0.5">Your Easy Online Store</span>
            </div>
          </div>
        </Link>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex gap-10 items-center justify-center absolute left-1/2 -translate-x-1/2">
          {['Home', 'Curated Sets', 'Our Story', 'Blog', 'Contact'].map((item) => (
            <Link 
              key={item} 
              to={item === 'Home' ? '/' : '#'} 
              className={`text-[14px] font-medium transition-colors relative group py-2 
                ${item === 'Home' ? 'text-primary' : 'text-gray-600 hover:text-primary'}
              `}
            >
              {item}
              {item === 'Home' && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-secondary rounded-full"></span>
              )}
              {item !== 'Home' && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-secondary rounded-full transition-all duration-300 group-hover:w-8"></span>
              )}
            </Link>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-6">
          <button className="text-dark hover:text-secondary transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-[22px] h-[22px]">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </button>
          
          <button onClick={onOpenCart} className="text-dark hover:text-secondary transition-colors relative">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-[22px] h-[22px]">
               <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
             </svg>
             <span className="absolute -top-1 -right-2 bg-secondary text-white text-[9px] font-bold w-[16px] h-[16px] rounded-full flex items-center justify-center">0</span>
          </button>
        </div>
        
      </div>
    </header>
  );
};

export default Header;

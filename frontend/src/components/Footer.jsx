import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-[#0a386b] text-white pt-16 pb-8 border-t-[8px] border-secondary">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
        {/* Brand Col */}
        <div>
          <div className="flex items-center gap-2 mb-6">
             <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary font-bold text-xl relative overflow-hidden shadow-lg">
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-secondary rounded-b-full"></div>
                  <span className="relative z-10">A</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-white leading-none tracking-tight">AASAN<span className="text-secondary">BUY</span></span>
                <span className="text-[0.6rem] font-semibold text-blue-200 uppercase tracking-widest mt-0.5">Your Easy Online Store</span>
              </div>
          </div>
          <p className="text-blue-100 text-sm mb-6 leading-relaxed">
            Delivering happiness across Qatar with premium flowers, delicious cakes, and thoughtfully personalized gifts. Make every occasion memorable.
          </p>
          <div className="flex gap-4">
            {['facebook', 'twitter', 'instagram', 'youtube'].map((social) => (
              <a key={social} href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary hover:-translate-y-1 transition-all">
                 <div className="w-4 h-4 bg-white opacity-80 mask-icon"></div>
              </a>
            ))}
          </div>
        </div>

        {/* Links Col 1 */}
        <div>
          <h3 className="text-lg font-bold mb-6 text-white relative inline-block">
            Shop By Center
            <span className="absolute -bottom-2 left-0 w-1/2 h-1 bg-secondary rounded-full"></span>
          </h3>
          <ul className="space-y-3 text-sm text-blue-100">
            {['Flowers', 'Cakes', 'Personalised Gifts', 'Combos', 'Chocolates'].map((link) => (
              <li key={link}><a href="#" className="hover:text-secondary transition-colors block">{link}</a></li>
            ))}
          </ul>
        </div>

        {/* Links Col 2 */}
        <div>
          <h3 className="text-lg font-bold mb-6 text-white relative inline-block">
            About Us
            <span className="absolute -bottom-2 left-0 w-1/2 h-1 bg-secondary rounded-full"></span>
          </h3>
          <ul className="space-y-3 text-sm text-blue-100">
            {['Our Story', 'Terms & Conditions', 'Privacy Policy', 'Contact Us', 'FAQ'].map((link) => (
              <li key={link}><a href="#" className="hover:text-secondary transition-colors block">{link}</a></li>
            ))}
          </ul>
        </div>

        {/* Newsletter Col */}
        <div>
          <h3 className="text-lg font-bold mb-6 text-white relative inline-block">
            Stay Updated
            <span className="absolute -bottom-2 left-0 w-1/2 h-1 bg-secondary rounded-full"></span>
          </h3>
          <p className="text-sm text-blue-100 mb-4">Subscribe to our newsletter for exclusive offers and updates.</p>
          <div className="flex flex-col gap-2">
            <input type="email" placeholder="Enter your email address" className="bg-white/10 border border-white/20 text-white placeholder-blue-200 px-4 py-3 rounded-lg focus:outline-none focus:border-secondary text-sm transition-colors" />
            <button className="bg-secondary text-white font-bold py-3 rounded-lg hover:bg-orange-500 transition-colors shadow-lg shadow-orange-500/20">Subscribe</button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-blue-200 text-sm">© 2026 AasanBuy Qatar. All rights reserved.</p>
        <div className="flex items-center gap-2">
           <span className="text-blue-200 text-sm mr-2">Secure Payments:</span>
           {/* Payment Icons placehoder */}
           <div className="flex gap-2">
             <div className="w-10 h-6 bg-white/20 rounded"></div>
             <div className="w-10 h-6 bg-white/20 rounded"></div>
             <div className="w-10 h-6 bg-white/20 rounded"></div>
           </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

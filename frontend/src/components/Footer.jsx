import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-dark text-white pt-20 pb-12 border-t border-white/5">
      <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
        {/* Brand & Mission */}
        <div className="space-y-8">
          <div className="flex flex-col">
            <span className="text-3xl font-black text-white leading-none tracking-tight font-heading">
                AASAN<span className="text-secondary">BUY</span>
            </span>
            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mt-2">Curated Luxury Essentials</span>
          </div>
          <p className="text-white/50 text-sm leading-relaxed max-w-xs">
            Transforming the way you shop for premium essentials. We bring curation and quality together, delivered at the speed of thought.
          </p>
          <div className="flex gap-4">
            {['Instagram', 'Twitter', 'Facebook'].map((social) => (
              <a key={social} href="#" className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary transition-all group">
                 <span className="text-[10px] font-black uppercase tracking-widest text-white group-hover:text-white">{social[0]}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Navigation Hub */}
        <div className="grid grid-cols-2 lg:col-span-2 gap-8">
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 mb-8 font-heading">Collections</h3>
              <ul className="space-y-4 text-[13px] font-bold text-white/60">
                {['Curated Flowers', 'Luxe Cakes', 'Personalised Joy', 'Combos'].map((link) => (
                  <li key={link}><a href="#" className="hover:text-secondary transition-colors block">{link}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 mb-8 font-heading">Trust & Legal</h3>
              <ul className="space-y-4 text-[13px] font-bold text-white/60">
                {['Our Story', 'Terms of Service', 'Privacy Policy', 'Shipping Policy', 'Contact Us'].map((link) => (
                  <li key={link}><a href="#" className="hover:text-secondary transition-colors block">{link}</a></li>
                ))}
              </ul>
            </div>
        </div>

        {/* Retention / Newsletter */}
        <div className="p-8 rounded-[32px] bg-white/5 border border-white/10 backdrop-blur-sm">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-secondary mb-4 font-heading">The Elite Club</h3>
          <p className="text-[12px] text-white/50 mb-6 font-medium leading-relaxed">Join 12,000+ members and get early access to exclusive drops.</p>
          <div className="flex flex-col gap-3">
            <input type="email" placeholder="Email Address" className="bg-black/20 border border-white/10 text-white placeholder-white/20 px-4 py-4 rounded-xl focus:outline-none focus:border-secondary text-xs transition-colors" />
            <button className="bg-primary text-white text-[11px] font-black uppercase tracking-widest py-4 rounded-xl hover:bg-primary-light transition-all shadow-xl shadow-primary/10">Subscribe Now</button>
          </div>
        </div>
      </div>

      {/* Trust Hub & Attribution */}
      <div className="max-w-[1400px] mx-auto px-6 pt-12 border-t border-white/5 flex flex-col lg:flex-row items-center justify-between gap-10">
        <div className="flex flex-wrap justify-center lg:justify-start gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
           <img src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg" alt="Razorpay" className="h-5" />
           <div className="h-6 w-[1px] bg-white/20" />
           <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase">
                <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 4.908-3.333 9.279-8 10.127-4.667-.848-8-5.219-8-10.127 0-.681.056-1.35.166-2.001zm10.741 2.908a1 1 0 111.186 1.618l-4 3a1 1 0 01-1.186 0l-2-1.5a1 1 0 111.186-1.618L9 10.158l3.907-2.931z" clipRule="evenodd" /></svg>
                SSL Secured
           </div>
           <div className="h-6 w-[1px] bg-white/20" />
           <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-white/80">
                100% Genuine JOY
           </div>
        </div>
        
        <div className="flex flex-col items-center lg:items-end gap-2">
            <p className="text-white/30 text-[11px] font-bold uppercase tracking-widest">© 2026 AasanBuy India. Excellence Curated.</p>
            <div className="flex gap-4 text-[10px] font-bold text-white/20 uppercase tracking-widest">
                <a href="#" className="hover:text-white transition-colors">Privacy</a>
                <a href="#" className="hover:text-white transition-colors">Sitemap</a>
            </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

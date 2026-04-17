import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/Toast';

const API_URL = import.meta.env.VITE_API_URL;

// ── Components ──────────────────────────────────────────────────────────────

const SuggestionModal = ({ isOpen, onClose, onViewCart }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-sans animate-fade-in">
      <div className="absolute inset-0 bg-dark/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-premium w-full max-w-2xl overflow-hidden animate-fade-in-up">
        <div className="p-5 flex justify-center items-center relative border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-xl font-black font-heading text-primary">Make It Extra Special</h3>
          <button onClick={onClose} className="absolute right-5 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white rounded-full text-gray-400 hover:text-primary border border-gray-100 shadow-soft transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { title: 'Dairy Milk Silk', price: '125', img: 'https://images.unsplash.com/photo-1548845971-eb6df5c68b64?w=150&h=150&fit=crop' },
              { title: 'Golden Balloon', price: '75', img: 'https://images.unsplash.com/photo-1530103862676-de8892bf309c?w=150&h=150&fit=crop' },
              { title: 'Luxury Card', price: '99', img: 'https://images.unsplash.com/photo-1596482163351-7871b6980db7?w=150&h=150&fit=crop' },
              { title: 'Premium Bear', price: '499', img: 'https://images.unsplash.com/photo-1559981421-3e0c0d5cb1ef?w=150&h=150&fit=crop' },
            ].map((item, i) => (
              <div key={i} className="group bg-white rounded-2xl p-3 flex flex-col items-center text-center border border-gray-100 shadow-soft hover:shadow-premium transition-all">
                <div className="w-20 h-20 rounded-xl bg-gray-50 overflow-hidden mb-3">
                  <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <span className="text-[11px] font-bold text-gray-500 mb-1 leading-tight">{item.title}</span>
                <span className="text-[13px] font-black text-primary mb-3">₹{item.price}</span>
                <button className="w-full text-[10px] font-black text-white bg-primary rounded-lg py-2 transition-all hover:bg-primary-light">Add to Box</button>
              </div>
            ))}
          </div>
        </div>
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center gap-4">
          <button onClick={onClose} className="text-sm font-black text-gray-400 hover:text-dark px-6 py-3 border border-gray-200 rounded-2xl bg-white hover:bg-gray-50 transition-all">
            No, Thanks
          </button>
          <button onClick={onViewCart} className="flex-1 bg-secondary text-white px-8 py-3.5 rounded-2xl font-black text-sm hover:shadow-lg hover:shadow-secondary/30 transition-all transform hover:-translate-y-0.5">
            Checkout Now →
          </button>
        </div>
      </div>
    </div>
  );
};

const StarRating = ({ value, size = 'md', onChange }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map(s => (
      <button
        key={s} type="button"
        onClick={() => onChange && onChange(s)}
        className={`${size === 'sm' ? 'text-sm' : 'text-2xl'} transition-colors ${s <= value ? 'text-secondary' : 'text-gray-200'} ${onChange ? 'cursor-pointer' : 'cursor-default'}`}
      >★</button>
    ))}
  </div>
);

const ReviewsSection = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ rating: 5, title: '', comment: '', guestName: '' });
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetch(`${API_URL}/api/products/${productId}/reviews`)
      .then(r => r.json())
      .then(data => setReviews(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowForm(false);
        setForm({ rating: 5, title: '', comment: '', guestName: '' });
        showToast("Review submitted for moderation! ✨", "success");
      }
    } catch {
        showToast("Error submitting review. Try again.", "error");
    }
    setSubmitting(false);
  };

  return (
    <div className="mt-20 border-t border-gray-100 pt-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="border-l-4 border-primary pl-4">
          <h2 className="text-2xl font-black font-heading text-dark">Verified Reviews</h2>
          <p className="text-sm text-gray-500 font-medium">Hear from our community of gifters</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="bg-white border-2 border-primary text-primary font-black px-6 py-3 rounded-2xl text-sm hover:bg-primary hover:text-white transition-all transform hover:-translate-y-1"
        >
          {showForm ? 'Cancel' : '+ Share Your Vibe'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-100 shadow-premium rounded-[32px] p-8 mb-12 animate-fade-in-up">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">My Rating</label>
                <StarRating value={form.rating} onChange={v => setForm({ ...form, rating: v })} />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">My Name</label>
                <input value={form.guestName} onChange={e => setForm({ ...form, guestName: e.target.value })} placeholder="Alex R." className="w-full bg-gray-50 border border-transparent rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-primary focus:outline-none transition-all" />
              </div>
           </div>
           <div className="mb-6">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Headline</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="E.g. Pure Joy!" className="w-full bg-gray-50 border border-transparent rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-primary focus:outline-none transition-all" />
           </div>
           <div className="mb-6">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Experience</label>
              <textarea required rows={4} value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })} placeholder="Tell us more about it..." className="w-full bg-gray-50 border border-transparent rounded-2xl px-4 py-3 text-sm focus:bg-white focus:border-primary focus:outline-none transition-all resize-none" />
           </div>
           <button type="submit" disabled={submitting} className="w-full md:w-auto bg-primary text-white font-black px-12 py-4 rounded-2xl text-sm shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50">
             {submitting ? 'Submitting...' : 'Post Verified Review'}
           </button>
        </form>
      )}

      {reviews.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[32px] border-2 border-dashed border-gray-100">
          <span className="text-5xl block mb-4">✨</span>
          <p className="font-heading font-black text-xl text-gray-400">Be the pioneer reviewer</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((r, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-3xl p-8 shadow-soft hover:shadow-premium transition-all">
               <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-primary/5 text-primary font-black flex items-center justify-center border border-primary/10">
                      {(r.user?.name || r.guestName || 'A')[0].toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-black text-dark text-sm leading-none">{r.user?.name || r.guestName || 'Anonymous'}</h4>
                      <div className="flex items-center gap-2 mt-1.5">
                        <StarRating value={r.rating} size="sm" />
                        <span className="text-[10px] text-gray-400 font-bold uppercase">{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  {r.isVerifiedPurchase && <span className="bg-emerald-50 text-emerald-600 text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-widest">Verified Buyer</span>}
               </div>
               {r.title && <h5 className="font-black text-primary text-sm mb-2">{r.title}</h5>}
               <p className="text-gray-500 text-[13px] leading-relaxed font-medium italic">"{r.comment}"</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────

const ProductDetails = ({ onOpenCart }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const { addToCart } = useCart();
  const { showToast } = useToast();

  useEffect(() => {
    fetch(`${API_URL}/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        if (data.colors?.length > 0) setSelectedColor(data.colors[0]);
        if (data.sizes?.length > 0) setSelectedSize(data.sizes[0]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-primary animate-pulse text-2xl font-heading">AasanBuy.</div>;
  if (!product) return <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 py-20 px-4 text-center">
    <span className="text-6xl mb-4">🔍</span>
    <h2 className="text-2xl font-black text-dark">This Joy is Hidden...</h2>
    <p className="text-gray-500">The product you are looking for doesn't exist or is recently removed.</p>
    <a href="/" className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-sm mt-4 shadow-xl">Back to Explorations</a>
  </div>;

  const discountPercent = product.mrp && product.price < product.mrp
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

  const displayImages = selectedColor?.images?.length > 0 ? selectedColor.images : product.images || [];
  const isOutOfStock = product.stock <= 0;

  return (
    <div className="w-full bg-[#FAFAFB] min-h-screen pb-24">
      
      {/* breadcrumb */}
      <div className="max-w-[1400px] mx-auto px-6 py-8">
          <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
            <a href="/" className="hover:text-primary transition-colors">Home</a>
            <span>/</span>
            <a href="/products" className="hover:text-primary transition-colors">{product.categories?.[0] || 'Collections'}</a>
            <span>/</span>
            <span className="text-primary">{product.name}</span>
          </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        <div className="bg-white rounded-[40px] shadow-premium border border-gray-100 flex flex-col lg:flex-row items-stretch overflow-hidden">
           
           {/* Left: Enhanced Images */}
           <div className="w-full lg:w-[48%] xl:w-[45%] bg-[#F8F9FB] flex flex-col lg:border-r border-gray-100 p-4 md:p-8">
              <div className="relative aspect-square bg-white rounded-[32px] shadow-soft border border-gray-100 overflow-hidden mb-6 flex items-center justify-center p-8 group">
                  <img src={displayImages[activeImg]} className="max-w-full max-h-full object-contain transition-transform duration-700 group-hover:scale-110" alt={product.name} />
                  {isOutOfStock && (
                      <div className="absolute inset-0 bg-dark/40 backdrop-blur-[2px] flex items-center justify-center">
                          <span className="bg-white text-dark font-black px-8 py-3 rounded-2xl tracking-[0.2em] shadow-2xl">SOLDOUT</span>
                      </div>
                  )}
                  {discountPercent > 0 && (
                      <div className="absolute top-6 left-6 bg-cta-buy text-white font-black px-4 py-2 rounded-xl text-[12px] shadow-xl">
                          {discountPercent}% OFF
                      </div>
                  )}
              </div>

              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                 {displayImages.map((img, i) => (
                   <button 
                    key={i} onClick={() => setActiveImg(i)}
                    className={`shrink-0 w-24 h-24 rounded-2xl border-2 transition-all p-2 bg-white ${activeImg === i ? 'border-primary ring-4 ring-primary/5 scale-95 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                   >
                     <img src={img} className="w-full h-full object-contain" />
                   </button>
                 ))}
              </div>
           </div>

           {/* Right: Conversion Optimized Panel */}
           <div className="flex-1 p-6 md:p-12">
              <div className="flex items-center gap-3 mb-4">
                  <span className="bg-primary/5 text-primary text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest">{product.brand || 'Exclusive'}</span>
                  {product.stock <= 5 && !isOutOfStock && <span className="bg-amber-500 text-white text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest animate-pulse">🔥 High Demand</span>}
              </div>

              <h1 className="text-3xl md:text-5xl font-black font-heading text-dark leading-tight mb-6">
                {product.name}
              </h1>

              <div className="flex items-center gap-6 pb-8 border-b border-gray-100 mb-8">
                  <div>
                    <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest block mb-1">Price</span>
                    <div className="flex items-baseline gap-3">
                        <span className="text-4xl font-black text-primary">₹{product.price.toLocaleString()}</span>
                        {product.mrp > product.price && <span className="text-lg text-gray-300 line-through font-bold">₹{product.mrp.toLocaleString()}</span>}
                    </div>
                  </div>
                  <div className="h-10 w-[1px] bg-gray-100" />
                  <div>
                    <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest block mb-1">Ratings</span>
                    <div className="flex items-center gap-1.5">
                        <span className="text-xl font-black text-dark">{product.rating || 4.5}</span>
                        <div className="flex text-secondary text-sm">★★★★★</div>
                    </div>
                  </div>
              </div>

              {/* Variants */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                 {product.colors?.length > 0 && (
                   <div>
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Selection: <span className="text-dark font-black">{selectedColor?.name}</span></label>
                     <div className="flex gap-4">
                        {product.colors.map((c, i) => (
                          <button key={i} onClick={() => { setSelectedColor(c); setActiveImg(0); }}
                            className={`w-10 h-10 rounded-2xl p-[3px] border-2 transition-all ${selectedColor?.name === c.name ? 'border-primary ring-4 ring-primary/10' : 'border-transparent hover:border-gray-200'}`}
                          >
                            <div className="w-full h-full rounded-xl overflow-hidden border border-gray-100" style={{ backgroundColor: c.hex }}></div>
                          </button>
                        ))}
                     </div>
                   </div>
                 )}
                 {product.sizes?.length > 0 && (
                   <div>
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Size Preference</label>
                     <div className="flex gap-3">
                        {product.sizes.map((s, i) => (
                           <button key={i} onClick={() => setSelectedSize(s)}
                            className={`min-w-[54px] h-11 border-2 font-black text-sm rounded-xl transition-all ${selectedSize === s ? 'border-primary bg-primary text-white shadow-xl' : 'border-gray-100 text-gray-400 hover:border-primary/20'}`}
                           >
                             {s}
                           </button>
                        ))}
                     </div>
                   </div>
                 )}
              </div>

              {/* Action Block */}
              <div className="space-y-4 mb-12">
                  <div className="flex gap-4">
                    <button 
                      onClick={() => { addToCart(product, 1, selectedColor, selectedSize); setShowModal(true); showToast(`${product.name} added to box!`, "success"); }}
                      disabled={isOutOfStock}
                      className="flex-1 h-16 bg-[#F8F9FB] text-primary border-2 border-primary/10 font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-white hover:border-primary transition-all disabled:opacity-50 btn-premium"
                    >
                      Add to Box
                    </button>
                    <button 
                      onClick={() => { addToCart(product, 1, selectedColor, selectedSize); navigate('/checkout'); }}
                      disabled={isOutOfStock}
                      className="flex-[1.5] h-16 bg-cta-buy text-white font-black rounded-2xl shadow-xl shadow-cta-buy/20 flex items-center justify-center gap-2 transform active:scale-95 transition-all hover:-translate-y-1 hover:brightness-110 disabled:opacity-50 btn-premium"
                    >
                      Buy Now & Save
                    </button>
                  </div>
                 <div className="flex items-center justify-center gap-4 text-[11px] font-bold text-gray-400">
                    <span className="flex items-center gap-1.5"><svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg> Secure Transaction</span>
                    <span className="flex items-center gap-1.5"><svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg> 7 Days Returns</span>
                 </div>
              </div>

              {/* Insights */}
              <div className="bg-[#F8F9FB] rounded-3xl p-8 border border-gray-50">
                   <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Product Story</h4>
                  <div className="prose prose-sm text-gray-500 leading-relaxed font-medium mb-8">
                      <div dangerouslySetInnerHTML={{ __html: product.description }} />
                  </div>
                  {product.highlights?.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                        {product.highlights.map((h, i) => (
                           <div key={i} className="flex items-start gap-3">
                              <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-1.5 shrink-0" />
                              <span className="text-[13px] font-bold text-dark/80">{h}</span>
                           </div>
                        ))}
                      </div>
                  )}
              </div>

              {/* Social Proof Toggle */}
              <ReviewsSection productId={id} />
           </div>
        </div>
      </div>

      <SuggestionModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        onViewCart={() => { setShowModal(false); navigate('/checkout'); }} 
      />
    </div>
  );
};

export default ProductDetails;

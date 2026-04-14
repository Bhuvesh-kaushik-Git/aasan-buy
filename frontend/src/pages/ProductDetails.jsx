import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const SuggestionModal = ({ isOpen, onClose, onContinue }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0 font-sans">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded shadow-2xl w-full max-w-3xl overflow-hidden animate-fade-in-up">
        {/* Header - FNP Style (minimal, centered text, x top right) */}
        <div className="p-4 flex justify-center items-center text-dark relative border-b border-gray-100 bg-[#f9f9f9]">
          <h3 className="text-lg font-bold">Make It More Special</h3>
          <button onClick={onClose} className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white rounded-full text-gray-500 hover:text-dark border shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 bg-[#fafafa]">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { title: "Dairy Milk Silk", price: "25", img: "https://images.unsplash.com/photo-1548845971-eb6df5c68b64?w=150&h=150&fit=crop" },
              { title: "Happy Birthday Balloon", price: "15", img: "https://images.unsplash.com/photo-1530103862676-de8892bf309c?w=150&h=150&fit=crop" },
              { title: "Greeting Card", price: "10", img: "https://images.unsplash.com/photo-1596482163351-7871b6980db7?w=150&h=150&fit=crop" },
              { title: "Cute Teddy Bear", price: "45", img: "https://images.unsplash.com/photo-1559981421-3e0c0d5cb1ef?w=150&h=150&fit=crop" },
            ].map((item, i) => (
              <div key={i} className="border border-gray-200 bg-white rounded-lg p-3 flex flex-col items-center text-center transition-colors">
                <img src={item.img} alt={item.title} className="w-[70px] h-[70px] object-cover rounded mb-3" />
                <span className="text-[12px] font-semibold text-gray-700 line-clamp-1 mb-1">{item.title}</span>
                <span className="text-[13px] text-dark font-bold mb-3 font-sans">QAR {item.price}</span>
                <button className="w-full text-[12px] font-bold text-primary border border-primary px-4 py-1.5 rounded hover:bg-primary hover:text-white transition-colors uppercase tracking-wide">Add</button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-gray-100 flex justify-end gap-4">
            <button onClick={onContinue} className="text-[13px] font-bold text-gray-500 hover:text-dark px-4 py-2 uppercase underline tracking-wider">Skip & Continue</button>
            <button onClick={onContinue} className="bg-primary text-white px-8 py-2.5 rounded font-bold uppercase hover:bg-opacity-90 shadow-sm text-[13px] tracking-wider transition-colors">Proceed</button>
        </div>
      </div>
    </div>
  );
};

const ProductDetails = ({ onOpenCart }) => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [showModal, setShowModal] = useState(false);
  
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/products/${id}`);
        if (!res.ok) throw new Error('Product not found');
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    setShowModal(true);
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center font-bold text-secondary animate-pulse">Loading Product...</div>;
  if (error) return <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
    <div className="text-red-500 font-bold">{error}</div>
    <a href="/" className="text-secondary underline">Back to Home</a>
  </div>;
  if (!product) return null;

  return (
    <div className="w-full bg-[#fcfcfc] font-sans">
      <div className="max-w-[1250px] mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
        
        {/* Left Col: Images Stacked (FNP Style) */}
        <div className="flex gap-4">
           {/* Thumbnails */}
           <div className="hidden md:flex flex-col gap-3 w-20">
             {product.images.map((img, i) => (
               <div key={i} 
                 onClick={() => setActiveImg(i)}
                 className={`aspect-square border cursor-pointer overflow-hidden transition-all ${i === activeImg ? 'border-secondary border-[2px] shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}
               >
                 <img src={img} className="w-full h-full object-cover" />
               </div>
             ))}
           </div>
           {/* Main Image area */}
           <div className="flex-grow bg-white aspect-square border border-gray-100 relative overflow-hidden rounded-lg shadow-sm">
             <img src={product.images[activeImg]} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" alt={product.name} />
             {product.stock > 0 && product.stock < 10 && (
               <div className="absolute top-4 left-4 bg-secondary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">Only {product.stock} Left!</div>
             )}
           </div>
        </div>

        {/* Right Col: Specific Details panel */}
        <div>
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] sticky top-36">
            <h1 className="text-[24px] font-bold text-dark leading-snug tracking-tight mb-2">{product.name}</h1>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center bg-orange-50 px-2 py-0.5 rounded text-secondary text-[12px] font-bold border border-orange-100">★ 4.8</div>
              <span className="text-[13px] text-gray-500 font-medium">{product.category}</span>
            </div>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-[28px] font-black text-dark font-sans tracking-tight">QAR {product.price}</span>
              <span className="text-[16px] text-gray-400 line-through">QAR {Math.round(product.price * 1.2)}</span>
              <span className="text-[13px] font-bold text-secondary tracking-widest uppercase">(20% OFF)</span>
            </div>

            {/* Delivery Inputs Box */}
            <div className="bg-[#fffbf4] border border-orange-100/50 rounded-2xl p-5 mb-6">
               <h4 className="font-bold text-gray-800 text-[12px] uppercase tracking-wider mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-secondary"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
                  Delivery Destination
               </h4>
               <div className="space-y-4">
                 <div className="relative">
                   <input 
                      type="text" 
                      placeholder="Enter Area / Pincode" 
                      className="w-full border-b-2 border-gray-200 bg-transparent py-2 text-[14px] focus:outline-none focus:border-secondary transition-colors text-dark font-medium placeholder:text-gray-400" 
                   />
                 </div>
                 <div className="relative">
                   <input 
                      type="date"
                      className="w-full border-b-2 border-gray-200 bg-transparent py-2 text-[14px] focus:outline-none focus:border-secondary transition-colors text-gray-600 font-medium"
                   />
                 </div>
               </div>
               <p className="text-[11px] text-gray-400 mt-4 leading-normal italic">* Select a date to see available delivery slots.</p>
            </div>

            <div className="pt-2 mb-8">
              <h4 className="font-bold text-gray-800 text-[12px] uppercase tracking-wider mb-2">Description</h4>
              <p className="text-[14px] text-gray-600 leading-relaxed font-medium">
                {product.description}
              </p>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={handleAddToCart} 
                className="flex-1 bg-secondary text-white font-black py-4 rounded-xl hover:shadow-[0_10px_25px_rgba(245,156,26,0.3)] hover:-translate-y-0.5 transition-all uppercase text-[15px] tracking-widest"
              >
                ADD TO CART
              </button>
            </div>

            <div className="mt-6 flex items-center justify-center gap-6 border-t border-gray-100 pt-6">
               <div className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-secondary">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Secure</span>
               </div>
               <div className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-secondary">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.129-1.125V11.25c0-.447-.25-.847-.643-1.04l-2.25-1.125a1.125 1.125 0 0 0-1.04 0l-2.25 1.125a1.125 1.125 0 0 0-.643 1.04v1.125m-9 0h1.125m1.125-1.125h1.125m1.125-1.125h1.125" /></svg>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fast</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      <SuggestionModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        onContinue={() => {
          setShowModal(false);
          onOpenCart();
        }} 
      />
    </div>
  );
};

export default ProductDetails;

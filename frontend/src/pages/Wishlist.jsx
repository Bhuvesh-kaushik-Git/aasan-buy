import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/Toast';
import OptimizedImage from '../components/OptimizedImage';

const Wishlist = () => {
    const { wishlist, toggleWishlist, loading } = useWishlist();
    const { addToCart } = useCart();
    const { showToast } = useToast();

    if (loading && wishlist.length === 0) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-pulse font-black text-primary text-xl">Loading Favorites...</div>
            </div>
        );
    }

    if (wishlist.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                <div className="w-24 h-24 bg-gray-50 rounded-[40px] flex items-center justify-center text-gray-300 text-4xl mb-8">❤️</div>
                <h2 className="text-3xl font-black text-dark tracking-tighter mb-4">Your Favorites are Empty.</h2>
                <p className="text-gray-500 mb-10 max-w-sm">Save the items you love and they will stay here for your next curation.</p>
                <Link to="/products" className="bg-primary text-white px-10 py-4 rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-105 transition-all">Explore Collections</Link>
            </div>
        );
    }

    return (
        <div className="max-w-[1400px] mx-auto px-6 py-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                     <span className="text-[10px] font-black text-secondary uppercase tracking-[0.4em] mb-2 block">Curation Hub</span>
                     <h1 className="text-4xl font-black text-dark tracking-tighter">My Favorites ({wishlist.length})</h1>
                </div>
                <p className="text-sm text-gray-400 font-medium max-w-xs text-right">Items you've handpicked for later. Ready to add them to your box?</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                {wishlist.map(product => (
                    <div key={product._id} className="group bg-white rounded-[40px] p-5 border border-black/5 hover:border-primary/20 hover:shadow-premium transition-all relative">
                        <button 
                            onClick={() => toggleWishlist(product)}
                            className="absolute top-8 right-8 z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center text-rose-500 shadow-soft border border-gray-100 hover:scale-110 active:scale-95 transition-all"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5"><path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001Z" /></svg>
                        </button>
                        
                        <Link to={`/product/${product._id}`} className="block">
                            <div className="aspect-square rounded-[32px] bg-[#F8F9FB] overflow-hidden mb-6 flex items-center justify-center p-6 group-hover:bg-white transition-colors">
                                <OptimizedImage src={product.images?.[0]} className="max-w-full max-h-full group-hover:scale-110 transition-transform duration-700" alt={product.name} />
                            </div>
                            <h3 className="text-sm font-black text-dark line-clamp-2 mb-2 group-hover:text-primary transition-colors">{product.name}</h3>
                            <p className="text-lg font-black text-primary mb-6">₹{product.price.toLocaleString()}</p>
                        </Link>

                        <button 
                            onClick={() => { addToCart(product, 1); showToast(`${product.name} added to box!`, "success"); }}
                            className="w-full bg-white border-2 border-primary/10 text-primary py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-primary hover:text-white hover:border-primary transition-all shadow-soft"
                        >
                            Add to Box
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Wishlist;

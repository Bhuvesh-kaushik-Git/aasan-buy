import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
import OptimizedImage from '../components/OptimizedImage';

const ThankYou = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const orderId = queryParams.get('orderId');
    
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [recommendedProducts, setRecommendedProducts] = useState([]);

    useEffect(() => {
        if (!orderId) {
            navigate('/');
            return;
        }

        const fetchOrder = async () => {
            try {
                const res = await fetch(`${API_URL}/orders/${orderId}`);
                if (!res.ok) throw new Error('Order not found');
                const data = await res.json();
                setOrder(data);

                // Fetch recommendations based on first item's category
                if (data.items?.[0]?.category) {
                     const recRes = await fetch(`${API_URL}/products?category=${data.items[0].category}&limit=4`);
                     const recData = await recRes.json();
                     setRecommendedProducts((recData.products || []).filter(p => !data.items.find(item => item.productId === p._id)));
                } else {
                     // Fallback to trending
                     const recRes = await fetch(`${API_URL}/products?limit=4&sort=trending`);
                     const recData = await recRes.json();
                     setRecommendedProducts(recData.products || []);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId, navigate]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-xs">Authenticating Success...</p>
            </div>
        </div>
    );

    if (error || !order) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
            <div className="w-20 h-20 bg-red-50 rounded-[32px] flex items-center justify-center mb-6 text-red-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" /></svg>
            </div>
            <h2 className="text-3xl font-black text-dark tracking-tighter mb-2">Order Not Found</h2>
            <p className="text-gray-500 mb-8 max-w-sm">We couldn't retrieve the details for this order. It might still be processing or the ID is invalid.</p>
            <Link to="/" className="bg-primary text-white px-10 py-4 rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:brightness-110 transition-all">Go Home</Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#FAFAFB] pt-12 pb-24">
            <div className="max-w-[1000px] mx-auto px-6">
                
                {/* ── Success Hero ── */}
                <div className="flex flex-col items-center text-center mb-16 animate-fade-in-up">
                    <div className="w-24 h-24 bg-emerald-500 rounded-[40px] flex items-center justify-center text-white mb-8 shadow-2xl shadow-emerald-500/20 relative">
                        <div className="absolute inset-0 bg-emerald-500 rounded-[40px] animate-ping opacity-20" />
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-12 h-12 relative z-10"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                    </div>
                    <span className="text-[12px] font-black text-emerald-500 uppercase tracking-[0.4em] mb-4">Transaction Successful</span>
                    <h1 className="text-4xl md:text-6xl font-black text-dark tracking-tighter leading-none mb-4">Thank You For Choosing Us.</h1>
                    <p className="text-gray-400 font-medium text-lg max-w-lg">Your order <span className="text-secondary font-black">#{orderId.slice(-8).toUpperCase()}</span> has been placed and is currently being prepared with care.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 items-start">
                    
                    {/* ── Order Details ── */}
                    <div className="space-y-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                        
                        {/* Order Items */}
                        <div className="bg-white rounded-[40px] shadow-soft border border-black/5 overflow-hidden">
                            <div className="px-10 py-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h2 className="text-[13px] font-black text-primary uppercase tracking-widest">Order Summary</h2>
                                <span className="text-[11px] font-black text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-100 uppercase tracking-widest">{order.items.length} Items</span>
                            </div>
                            <div className="p-10 space-y-6">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex gap-6 items-center group">
                                        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                                            <OptimizedImage src={item.image} className="w-full h-full" alt={item.name} />
                                        </div>
                                        <div className="flex-grow">
                                            <h3 className="text-sm font-black text-dark group-hover:text-primary transition-colors">{item.name}</h3>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-[11px] font-bold text-gray-400">Qty: {item.quantity}</span>
                                                {item.selectedSize && <span className="w-1 h-1 bg-gray-200 rounded-full" />}
                                                {item.selectedSize && <span className="text-[11px] font-bold text-gray-400 uppercase">{item.selectedSize}</span>}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-dark">₹{(item.price * item.quantity).toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Delivery Info */}
                        <div className="bg-white rounded-[40px] shadow-soft border border-black/5 p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div>
                                <h3 className="text-[11px] font-black text-primary uppercase tracking-widest mb-6">Delivery details</h3>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 text-lg">📍</div>
                                        <div className="text-sm leading-relaxed text-gray-500 font-medium">
                                            <p className="font-black text-dark mb-1">{order.customerDetails.fullName}</p>
                                            <p>{order.customerDetails.address}</p>
                                            <p>{order.customerDetails.city}, {order.customerDetails.state} - {order.customerDetails.pincode}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-[11px] font-black text-primary uppercase tracking-widest mb-6">Contact Info</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 text-lg">📞</div>
                                        <span className="text-sm font-bold text-dark">{order.customerDetails.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 text-lg">📧</div>
                                        <span className="text-sm font-bold text-dark">{order.customerDetails.email}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* ── Payment Summary ── */}
                    <div className="space-y-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                        <div className="bg-primary rounded-[40px] p-10 text-white shadow-2xl shadow-primary/30 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-12 translate-x-12 blur-3xl" />
                            
                            <h2 className="text-[11px] font-black uppercase tracking-widest opacity-60 mb-8">Payment Summary</h2>
                            
                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-sm">
                                    <span className="opacity-70">Subtotal</span>
                                    <span className="font-bold">₹{order.originalAmount.toLocaleString()}</span>
                                </div>
                                {order.discountAmount > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="opacity-70">Coupon Discount</span>
                                        <span className="font-black text-secondary">- ₹{order.discountAmount.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm">
                                    <span className="opacity-70">Shipping</span>
                                    <span className="font-black text-emerald-300">FREE</span>
                                </div>
                                <div className="pt-6 border-t border-white/10 flex justify-between items-baseline">
                                    <span className="text-xs font-black uppercase tracking-widest">Amount Paid</span>
                                    <span className="text-4xl font-black tracking-tighter font-heading">₹{order.totalAmount.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex justify-between items-center">
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Method</span>
                                <span className="text-xs font-black uppercase tracking-widest">{order.paymentMethod}</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 px-2">
                             <Link to="/products" className="w-full bg-white text-dark py-5 rounded-2xl font-black text-center text-sm shadow-soft hover:shadow-premium transition-all">Continue Shopping</Link>
                             <button onClick={() => window.print()} className="text-[11px] font-black text-gray-400 uppercase tracking-widest hover:text-primary transition-colors">Print Receipt</button>
                        </div>
                    </div>

                </div>

                {/* ── Recommendations ── */}
                {recommendedProducts.length > 0 && (
                    <div className="mt-20 border-t border-gray-100 pt-16 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-black text-dark tracking-tight">You Might Also Like</h2>
                            <Link to="/products" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Explore All →</Link>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {recommendedProducts.map(p => (
                                <Link key={p._id} to={`/product/${p._id}`} className="group bg-white rounded-3xl p-4 border border-black/5 hover:border-primary/20 transition-all shadow-soft overflow-hidden">
                                    <div className="aspect-square rounded-2xl bg-gray-50 mb-4 overflow-hidden">
                                        <OptimizedImage src={p.images?.[0]} className="w-full h-full group-hover:scale-110 transition-transform duration-700" alt="" />
                                    </div>
                                    <h3 className="text-[11px] font-black text-dark line-clamp-1 mb-1">{p.name}</h3>
                                    <p className="text-[13px] font-black text-primary">₹{p.price.toLocaleString()}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Footer Branding ── */}
                <div className="mt-24 pt-12 border-t border-gray-100 text-center animate-fade-in-up" style={{ animationDelay: '500ms' }}>
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em]">Curated with Love By AasanBuy</p>
                </div>

            </div>
        </div>
    );
};

export default ThankYou;

import React, { useState } from 'react';
import { useToast } from '../components/Toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const TrackOrder = () => {
    const [orderId, setOrderId] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [orderData, setOrderData] = useState(null);
    const { showToast } = useToast();

    const handleTrack = async (e) => {
        e.preventDefault();
        setLoading(true);
        setOrderData(null);
        try {
            const res = await fetch(`${API_URL}/api/orders/track`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: orderId.trim(), email: email.trim() })
            });
            const data = await res.json();
            if (res.ok) {
                setOrderData(data);
                showToast("Order status successfully retrieved!", "success");
            } else {
                showToast(data.error || "Order not found. Please check details.", "error");
            }
        } catch (err) {
            showToast("Failed to connect to tracking server", "error");
        } finally {
            setLoading(false);
        }
    };

    const steps = ['Processing', 'Shipped', 'Delivered'];
    const currentStep = orderData ? steps.indexOf(orderData.orderStatus) : -1;

    return (
        <div className="max-w-[700px] mx-auto px-6 py-12 font-sans min-h-[70vh]">
            <div className="text-center mb-12 animate-fade-in-up">
                <div className="w-20 h-20 bg-primary/5 rounded-[32px] flex items-center justify-center text-primary mx-auto mb-6 text-2xl border border-primary/10">📦</div>
                <h1 className="text-4xl font-black text-dark tracking-tighter">Track Your Joy.</h1>
                <p className="text-gray-400 font-medium mt-2">Enter credentials to see the logistics timeline.</p>
            </div>

            <form onSubmit={handleTrack} className="bg-white p-10 rounded-[40px] shadow-premium border border-black/5 mb-12 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Transaction ID</label>
                        <input required value={orderId} onChange={e => setOrderId(e.target.value)} placeholder="#ABCDEF..." className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all" />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Verification Email</label>
                        <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@email.com" className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all" />
                    </div>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-primary text-white py-5 rounded-2xl font-black text-sm tracking-widest uppercase shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50">
                    {loading ? 'Locating Package...' : 'Fetch Logistics Data'}
                </button>
            </form>

            {orderData && (
                <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                    <div className="bg-white border border-gray-100 rounded-[40px] p-10 shadow-soft">
                        <div className="flex justify-between items-center mb-10 overflow-hidden relative">
                             {/* Line Background */}
                             <div className="absolute top-5 left-0 w-full h-[2px] bg-gray-100 z-0" />
                             {/* Active Line Progress */}
                             <div className="absolute top-5 left-0 h-[2px] bg-emerald-500 z-0 transition-all duration-1000" style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }} />

                             {steps.map((step, idx) => {
                                 const active = idx <= currentStep;
                                 return (
                                     <div key={step} className="relative z-10 flex flex-col items-center gap-3">
                                         <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-700 ${active ? 'bg-emerald-500 border-emerald-100 text-white shadow-lg shadow-emerald-500/20' : 'bg-gray-50 border-white text-gray-300'}`}>
                                             {active ? '✓' : idx + 1}
                                         </div>
                                         <span className={`text-[10px] font-black uppercase tracking-widest ${active ? 'text-emerald-500' : 'text-gray-300'}`}>{step}</span>
                                     </div>
                                 )
                             })}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-gray-50 uppercase tracking-[0.2em] font-black text-[10px]">
                             <div className="text-gray-400">Status</div>
                             <div className="text-dark text-right">{orderData.orderStatus}</div>
                             <div className="text-gray-400">Payment Status</div>
                             <div className="text-dark text-right">{orderData.paymentStatus}</div>
                             <div className="text-gray-400">Logistics Update</div>
                             <div className="text-dark text-right">{new Date(orderData.updatedAt).toLocaleDateString()}</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrackOrder;

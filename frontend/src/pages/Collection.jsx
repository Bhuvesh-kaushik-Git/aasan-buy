import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

const Collection = () => {
    const { id } = useParams();
    const [collection, setCollection] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch(`${API_URL}/api/settings`);
                if (!res.ok) throw new Error('Settings not found');
                const settings = await res.json();
                
                // Find the occasion across all sections
                let foundOccasion = null;
                for (const section of settings.occasionSections) {
                    const occ = section.occasions.find(o => o._id?.toString() === id?.toString());
                    if (occ) {
                        foundOccasion = { ...occ, sectionTitle: section.sectionTitle };
                        break;
                    }
                }

                if (!foundOccasion) throw new Error('Collection not found');
                
                // Debug log to verify population
                console.log('Found Occasion:', foundOccasion);
                if (foundOccasion.products) {
                    console.log('Products:', foundOccasion.products);
                }

                setCollection({
                    ...foundOccasion,
                    products: foundOccasion.products || []
                });

                // ── SEO Automation ──
                const title = `${foundOccasion.label} Collection | AasanBuy - Curated Joy`;
                const description = `Explore our curated ${foundOccasion.label} selection. Premium products chosen with care for your special moments.`;
                
                document.title = title;
                
                // Update Meta Description
                let metaDesc = document.querySelector('meta[name="description"]');
                if (!metaDesc) {
                    metaDesc = document.createElement('meta');
                    metaDesc.setAttribute('name', 'description');
                    document.head.appendChild(metaDesc);
                }
                metaDesc.setAttribute('content', description);

                // Update OG Title/Description for social sharing
                const ogTitle = document.querySelector('meta[property="og:title"]');
                if (ogTitle) ogTitle.setAttribute('content', title);
                
                const ogDesc = document.querySelector('meta[property="og:description"]');
                if (ogDesc) ogDesc.setAttribute('content', description);

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, [id]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Curating Collection...</p>
            </div>
        </div>
    );

    if (error || !collection) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
            <h2 className="text-2xl font-black text-dark mb-4">Collection Not Found</h2>
            <Link to="/" className="bg-primary text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest">Return Home</Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-background">
            {/* ── Collection Header ── */}
            <div className="relative h-[300px] md:h-[400px] overflow-hidden flex items-center justify-center text-center">
                <img src={collection.imageUrl} className="absolute inset-0 w-full h-full object-cover brightness-[0.4] scale-105" alt={collection.label} />
                <div className="relative z-10 px-6 max-w-4xl animate-fade-in-up">
                    <span className="text-[11px] font-black text-secondary uppercase tracking-[0.4em] mb-4 block drop-shadow-lg">
                        {collection.sectionTitle || 'Special Collection'}
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6 drop-shadow-2xl">
                        {collection.label}
                    </h1>
                    <div className="w-24 h-1 bg-secondary mx-auto rounded-full mb-6 shadow-glow ring-2 ring-secondary/20" />
                    <p className="text-white/80 font-medium text-lg max-w-2xl mx-auto hidden md:block">
                        A hand-picked selection of premium products curated specifically for {collection.label.toLowerCase()} moments.
                    </p>
                </div>
            </div>

            {/* ── Product Grid ── */}
            <div className="max-w-[1400px] mx-auto px-6 py-20">
                <div className="flex justify-between items-center mb-12">
                    <div>
                        <h2 className="text-[13px] font-black text-primary uppercase tracking-[0.2em]">The Selection</h2>
                        <p className="text-gray-400 font-medium text-sm">{(collection.products || []).length} Exquisite Items Found</p>
                    </div>
                    <div className="flex gap-2">
                        {/* Filter buttons could go here */}
                    </div>
                </div>

                {collection.products && collection.products.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
                        {collection.products.map((product, idx) => (
                            <Link 
                                to={`/product/${product._id}`} 
                                key={product._id} 
                                className="group animate-fade-in-up"
                                style={{ animationDelay: `${idx * 50}ms` }}
                            >
                                <div className="bg-white rounded-[32px] overflow-hidden shadow-soft hover:shadow-premium transition-all duration-500 border border-black/5 flex flex-col h-full group-hover:-translate-y-2">
                                    <div className="aspect-square overflow-hidden relative bg-gray-50">
                                        <img 
                                            src={product.images[0]} 
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out" 
                                            alt={product.name} 
                                        />
                                        {product.stock <= 5 && product.stock > 0 && (
                                            <div className="absolute top-4 left-4 bg-secondary text-white text-[9px] font-black px-2 py-1 rounded-lg shadow-xl uppercase tracking-widest animate-pulse">Low Stock</div>
                                        )}
                                        {product.stock === 0 && (
                                            <div className="absolute inset-0 bg-dark/60 backdrop-blur-[2px] flex items-center justify-center p-6 text-center">
                                                <span className="text-white text-[11px] font-black uppercase tracking-[0.3em] border-2 border-white/40 px-4 py-2 rounded-xl">Sold Out</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-6 flex-grow flex flex-col">
                                        <h3 className="text-sm font-black text-dark group-hover:text-primary transition-colors line-clamp-2 mb-2 leading-tight">
                                            {product.name}
                                        </h3>
                                        <div className="mt-auto flex items-baseline gap-2">
                                            <span className="text-lg font-black text-primary">₹{product.price.toLocaleString()}</span>
                                            {product.oldPrice && (
                                                <span className="text-xs text-gray-400 line-through font-bold">₹{product.oldPrice.toLocaleString()}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="p-20 bg-gray-50 rounded-[40px] border border-dashed border-gray-200 text-center">
                        <div className="w-20 h-20 bg-white rounded-[32px] mx-auto flex items-center justify-center mb-6 shadow-soft text-gray-200">
                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-10 h-10"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>
                        </div>
                        <h3 className="text-xl font-black text-dark mb-2 tracking-tight">Our Curators are working on this Box.</h3>
                        <p className="text-gray-400 text-sm mb-8 max-w-sm mx-auto">This collection is being finalized to ensure every item meets our premium standards.</p>
                        <Link to="/products" className="bg-dark text-white px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl transition-all hover:scale-105">Browse All Gifts</Link>
                    </div>
                )}
            </div>

            {/* ── Collection Footer ── */}
            <div className="max-w-7xl mx-auto px-6 pb-24">
                <div className="bg-primary rounded-[50px] p-12 md:p-20 text-white relative overflow-hidden shadow-2xl shadow-primary/20">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-20 -translate-y-20 blur-3xl opacity-50" />
                     <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                        <div className="text-center md:text-left max-w-lg">
                            <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-6 leading-tight">Can't find what you're looking for?</h2>
                            <p className="text-white/70 font-medium text-lg leading-relaxed">Our personal shoppers are available to help you curate the perfect bundle for your special moment.</p>
                        </div>
                        <Link to="/products" className="bg-white text-primary px-12 py-5 rounded-[24px] font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-secondary hover:text-white transition-all transform active:scale-95">Explore Full Catalog</Link>
                     </div>
                </div>
            </div>

        </div>
    );
};

export default Collection;

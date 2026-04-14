import React, { useState, useEffect } from 'react';

function App() {
  const [activeTab, setActiveTab] = useState('CMS');
  const [formData, setFormData] = useState({
    heroTitle: '',
    heroSubtitle: '',
    heroImageUrl: ''
  });
  const [loading, setLoading] = useState(false);

  // Fetch Settings on Load
  useEffect(() => {
    fetch('http://localhost:5001/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data && data.heroBanner) {
          setFormData({
            heroTitle: data.heroBanner.title || '',
            heroSubtitle: data.heroBanner.subtitle || '',
            heroImageUrl: data.heroBanner.imageUrl || ''
          });
        }
      })
      .catch(err => console.error("Error fetching settings:", err));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveCMS = () => {
    setLoading(true);
    fetch('http://localhost:5001/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        heroBanner: {
          title: formData.heroTitle,
          subtitle: formData.heroSubtitle,
          imageUrl: formData.heroImageUrl
        }
      })
    })
    .then(res => res.json())
    .then(data => {
      alert("Settings Updated! The storefront will now reflect these changes.");
    })
    .catch(err => console.error(err))
    .finally(() => setLoading(false));
  };

  const sidebarItems = ['Dashboard', 'Orders', 'Products', 'Categories', 'CMS / Pages', 'Settings'];

  return (
    <div className="flex h-screen bg-background font-sans">
      
      {/* Sidebar - Deep Blue with Orange accents */}
      <div className="w-64 bg-primary text-white shadow-xl z-20 flex flex-col">
        <div className="p-6 border-b border-primary/50 flex items-center gap-3">
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-secondary">
             <path d="M9.375 3a1.875 1.875 0 0 0 0 3.75h1.875v4.5H3.375A1.875 1.875 0 0 1 1.5 9.375v-.75c0-1.036.84-1.875 1.875-1.875h3.193A3.375 3.375 0 0 1 12 2.753a3.375 3.375 0 0 1 5.432 3.997h3.193c1.035 0 1.875.84 1.875 1.875v.75a1.875 1.875 0 0 1-1.875 1.875H12.75v-4.5h1.875a1.875 1.875 0 1 0-1.875-1.875V3zM12.75 12.75h7.5v6.375a2.625 2.625 0 0 1-2.625 2.625H6.375a2.625 2.625 0 0 1-2.625-2.625V12.75h7.5zm-1.5 0H3.75v6.375c0 .621.504 1.125 1.125 1.125h6.375v-7.5z"/>
           </svg>
           <h1 className="text-xl font-bold font-serif tracking-wide">Aasan<span className="text-secondary">Admin</span></h1>
        </div>
        <nav className="flex-1 mt-6 px-4">
          <ul className="space-y-2">
            {sidebarItems.map(item => (
              <li key={item}>
                <button 
                  onClick={() => setActiveTab(item === 'CMS / Pages' ? 'CMS' : item)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 
                  ${activeTab === (item === 'CMS / Pages' ? 'CMS' : item) 
                    ? 'bg-secondary text-white shadow-lg' 
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 m-4 bg-primary/80 border border-white/10 rounded-xl">
           <span className="text-xs text-secondary font-bold tracking-widest uppercase block mb-1">Status</span>
           <span className="text-sm font-medium">All APIs Operational</span>
        </div>
      </div>

      {/* Main Content Space */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-[#fafafa]">
        {/* Soft Header */}
        <header className="bg-white/60 backdrop-blur-md h-[70px] border-b border-gray-200 flex items-center justify-between px-8 z-10 sticky top-0 shadow-sm">
           <h2 className="text-xl font-bold text-dark font-serif tracking-tight">{activeTab === 'CMS' ? 'CMS / Page Configuration' : activeTab}</h2>
           <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 font-medium">Welcome, Super Admin</span>
              <div className="w-[36px] h-[36px] rounded-full bg-secondary text-white flex items-center justify-center font-bold font-serif shadow-sm">A</div>
           </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          
          {activeTab === 'CMS' ? (
            <div className="max-w-[700px] mx-auto animate-fade-in-up">
              <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                 
                 <div className="bg-[#fefaf4] p-6 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-dark font-serif tracking-wide mb-1">Storefront Hero Banner</h3>
                    <p className="text-[13px] text-gray-500">Update the primary text and background image shown on the customer Homepage.</p>
                 </div>

                 <div className="p-8 pb-10 space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 font-sans tracking-wide">Hero Headline</label>
                      <input 
                        type="text" 
                        name="heroTitle"
                        value={formData.heroTitle}
                        onChange={handleInputChange}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50 transition-colors text-dark"
                        placeholder="e.g. CURATED JOY. AASAN LIVING."
                      />
                      <p className="text-xs text-gray-400 mt-2">Will be rendered exactly as typed. We recommend keeping it under 40 characters.</p>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 font-sans tracking-wide">Subtext / Limit Description</label>
                      <input 
                        type="text" 
                        name="heroSubtitle"
                        value={formData.heroSubtitle}
                        onChange={handleInputChange}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50 transition-colors text-dark"
                        placeholder="e.g. Hand-picked essentials, delivered to your door."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 font-sans tracking-wide">Hero Image / 3D Asset URL</label>
                      <input 
                        type="text" 
                        name="heroImageUrl"
                        value={formData.heroImageUrl}
                        onChange={handleInputChange}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50 transition-colors text-dark"
                        placeholder="https://..."
                      />
                    </div>
                 </div>
                 
                 <div className="bg-gray-50 p-6 border-t border-gray-100 flex justify-end">
                    <button 
                      onClick={handleSaveCMS}
                      disabled={loading}
                      className="bg-secondary text-white font-bold text-[13px] uppercase tracking-wider px-10 py-3 rounded-full hover:bg-opacity-90 hover:shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Publishing...' : 'Publish Changes'}
                    </button>
                 </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[50vh] text-gray-400">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 mb-4 opacity-50">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
               </svg>
               <h3 className="font-serif text-xl tracking-tight text-gray-500">Module Under Construction</h3>
               <p className="text-sm">This administrative section will be available soon.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

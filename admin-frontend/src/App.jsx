import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-primary text-white flex flex-col shadow-xl">
        <div className="p-6 border-b border-blue-800">
           <h1 className="text-2xl font-black">AASAN<span className="text-secondary">BUY</span></h1>
           <span className="text-xs text-blue-200">Admin Dashboard</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {['Dashboard', 'Orders', 'Products', 'Categories', 'CMS / Pages', 'Settings'].map(item => (
            <a key={item} href="#" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-secondary hover:text-white">
              {item}
            </a>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow py-4 px-6 flex justify-between items-center">
           <h2 className="text-xl font-bold text-gray-800">CMS / Pages Management</h2>
           <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Admin User</span>
              <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center font-bold">A</div>
           </div>
        </header>
        
        {/* Dashboard Content Area */}
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-primary mb-4 border-b pb-2">Edit Homepage Config</h3>
            
            <div className="space-y-6">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Hero Title</label>
                 <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-secondary focus:ring-1 focus:ring-secondary" defaultValue="Make Every Moment Special" />
               </div>
               
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Hero Subtitle</label>
                 <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-secondary focus:ring-1 focus:ring-secondary" defaultValue="Order premium flowers, delicious cakes..." />
               </div>
               
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Hero Image URL</label>
                 <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-secondary focus:ring-1 focus:ring-secondary" defaultValue="https://images.unsplash.com/photo-1563241598-6bbdb1e96723" />
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Category Section Config</label>
                 <div className="bg-gray-50 p-4 border rounded">
                   <p className="text-xs text-gray-500 mb-2">Dynamic list of categories fetched by the main shop. This allows you to add/remove icons instantly.</p>
                   <button className="bg-primary text-white text-xs px-3 py-1.5 rounded font-bold hover:bg-blue-800">+ Add Category Quick Icon</button>
                 </div>
               </div>

               <div className="pt-4 border-t mt-6 flex justify-end">
                 <button className="bg-success text-white px-6 py-2 rounded font-bold hover:bg-green-600 transition-colors">Save Changes via API</button>
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;

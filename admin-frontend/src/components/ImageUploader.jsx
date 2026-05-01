import React, { useRef, useState } from 'react';

export default function ImageUploader({ value, onChange, adminToken, placeholder = "Upload Visual Asset" }) {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('image', file);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

    try {
      const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        onChange(data.url);
      } else {
        alert(data.error || "Upload failed");
      }
    } catch (err) {
      console.error(err);
      alert("Network error during upload");
    } finally {
      if(fileInputRef.current) fileInputRef.current.value = null;
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
       <div className="flex items-center gap-3">
          <input 
            type="text" 
            value={value || ''} 
            onChange={e => onChange(e.target.value)} 
            className="flex-1 border-0 rounded-2xl px-6 py-4 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-secondary/10 focus:outline-none transition-all font-black text-sm" 
            placeholder="https://..." 
          />
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            onChange={handleUpload} 
            className="hidden" 
          />
          <button 
             type="button" 
             onClick={() => fileInputRef.current?.click()} 
             disabled={loading}
             className="shrink-0 bg-primary/10 text-primary hover:bg-primary hover:text-white font-black text-xs uppercase tracking-widest px-6 py-4 rounded-2xl transition-all disabled:opacity-50 flex items-center gap-2"
          >
             {loading ? 'Uploading...' : '📁 Upload'}
          </button>
       </div>
       {value && (
         <div className="h-32 bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden relative group w-48">
            <img src={value} className="w-full h-full object-cover" alt="Preview" />
            <button 
               type="button" 
               onClick={() => onChange('')} 
               className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity shadow-lg cursor-pointer"
            >✕</button>
         </div>
       )}
    </div>
  );
}

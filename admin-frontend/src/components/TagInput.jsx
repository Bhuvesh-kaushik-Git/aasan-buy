import React, { useRef, useState } from 'react';

const TagInput = ({ tags, setTags, placeholder = "Add tag...", adminToken, allowUpload = false }) => {
  const [input, setInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const addTag = (e) => {
    if(e && e.preventDefault) e.preventDefault();
    const val = input.trim();
    if (val && !tags.includes(val)) {
      setTags([...tags, val]);
      setInput('');
    }
  };

  const removeTag = (indexToRemove) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  const handleUpload = async (e) => {
     const file = e.target.files[0];
     if (!file) return;

     setUploading(true);
     const formData = new FormData();
     formData.append('image', file);

     const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

     try {
       const res = await fetch(`${API_URL}/upload`, {
         method: 'POST',
         headers: {
           ...(adminToken ? { 'Authorization': `Bearer ${adminToken}` } : {})
         },
         body: formData
       });
       const data = await res.json();
       if (res.ok) {
         if (!tags.includes(data.url)) {
           setTags([...tags, data.url]);
         }
       } else {
         alert(data.error || "Upload failed");
       }
     } catch (err) {
       console.error(err);
       alert("Network error during upload");
     } finally {
       if(fileRef.current) fileRef.current.value = null;
       setUploading(false);
     }
  };

  return (
    <div className="w-full">
      <div className={`flex flex-wrap gap-2 p-3 bg-gray-50 border border-gray-200 rounded-xl mb-2 min-h-[50px] focus-within:bg-white focus-within:border-secondary transition-all relative ${allowUpload ? 'pr-10' : ''}`}>
        
        {/* Upload Button Absolute Positioned */}
        {allowUpload && (
          <div className="absolute right-2 top-2">
             <input type="file" accept="image/*" className="hidden" ref={fileRef} onChange={handleUpload} />
             <button 
                type="button" 
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                title="Upload Image File"
                className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-lg transition-colors disabled:opacity-50"
             >
                {uploading ? (
                   <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>
                )}
             </button>
          </div>
        )}

        {tags.map((tag, index) => (
          <div key={index} className="flex items-center gap-1.5 bg-white border border-gray-100 px-3 py-1 rounded-lg text-xs font-bold text-dark shadow-sm group">
            {tag.startsWith('http') && <img src={tag} className="w-4 h-4 object-cover rounded-sm" alt=""/>}
            <span className="max-w-[120px] truncate">{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="text-gray-400 hover:text-red-500 transition-colors ml-1"
            >
              ✕
            </button>
          </div>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTag(e)}
          onBlur={addTag}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="flex-1 bg-transparent border-0 p-0 text-xs font-bold focus:ring-0 focus:outline-none min-w-[100px]"
        />
      </div>
    </div>
  );
};

export default TagInput;

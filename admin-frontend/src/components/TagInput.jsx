import React, { useState } from 'react';

const TagInput = ({ tags, setTags, placeholder = "Add tag..." }) => {
  const [input, setInput] = useState('');

  const addTag = (e) => {
    e.preventDefault();
    const val = input.trim();
    if (val && !tags.includes(val)) {
      setTags([...tags, val]);
      setInput('');
    }
  };

  const removeTag = (indexToRemove) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 p-3 bg-gray-50 border border-gray-200 rounded-xl mb-2 min-h-[50px] focus-within:bg-white focus-within:border-secondary transition-all">
        {tags.map((tag, index) => (
          <div key={index} className="flex items-center gap-1.5 bg-white border border-gray-100 px-3 py-1 rounded-lg text-xs font-bold text-dark shadow-sm group">
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="text-gray-400 hover:text-red-500 transition-colors"
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
          className="flex-1 bg-transparent border-0 p-0 text-xs font-bold focus:ring-0 focus:outline-none min-w-[80px]"
        />
      </div>
    </div>
  );
};

export default TagInput;

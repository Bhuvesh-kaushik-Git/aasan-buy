import React, { useState } from 'react';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&fit=crop';

/**
 * OptimizedImage component with graceful fallback for broken URLs
 * and support for premium UI standards.
 */
const OptimizedImage = ({ src, alt, className, ...props }) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleError = () => {
    setError(true);
    setLoading(false);
  };

  const handleLoad = () => {
    setLoading(false);
  };

  // Detect corrupted base64 or empty strings upfront
  const isCorrupted = !src || src === 'data:image/jpeg;base64:0:0' || src.includes('undefined');
  const finalSrc = (error || isCorrupted) ? FALLBACK_IMAGE : src;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {loading && !isCorrupted && (
        <div className="absolute inset-0 bg-gray-50 animate-pulse flex items-center justify-center">
             <div className="w-8 h-8 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
        </div>
      )}
      <img
        src={finalSrc}
        alt={alt}
        onError={handleError}
        onLoad={handleLoad}
        loading="lazy"
        className={`w-full h-full object-cover transition-all duration-700 ${loading ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}`}
        {...props}
      />
    </div>
  );
};

export default OptimizedImage;

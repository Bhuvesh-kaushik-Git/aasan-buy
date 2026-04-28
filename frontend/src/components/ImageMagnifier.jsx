import React, { useState } from 'react';
import OptimizedImage from './OptimizedImage';

const ImageMagnifier = ({ src, alt }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [show, setShow] = useState(false);
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    
    // Bounds checking for the event coordinates
    let x = e.clientX - left;
    let y = e.clientY - top;
    
    // Prevent mouse from going outside the container conceptually
    x = Math.max(0, Math.min(x, width));
    y = Math.max(0, Math.min(y, height));

    // Calculate percentage for background position
    const xPercent = (x / width) * 100;
    const yPercent = (y / height) * 100;

    setPosition({ x: xPercent, y: yPercent });
    setLensPos({ x, y });
  };

  return (
    <div 
      className="relative w-full h-full flex items-center justify-center cursor-crosshair"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onMouseMove={handleMouseMove}
    >
      {/* Base Image */}
      <OptimizedImage src={src} className="max-w-full max-h-full object-contain pointer-events-none" alt={alt} />
      
      {/* Zoom Lens on top of original image */}
      {show && (
         <div 
           className="absolute pointer-events-none border border-gray-400/50 bg-white/20 hidden lg:block"
           style={{
             width: '150px',
             height: '150px',
             top: `calc(${position.y}% - 75px)`,
             left: `calc(${position.x}% - 75px)`,
             boxShadow: '0 0 0 9999px rgba(255,255,255,0.4)',
             mixBlendMode: 'multiply'
           }}
         />
      )}

      {/* Magnified adjacent box covering the right column */}
      {show && (
        <div 
           className="absolute z-[100] bg-white border border-gray-200 shadow-2xl rounded-3xl hidden lg:block pointer-events-none w-[500px] h-[600px] xl:w-[600px] xl:h-[700px]"
           style={{
             left: 'calc(100% + 30px)',
             top: '-20px',
             backgroundImage: `url(${src})`,
             backgroundPosition: `${position.x}% ${position.y}%`,
             backgroundSize: '250%', // Magnification strength
             backgroundRepeat: 'no-repeat'
           }}
        />
      )}
    </div>
  );
};

export default ImageMagnifier;

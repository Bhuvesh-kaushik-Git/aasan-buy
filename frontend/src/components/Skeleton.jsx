import React from 'react';

export const ProductSkeleton = () => (
  <div className="flex flex-col w-[260px] bg-white rounded-2xl shadow-soft h-[420px] overflow-hidden border border-gray-100/50 animate-pulse">
    <div className="w-full h-[280px] bg-gray-100" />
    <div className="p-5 space-y-3">
      <div className="flex gap-2">
        <div className="h-4 w-12 bg-gray-100 rounded-lg" />
        <div className="h-4 w-12 bg-gray-50 rounded-lg" />
      </div>
      <div className="h-5 w-full bg-gray-100 rounded-lg" />
      <div className="h-4 w-2/3 bg-gray-50 rounded-lg" />
      <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
        <div className="h-3 w-16 bg-gray-50 rounded-lg" />
        <div className="h-3 w-10 bg-gray-50 rounded-lg" />
      </div>
    </div>
  </div>
);

export const BannerSkeleton = () => (
  <section className="relative w-full max-w-[1400px] mx-auto pt-6 px-4 md:px-8">
    <div className="w-full aspect-[21/10] md:aspect-[21/8] bg-gray-100 rounded-[32px] animate-pulse" />
  </section>
);

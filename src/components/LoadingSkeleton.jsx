import React from 'react';

export const ProductCardSkeleton = () => {
  return (
    <div className="bg-white dark:bg-customGray-dark border border-customGray-light dark:border-white/5 rounded-3xl p-4 flex flex-col gap-4 animate-pulse select-none">
      <div className="aspect-square bg-customGray-light dark:bg-white/5 rounded-2xl w-full"></div>
      <div className="h-4 bg-customGray-light dark:bg-white/5 rounded w-1/3"></div>
      <div className="h-5 bg-customGray-light dark:bg-white/5 rounded w-3/4"></div>
      <div className="h-3 bg-customGray-light dark:bg-white/5 rounded w-1/2"></div>
      <div className="flex justify-between items-center mt-2">
        <div className="h-6 bg-customGray-light dark:bg-white/5 rounded w-1/4"></div>
        <div className="h-9 w-9 bg-customGray-light dark:bg-white/5 rounded-xl"></div>
      </div>
    </div>
  );
};

export const ProductDetailSkeleton = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse select-none">
      <div className="flex flex-col gap-4">
        <div className="aspect-square bg-customGray-light dark:bg-white/5 rounded-3xl w-full"></div>
        <div className="flex gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-20 h-20 bg-customGray-light dark:bg-white/5 rounded-xl"></div>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-6">
        <div className="h-4 bg-customGray-light dark:bg-white/5 rounded w-1/4"></div>
        <div className="h-8 bg-customGray-light dark:bg-white/5 rounded w-3/4"></div>
        <div className="h-4 bg-customGray-light dark:bg-white/5 rounded w-1/3"></div>
        <div className="h-10 bg-customGray-light dark:bg-white/5 rounded w-1/4"></div>
        <hr className="border-customGray-light dark:border-white/5" />
        <div className="space-y-2">
          <div className="h-4 bg-customGray-light dark:bg-white/5 rounded w-full"></div>
          <div className="h-4 bg-customGray-light dark:bg-white/5 rounded w-full"></div>
          <div className="h-4 bg-customGray-light dark:bg-white/5 rounded w-5/6"></div>
        </div>
        <div className="flex gap-4 mt-6">
          <div className="h-12 bg-customGray-light dark:bg-white/5 rounded-2xl w-1/2"></div>
          <div className="h-12 bg-customGray-light dark:bg-white/5 rounded-2xl w-1/2"></div>
        </div>
      </div>
    </div>
  );
};

export const TableSkeleton = ({ rows = 5, cols = 4 }) => {
  return (
    <div className="w-full bg-white dark:bg-customGray-dark border border-customGray-light dark:border-white/5 rounded-3xl overflow-hidden animate-pulse select-none">
      <div className="h-12 bg-customGray-light/50 dark:bg-black/30 border-b border-customGray-light dark:border-white/5"></div>
      <div className="p-4 space-y-4">
        {[...Array(rows)].map((_, r) => (
          <div key={r} className="flex gap-4 items-center">
            {[...Array(cols)].map((_, c) => (
              <div key={c} className="h-5 bg-customGray-light dark:bg-white/5 rounded flex-grow"></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

const LoadingSkeleton = () => {
  return <ProductCardSkeleton />;
};

export default LoadingSkeleton;

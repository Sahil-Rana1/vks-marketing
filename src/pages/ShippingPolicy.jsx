import React from 'react';

const ShippingPolicy = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 select-none text-left">
      <h1 className="text-3xl font-black text-secondary dark:text-white mb-6">Shipping & Delivery Policy</h1>
      
      <div className="text-sm text-customGray leading-relaxed space-y-4">
        <p className="font-semibold text-secondary dark:text-white">Last Updated: June 29, 2026</p>
        
        <p>
          VKS Marketing commits to delivering your products in excellent condition and always on time. Here is our shipping policy outlining delivery parameters.
        </p>

        <h2 className="text-lg font-bold text-secondary dark:text-white pt-4">Shipping Fees</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Free Shipping</strong>: All orders total ₹500 and above qualify for free standard shipping.</li>
          <li><strong>Standard Shipping</strong>: A flat delivery fee of ₹40 is charged on orders below ₹500.</li>
        </ul>

        <h2 className="text-lg font-bold text-secondary dark:text-white pt-4">Dispatch and Transit Times</h2>
        <p>
          Orders are typically processed and dispatched from our warehouse in Noida within 1-2 business days.
          Estimated delivery timelines range from:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Delhi/NCR</strong>: 2-3 business days.</li>
          <li><strong>Metros (Mumbai, Bangalore, etc.)</strong>: 3-5 business days.</li>
          <li><strong>Rest of India</strong>: 5-7 business days.</li>
        </ul>

        <h2 className="text-lg font-bold text-secondary dark:text-white pt-4">Order Tracking</h2>
        <p>
          A tracking link is provided upon order creation. You can easily track the real-time shipping progress and transit timeline of your package under "My Orders" or "Track Order" inside your account dashboard.
        </p>
      </div>
    </div>
  );
};

export default ShippingPolicy;

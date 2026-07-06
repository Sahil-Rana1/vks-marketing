import React from 'react';

const RefundPolicy = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 select-none text-left">
      <h1 className="text-3xl font-black text-secondary dark:text-white mb-6">Refund & Return Policy</h1>
      
      <div className="text-sm text-customGray leading-relaxed space-y-4">
        <p className="font-semibold text-secondary dark:text-white">Last Updated: June 29, 2026</p>
        
        <p>
          We want you to be completely satisfied with your purchase. If you are not entirely wowed by your VKS Marketing purchase, we are here to assist with returns and exchanges.
        </p>

        <h2 className="text-lg font-bold text-secondary dark:text-white pt-4">Return Eligibility</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Items must be returned within 7 calendar days from the delivery date.</li>
          <li>Products must be unused, in the same condition that you received them, and in the original packaging.</li>
          <li>Receipt or proof of purchase is required.</li>
        </ul>

        <h2 className="text-lg font-bold text-secondary dark:text-white pt-4">Exchanges</h2>
        <p>
          We replace items if they are received defective, damaged, or incorrect. If you need to exchange an item for the same product, submit an inquiry on our Contact page or email us at support@vksmarketing.com.
        </p>

        <h2 className="text-lg font-bold text-secondary dark:text-white pt-4">Refund Process</h2>
        <p>
          Once we receive and inspect your returned item, we will notify you of the approval or rejection of your refund. Approved refunds will be processed to your original payment method (or bank transfer for COD orders) within 5-7 business days.
        </p>
      </div>
    </div>
  );
};

export default RefundPolicy;

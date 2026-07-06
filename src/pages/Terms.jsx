import React from 'react';

const Terms = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 select-none text-left">
      <h1 className="text-3xl font-black text-secondary dark:text-white mb-6">Terms of Service</h1>
      
      <div className="text-sm text-customGray leading-relaxed space-y-4">
        <p className="font-semibold text-secondary dark:text-white">Last Updated: June 29, 2026</p>
        
        <p>
          Welcome to VKS Marketing. These Terms of Service outline the rules and regulations for the use of VKS Marketing's Website, located at www.vksmarketing.com.
        </p>

        <h2 className="text-lg font-bold text-secondary dark:text-white pt-4">Acceptance of Terms</h2>
        <p>
          By accessing this website, we assume you accept these terms and conditions in full. Do not continue to use VKS Marketing if you do not agree to all of the terms and conditions stated on this page.
        </p>

        <h2 className="text-lg font-bold text-secondary dark:text-white pt-4">User Accounts</h2>
        <p>
          To access certain e-commerce features (placing orders, tracking deliveries, reviews), you must create an account. You are responsible for maintaining the confidentiality of your account credentials. All account registrations are verified using email verification OTP codes to maintain high platform security.
        </p>

        <h2 className="text-lg font-bold text-secondary dark:text-white pt-4">Product Availability and Pricing</h2>
        <p>
          We strive to provide accurate stock quantities and pricing for our household organizers. However, inventory adjustments may occur. We reserve the right to cancel orders in case of pricing errors or supply shortages, issuing immediate full refunds.
        </p>
      </div>
    </div>
  );
};

export default Terms;

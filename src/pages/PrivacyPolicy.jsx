import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 select-none text-left">
      <h1 className="text-3xl font-black text-secondary dark:text-white mb-6">Privacy Policy</h1>
      
      <div className="text-sm text-customGray leading-relaxed space-y-4">
        <p className="font-semibold text-secondary dark:text-white">Effective Date: June 29, 2026</p>
        
        <p>
          At VKS Marketing, accessible from www.vksmarketing.com, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by VKS Marketing and how we use it.
        </p>

        <h2 className="text-lg font-bold text-secondary dark:text-white pt-4">Information We Collect</h2>
        <p>
          When you register for an Account, we may ask for your contact information, including items such as name, company name, address, email address, and telephone number. We do not store payment card credentials directly; all payments are processed securely via encrypted gateways (like Razorpay).
        </p>

        <h2 className="text-lg font-bold text-secondary dark:text-white pt-4">How We Use Your Information</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Provide, operate, and maintain our e-commerce platform.</li>
          <li>Improve, personalize, and expand our store.</li>
          <li>Understand and analyze how you use our website.</li>
          <li>Develop new products, services, features, and functionality.</li>
          <li>Communicate with you (e.g., OTP codes, order status updates, marketing emails).</li>
        </ul>

        <h2 className="text-lg font-bold text-secondary dark:text-white pt-4">Cookies and Web Beacons</h2>
        <p>
          Like any other website, VKS Marketing uses 'cookies'. These cookies are used to store information including visitors' preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users' experience by customizing our web page content.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

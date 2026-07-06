import React from 'react';
import { FiCheckCircle, FiHeart, FiSmile } from 'react-icons/fi';

const About = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 select-none text-left">
      <h1 className="text-3xl sm:text-4xl font-black text-secondary dark:text-white mb-6">About VKS Marketing</h1>
      
      <div className="prose dark:prose-invert max-w-none text-sm text-customGray leading-relaxed space-y-6">
        <p className="text-base text-secondary dark:text-gray-200 font-medium">
          Welcome to VKS Marketing, your premier destination for modern, minimal, and high-quality Kitchen & Household Essentials.
        </p>

        <p>
          Founded on the principle that home organizers and kitchen utilities should be both highly functional and visually stunning, we design and source products that elevate your everyday living spaces. Drawing inspiration from premium global design aesthetics—combining the functionality of IKEA, the tech-driven utility of Amazon, and the clean, premium minimalism of Apple—we bring you a curated catalog of household organizers, bathroom products, and space savers.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 my-10 select-none">
          <div className="bg-white dark:bg-customGray-dark border border-customGray-light dark:border-white/5 p-5 rounded-3xl shadow-sm text-center">
            <FiCheckCircle className="text-primary w-8 h-8 mx-auto mb-3" />
            <h3 className="font-bold text-sm text-secondary dark:text-white mb-1">Quality First</h3>
            <p className="text-xs text-customGray">Every organizer and container is made from thick, food-grade materials that endure.</p>
          </div>

          <div className="bg-white dark:bg-customGray-dark border border-customGray-light dark:border-white/5 p-5 rounded-3xl shadow-sm text-center">
            <FiHeart className="text-primary w-8 h-8 mx-auto mb-3" />
            <h3 className="font-bold text-sm text-secondary dark:text-white mb-1">Minimal Aesthetics</h3>
            <p className="text-xs text-customGray">Neutral color palettes and clean silhouettes that complement any interior theme.</p>
          </div>

          <div className="bg-white dark:bg-customGray-dark border border-customGray-light dark:border-white/5 p-5 rounded-3xl shadow-sm text-center">
            <FiSmile className="text-primary w-8 h-8 mx-auto mb-3" />
            <h3 className="font-bold text-sm text-secondary dark:text-white mb-1">Customer Care</h3>
            <p className="text-xs text-customGray">Attentive support, prompt shipping, and 7-day easy exchange policies.</p>
          </div>
        </div>

        <h2 className="text-xl font-bold text-secondary dark:text-white pt-4">Our Vision</h2>
        <p>
          We aim to simplify clutter management in modern Indian homes. From space-saving multi-slot sunglasses cases and UV sterilizing toothbrush holders to automatic soap dispensers and airtight modular spice jars, we help you construct a clean, stress-free home where everything has its dedicated place.
        </p>
      </div>
    </div>
  );
};

export default About;

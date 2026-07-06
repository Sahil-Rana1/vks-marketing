import React, { useState, useEffect } from 'react';
import { FiSave, FiSettings, FiSliders, FiMonitor, FiPhone, FiMail, FiMapPin, FiRefreshCw, FiImage } from 'react-icons/fi';
import { useToast } from '../context/ToastContext.jsx';

const DEFAULT_SETTINGS = {
  phone: '+91 98765 43210',
  email: 'info@vksmarketing.com',
  announcement: 'Upgrade your home with quality products at affordable prices.',
  address: 'Sector 63, Noida, UP, India',
  heroSlides: [
    {
      badge: 'Kitchen Storage',
      title: 'Airtight Storage Container Set',
      description: 'Modular leakproof dry kitchen storage container boxes. BPA free plastic with airtight vacuum snap locks.',
      actionText: 'Claim Container Set',
      image: 'https://images.unsplash.com/photo-1595231712426-63d23a9ae100?q=80&w=600&auto=format&fit=crop',
      features: 'Airtight Lock, BPA Free'
    },
    {
      badge: 'Bathroom Accessories',
      title: '3 in 1 Soap Dispenser with Sponge Holder',
      description: 'Unbreakable 3-in-1 kitchen hand wash & dish soap dispenser with integrated sponge holder slot.',
      actionText: 'Shop Dispenser',
      image: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?q=80&w=600&auto=format&fit=crop',
      features: 'ABS Plastic, Leak Proof'
    },
    {
      badge: 'Home Organizers',
      title: 'Hanging Multi-Slot Sunglasses Organizer',
      description: 'Hanging wall-mounted sunglasses holder with multiple storage slots. Hard velvet lining protects goggles.',
      actionText: 'Shop Organizers',
      image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=600&auto=format&fit=crop',
      features: 'Velvet Lining, Wall Mounted'
    },
    {
      badge: 'Household Essentials',
      title: 'Multi-functional Hexagon Extension Board',
      description: 'Hexagonal premium power strip extension board with 4 USB charging ports and 4 universal multi-plug outlets.',
      actionText: 'Shop Extension Board',
      image: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?q=80&w=600&auto=format&fit=crop',
      features: 'Surge Safe, 4 USB Ports'
    }
  ]
};

const AdminCustomize = () => {
  const [activeTab, setActiveTab] = useState('general'); // general, slides
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const { showToast } = useToast();

  useEffect(() => {
    try {
      const saved = localStorage.getItem('vks_site_settings');
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to parse settings:', e);
    }
  }, []);

  const handleChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSlideChange = (index, field, value) => {
    const updatedSlides = [...settings.heroSlides];
    updatedSlides[index] = {
      ...updatedSlides[index],
      [field]: value
    };
    setSettings((prev) => ({
      ...prev,
      heroSlides: updatedSlides
    }));
  };

  const handleSave = () => {
    try {
      localStorage.setItem('vks_site_settings', JSON.stringify(settings));
      showToast('Site customizations updated successfully!', 'success');
    } catch (error) {
      showToast('Failed to save settings: ' + error.toString(), 'error');
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset all values to system defaults? Any unsaved edits will be lost.')) {
      setSettings(DEFAULT_SETTINGS);
      localStorage.setItem('vks_site_settings', JSON.stringify(DEFAULT_SETTINGS));
      showToast('Site customizations reset to default values!', 'info');
    }
  };

  return (
    <div className="space-y-6 text-left max-w-5xl select-none">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-secondary dark:text-white mb-1 flex items-center gap-2">
            <FiSettings className="text-primary animate-spin-slow" /> Customize Site Settings
          </h1>
          <p className="text-xs text-customGray font-medium">Update announcements, contact details, and main hero slideshow slides dynamically.</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="px-4 py-2 border border-gray-200 dark:border-white/10 text-secondary dark:text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
          >
            <FiRefreshCw className="w-3.5 h-3.5" /> Reset
          </button>
          
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-primary hover:bg-primary/95 text-black font-black rounded-xl text-xs uppercase tracking-widest flex items-center gap-1.5 shadow-md shadow-primary/10 hover:shadow-primary/20 transition-all"
          >
            <FiSave className="w-3.5 h-3.5" /> Save Changes
          </button>
        </div>
      </div>

      {/* Tabs list */}
      <div className="border-b border-gray-200 dark:border-white/5 flex gap-4 select-none">
        <button
          onClick={() => setActiveTab('general')}
          className={`pb-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'general'
              ? 'border-primary text-secondary dark:text-white'
              : 'border-transparent text-customGray hover:text-secondary dark:hover:text-white'
          }`}
        >
          <FiSliders /> General Details
        </button>
        <button
          onClick={() => setActiveTab('slides')}
          className={`pb-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'slides'
              ? 'border-primary text-secondary dark:text-white'
              : 'border-transparent text-customGray hover:text-secondary dark:hover:text-white'
          }`}
        >
          <FiMonitor /> Hero Slideshow Slides
        </button>
      </div>

      {/* Settings inputs */}
      <div className="bg-white dark:bg-customGray-dark border border-customGray-light dark:border-white/5 p-6 sm:p-8 rounded-[32px] shadow-sm">
        
        {activeTab === 'general' && (
          <div className="space-y-6">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-customGray border-b border-gray-100 dark:border-white/5 pb-2">Header announcement slogan & details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">Top Announcement Slogan</label>
                <textarea
                  value={settings.announcement}
                  onChange={(e) => handleChange('announcement', e.target.value)}
                  rows={2}
                  className="w-full text-sm bg-customGray-light dark:bg-black/30 border border-transparent rounded-xl py-2.5 px-3 focus:outline-none focus:border-primary/50 text-secondary dark:text-white leading-relaxed resize-none"
                  placeholder="Enter slogan text..."
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">Support Address</label>
                <textarea
                  value={settings.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  rows={2}
                  className="w-full text-sm bg-customGray-light dark:bg-black/30 border border-transparent rounded-xl py-2.5 px-3 focus:outline-none focus:border-primary/50 text-secondary dark:text-white leading-relaxed resize-none"
                  placeholder="Enter street address..."
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1 flex items-center gap-1">
                  <FiPhone className="text-primary w-3 h-3" /> Contact Phone Number
                </label>
                <input
                  type="text"
                  value={settings.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full text-sm bg-customGray-light dark:bg-black/30 border border-transparent rounded-xl py-2.5 px-3 focus:outline-none focus:border-primary/50 text-secondary dark:text-white"
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1 flex items-center gap-1">
                  <FiMail className="text-primary w-3 h-3" /> Contact Support Email
                </label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full text-sm bg-customGray-light dark:bg-black/30 border border-transparent rounded-xl py-2.5 px-3 focus:outline-none focus:border-primary/50 text-secondary dark:text-white"
                  placeholder="support@domain.com"
                />
              </div>

            </div>
          </div>
        )}

        {activeTab === 'slides' && (
          <div className="space-y-8">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-customGray border-b border-gray-100 dark:border-white/5 pb-2">Edit slide attributes in Hero slideshow carousel</h3>
            
            <div className="space-y-8 divide-y divide-gray-150 dark:divide-white/5">
              {settings.heroSlides.map((slide, idx) => (
                <div key={idx} className={`pt-6 first:pt-0 text-left grid grid-cols-1 md:grid-cols-2 gap-6 items-start`}>
                  
                  {/* Left info */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary text-black font-extrabold flex items-center justify-center text-xs">
                        {idx + 1}
                      </span>
                      <h4 className="font-black text-sm uppercase tracking-wider text-secondary dark:text-white">Slide #{idx + 1} Slogan Block</h4>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-customGray block mb-1">Category Badge Slogan</label>
                      <input
                        type="text"
                        value={slide.badge}
                        onChange={(e) => handleSlideChange(idx, 'badge', e.target.value)}
                        className="w-full text-sm bg-customGray-light dark:bg-black/30 border border-transparent rounded-xl py-2.5 px-3 focus:outline-none focus:border-primary/50 text-secondary dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-customGray block mb-1">Slide Title Slogan</label>
                      <input
                        type="text"
                        value={slide.title}
                        onChange={(e) => handleSlideChange(idx, 'title', e.target.value)}
                        className="w-full text-sm bg-customGray-light dark:bg-black/30 border border-transparent rounded-xl py-2.5 px-3 focus:outline-none focus:border-primary/50 text-secondary dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-customGray block mb-1">Button Call-To-Action Text</label>
                      <input
                        type="text"
                        value={slide.actionText}
                        onChange={(e) => handleSlideChange(idx, 'actionText', e.target.value)}
                        className="w-full text-sm bg-customGray-light dark:bg-black/30 border border-transparent rounded-xl py-2.5 px-3 focus:outline-none focus:border-primary/50 text-secondary dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Right info */}
                  <div className="space-y-4 pt-8 md:pt-10">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-customGray block mb-1">Description Paragraph</label>
                      <textarea
                        value={slide.description}
                        onChange={(e) => handleSlideChange(idx, 'description', e.target.value)}
                        rows={2}
                        className="w-full text-sm bg-customGray-light dark:bg-black/30 border border-transparent rounded-xl py-2.5 px-3 focus:outline-none focus:border-primary/50 text-secondary dark:text-white resize-none leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-customGray block mb-1 flex items-center gap-1">
                        <FiImage className="w-3.5 h-3.5" /> Slide Image URL
                      </label>
                      <input
                        type="text"
                        value={slide.image}
                        onChange={(e) => handleSlideChange(idx, 'image', e.target.value)}
                        className="w-full text-xs bg-customGray-light dark:bg-black/30 border border-transparent rounded-xl py-2.5 px-3 focus:outline-none focus:border-primary/50 text-secondary dark:text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-customGray block mb-1">Slide Features (Comma Separated)</label>
                      <input
                        type="text"
                        value={slide.features}
                        onChange={(e) => handleSlideChange(idx, 'features', e.target.value)}
                        className="w-full text-xs bg-customGray-light dark:bg-black/30 border border-transparent rounded-xl py-2.5 px-3 focus:outline-none focus:border-primary/50 text-secondary dark:text-white"
                        placeholder="Feature 1, Feature 2, Feature 3"
                      />
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>
        )}

      </div>
      
    </div>
  );
};

export default AdminCustomize;

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  FiHeart,
  FiShoppingCart,
  FiShare2,
  FiTruck,
  FiAward,
  FiShield,
  FiChevronRight
} from 'react-icons/fi';
import { useToast } from '../context/ToastContext.jsx';
import ImageMagnifier from '../components/ImageMagnifier.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { ProductDetailSkeleton } from '../components/LoadingSkeleton.jsx';
import API from '../services/api.js';
import { setCart } from '../redux/cartSlice.js';
import { addToCompare } from '../components/CompareDrawer.jsx';
import { playClickSound, playCartChime } from '../utils/audio.js';
import { setWishlist } from '../redux/wishlistSlice.js';
import { setCurrentProduct, setRelatedProducts, setBoughtTogether, setProductReviews } from '../redux/productSlice.js';

// Fallback Mock data for development
const MOCK_PRODUCTS = [
  { _id: 'mock_p1', title: 'Automatic Soap & Sanitizer Dispenser', slug: 'automatic-soap-dispenser', description: 'Touchless automatic infrared sensor soap dispenser for kitchen and bathroom. Premium matte finish with leak-proof design. Operates on smart battery saving tech.', price: 1299, discount: 15, images: ['https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=600&auto=format&fit=crop'], category: { name: 'Kitchen & Bathroom', slug: 'kitchen-bathroom', _id: 'mock_cat_kb' }, rating: 4.8, stock: 25, featured: true, trending: true, sku: 'SD-01', brand: 'VKS Marketing', features: ['Touchless Automatic Sensor', 'Waterproof IPX4 base', 'Adjustable soap volumes', 'Large 400ml capacity'], specifications: [{ key: 'Material', value: 'High grade ABS + PC' }, { key: 'Power', value: '4 AA Batteries' }, { key: 'Capacity', value: '400 ml' }], size: ['Standard', 'Family Pack'], color: ['Matte Black', 'Frost White'] },
  { _id: 'mock_p2', title: 'UV Sterilizer Toothbrush Holder', slug: 'uv-toothbrush-holder', description: 'Wall-mounted toothbrush holder with UV-C sanitizing light. Holds 5 toothbrushes with automatic toothpaste dispenser.', price: 1899, discount: 20, images: ['https://images.unsplash.com/photo-1620626011761-996317b69766?q=80&w=600&auto=format&fit=crop'], category: { name: 'Bathroom Accessories', slug: 'bathroom-accessories', _id: 'mock_cat_ba' }, rating: 4.6, stock: 12, featured: true, trending: false, sku: 'TB-02', brand: 'VKS Marketing', features: ['UV-C Sterilization 99.9%', 'Holds up to 5 toothbrushes', 'Integrated toothpaste squeezer', 'USB rechargeable'], specifications: [{ key: 'Material', value: 'Eco-friendly Plastic' }, { key: 'Power', value: 'USB Charging' }, { key: 'Battery', value: '1200mAh' }], size: ['Universal'], color: ['Arctic White'] },
  { _id: 'mock_p6', title: 'Airtight Kitchen Storage Container Set', slug: 'kitchen-storage-boxes', description: '7-piece modular leakproof dry food storage container set with labels and marker.', price: 1999, discount: 30, images: ['https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?q=80&w=600&auto=format&fit=crop'], category: { name: 'Kitchen & Dining', slug: 'kitchen-dining', _id: 'mock_cat_kd' }, rating: 4.9, stock: 20, featured: true, trending: true, sku: 'KB-06', brand: 'VKS Marketing', features: ['100% Leakproof Seal', 'Modular Stackable Design', 'BPA Free Material', 'Chalkboard Labels Included'], specifications: [{ key: 'Pieces Count', value: '7 Containers' }, { key: 'Material', value: 'BPA-Free Acrylic' }], size: ['7-Piece Set'], color: ['Clear Transparent'] }
];

const ProductDetail = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { currentProduct, relatedProducts, boughtTogether, productReviews, recentlyViewed } = useSelector(
    (state) => state.products
  );
  const { isAuthenticated } = useSelector((state) => state.auth);
  const wishlistProducts = useSelector((state) => state.wishlist.products);
  
  // Loading and Interactive States
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('description'); // description, specs, shipping
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');

  // Review Submissions
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const isWishlisted = wishlistProducts.some((p) => p._id === currentProduct?._id);

  // Fetch product detail on mount/slug change
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        // API lookup by Slug
        const res = await API.get(`/products/slug/${slug}`);
        if (res.data.success) {
          const product = res.data.product;
          dispatch(setCurrentProduct({ product }));

          // Fetch reviews
          const reviewsRes = await API.get(`/reviews/product/${product._id}`);
          if (reviewsRes.data.success) {
            dispatch(setProductReviews(reviewsRes.data.reviews));
          }

          // Fetch related products
          const relatedRes = await API.get(`/products/related/${product._id}`);
          if (relatedRes.data.success) {
            dispatch(setRelatedProducts(relatedRes.data.products));
          }

          // Fetch frequently bought together bundle
          const bundleRes = await API.get(`/products/bought-together/${product._id}`);
          if (bundleRes.data.success) {
            dispatch(setBoughtTogether(bundleRes.data.products));
          }
        } else {
          loadMockFallback();
        }
      } catch (error) {
        console.error('API detail fetch error, fall back to mock details:', error);
        loadMockFallback();
      } finally {
        setLoading(false);
      }
    };

    const loadMockFallback = () => {
      const match = MOCK_PRODUCTS.find((p) => p.slug === slug) || MOCK_PRODUCTS[0];
      dispatch(setCurrentProduct({ product: match }));
      
      const restMock = MOCK_PRODUCTS.filter((p) => p._id !== match._id);
      dispatch(setRelatedProducts(restMock));
      dispatch(setBoughtTogether(restMock.slice(0, 2)));
      dispatch(setProductReviews([
        { user: { name: 'Sumit Sharma' }, rating: 5, comment: 'Incredibly premium material. Absolute value for money.', createdAt: new Date() },
        { user: { name: 'Kiran Verma' }, rating: 4, comment: 'Highly useful organizer. Satisfied with VKS Marketing service.', createdAt: new Date() }
      ]));
    };

    fetchProduct();
  }, [slug, dispatch]);

  // Reset state selection on product swap
  useEffect(() => {
    if (currentProduct) {
      setSelectedColor(currentProduct.color[0] || '');
      setSelectedSize(currentProduct.size[0] || '');
      setActiveImageIdx(0);
      setQuantity(1);
    }
  }, [currentProduct]);

  // Share Product Link Helper
  const handleShareProduct = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Product link copied to clipboard!', 'info');
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      showToast('Please login to manage your wishlist', 'warning');
      return;
    }
    try {
      const res = await API.post('/wishlist/toggle', { productId: currentProduct._id });
      if (res.data.success) {
        dispatch(setWishlist(res.data.wishlist));
        showToast(res.data.message, 'success');
        playClickSound();
      }
    } catch (error) {
      showToast(error.toString(), 'error');
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      showToast('Please login to add items to cart', 'warning');
      return;
    }
    try {
      const res = await API.post('/cart/add', {
        productId: currentProduct._id,
        quantity,
        color: selectedColor || currentProduct.color[0] || '',
        size: selectedSize || currentProduct.size[0] || ''
      });
      if (res.data.success) {
        dispatch(setCart(res.data.cart));
        showToast('Product added to cart successfully!', 'success');
        playCartChime();
        window.dispatchEvent(new Event('vks_open_minicart'));
      }
    } catch (error) {
      showToast(error.toString(), 'error');
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      showToast('Please login to checkout', 'warning');
      return;
    }
    try {
      const res = await API.post('/cart/add', {
        productId: currentProduct._id,
        quantity,
        color: selectedColor || currentProduct.color[0] || '',
        size: selectedSize || currentProduct.size[0] || ''
      });
      if (res.data.success) {
        dispatch(setCart(res.data.cart));
        navigate('/cart');
      }
    } catch (error) {
      showToast(error.toString(), 'error');
    }
  };

  // Add all bundle items to cart in a single click
  const handleAddBundleToCart = async () => {
    if (!isAuthenticated) {
      showToast('Please login to checkout', 'warning');
      return;
    }
    try {
      // Add current product
      await API.post('/cart/add', {
        productId: currentProduct._id,
        quantity: 1,
        color: selectedColor || currentProduct.color[0] || '',
        size: selectedSize || currentProduct.size[0] || ''
      });

      // Add other items in bundle
      for (const item of boughtTogether) {
        await API.post('/cart/add', {
          productId: item._id,
          quantity: 1,
          color: item.color[0] || '',
          size: item.size[0] || ''
        });
      }

      // Refresh cart in Redux
      const cartRes = await API.get('/cart');
      if (cartRes.data.success) {
        dispatch(setCart(cartRes.data.cart));
        showToast('Frequently Bought Together bundle added to cart!', 'success');
        window.dispatchEvent(new Event('vks_open_minicart'));
      }
    } catch (error) {
      showToast('Bundle upload failed: ' + error.toString(), 'error');
    }
  };

  // Review submit
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment) return;
    try {
      const res = await API.post('/reviews', {
        productId: currentProduct._id,
        rating: reviewRating,
        comment: reviewComment
      });
      if (res.data.success) {
        showToast(res.data.message, 'success');
        setReviewComment('');
        
        // Reload reviews list
        const reviewsRes = await API.get(`/reviews/product/${currentProduct._id}`);
        if (reviewsRes.data.success) {
          dispatch(setProductReviews(reviewsRes.data.reviews));
        }
      }
    } catch (error) {
      showToast(error.toString(), 'error');
    }
  };

  if (loading || !currentProduct) {
    return <ProductDetailSkeleton />;
  }

  // Price formatting
  const discountedPrice = currentProduct.price * (1 - currentProduct.discount / 100);
  
  let bulkDiscount = 0;
  if (quantity >= 5) {
    bulkDiscount = 10;
  } else if (quantity >= 3) {
    bulkDiscount = 5;
  }
  
  const unitPrice = discountedPrice * (1 - bulkDiscount / 100);
  const formattedPrice = unitPrice.toFixed(2);
  const originalPrice = currentProduct.price.toFixed(2);
  const estimatedTotal = (unitPrice * quantity).toFixed(2);

  // Bundle calculations
  const bundleSubtotal = discountedPrice + boughtTogether.reduce((acc, p) => acc + (p.price * (1 - p.discount / 100)), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 select-none">
      
      {/* 1. Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs text-customGray font-semibold select-none mb-8 text-left">
        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        <FiChevronRight />
        <Link to="/shop" className="hover:text-primary transition-colors">Shop</Link>
        <FiChevronRight />
        <span className="text-secondary dark:text-white truncate max-w-[200px]">{currentProduct.title}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 items-start mb-16">
        
        {/* LEFT COLUMN - GALLERY & IMAGE MAGNIFIER */}
        <div className="w-full lg:w-1/2 flex flex-col gap-4">
          <div className="w-full aspect-square border border-customGray-light dark:border-white/5 rounded-3xl overflow-hidden bg-white dark:bg-customGray-dark/20 relative shadow-sm">
            <ImageMagnifier
              src={currentProduct.images[activeImageIdx]}
              alt={currentProduct.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Thumbnails list */}
          {currentProduct.images.length > 1 && (
            <div className="flex gap-3">
              {currentProduct.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-20 h-20 border rounded-2xl overflow-hidden bg-white hover:border-primary transition-all ${
                    activeImageIdx === idx ? 'border-primary ring-2 ring-primary/20' : 'border-customGray-light dark:border-white/10'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN - SPEC DETAILS & CART INITIATIONS */}
        <div className="w-full lg:w-1/2 flex flex-col text-left">
          
          <div className="flex justify-between items-start gap-4 mb-2">
            <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full">
              {currentProduct.brand}
            </span>
            <button
              onClick={handleShareProduct}
              className="p-2.5 bg-customGray-light/60 hover:bg-primary dark:bg-customGray-dark rounded-full hover:text-black transition-colors"
              title="Share Product"
            >
              <FiShare2 className="w-4 h-4" />
            </button>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-secondary dark:text-white mb-2 leading-snug">
            {currentProduct.title}
          </h1>

          {/* Rating stars */}
          <div className="flex items-center gap-2 mb-6 select-none text-sm font-semibold">
            <div className="flex text-primary">
              {[...Array(5)].map((_, i) => (
                <span key={i}>
                  {i < Math.round(currentProduct.rating) ? '★' : '☆'}
                </span>
              ))}
            </div>
            <span className="text-xs text-customGray">({currentProduct.rating.toFixed(1)} / 5 from {productReviews.length} Reviews)</span>
          </div>

          {/* Pricing detail */}
          <div className="flex items-baseline gap-4 mb-6 border-y border-customGray-light dark:border-white/5 py-4">
            <div className="flex flex-col text-left">
              <div className="flex items-baseline gap-4">
                <span className="text-3xl font-black text-secondary dark:text-white">₹{formattedPrice}</span>
                {currentProduct.discount > 0 && (
                  <>
                    <span className="text-base text-customGray line-through">₹{originalPrice}</span>
                    <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                      Save {currentProduct.discount}%
                    </span>
                  </>
                )}
              </div>
              {quantity > 1 && (
                <span className="text-[10px] text-customGray font-bold mt-1 block">
                  Estimated Total: <span className="text-secondary dark:text-white font-black">₹{estimatedTotal}</span> ({quantity} items)
                </span>
              )}
            </div>
          </div>

          {/* Wholesale Volume Tiers Grid */}
          <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-2xl space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">Wholesale Volume Pricing</span>
              {bulkDiscount > 0 && (
                <span className="text-[9px] bg-emerald-500 text-white font-black py-0.5 px-2 rounded-full uppercase">
                  Extra {bulkDiscount}% Saved
                </span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold select-none">
              <div className={`p-2 rounded-xl border transition-all ${quantity < 3 ? 'border-primary bg-primary/10' : 'border-gray-255 dark:border-white/5 bg-transparent'}`}>
                <span className="block text-secondary dark:text-white">1 - 2 Qty</span>
                <span className="text-[10px] text-customGray">Standard</span>
              </div>
              <div className={`p-2 rounded-xl border transition-all ${quantity >= 3 && quantity < 5 ? 'border-primary bg-primary/10' : 'border-gray-255 dark:border-white/5 bg-transparent'}`}>
                <span className="block text-secondary dark:text-white">3 - 4 Qty</span>
                <span className="text-[10px] text-primary">Save 5%</span>
              </div>
              <div className={`p-2 rounded-xl border transition-all ${quantity >= 5 ? 'border-primary bg-primary/10' : 'border-gray-255 dark:border-white/5 bg-transparent'}`}>
                <span className="block text-secondary dark:text-white">5+ Qty</span>
                <span className="text-[10px] text-primary">Save 10%</span>
              </div>
            </div>
          </div>

          {/* Color selects */}
          {currentProduct.color && currentProduct.color.length > 0 && (
            <div className="mb-5">
              <span className="text-xs font-bold uppercase tracking-wider text-customGray block mb-2">Select Color</span>
              <div className="flex gap-2">
                {currentProduct.color.map((col) => (
                  <button
                    key={col}
                    onClick={() => setSelectedColor(col)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
                      (selectedColor || currentProduct.color[0]) === col
                        ? 'border-primary bg-primary text-black'
                        : 'border-customGray-light dark:border-white/10 hover:border-customGray'
                    }`}
                  >
                    {col}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size selects */}
          {currentProduct.size && currentProduct.size.length > 0 && (
            <div className="mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-customGray block mb-2">Select Size</span>
              <div className="flex gap-2">
                {currentProduct.size.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
                      (selectedSize || currentProduct.size[0]) === sz
                        ? 'border-primary bg-primary text-black'
                        : 'border-customGray-light dark:border-white/10 hover:border-customGray'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Active Stock Bar */}
          {currentProduct.stock > 0 && (
            <div className={`mb-6 p-4 rounded-2xl space-y-2 ${
              currentProduct.stock <= 10 
                ? 'bg-red-500/5 border border-red-500/10' 
                : 'bg-emerald-500/5 border border-emerald-500/10'
            }`}>
              <div className={`flex justify-between text-xs font-black ${
                currentProduct.stock <= 10 ? 'text-red-500' : 'text-emerald-500'
              }`}>
                <span className="flex items-center gap-1.5">
                  {currentProduct.stock <= 10 ? '🔥 Limited stock warning' : '🟢 In Stock'}
                </span>
                <span>{currentProduct.stock} units available</span>
              </div>
              <div className="w-full bg-customGray-light dark:bg-black/35 h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    currentProduct.stock <= 10 ? 'bg-red-500' : 'bg-emerald-500'
                  }`} 
                  style={{ width: `${Math.min(100, (currentProduct.stock / 20) * 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Quantity Selector & Add CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            {currentProduct.stock > 0 && (
              <div className="flex border border-customGray-light dark:border-white/10 rounded-2xl overflow-hidden self-start select-none">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-4 py-3 hover:bg-customGray-light dark:hover:bg-white/5 transition-colors font-bold"
                >
                  -
                </button>
                <span className="px-6 py-3 self-center font-bold text-sm w-14 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(currentProduct.stock, q + 1))}
                  className="px-4 py-3 hover:bg-customGray-light dark:hover:bg-white/5 transition-colors font-bold"
                >
                  +
                </button>
              </div>
            )}

            <div className="flex-grow flex gap-3">
              {currentProduct.stock > 0 ? (
                <>
                  <button
                    onClick={handleAddToCart}
                    className="flex-grow py-3.5 bg-secondary hover:bg-secondary/95 dark:bg-white dark:text-black dark:hover:bg-white/95 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow"
                  >
                    <FiShoppingCart /> Add to Cart
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="flex-grow py-3.5 bg-primary hover:bg-primary/95 text-black font-bold rounded-2xl shadow"
                  >
                    Buy Now
                  </button>
                </>
              ) : (
                <div className="w-full py-4 bg-red-500/10 text-red-500 font-extrabold rounded-2xl text-center">
                  Product Out of Stock
                </div>
              )}

              {/* Compare button */}
              <button
                onClick={() => addToCompare(currentProduct, showToast)}
                className="px-4 py-3.5 rounded-2xl border border-customGray-light dark:border-white/10 text-secondary dark:text-white hover:border-primary hover:text-primary transition-all shadow-sm font-bold text-xs uppercase"
                title="Add to Compare"
              >
                Compare
              </button>

              {/* Wishlist button */}
              <button
                onClick={handleWishlistToggle}
                className={`px-4 py-3.5 rounded-2xl border shadow-sm transition-all ${
                  isWishlisted
                    ? 'border-red-100 text-red-500 bg-red-50/20'
                    : 'border-customGray-light dark:border-white/10 text-secondary dark:text-white hover:text-red-500'
                }`}
              >
                <FiHeart className={isWishlisted ? 'fill-current' : ''} />
              </button>
            </div>
          </div>

          {/* Delivery & Shipping Info */}
          <div className="border-t border-customGray-light dark:border-white/5 pt-6 space-y-4 text-xs font-semibold text-customGray">
            <div className="flex items-center gap-3"><FiTruck className="text-primary w-4.5 h-4.5" /> Free shipping on orders above ₹500</div>
            <div className="flex items-center gap-3"><FiAward className="text-primary w-4.5 h-4.5" /> Genuine VKS Marketing brand guarantee</div>
            <div className="flex items-center gap-3"><FiShield className="text-primary w-4.5 h-4.5" /> 7 days easy exchange and refund options</div>
          </div>

        </div>

      </div>

      {/* 2. SPECIFICATION TABS */}
      <section className="mb-16 text-left">
        <div className="flex gap-4 border-b border-customGray-light dark:border-white/5 pb-3 mb-6 select-none font-semibold">
          {[
            { id: 'description', label: 'Product Description' },
            { id: 'specs', label: 'Specifications' },
            { id: 'features', label: 'Key Features' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`text-sm tracking-wide transition-all border-b-2 -mb-[14px] pb-2 ${
                activeTab === tab.id
                  ? 'border-primary text-secondary dark:text-white font-bold'
                  : 'border-transparent text-customGray hover:text-secondary dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="text-sm leading-relaxed text-customGray-dark dark:text-gray-300">
          {activeTab === 'description' && (
            <p className="whitespace-pre-line">{currentProduct.description}</p>
          )}

          {activeTab === 'specs' && (
            <div className="border border-customGray-light dark:border-white/5 rounded-3xl overflow-hidden max-w-xl">
              <table className="w-full">
                <tbody>
                  {currentProduct.specifications && currentProduct.specifications.length > 0 ? (
                    currentProduct.specifications.map((spec, i) => (
                      <tr key={i} className="border-b border-customGray-light dark:border-white/5 last:border-b-0 hover:bg-customGray-light/40 dark:hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 font-semibold text-secondary dark:text-white text-xs w-1/3 bg-customGray-light/20 dark:bg-black/25">{spec.key}</td>
                        <td className="px-4 py-3 text-xs">{spec.value}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-4 py-3 text-center">No specifications detailed.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'features' && (
            <ul className="list-disc pl-5 space-y-2">
              {currentProduct.features && currentProduct.features.length > 0 ? (
                currentProduct.features.map((feat, i) => (
                  <li key={i} className="text-sm">{feat}</li>
                ))
              ) : (
                <li>Premium utility and household assistance.</li>
              )}
            </ul>
          )}
        </div>
      </section>

      {/* 3. FREQUENTLY BOUGHT TOGETHER BUNDLE */}
      {boughtTogether.length > 0 && (
        <section className="bg-customGray-light/35 dark:bg-customGray-dark/20 border border-customGray-light dark:border-white/5 rounded-[32px] p-6 sm:p-8 mb-16 text-left select-none">
          <h2 className="text-lg font-black text-secondary dark:text-white mb-6">Frequently Bought Together</h2>
          
          <div className="flex flex-col lg:flex-row gap-8 items-center justify-between">
            {/* Bundle items pictures */}
            <div className="flex flex-wrap items-center gap-4 text-customGray font-bold text-2xl">
              {/* Current item */}
              <div className="flex flex-col items-center gap-2 max-w-[120px]">
                <img src={currentProduct.images[0]} alt="Current" className="w-24 h-24 object-cover rounded-2xl border bg-white" />
                <span className="text-[10px] text-secondary dark:text-white truncate w-full text-center">{currentProduct.title}</span>
              </div>
              
              <span>+</span>

              {/* Bundle list */}
              {boughtTogether.map((item) => (
                <React.Fragment key={item._id}>
                  <div className="flex flex-col items-center gap-2 max-w-[120px]">
                    <img src={item.images[0]} alt={item.title} className="w-24 h-24 object-cover rounded-2xl border bg-white" />
                    <span className="text-[10px] text-secondary dark:text-white truncate w-full text-center">{item.title}</span>
                  </div>
                  {boughtTogether.indexOf(item) < boughtTogether.length - 1 && <span>+</span>}
                </React.Fragment>
              ))}
            </div>

            {/* Price sum and CTA */}
            <div className="bg-white dark:bg-customGray-dark border border-customGray-light dark:border-white/5 p-6 rounded-3xl shadow-sm text-center lg:text-left">
              <p className="text-xs text-customGray font-bold mb-1">Bundle Total Price</p>
              <h3 className="text-2xl font-black text-secondary dark:text-white mb-4">₹{bundleSubtotal.toFixed(2)}</h3>
              <button
                onClick={handleAddBundleToCart}
                className="px-6 py-3 bg-primary hover:bg-primary/95 text-black font-bold rounded-2xl shadow transition-all flex items-center gap-2"
              >
                <FiShoppingCart /> Add All 3 to Cart
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 4. RELATED PRODUCTS PANEL */}
      {relatedProducts.length > 0 && (
        <section className="mb-16 text-left">
          <h2 className="text-2xl font-black text-secondary dark:text-white mb-8">Similar Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.slice(0, 4).map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        </section>
      )}

      {/* 5. RECENTLY VIEWED PANEL */}
      {recentlyViewed.length > 1 && (
        <section className="mb-16 text-left">
          <h2 className="text-lg font-black text-secondary dark:text-white mb-6">Recently Viewed</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {recentlyViewed.filter(p => p._id !== currentProduct._id).map((prod) => (
              <Link
                key={prod._id}
                to={`/product/${prod.slug}`}
                className="bg-white dark:bg-customGray-dark border border-customGray-light dark:border-white/5 rounded-2xl overflow-hidden p-2 flex flex-col hover:border-primary transition-all group"
              >
                <img src={prod.images[0]} alt={prod.title} className="w-full aspect-square object-cover rounded-xl mb-2" />
                <h4 className="text-xs font-bold truncate text-secondary dark:text-white group-hover:text-primary leading-tight">{prod.title}</h4>
                <p className="text-[10px] text-primary font-bold mt-1">₹{(prod.price * (1 - prod.discount / 100)).toFixed(0)}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 6. CUSTOMER REVIEWS & FORM */}
      <section className="text-left max-w-4xl">
        <h2 className="text-2xl font-black text-secondary dark:text-white mb-8 border-b border-customGray-light dark:border-white/5 pb-4">Customer Reviews</h2>
        
        <div className="flex flex-col md:flex-row gap-8 items-start mb-10">
          {/* Reviews List */}
          <div className="w-full md:w-2/3 space-y-6">
            {productReviews.length > 0 ? (
              productReviews.map((rev, idx) => (
                <div key={idx} className="border-b border-customGray-light dark:border-white/5 pb-6 last:border-b-0">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-sm text-secondary dark:text-white">{rev.user?.name || 'Anonymous User'}</span>
                    <span className="text-[10px] text-customGray font-semibold">
                      {new Date(rev.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex text-primary mb-2 select-none">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-xs">
                        {i < rev.rating ? '★' : '☆'}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-customGray leading-relaxed">{rev.comment}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-customGray italic">No reviews written for this product yet. Be the first to review!</p>
            )}
          </div>

          {/* Add Review Form */}
          {isAuthenticated ? (
            <form onSubmit={handleReviewSubmit} className="w-full md:w-1/3 bg-white dark:bg-customGray-dark border border-customGray-light dark:border-white/5 p-6 rounded-3xl shadow-sm">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-secondary dark:text-white mb-4">Write a Review</h3>
              
              {/* Rating stars picker */}
              <div className="mb-4">
                <span className="text-xs font-bold text-customGray block mb-2">Your Rating</span>
                <div className="flex gap-1.5 text-primary text-xl select-none">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="focus:outline-none hover:scale-110 transition-transform"
                    >
                      {star <= reviewRating ? '★' : '☆'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Comments box */}
              <div className="mb-4">
                <label className="text-xs font-bold text-customGray block mb-2">Your Comment</label>
                <textarea
                  rows="4"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your thoughts about this product..."
                  className="w-full text-sm bg-customGray-light dark:bg-black/30 border border-transparent rounded-2xl p-3 focus:outline-none focus:border-primary/50"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-secondary text-white dark:bg-primary dark:text-black rounded-xl font-bold text-sm shadow hover:bg-secondary/95 transition-all"
              >
                Submit Review
              </button>
            </form>
          ) : (
            <div className="w-full md:w-1/3 bg-customGray-light/40 dark:bg-customGray-dark/20 p-6 rounded-3xl text-center select-none">
              <p className="text-xs text-customGray font-semibold mb-3">Please log in to share your experience with this product.</p>
              <Link to="/login" className="px-4 py-2 bg-secondary text-white dark:bg-primary dark:text-black rounded-xl text-xs font-bold inline-block">
                Log In
              </Link>
            </div>
          )}
        </div>
      </section>

    </div>
  );
};

export default ProductDetail;

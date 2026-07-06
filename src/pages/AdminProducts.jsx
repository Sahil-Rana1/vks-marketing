import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiUpload } from 'react-icons/fi';
import { useToast } from '../context/ToastContext.jsx';
import { TableSkeleton } from '../components/LoadingSkeleton.jsx';
import API from '../services/api.js';

// Fallbacks for dev
const MOCK_PRODUCTS = [
  { _id: 'mock_p1', title: 'Automatic Soap & Sanitizer Dispenser', price: 1299, discount: 15, stock: 25, sku: 'SD-01', brand: 'VKS Marketing', category: { name: 'Kitchen & Bathroom', _id: 'mock_cat_kb' }, images: ['https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=300&auto=format&fit=crop'], color: ['Matte Black'], size: ['Standard'], features: [], specifications: [] }
];

const MOCK_CATEGORIES = [
  { _id: 'mock_cat_kb', name: 'Kitchen & Bathroom' },
  { _id: 'mock_cat_ba', name: 'Bathroom Accessories' },
  { _id: 'mock_cat_ho', name: 'Home Organizers' }
];

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal editor states
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  
  const { showToast } = useToast();

  // Form Fields
  const [title, setTitle] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('0');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('VKS Marketing');
  const [description, setDescription] = useState('');
  const [featured, setFeatured] = useState(false);
  const [trending, setTrending] = useState(false);
  
  // Custom arrays
  const [colorInput, setColorInput] = useState('');
  const [colors, setColors] = useState([]);
  
  const [sizeInput, setSizeInput] = useState('');
  const [sizes, setSizes] = useState([]);
  
  const [featureInput, setFeatureInput] = useState('');
  const [featuresList, setFeaturesList] = useState([]);

  // Specifications key-value pairs
  const [specKey, setSpecKey] = useState('');
  const [specVal, setSpecVal] = useState('');
  const [specsList, setSpecsList] = useState([]);

  // File Upload
  const [imageFiles, setImageFiles] = useState([]);

  // Fetch catalog & categories
  const loadData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        API.get('/products'),
        API.get('/categories')
      ]);

      if (prodRes.data.success && prodRes.data.products.length > 0) {
        setProducts(prodRes.data.products);
      } else {
        setProducts(MOCK_PRODUCTS);
      }

      if (catRes.data.success && catRes.data.categories.length > 0) {
        setCategories(catRes.data.categories);
      } else {
        setCategories(MOCK_CATEGORIES);
      }
    } catch (err) {
      console.error(err);
      setProducts(MOCK_PRODUCTS);
      setCategories(MOCK_CATEGORIES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setTitle('');
    setSku('');
    setPrice('');
    setDiscount('0');
    setStock('');
    setCategory('');
    setBrand('VKS Marketing');
    setDescription('');
    setFeatured(false);
    setTrending(false);
    setColors([]);
    setSizes([]);
    setFeaturesList([]);
    setSpecsList([]);
    setImageFiles([]);
    setEditId(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    if (categories.length > 0) setCategory(categories[0]._id);
    setIsOpen(true);
  };

  const handleOpenEdit = (prod) => {
    resetForm();
    setEditId(prod._id);
    setTitle(prod.title);
    setSku(prod.sku);
    setPrice(prod.price);
    setDiscount(prod.discount);
    setStock(prod.stock);
    setCategory(prod.category?._id || '');
    setBrand(prod.brand);
    setDescription(prod.description);
    setFeatured(prod.featured);
    setTrending(prod.trending);
    setColors(prod.color || []);
    setSizes(prod.size || []);
    setFeaturesList(prod.features || []);
    setSpecsList(prod.specifications || []);
    setIsOpen(true);
  };

  const handleFileChange = (e) => {
    setImageFiles([...e.target.files]);
  };

  // List append helpers
  const appendColor = () => {
    if (colorInput.trim() && !colors.includes(colorInput.trim())) {
      setColors([...colors, colorInput.trim()]);
      setColorInput('');
    }
  };

  const appendSize = () => {
    if (sizeInput.trim() && !sizes.includes(sizeInput.trim())) {
      setSizes([...sizes, sizeInput.trim()]);
      setSizeInput('');
    }
  };

  const appendFeature = () => {
    if (featureInput.trim() && !featuresList.includes(featureInput.trim())) {
      setFeaturesList([...featuresList, featureInput.trim()]);
      setFeatureInput('');
    }
  };

  const appendSpec = () => {
    if (specKey.trim() && specVal.trim()) {
      setSpecsList([...specsList, { key: specKey.trim(), value: specVal.trim() }]);
      setSpecKey('');
      setSpecVal('');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!title || !price || !stock || !sku || !category) {
      showToast('Please fill all required catalog fields', 'warning');
      return;
    }

    try {
      // Use Form Data for multipart uploads
      const formData = new FormData();
      formData.append('title', title);
      formData.append('sku', sku);
      formData.append('price', price);
      formData.append('discount', discount);
      formData.append('stock', stock);
      formData.append('category', category);
      formData.append('brand', brand);
      formData.append('description', description);
      formData.append('featured', featured);
      formData.append('trending', trending);
      
      formData.append('color', JSON.stringify(colors));
      formData.append('size', JSON.stringify(sizes));
      formData.append('features', JSON.stringify(featuresList));
      formData.append('specifications', JSON.stringify(specsList));

      // Append files
      imageFiles.forEach((file) => {
        formData.append('images', file);
      });

      let res;
      if (editId) {
        // Update product
        res = await API.put(`/products/${editId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        // Create product
        res = await API.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (res.data.success) {
        showToast(res.data.message, 'success');
        setIsOpen(false);
        resetForm();
        loadData();
      }
    } catch (error) {
      showToast(error.toString(), 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await API.delete(`/products/${id}`);
      if (res.data.success) {
        showToast(res.data.message, 'success');
        loadData();
      }
    } catch (error) {
      showToast(error.toString(), 'error');
    }
  };

  return (
    <div className="space-y-6 select-none text-left">
      <div className="flex justify-between items-center select-none mb-6">
        <div>
          <h2 className="text-2xl font-black text-secondary dark:text-white">Products Catalog</h2>
          <p className="text-xs text-customGray font-semibold mt-1">Manage and edit your products catalog</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-5 py-2.5 bg-primary text-black font-bold rounded-xl shadow flex items-center gap-1.5 hover:bg-primary/95 transition-all text-xs"
        >
          <FiPlus /> Add Product
        </button>
      </div>

      {loading ? (
        <TableSkeleton rows={4} cols={5} />
      ) : (
        <div className="bg-white dark:bg-customGray-dark border border-customGray-light dark:border-white/5 rounded-3xl overflow-hidden shadow-sm overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-customGray-light dark:border-white/5 text-customGray font-bold uppercase bg-customGray-light/10 dark:bg-black/20 select-none">
                <th className="p-4 font-bold">Image</th>
                <th className="p-4 font-bold">Title / SKU</th>
                <th className="p-4 font-bold">Category</th>
                <th className="p-4 font-bold">Price</th>
                <th className="p-4 font-bold">Stock</th>
                <th className="p-4 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((prod) => (
                <tr key={prod._id} className="border-b border-customGray-light dark:border-white/5 last:border-0 hover:bg-customGray-light/20 dark:hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <img src={prod.images[0]} alt={prod.title} className="w-12 h-12 object-cover rounded-xl border bg-white" />
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-secondary dark:text-white text-sm line-clamp-1">{prod.title}</p>
                    <p className="text-[10px] text-customGray font-semibold">SKU: {prod.sku}</p>
                  </td>
                  <td className="p-4 font-bold">{prod.category?.name || 'Essentials'}</td>
                  <td className="p-4 font-bold">₹{prod.price} {prod.discount > 0 && <span className="text-[9px] text-primary bg-primary/10 px-1.5 py-0.5 rounded ml-1">-{prod.discount}%</span>}</td>
                  <td className="p-4 font-bold">
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] ${prod.stock <= 5 ? 'text-red-500 bg-red-500/10' : 'text-customGray-dark dark:text-gray-300'}`}>
                      {prod.stock} Units
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2.5">
                      <button onClick={() => handleOpenEdit(prod)} className="p-2 hover:bg-primary hover:text-black rounded-lg text-customGray transition-all" title="Edit Product"><FiEdit2 /></button>
                      <button onClick={() => handleDelete(prod._id)} className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg text-customGray transition-all" title="Delete Product"><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Editor Modal Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-end">
          {/* Backdrop */}
          <div onClick={() => setIsOpen(false)} className="absolute inset-0 bg-black/60" />
          
          {/* Modal Panel */}
          <div className="absolute right-0 top-0 bottom-0 w-[550px] max-w-[90vw] bg-white dark:bg-customGray-dark p-6 flex flex-col gap-6 shadow-2xl overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-4 select-none">
              <h3 className="font-extrabold text-lg">{editId ? 'Edit Product Details' : 'Add New Product'}</h3>
              <button onClick={() => setIsOpen(false)} className="p-1 rounded-full hover:bg-customGray-light dark:hover:bg-black/30"><FiX /></button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-semibold text-customGray">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-[10px] font-bold uppercase">Product Title *</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-customGray-light dark:bg-black/30 py-2 px-3 rounded-xl border border-transparent focus:outline-none" required />
                </div>
                <div>
                  <label className="block mb-1 text-[10px] font-bold uppercase">SKU Code *</label>
                  <input type="text" value={sku} onChange={(e) => setSku(e.target.value)} className="w-full bg-customGray-light dark:bg-black/30 py-2 px-3 rounded-xl border border-transparent focus:outline-none" required />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block mb-1 text-[10px] font-bold uppercase">Price (₹) *</label>
                  <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full bg-customGray-light dark:bg-black/30 py-2 px-3 rounded-xl border border-transparent focus:outline-none" required />
                </div>
                <div>
                  <label className="block mb-1 text-[10px] font-bold uppercase">Discount (%)</label>
                  <input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} className="w-full bg-customGray-light dark:bg-black/30 py-2 px-3 rounded-xl border border-transparent focus:outline-none" />
                </div>
                <div>
                  <label className="block mb-1 text-[10px] font-bold uppercase">Stock qty *</label>
                  <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full bg-customGray-light dark:bg-black/30 py-2 px-3 rounded-xl border border-transparent focus:outline-none" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-[10px] font-bold uppercase">Category *</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-customGray-light dark:bg-black/30 py-2.5 px-3 rounded-xl border border-transparent focus:outline-none" required>
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-[10px] font-bold uppercase">Brand</label>
                  <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full bg-customGray-light dark:bg-black/30 py-2 px-3 rounded-xl border border-transparent focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-[10px] font-bold uppercase">Product Description</label>
                <textarea rows="3" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-customGray-light dark:bg-black/30 p-3 rounded-xl border border-transparent focus:outline-none"></textarea>
              </div>

              {/* Tag style inputs for Colors & Sizes */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-[10px] font-bold uppercase">Colors (e.g. White)</label>
                  <div className="flex gap-1">
                    <input type="text" value={colorInput} onChange={(e) => setColorInput(e.target.value)} className="w-full bg-customGray-light dark:bg-black/30 py-1.5 px-2 rounded-xl focus:outline-none" />
                    <button type="button" onClick={appendColor} className="px-3 bg-secondary text-white rounded-xl">+</button>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {colors.map((c) => (
                      <span key={c} className="bg-primary/10 text-primary px-2 py-0.5 rounded-md text-[9px] flex items-center gap-1">
                        {c} <button type="button" onClick={() => setColors(colors.filter(col => col !== c))} className="text-[9px] font-extrabold">x</button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block mb-1 text-[10px] font-bold uppercase">Sizes (e.g. Medium)</label>
                  <div className="flex gap-1">
                    <input type="text" value={sizeInput} onChange={(e) => setSizeInput(e.target.value)} className="w-full bg-customGray-light dark:bg-black/30 py-1.5 px-2 rounded-xl focus:outline-none" />
                    <button type="button" onClick={appendSize} className="px-3 bg-secondary text-white rounded-xl">+</button>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {sizes.map((s) => (
                      <span key={s} className="bg-primary/10 text-primary px-2 py-0.5 rounded-md text-[9px] flex items-center gap-1">
                        {s} <button type="button" onClick={() => setSizes(sizes.filter(sz => sz !== s))} className="text-[9px] font-extrabold">x</button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Specs and Features list builders */}
              <div>
                <label className="block mb-1 text-[10px] font-bold uppercase">Specifications (e.g. Material: Glass)</label>
                <div className="flex gap-2">
                  <input type="text" placeholder="Key" value={specKey} onChange={(e) => setSpecKey(e.target.value)} className="w-1/2 bg-customGray-light dark:bg-black/30 py-1.5 px-2 rounded-xl focus:outline-none" />
                  <input type="text" placeholder="Value" value={specVal} onChange={(e) => setSpecVal(e.target.value)} className="w-1/2 bg-customGray-light dark:bg-black/30 py-1.5 px-2 rounded-xl focus:outline-none" />
                  <button type="button" onClick={appendSpec} className="px-3 bg-secondary text-white rounded-xl">+</button>
                </div>
                <div className="mt-2 space-y-1">
                  {specsList.map((spec, i) => (
                    <div key={i} className="flex justify-between items-center bg-customGray-light/30 p-1.5 rounded-lg text-[10px]">
                      <span><strong>{spec.key}</strong>: {spec.value}</span>
                      <button type="button" onClick={() => setSpecsList(specsList.filter((_, idx) => idx !== i))} className="text-red-500">Remove</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Checkbox settings */}
              <div className="flex gap-6 select-none font-semibold">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="accent-primary rounded" />
                  Featured Product
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={trending} onChange={(e) => setTrending(e.target.checked)} className="accent-primary rounded" />
                  Trending Product
                </label>
              </div>

              {/* File Image Upload */}
              <div>
                <label className="block mb-1.5 text-[10px] font-bold uppercase">Upload Images (Maximum 5)</label>
                <div className="border border-dashed border-customGray-light p-4 rounded-2xl text-center relative hover:bg-customGray-light/20 transition-colors">
                  <FiUpload className="w-6 h-6 mx-auto mb-2 text-customGray" />
                  <span className="text-[10px]">Click to upload product image files</span>
                  <input type="file" multiple onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                </div>
                {imageFiles.length > 0 && (
                  <div className="text-[10px] text-primary font-bold mt-1.5">
                    {imageFiles.length} files selected for upload.
                  </div>
                )}
              </div>

              <div className="pt-4 border-t flex gap-3 select-none">
                <button type="button" onClick={() => setIsOpen(false)} className="w-1/2 py-2.5 border rounded-xl font-bold text-center">Cancel</button>
                <button type="submit" className="w-1/2 py-2.5 bg-primary text-black font-extrabold rounded-xl shadow text-center">{editId ? 'Save Changes' : 'Create Product'}</button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminProducts;

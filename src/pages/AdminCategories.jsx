import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiUpload } from 'react-icons/fi';
import { useToast } from '../context/ToastContext.jsx';
import { TableSkeleton } from '../components/LoadingSkeleton.jsx';
import API from '../services/api.js';

const MOCK_CATEGORIES = [
  { _id: 'mock_cat_kd', name: 'Kitchen & Dining', description: 'Premium airtight storage containers and dispensers.', image: 'https://images.unsplash.com/photo-1595231712426-63d23a9ae100?q=80&w=300&auto=format&fit=crop' },
  { _id: 'mock_cat_ba', name: 'Bathroom Accessories', description: 'Sanitizers and wall organizers for clean spaces.', image: 'https://images.unsplash.com/photo-1620626011761-996317b69766?q=80&w=300&auto=format&fit=crop' }
];

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Editor modal
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  const { showToast } = useToast();

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await API.get('/categories');
      if (res.data.success && res.data.categories.length > 0) {
        setCategories(res.data.categories);
      } else {
        setCategories(MOCK_CATEGORIES);
      }
    } catch (err) {
      console.error(err);
      setCategories(MOCK_CATEGORIES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenCreate = () => {
    setEditId(null);
    setName('');
    setDescription('');
    setImageFile(null);
    setIsOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditId(cat._id);
    setName(cat.name);
    setDescription(cat.description || '');
    setImageFile(null);
    setIsOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!name) {
      showToast('Category name is required', 'warning');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      let res;
      if (editId) {
        res = await API.put(`/categories/${editId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        res = await API.post('/categories', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (res.data.success) {
        showToast(res.data.message, 'success');
        setIsOpen(false);
        loadCategories();
      }
    } catch (error) {
      showToast(error.toString(), 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category? Products in this category will become orphaned.')) return;
    try {
      const res = await API.delete(`/categories/${id}`);
      if (res.data.success) {
        showToast(res.data.message, 'success');
        loadCategories();
      }
    } catch (error) {
      showToast(error.toString(), 'error');
    }
  };

  return (
    <div className="space-y-6 select-none text-left">
      <div className="flex justify-between items-center select-none mb-6">
        <div>
          <h2 className="text-2xl font-black text-secondary dark:text-white">Categories Manager</h2>
          <p className="text-xs text-customGray font-semibold mt-1">Configure product organizing sections</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-5 py-2.5 bg-primary text-black font-bold rounded-xl shadow flex items-center gap-1.5 hover:bg-primary/95 transition-all text-xs"
        >
          <FiPlus /> Add Category
        </button>
      </div>

      {loading ? (
        <TableSkeleton rows={3} cols={4} />
      ) : (
        <div className="bg-white dark:bg-customGray-dark border border-customGray-light dark:border-white/5 rounded-3xl overflow-hidden shadow-sm overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-customGray-light dark:border-white/5 text-customGray font-bold uppercase bg-customGray-light/10 dark:bg-black/20 select-none">
                <th className="p-4 font-bold">Image</th>
                <th className="p-4 font-bold">Category Name</th>
                <th className="p-4 font-bold">Description</th>
                <th className="p-4 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat._id} className="border-b border-customGray-light dark:border-white/5 last:border-0 hover:bg-customGray-light/20 dark:hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} className="w-12 h-12 object-cover rounded-xl border bg-white" />
                    ) : (
                      <div className="w-12 h-12 bg-customGray-light dark:bg-black/40 rounded-xl" />
                    )}
                  </td>
                  <td className="p-4 font-bold text-sm text-secondary dark:text-white">{cat.name}</td>
                  <td className="p-4 text-customGray font-medium max-w-xs truncate">{cat.description || 'No description provided.'}</td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => handleOpenEdit(cat)} className="p-2 hover:bg-primary hover:text-black rounded-lg text-customGray transition-all"><FiEdit2 /></button>
                      <button onClick={() => handleDelete(cat._id)} className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg text-customGray transition-all"><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Editor Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div onClick={() => setIsOpen(false)} className="absolute inset-0 bg-black/60" />
          <div className="relative max-w-md w-full bg-white dark:bg-customGray-dark rounded-3xl overflow-hidden p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3 select-none">
              <h3 className="font-extrabold text-sm uppercase tracking-wider">{editId ? 'Edit Category' : 'Create Category'}</h3>
              <button onClick={() => setIsOpen(false)} className="p-1 rounded-full hover:bg-customGray-light dark:hover:bg-black/35"><FiX /></button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-semibold text-customGray text-left">
              <div>
                <label className="block mb-1 text-[10px] font-bold uppercase">Category Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-customGray-light dark:bg-black/30 py-2.5 px-3 rounded-xl border border-transparent focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-[10px] font-bold uppercase">Description</label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-customGray-light dark:bg-black/30 p-3 rounded-xl border border-transparent focus:outline-none"
                ></textarea>
              </div>

              {/* Upload image */}
              <div>
                <label className="block mb-1.5 text-[10px] font-bold uppercase">Category Image</label>
                <div className="border border-dashed p-4 rounded-xl text-center relative hover:bg-customGray-light/10 cursor-pointer">
                  <FiUpload className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-[10px]">Upload category banner</span>
                  <input
                    type="file"
                    onChange={(e) => setImageFile(e.target.files[0])}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept="image/*"
                  />
                </div>
                {imageFile && (
                  <span className="text-[10px] text-primary font-bold block mt-1.5">Selected: {imageFile.name}</span>
                )}
              </div>

              <div className="pt-4 border-t flex gap-2 select-none">
                <button type="button" onClick={() => setIsOpen(false)} className="w-1/2 py-2.5 border rounded-xl font-bold text-center">Cancel</button>
                <button type="submit" className="w-1/2 py-2.5 bg-primary text-black font-extrabold rounded-xl shadow text-center">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminCategories;

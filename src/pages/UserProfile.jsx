import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FiMapPin, FiTrash2, FiPlus, FiChevronLeft } from 'react-icons/fi';
import { useToast } from '../context/ToastContext.jsx';
import { updateProfileAddresses } from '../redux/authSlice.js';
import API from '../services/api.js';
import { Link } from 'react-router-dom';

const UserProfile = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { showToast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    isDefault: false
  });

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!address.street || !address.city || !address.state || !address.postalCode) {
      showToast('Please fill all address fields', 'warning');
      return;
    }

    try {
      const updatedList = [...(user.addresses || []), address];
      const res = await API.put('/auth/addresses', { addresses: updatedList });
      if (res.data.success) {
        dispatch(updateProfileAddresses(res.data.addresses));
        showToast('New shipping address saved successfully!', 'success');
        setShowForm(false);
        setAddress({ street: '', city: '', state: '', postalCode: '', country: 'India', isDefault: false });
      }
    } catch (err) {
      showToast(err.toString(), 'error');
    }
  };

  const handleDeleteAddress = async (idxToDelete) => {
    try {
      const updatedList = user.addresses.filter((_, idx) => idx !== idxToDelete);
      const res = await API.put('/auth/addresses', { addresses: updatedList });
      if (res.data.success) {
        dispatch(updateProfileAddresses(res.data.addresses));
        showToast('Address deleted successfully', 'info');
      }
    } catch (err) {
      showToast(err.toString(), 'error');
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 select-none text-left">
      <div className="flex items-center gap-1.5 text-xs text-customGray font-semibold mb-6">
        <Link to="/" className="hover:text-primary transition-colors flex items-center gap-1"><FiChevronLeft /> Back to Home</Link>
      </div>

      <h1 className="text-3xl font-black text-secondary dark:text-white mb-6">Profile Settings</h1>
      
      {/* Account Info */}
      <div className="bg-white dark:bg-customGray-dark border border-customGray-light dark:border-white/5 rounded-3xl p-6 shadow-sm mb-6 select-none">
        <h3 className="font-extrabold text-sm mb-4 border-b border-customGray-light dark:border-white/5 pb-2">Account Details</h3>
        <div className="space-y-2 text-xs font-semibold text-customGray">
          <p><span className="text-secondary dark:text-white font-bold block mb-0.5">Full Name</span> {user?.name}</p>
          <p><span className="text-secondary dark:text-white font-bold block mt-3 mb-0.5">Email Address</span> {user?.email}</p>
          {user?.phone && <p><span className="text-secondary dark:text-white font-bold block mt-3 mb-0.5">Phone Number</span> {user?.phone}</p>}
        </div>
      </div>

      {/* Address management panel */}
      <div className="bg-white dark:bg-customGray-dark border border-customGray-light dark:border-white/5 rounded-3xl p-6 shadow-sm mb-6 select-none">
        <div className="flex justify-between items-center mb-6 border-b border-customGray-light dark:border-white/5 pb-2">
          <h3 className="font-extrabold text-sm flex items-center gap-2"><FiMapPin className="text-primary" /> Stored Shipping Addresses</h3>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              <FiPlus /> Add
            </button>
          )}
        </div>

        {user?.addresses && user.addresses.length > 0 ? (
          <div className="space-y-3 mb-6">
            {user.addresses.map((addr, idx) => (
              <div
                key={idx}
                className="p-4 border border-customGray-light dark:border-white/10 rounded-2xl flex justify-between items-center bg-customGray-light/10 dark:bg-black/20"
              >
                <div className="text-xs leading-relaxed text-customGray font-semibold">
                  <p className="font-bold text-secondary dark:text-white">Address #{idx + 1}</p>
                  <p className="mt-0.5">{addr.street}, {addr.city}, {addr.state} - {addr.postalCode}</p>
                </div>
                <button
                  onClick={() => handleDeleteAddress(idx)}
                  className="p-2 text-customGray hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                  title="Delete Address"
                >
                  <FiTrash2 className="w-4.5 h-4.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-customGray font-semibold mb-6">No shipping addresses configured. Add one below.</p>
        )}

        {/* Add Address Form */}
        {showForm && (
          <form onSubmit={handleAddAddress} className="space-y-3 border-t border-customGray-light dark:border-white/5 pt-4">
            <span className="text-xs font-extrabold text-customGray block">Create Shipping Destination</span>
            <div>
              <input
                type="text"
                placeholder="Street Address, Block..."
                value={address.street}
                onChange={(e) => setAddress({ ...address, street: e.target.value })}
                className="w-full bg-customGray-light dark:bg-black/30 text-sm rounded-xl p-2.5 border border-transparent focus:outline-none"
                required
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="City"
                value={address.city}
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
                className="w-full bg-customGray-light dark:bg-black/30 text-sm rounded-xl p-2.5 border border-transparent focus:outline-none"
                required
              />
              <input
                type="text"
                placeholder="State"
                value={address.state}
                onChange={(e) => setAddress({ ...address, state: e.target.value })}
                className="w-full bg-customGray-light dark:bg-black/30 text-sm rounded-xl p-2.5 border border-transparent focus:outline-none"
                required
              />
              <input
                type="text"
                placeholder="Postal Code"
                value={address.postalCode}
                onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                className="w-full bg-customGray-light dark:bg-black/30 text-sm rounded-xl p-2.5 border border-transparent focus:outline-none"
                required
              />
            </div>
            <div className="flex gap-2 justify-end pt-2 select-none">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-secondary text-white dark:bg-primary dark:text-black rounded-xl text-xs font-bold shadow"
              >
                Save
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

export default UserProfile;

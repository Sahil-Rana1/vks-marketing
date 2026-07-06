import React, { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiX, FiPercent } from 'react-icons/fi';
import { useToast } from '../context/ToastContext.jsx';
import { TableSkeleton } from '../components/LoadingSkeleton.jsx';
import API from '../services/api.js';

const MOCK_COUPONS = [
  { _id: 'mock_c1', code: 'WELCOME10', discountType: 'Percentage', discountValue: 10, minPurchaseAmount: 1000, maxDiscountAmount: 250, expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), isActive: true }
];

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const { showToast } = useToast();

  // Form Fields
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('Percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minPurchaseAmount, setMinPurchaseAmount] = useState('0');
  const [maxDiscountAmount, setMaxDiscountAmount] = useState('0');
  const [expiryDate, setExpiryDate] = useState('');

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const res = await API.get('/coupons');
      if (res.data.success && res.data.coupons.length > 0) {
        setCoupons(res.data.coupons);
      } else {
        setCoupons(MOCK_COUPONS);
      }
    } catch (err) {
      console.error(err);
      setCoupons(MOCK_COUPONS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!code || !discountValue || !expiryDate) {
      showToast('Please fill all required coupon fields', 'warning');
      return;
    }

    try {
      const res = await API.post('/coupons', {
        code: code.toUpperCase(),
        discountType,
        discountValue,
        minPurchaseAmount,
        maxDiscountAmount,
        expiryDate
      });
      if (res.data.success) {
        showToast(res.data.message, 'success');
        setIsOpen(false);
        setCode('');
        setDiscountValue('');
        setMinPurchaseAmount('0');
        setMaxDiscountAmount('0');
        setExpiryDate('');
        loadCoupons();
      }
    } catch (error) {
      showToast(error.toString(), 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon code? It will no longer be valid for checkouts.')) return;
    try {
      const res = await API.delete(`/coupons/${id}`);
      if (res.data.success) {
        showToast(res.data.message, 'success');
        loadCoupons();
      }
    } catch (error) {
      showToast(error.toString(), 'error');
    }
  };

  return (
    <div className="space-y-6 select-none text-left">
      <div className="flex justify-between items-center select-none mb-6">
        <div>
          <h2 className="text-2xl font-black text-secondary dark:text-white">Coupons Registry</h2>
          <p className="text-xs text-customGray font-semibold mt-1">Configure active promotional discounts</p>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="px-5 py-2.5 bg-primary text-black font-bold rounded-xl shadow flex items-center gap-1.5 hover:bg-primary/95 transition-all text-xs"
        >
          <FiPlus /> Create Coupon
        </button>
      </div>

      {loading ? (
        <TableSkeleton rows={2} cols={5} />
      ) : (
        <div className="bg-white dark:bg-customGray-dark border border-customGray-light dark:border-white/5 rounded-3xl overflow-hidden shadow-sm overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-customGray-light dark:border-white/5 text-customGray font-bold uppercase bg-customGray-light/10 dark:bg-black/20 select-none">
                <th className="p-4 font-bold">Code</th>
                <th className="p-4 font-bold">Discount</th>
                <th className="p-4 font-bold">Min Purchase</th>
                <th className="p-4 font-bold">Expiry Date</th>
                <th className="p-4 font-bold text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c._id} className="border-b border-customGray-light dark:border-white/5 last:border-0 hover:bg-customGray-light/20 dark:hover:bg-white/5 transition-colors">
                  <td className="p-4 font-extrabold text-secondary dark:text-white uppercase flex items-center gap-1.5">
                    <FiPercent className="text-primary" /> {c.code}
                  </td>
                  <td className="p-4 font-bold">
                    {c.discountType === 'Percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`}
                  </td>
                  <td className="p-4 font-bold">₹{c.minPurchaseAmount}</td>
                  <td className="p-4 font-semibold text-customGray">
                    {new Date(c.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="p-4 text-center">
                    <button onClick={() => handleDelete(c._id)} className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg text-customGray transition-all"><FiTrash2 /></button>
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
              <h3 className="font-extrabold text-sm uppercase tracking-wider">Create Coupon</h3>
              <button onClick={() => setIsOpen(false)} className="p-1 rounded-full hover:bg-customGray-light dark:hover:bg-black/35"><FiX /></button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-semibold text-customGray text-left">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-[10px] font-bold uppercase">Promo Code *</label>
                  <input
                    type="text"
                    placeholder="PROMO50"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="w-full bg-customGray-light dark:bg-black/30 py-2.5 px-3 rounded-xl border border-transparent focus:outline-none uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[10px] font-bold uppercase">Discount Type *</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="w-full bg-customGray-light dark:bg-black/30 py-2.5 px-3 rounded-xl border border-transparent focus:outline-none"
                  >
                    <option value="Percentage">Percentage (%)</option>
                    <option value="FixedAmount">Flat Amount (₹)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block mb-1 text-[10px] font-bold uppercase">Value *</label>
                  <input
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="w-full bg-customGray-light dark:bg-black/30 py-2.5 px-2 rounded-xl border border-transparent focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[10px] font-bold uppercase">Min Order (₹)</label>
                  <input
                    type="number"
                    value={minPurchaseAmount}
                    onChange={(e) => setMinPurchaseAmount(e.target.value)}
                    className="w-full bg-customGray-light dark:bg-black/30 py-2.5 px-2 rounded-xl border border-transparent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[10px] font-bold uppercase">Max Cap (₹)</label>
                  <input
                    type="number"
                    value={maxDiscountAmount}
                    onChange={(e) => setMaxDiscountAmount(e.target.value)}
                    className="w-full bg-customGray-light dark:bg-black/30 py-2.5 px-2 rounded-xl border border-transparent focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-[10px] font-bold uppercase">Expiry Date *</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full bg-customGray-light dark:bg-black/30 py-2.5 px-3 rounded-xl border border-transparent focus:outline-none"
                  required
                />
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

export default AdminCoupons;

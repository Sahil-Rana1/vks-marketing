import React, { useState, useEffect } from 'react';
import { FiEye, FiX, FiCheck } from 'react-icons/fi';
import { useToast } from '../context/ToastContext.jsx';
import { TableSkeleton } from '../components/LoadingSkeleton.jsx';
import API from '../services/api.js';

const MOCK_ORDERS = [
  { _id: 'mock_o1', createdAt: new Date(), user: { name: 'Sumit Sharma', email: 'sumit@example.com' }, totalAmount: 3198, paymentMethod: 'COD', paymentStatus: 'Pending', orderStatus: 'Processing', shippingAddress: { name: 'Sumit Sharma', street: 'Sector 15', city: 'Noida', state: 'UP', postalCode: '201301', phone: '9876543210' }, items: [{ title: 'Automatic Soap Dispenser', quantity: 2, price: 1299 }] }
];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Detail Modal Drawer
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Status edit form fields
  const [orderStatus, setOrderStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [comment, setComment] = useState('');

  const { showToast } = useToast();

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await API.get('/orders/admin/list');
      if (res.data.success && res.data.orders.length > 0) {
        setOrders(res.data.orders);
      } else {
        setOrders(MOCK_ORDERS);
      }
    } catch (err) {
      console.error(err);
      setOrders(MOCK_ORDERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleOpenDetails = (ord) => {
    setSelectedOrder(ord);
    setOrderStatus(ord.orderStatus);
    setPaymentStatus(ord.paymentStatus);
    setComment('');
    setIsOpen(true);
  };

  const handleStatusUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.put(`/orders/${selectedOrder._id}/status`, {
        orderStatus,
        paymentStatus,
        comment
      });

      if (res.data.success) {
        showToast('Order parameters updated successfully!', 'success');
        setIsOpen(false);
        loadOrders();
      }
    } catch (error) {
      showToast(error.toString(), 'error');
    }
  };

  const getOrderStatusColor = (status) => {
    switch (status) {
      case 'Processing':
        return 'text-amber-500 bg-amber-500/10';
      case 'Shipped':
        return 'text-blue-500 bg-blue-500/10';
      case 'Out for Delivery':
        return 'text-indigo-500 bg-indigo-500/10';
      case 'Delivered':
        return 'text-emerald-500 bg-emerald-500/10';
      case 'Cancelled':
        return 'text-red-500 bg-red-500/10';
      default:
        return 'text-customGray bg-customGray/10';
    }
  };

  return (
    <div className="space-y-6 select-none text-left">
      <div>
        <h2 className="text-2xl font-black text-secondary dark:text-white">Orders Dashboard</h2>
        <p className="text-xs text-customGray font-semibold mt-1">Audit transactions, update timelines and shipping states</p>
      </div>

      {loading ? (
        <TableSkeleton rows={4} cols={5} />
      ) : (
        <div className="bg-white dark:bg-customGray-dark border border-customGray-light dark:border-white/5 rounded-3xl overflow-hidden shadow-sm overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-customGray-light dark:border-white/5 text-customGray font-bold uppercase bg-customGray-light/10 dark:bg-black/20 select-none">
                <th className="p-4 font-bold">Order ID</th>
                <th className="p-4 font-bold">Date</th>
                <th className="p-4 font-bold">Customer</th>
                <th className="p-4 font-bold">Total</th>
                <th className="p-4 font-bold">Order Status</th>
                <th className="p-4 font-bold">Payment</th>
                <th className="p-4 text-center font-bold">Details</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((ord) => (
                <tr key={ord._id} className="border-b border-customGray-light dark:border-white/5 last:border-0 hover:bg-customGray-light/20 dark:hover:bg-white/5 transition-colors">
                  <td className="p-4 font-bold uppercase">#{ord._id.slice(-6)}</td>
                  <td className="p-4 font-semibold text-customGray">
                    {new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </td>
                  <td className="p-4">
                    <p className="font-bold">{ord.user?.name}</p>
                    <p className="text-[10px] text-customGray">{ord.user?.email}</p>
                  </td>
                  <td className="p-4 font-bold">₹{ord.totalAmount.toFixed(0)}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase ${getOrderStatusColor(ord.orderStatus)}`}>
                      {ord.orderStatus}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase ${
                      ord.paymentStatus === 'Paid' ? 'text-emerald-500 bg-emerald-500/10' : 'text-amber-500 bg-amber-500/10'
                    }`}>
                      {ord.paymentStatus}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button onClick={() => handleOpenDetails(ord)} className="p-2 hover:bg-primary hover:text-black rounded-lg text-customGray transition-all"><FiEye /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Details & Editor Drawer */}
      {isOpen && selectedOrder && (
        <div className="fixed inset-0 z-[200] flex items-center justify-end">
          <div onClick={() => setIsOpen(false)} className="absolute inset-0 bg-black/60" />
          
          <div className="absolute right-0 top-0 bottom-0 w-[500px] max-w-[90vw] bg-white dark:bg-customGray-dark p-6 flex flex-col gap-6 shadow-2xl overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-4 select-none">
              <h3 className="font-extrabold text-lg">Order Details</h3>
              <button onClick={() => setIsOpen(false)} className="p-1 rounded-full hover:bg-customGray-light dark:hover:bg-black/35"><FiX /></button>
            </div>

            {/* Billing items listing */}
            <div className="text-xs font-semibold text-customGray space-y-4 text-left">
              <div className="border-b pb-4">
                <span className="font-bold text-secondary dark:text-white text-sm block mb-2">Items Ordered</span>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>{item.title} x{item.quantity}</span>
                      <span className="font-bold text-secondary dark:text-white">₹{(item.price * item.quantity).toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address detail */}
              <div className="border-b pb-4">
                <span className="font-bold text-secondary dark:text-white text-sm block mb-1">Shipping Destination</span>
                <p className="font-extrabold text-secondary dark:text-gray-300">{selectedOrder.shippingAddress.name}</p>
                <p className="mt-0.5">{selectedOrder.shippingAddress.street}</p>
                <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.postalCode}</p>
                <p className="mt-1">Phone: {selectedOrder.shippingAddress.phone}</p>
              </div>

              {/* Status Update forms */}
              <form onSubmit={handleStatusUpdateSubmit} className="space-y-4 pt-2">
                <span className="font-bold text-secondary dark:text-white text-sm block">Update Order Settings</span>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-[10px] font-bold uppercase">Order Status</label>
                    <select
                      value={orderStatus}
                      onChange={(e) => setOrderStatus(e.target.value)}
                      className="w-full bg-customGray-light dark:bg-black/30 py-2.5 px-3 rounded-xl border border-transparent focus:outline-none"
                    >
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Out for Delivery">Out for Delivery</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 text-[10px] font-bold uppercase">Payment Status</label>
                    <select
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value)}
                      className="w-full bg-customGray-light dark:bg-black/30 py-2.5 px-3 rounded-xl border border-transparent focus:outline-none"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Failed">Failed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block mb-1 text-[10px] font-bold uppercase">Timeline Comment</label>
                  <input
                    type="text"
                    placeholder="E.g. Package dispatched via Delivery partner"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full bg-customGray-light dark:bg-black/30 py-2.5 px-3 rounded-xl border border-transparent focus:outline-none"
                  />
                </div>

                <div className="pt-4 border-t flex gap-2 select-none">
                  <button type="button" onClick={() => setIsOpen(false)} className="w-1/2 py-2.5 border rounded-xl font-bold text-center">Cancel</button>
                  <button type="submit" className="w-1/2 py-2.5 bg-primary text-black font-extrabold rounded-xl shadow text-center">Update Status</button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminOrders;

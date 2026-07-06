import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingBag, FiArrowRight, FiClock } from 'react-icons/fi';
import { useToast } from '../context/ToastContext.jsx';
import { TableSkeleton } from '../components/LoadingSkeleton.jsx';
import API from '../services/api.js';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { showToast } = useToast();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await API.get('/orders/my-orders');
        if (res.data.success) {
          setOrders(res.data.orders);
        }
      } catch (error) {
        console.error('Failed fetching order history:', error);
        showToast('Could not load order history', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [showToast]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Processing':
        return 'text-amber-500 bg-amber-500/10';
      case 'Shipped':
        return 'text-blue-500 bg-blue-500/10';
      case 'Delivered':
        return 'text-emerald-500 bg-emerald-500/10';
      case 'Cancelled':
        return 'text-red-500 bg-red-500/10';
      default:
        return 'text-customGray bg-customGray/10';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 select-none">
      <h1 className="text-3xl font-black text-secondary dark:text-white mb-8 text-left">Your Orders</h1>

      {loading ? (
        <TableSkeleton rows={4} cols={3} />
      ) : orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white dark:bg-customGray-dark border border-customGray-light dark:border-white/5 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3 select-none">
                  <span className="font-extrabold text-sm text-secondary dark:text-white">Order #{order._id.slice(-6).toUpperCase()}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${getStatusColor(order.orderStatus)}`}>
                    {order.orderStatus}
                  </span>
                </div>
                <p className="text-xs text-customGray font-semibold">
                  Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
                <p className="text-xs font-bold text-secondary dark:text-gray-300">
                  {order.items.length} {order.items.length === 1 ? 'item' : 'items'} • total: ₹{order.totalAmount.toFixed(0)}
                </p>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-4 sm:pt-0">
                <span className="text-xs font-bold text-customGray uppercase">{order.paymentMethod}</span>
                <Link
                  to={`/orders/${order._id}`}
                  className="px-5 py-2.5 bg-customGray-light dark:bg-black/40 hover:bg-primary dark:hover:bg-primary hover:text-black rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
                >
                  Track Order <FiArrowRight />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-customGray-dark border border-customGray-light dark:border-white/5 rounded-3xl shadow-sm select-none">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary text-2xl mx-auto mb-4">
            <FiShoppingBag />
          </div>
          <h2 className="text-xl font-bold text-secondary dark:text-white mb-2">No Orders Placed Yet</h2>
          <p className="text-sm text-customGray mb-6">Upgrade your home and purchase essentials to view them here.</p>
          <Link to="/shop" className="px-6 py-2.5 bg-primary hover:bg-primary/95 text-black font-bold rounded-xl shadow inline-block transition-all">
            Start Shopping
          </Link>
        </div>
      )}

    </div>
  );
};

export default OrderHistory;

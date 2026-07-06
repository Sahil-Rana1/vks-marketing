import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiChevronLeft, FiMapPin, FiCreditCard, FiClock, FiCheck } from 'react-icons/fi';
import { useToast } from '../context/ToastContext.jsx';
import { ProductDetailSkeleton } from '../components/LoadingSkeleton.jsx';
import API from '../services/api.js';

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const { showToast } = useToast();

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/orders/${id}`);
        if (res.data.success) {
          setOrder(res.data.order);
        }
      } catch (error) {
        console.error('Failed fetching order details:', error);
        showToast('Could not load order tracking details', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id, showToast]);

  const getStepStatusIndex = (status) => {
    const statuses = ['Processing', 'Shipped', 'Delivered'];
    return statuses.indexOf(status);
  };

  if (loading || !order) {
    return <ProductDetailSkeleton />;
  }

  const currentStatusIndex = getStepStatusIndex(order.orderStatus);

  const trackerSteps = [
    { label: 'Order Processed', status: 'Processing', description: 'Your order has been validated and is being packed.' },
    { label: 'Shipped Out', status: 'Shipped', description: 'Your order has left our Noida facility and is on its way.' },
    { label: 'Delivered', status: 'Delivered', description: 'Package has been signed for at your address.' }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 select-none">
      
      {/* Header back button */}
      <div className="flex items-center gap-1.5 text-xs text-customGray font-semibold select-none mb-8 text-left">
        <Link to="/orders" className="hover:text-primary transition-colors flex items-center gap-1"><FiChevronLeft /> Back to Orders</Link>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-customGray-light dark:border-white/5 pb-5 select-none text-left">
        <div>
          <h1 className="text-2xl font-black text-secondary dark:text-white">Order Tracking</h1>
          <p className="text-xs text-customGray font-semibold mt-1">ID: #{order._id.toUpperCase()}</p>
        </div>
        <div className="text-right sm:text-right">
          <p className="text-xs text-customGray font-semibold">Placed On</p>
          <p className="text-sm font-bold">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
        
        {/* LEFT COLUMN - TIMELINE & DETAILS */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Timeline Tracker */}
          <div className="bg-white dark:bg-customGray-dark border border-customGray-light dark:border-white/5 rounded-3xl p-6 shadow-sm select-none">
            <h3 className="font-extrabold text-base mb-6 flex items-center gap-2"><FiClock className="text-primary" /> Order Timeline</h3>
            
            {order.orderStatus === 'Cancelled' ? (
              <div className="bg-red-500/10 text-red-500 border border-red-500/20 p-4 rounded-2xl text-xs font-bold">
                This order was cancelled. Feel free to contact our customer support team for details.
              </div>
            ) : (
              <div className="relative pl-8 space-y-8 border-l border-customGray-light dark:border-white/5 ml-4">
                {trackerSteps.map((step, idx) => {
                  const stepIndex = getStepStatusIndex(step.status);
                  const isCompleted = stepIndex <= currentStatusIndex;
                  const isActive = stepIndex === currentStatusIndex;

                  return (
                    <div key={idx} className="relative">
                      {/* Timeline dot */}
                      <span className={`absolute -left-[41px] top-1 w-6 h-6 rounded-full border-4 flex items-center justify-center transition-all ${
                        isCompleted
                          ? 'bg-primary border-primary text-black ring-4 ring-primary/10'
                          : 'bg-white dark:bg-customGray-dark border-customGray-light dark:border-white/10 text-transparent'
                      }`}>
                        {isCompleted && <FiCheck className="w-3 h-3 text-black font-extrabold" />}
                      </span>

                      {/* Step Detail */}
                      <div>
                        <h4 className={`text-sm font-extrabold transition-all ${isActive ? 'text-primary' : 'text-secondary dark:text-white'}`}>
                          {step.label}
                        </h4>
                        <p className="text-xs text-customGray mt-0.5 leading-normal">{step.description}</p>
                        
                        {/* If timeline step has specific logged timestamps */}
                        {order.timeline.find(t => t.status === step.status) && (
                          <span className="text-[10px] text-customGray font-semibold uppercase block mt-1">
                            {new Date(order.timeline.find(t => t.status === step.status).timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Line items summary */}
          <div className="bg-white dark:bg-customGray-dark border border-customGray-light dark:border-white/5 rounded-3xl p-6 shadow-sm">
            <h3 className="font-extrabold text-base mb-4">Items Summary</h3>
            <div className="divide-y divide-customGray-light dark:divide-white/5">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-4 first:pt-0 last:pb-0 flex justify-between items-center gap-4">
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-secondary dark:text-white truncate">{item.title}</h4>
                    <p className="text-xs text-customGray font-medium mt-0.5">
                      Quantity: {item.quantity} {item.color && `• Color: ${item.color}`} {item.size && `• Size: ${item.size}`}
                    </p>
                  </div>
                  <span className="font-black text-sm text-secondary dark:text-white flex-shrink-0">
                    ₹{(item.price * item.quantity).toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN - METRICS SUMMARY */}
        <div className="space-y-6">
          
          {/* Shipping detail */}
          <div className="bg-white dark:bg-customGray-dark border border-customGray-light dark:border-white/5 rounded-3xl p-6 shadow-sm">
            <h3 className="font-extrabold text-sm mb-4 flex items-center gap-1.5"><FiMapPin className="text-primary" /> Delivery Address</h3>
            <div className="text-xs leading-relaxed text-customGray font-semibold space-y-1">
              <p className="font-extrabold text-secondary dark:text-white text-sm">{order.shippingAddress.name}</p>
              <p>{order.shippingAddress.street}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}</p>
              <p className="pt-2 text-secondary dark:text-gray-300">Phone: {order.shippingAddress.phone}</p>
            </div>
          </div>

          {/* Payment detail */}
          <div className="bg-white dark:bg-customGray-dark border border-customGray-light dark:border-white/5 rounded-3xl p-6 shadow-sm">
            <h3 className="font-extrabold text-sm mb-4 flex items-center gap-1.5"><FiCreditCard className="text-primary" /> Payment Method</h3>
            <div className="text-xs leading-normal font-semibold text-customGray space-y-2">
              <div className="flex justify-between">
                <span>Method</span>
                <span className="text-secondary dark:text-white font-extrabold">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>Status</span>
                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                  order.paymentStatus === 'Paid' ? 'text-emerald-500 bg-emerald-500/10' : 'text-amber-500 bg-amber-500/10'
                }`}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="bg-white dark:bg-customGray-dark border border-customGray-light dark:border-white/5 rounded-[32px] p-6 shadow-sm">
            <h3 className="font-extrabold text-sm mb-4">Billing Summary</h3>
            <div className="space-y-3 text-xs font-semibold text-customGray">
              <div className="flex justify-between">
                <span>GST (18%)</span>
                <span className="text-secondary dark:text-white">₹{order.taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery fee</span>
                <span className="text-secondary dark:text-white">{order.deliveryCharges === 0 ? 'Free' : `₹${order.deliveryCharges.toFixed(2)}`}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-primary">
                  <span>Discount</span>
                  <span>- ₹{order.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <hr className="border-customGray-light dark:border-white/5" />
              <div className="flex justify-between text-sm font-black text-secondary dark:text-white">
                <span>Grand Total</span>
                <span>₹{order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default OrderDetails;

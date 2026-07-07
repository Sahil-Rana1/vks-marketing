import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiDollarSign,
  FiShoppingBag,
  FiUsers,
  FiBox,
  FiAlertTriangle,
  FiChevronRight
} from 'react-icons/fi';
import { useToast } from '../context/ToastContext.jsx';
import { TableSkeleton } from '../components/LoadingSkeleton.jsx';
import API from '../services/api.js';

// Fallback analytics mock
const MOCK_ANALYTICS = {
  totalRevenue: 28450,
  totalOrders: 15,
  totalCustomers: 12,
  totalProducts: 6,
  lowStockProducts: [
    { _id: 'mock_p4', title: '360° Rotating Cosmetic Organizer', stock: 3, price: 1499, sku: 'CO-04' }
  ],
  recentOrders: [
    { _id: 'mock_o1', user: { name: 'Sumit Sharma', email: 'sumit@example.com' }, totalAmount: 3198, orderStatus: 'Processing', createdAt: new Date() },
    { _id: 'mock_o2', user: { name: 'Kiran Verma', email: 'kiran@example.com' }, totalAmount: 1299, orderStatus: 'Delivered', createdAt: new Date() }
  ]
};

const MOCK_CHARTS = {
  dailySales: [
    { _id: 'Mon', revenue: 4500 },
    { _id: 'Tue', revenue: 6200 },
    { _id: 'Wed', revenue: 3100 },
    { _id: 'Thu', revenue: 7800 },
    { _id: 'Fri', revenue: 5400 },
    { _id: 'Sat', revenue: 9100 },
    { _id: 'Sun', revenue: 6800 }
  ],
  monthlySales: [
    { _id: 'Jan', revenue: 24000 },
    { _id: 'Feb', revenue: 32000 },
    { _id: 'Mar', revenue: 28000 },
    { _id: 'Apr', revenue: 41000 },
    { _id: 'May', revenue: 38000 },
    { _id: 'Jun', revenue: 55000 }
  ]
};

const DashboardOverview = () => {
  const [analytics, setAnalytics] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  const { showToast } = useToast();

  useEffect(() => {
    const fetchDashboardTelemetry = async () => {
      try {
        setLoading(true);
        const [analRes, chartRes] = await Promise.all([
          API.get('/orders/admin/analytics'),
          API.get('/orders/admin/charts')
        ]);

        if (analRes.data.success) {
          setAnalytics(analRes.data.analytics);
          if (analRes.data.analytics.lowStockProducts?.length > 0) {
            showToast(`Inventory Alert: ${analRes.data.analytics.lowStockProducts.length} items are running low on stock!`, 'warning');
          }
        } else {
          setAnalytics(MOCK_ANALYTICS);
        }

        if (chartRes.data.success) {
          setChartData(chartRes.data);
        } else {
          setChartData(MOCK_CHARTS);
        }
      } catch (err) {
        console.error('Failed fetching admin data, using mock values:', err);
        setAnalytics(MOCK_ANALYTICS);
        setChartData(MOCK_CHARTS);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardTelemetry();
  }, [showToast]);

  if (loading || !analytics || !chartData) {
    return <TableSkeleton rows={4} cols={4} />;
  }

  // Calculate SVG line coordinates for weekly chart
  const maxWeeklyVal = Math.max(...chartData.dailySales.map(d => d.revenue), 1000);
  const points = chartData.dailySales
    .map((d, idx) => `${idx * 80 + 40},${180 - (d.revenue / maxWeeklyVal) * 140}`)
    .join(' ');

  // Calculate SVG height coordinates for monthly bars
  const maxMonthlyVal = Math.max(...chartData.monthlySales.map(m => m.revenue), 10000);

  return (
    <div className="space-y-8 select-none text-left">

      {/* Low Stock Warning Notification Banner */}
      {analytics.lowStockProducts && analytics.lowStockProducts.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 rounded-3xl p-5 flex items-center gap-4 shadow-sm select-none">
          <div className="p-3 bg-red-500/20 rounded-2xl text-xl flex-shrink-0 animate-pulse">
            <FiAlertTriangle className="text-red-500 dark:text-red-400" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-red-800 dark:text-red-400">Inventory Warning: Low Stock Detected!</h4>
            <p className="text-xs text-red-650 dark:text-red-500 font-semibold mt-0.5">
              There are {analytics.lowStockProducts.length} {analytics.lowStockProducts.length === 1 ? 'item' : 'items'} running low on stock (5 units or less). Please review the stock list below and replenish inventory.
            </p>
          </div>
        </div>
      )}
      
      {/* 1. Analytics Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white dark:bg-customGray-dark border border-customGray-light dark:border-white/5 p-6 rounded-3xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-customGray font-bold uppercase tracking-wider mb-1">Total Revenue</p>
            <h3 className="text-2xl font-black text-secondary dark:text-white">₹{analytics.totalRevenue.toFixed(0)}</h3>
          </div>
          <div className="p-4 bg-primary/10 rounded-2xl text-primary text-xl"><FiDollarSign /></div>
        </div>

        <div className="bg-white dark:bg-customGray-dark border border-customGray-light dark:border-white/5 p-6 rounded-3xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-customGray font-bold uppercase tracking-wider mb-1">Orders Placed</p>
            <h3 className="text-2xl font-black text-secondary dark:text-white">{analytics.totalOrders}</h3>
          </div>
          <div className="p-4 bg-primary/10 rounded-2xl text-primary text-xl"><FiShoppingBag /></div>
        </div>

        <div className="bg-white dark:bg-customGray-dark border border-customGray-light dark:border-white/5 p-6 rounded-3xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-customGray font-bold uppercase tracking-wider mb-1">Registered Users</p>
            <h3 className="text-2xl font-black text-secondary dark:text-white">{analytics.totalCustomers}</h3>
          </div>
          <div className="p-4 bg-primary/10 rounded-2xl text-primary text-xl"><FiUsers /></div>
        </div>

        <div className="bg-white dark:bg-customGray-dark border border-customGray-light dark:border-white/5 p-6 rounded-3xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-customGray font-bold uppercase tracking-wider mb-1">Total Products</p>
            <h3 className="text-2xl font-black text-secondary dark:text-white">{analytics.totalProducts}</h3>
          </div>
          <div className="p-4 bg-primary/10 rounded-2xl text-primary text-xl"><FiBox /></div>
        </div>

      </div>

      {/* 2. Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* SVG Weekly Sales Line Chart */}
        <div className="bg-white dark:bg-customGray-dark border border-customGray-light dark:border-white/5 rounded-3xl p-6 shadow-sm">
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-customGray mb-6">Weekly Sales Trend (₹)</h3>
          <div className="w-full aspect-[2/1] min-h-[220px]">
            <svg viewBox="0 0 560 200" className="w-full h-full">
              {/* Grid lines */}
              <line x1="20" y1="180" x2="540" y2="180" stroke="#e0e0e0" strokeWidth="0.5" strokeDasharray="4" />
              <line x1="20" y1="110" x2="540" y2="110" stroke="#e0e0e0" strokeWidth="0.5" strokeDasharray="4" />
              <line x1="20" y1="40" x2="540" y2="40" stroke="#e0e0e0" strokeWidth="0.5" strokeDasharray="4" />
              
              {/* Trend path */}
              <polyline
                fill="none"
                stroke="#F59E0B"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
              />
              
              {/* Data points */}
              {chartData.dailySales.map((d, idx) => {
                const cx = idx * 80 + 40;
                const cy = 180 - (d.revenue / maxWeeklyVal) * 140;
                return (
                  <g key={idx} className="group cursor-pointer">
                    <circle cx={cx} cy={cy} r="6" fill="#F59E0B" stroke="#ffffff" strokeWidth="2" />
                    {/* Tooltip trigger text */}
                    <text x={cx} y={cy - 12} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#F59E0B" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      ₹{d.revenue}
                    </text>
                  </g>
                );
              })}

              {/* X Axis Labels */}
              {chartData.dailySales.map((d, idx) => (
                <text key={idx} x={idx * 80 + 40} y="195" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#6B7280">
                  {d._id}
                </text>
              ))}
            </svg>
          </div>
        </div>

        {/* SVG Monthly Sales Bar Chart */}
        <div className="bg-white dark:bg-customGray-dark border border-customGray-light dark:border-white/5 rounded-3xl p-6 shadow-sm">
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-customGray mb-6">Monthly Revenue Graph (₹)</h3>
          <div className="w-full aspect-[2/1] min-h-[220px]">
            <svg viewBox="0 0 560 200" className="w-full h-full">
              {/* Grid lines */}
              <line x1="20" y1="180" x2="540" y2="180" stroke="#e0e0e0" strokeWidth="0.5" strokeDasharray="4" />
              <line x1="20" y1="110" x2="540" y2="110" stroke="#e0e0e0" strokeWidth="0.5" strokeDasharray="4" />
              <line x1="20" y1="40" x2="540" y2="40" stroke="#e0e0e0" strokeWidth="0.5" strokeDasharray="4" />

              {/* Monthly bars */}
              {chartData.monthlySales.map((m, idx) => {
                const barHeight = (m.revenue / maxMonthlyVal) * 140;
                const rx = idx * 80 + 35;
                const ry = 180 - barHeight;
                return (
                  <g key={idx} className="group cursor-pointer">
                    <rect
                      x={rx}
                      y={ry}
                      width="30"
                      height={barHeight}
                      fill="#111827"
                      rx="4"
                      className="fill-secondary dark:fill-white/80 group-hover:fill-primary transition-colors duration-200"
                    />
                    <text x={rx + 15} y={ry - 8} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#F59E0B" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      ₹{m.revenue}
                    </text>
                  </g>
                );
              })}

              {/* X Axis Labels */}
              {chartData.monthlySales.map((m, idx) => (
                <text key={idx} x={idx * 80 + 50} y="195" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#6B7280">
                  {m._id}
                </text>
              ))}
            </svg>
          </div>
        </div>

      </div>

      {/* 3. Grid: Recent Orders & Inventory Warnings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Orders table */}
        <div className="lg:col-span-2 bg-white dark:bg-customGray-dark border border-customGray-light dark:border-white/5 rounded-3xl p-6 shadow-sm overflow-x-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-customGray">Recent Orders</h3>
            <Link to="/admin/orders" className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
              View All <FiChevronRight />
            </Link>
          </div>

          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-customGray-light dark:border-white/5 text-customGray font-bold uppercase">
                <th className="pb-3 font-bold">Order ID</th>
                <th className="pb-3 font-bold">Customer</th>
                <th className="pb-3 font-bold">Total</th>
                <th className="pb-3 font-bold">Status</th>
              </tr>
            </thead>
            <tbody>
              {analytics.recentOrders.map((ord) => (
                <tr key={ord._id} className="border-b border-customGray-light dark:border-white/5 last:border-0 hover:bg-customGray-light/20 dark:hover:bg-white/5 transition-colors">
                  <td className="py-3.5 font-bold uppercase">#{ord._id.slice(-6)}</td>
                  <td className="py-3.5">
                    <p className="font-bold">{ord.user?.name}</p>
                    <p className="text-[10px] text-customGray">{ord.user?.email}</p>
                  </td>
                  <td className="py-3.5 font-bold">₹{ord.totalAmount.toFixed(0)}</td>
                  <td className="py-3.5">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase ${
                      ord.orderStatus === 'Processing' ? 'text-amber-500 bg-amber-500/10' : 'text-emerald-500 bg-emerald-500/10'
                    }`}>
                      {ord.orderStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Inventory alert */}
        <div className="bg-white dark:bg-customGray-dark border border-customGray-light dark:border-white/5 rounded-3xl p-6 shadow-sm select-none">
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-customGray mb-6 flex items-center gap-2">
            <FiAlertTriangle className="text-amber-500" /> Stock Alerts
          </h3>
          
          <div className="space-y-4">
            {analytics.lowStockProducts.length > 0 ? (
              analytics.lowStockProducts.map((prod) => (
                <div key={prod._id} className="p-3 border border-amber-500/10 bg-amber-500/5 rounded-2xl flex justify-between items-center text-xs">
                  <div>
                    <h4 className="font-bold text-secondary dark:text-white truncate w-32">{prod.title}</h4>
                    <p className="text-[10px] text-customGray font-semibold mt-0.5">SKU: {prod.sku}</p>
                  </div>
                  <span className="font-black text-red-500 bg-red-500/10 px-2 py-1 rounded-lg">
                    {prod.stock} Left
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-customGray italic text-center py-6">All products are healthy in stock.</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default DashboardOverview;

import React, { useState, useEffect } from 'react';
import { FiMail } from 'react-icons/fi';
import { useToast } from '../context/ToastContext.jsx';
import { TableSkeleton } from '../components/LoadingSkeleton.jsx';
import API from '../services/api.js';

const MOCK_SUBSCRIBERS = [
  { _id: 'mock_sub1', email: 'sahil@example.com', isSubscribed: true, createdAt: new Date() }
];

const AdminSubscribers = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);

  const { showToast } = useToast();

  const loadSubscribers = async () => {
    try {
      setLoading(true);
      const res = await API.get('/newsletter/subscribers');
      if (res.data.success && res.data.subscribers.length > 0) {
        setSubscribers(res.data.subscribers);
      } else {
        setSubscribers(MOCK_SUBSCRIBERS);
      }
    } catch (err) {
      console.error(err);
      setSubscribers(MOCK_SUBSCRIBERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscribers();
  }, []);

  return (
    <div className="space-y-6 select-none text-left">
      <div>
        <h2 className="text-2xl font-black text-secondary dark:text-white">Newsletter List</h2>
        <p className="text-xs text-customGray font-semibold mt-1">Audit active email subscriptions for VKS Marketing newsletters</p>
      </div>

      {loading ? (
        <TableSkeleton rows={2} cols={3} />
      ) : (
        <div className="bg-white dark:bg-customGray-dark border border-customGray-light dark:border-white/5 rounded-3xl overflow-hidden shadow-sm overflow-x-auto max-w-xl">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-customGray-light dark:border-white/5 text-customGray font-bold uppercase bg-customGray-light/10 dark:bg-black/20 select-none">
                <th className="p-4 font-bold">Email Address</th>
                <th className="p-4 font-bold">Joined On</th>
                <th className="p-4 font-bold">Active Status</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((sub) => (
                <tr key={sub._id} className="border-b border-customGray-light dark:border-white/5 last:border-0 hover:bg-customGray-light/20 dark:hover:bg-white/5 transition-colors">
                  <td className="p-4 font-bold text-secondary dark:text-white flex items-center gap-1.5 truncate">
                    <FiMail className="text-primary w-4 h-4 flex-shrink-0" /> {sub.email}
                  </td>
                  <td className="p-4 font-semibold text-customGray">
                    {new Date(sub.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase ${
                      sub.isSubscribed ? 'text-emerald-500 bg-emerald-500/10' : 'text-customGray bg-customGray/10'
                    }`}>
                      {sub.isSubscribed ? 'Active' : 'Unsubscribed'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};

export default AdminSubscribers;

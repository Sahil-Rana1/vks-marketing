import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheckCircle, FiAlertCircle, FiInfo } from 'react-icons/fi';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Automatically dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const iconMap = {
    success: <FiCheckCircle className="text-emerald-500 w-5 h-5 flex-shrink-0" />,
    error: <FiAlertCircle className="text-red-500 w-5 h-5 flex-shrink-0" />,
    info: <FiInfo className="text-blue-500 w-5 h-5 flex-shrink-0" />,
    warning: <FiAlertCircle className="text-amber-500 w-5 h-5 flex-shrink-0" />
  };

  const bgMap = {
    success: 'bg-white dark:bg-customGray-dark border-emerald-500/20 text-secondary dark:text-white',
    error: 'bg-white dark:bg-customGray-dark border-red-500/20 text-secondary dark:text-white',
    info: 'bg-white dark:bg-customGray-dark border-blue-500/20 text-secondary dark:text-white',
    warning: 'bg-white dark:bg-customGray-dark border-amber-500/20 text-secondary dark:text-white'
  };

  return (
    <ToastContext.Provider value={{ showToast: addToast }}>
      {children}
      
      {/* Toast container in fixed overlay */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
              className={`p-4 rounded-xl border shadow-xl flex items-start gap-3 pointer-events-auto ${bgMap[toast.type]} glassmorphism`}
            >
              {iconMap[toast.type]}
              <div className="flex-grow text-sm font-medium leading-5">
                {toast.message}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-customGray hover:text-secondary dark:hover:text-white p-0.5 rounded transition-colors"
              >
                <FiX className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

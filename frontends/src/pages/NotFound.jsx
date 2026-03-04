import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiAlertCircle, FiHome } from 'react-icons/fi';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.div
          animate={{ 
            rotate: [0, 10, -10, 10, 0],
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          className="inline-block"
        >
          <FiAlertCircle className="w-24 h-24 text-primary-600 mx-auto mb-6" />
        </motion.div>
        
        <h1 className="text-6xl font-bold text-slate-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-slate-700 mb-4">Page Not Found</h2>
        <p className="text-slate-500 mb-8 max-w-md">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        
        <Link
          to="/"
          className="btn-primary inline-flex items-center space-x-2"
        >
          <FiHome />
          <span>Back to Dashboard</span>
        </Link>
      </motion.div>
    </div>
  );
}

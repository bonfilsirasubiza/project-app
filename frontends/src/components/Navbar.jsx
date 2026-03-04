import React, { useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiBell, FiUser, FiChevronDown, FiSearch } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';

const Navbar = ({ onMenuClick }) => {
  const { user } = useContext(AuthContext);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200/70 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
            aria-label="Open navigation"
          >
            <FiMenu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Raw Material Inventory</h1>
            <p className="text-xs text-slate-500">Operations Console</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center bg-slate-100 px-3 py-2 rounded-lg text-slate-500 border border-slate-200">
            <FiSearch className="w-4 h-4 mr-2" />
            <span className="text-sm">Quick search</span>
          </div>
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors relative text-slate-600"
              aria-label="Toggle notifications"
              aria-expanded={showNotifications}
            >
              <FiBell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full"></span>
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-lg shadow-xl z-50"
                >
                  <div className="p-4 border-b border-slate-200">
                    <h3 className="font-semibold text-slate-900">Notifications</h3>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-slate-500">No new notifications</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-3 p-2 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Open profile menu"
              aria-expanded={showProfileMenu}
            >
              <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
                <FiUser className="w-4 h-4 text-slate-600" />
              </div>
              <span className="text-sm font-medium text-slate-700">
                {user?.username || 'User'}
              </span>
              <FiChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-xl z-50"
                >
                  <div className="py-2">
                    <a href="#" className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
                      Profile Settings
                    </a>
                    <a href="#" className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
                      Change Password
                    </a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

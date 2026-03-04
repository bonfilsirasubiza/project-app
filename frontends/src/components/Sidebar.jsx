import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiBox, 
  FiPackage, 
  FiTruck, 
  FiBarChart2, 
  FiLogOut,
  FiHome,
  FiX,
  FiArrowUpRight
} from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const handleClose = typeof onClose === 'function' ? onClose : () => {};

  const menuItems = [
    { path: '/raw-material', name: 'Raw Materials', icon: FiBox },
    { path: '/stock-in', name: 'Stock In', icon: FiPackage },
    { path: '/stock-out', name: 'Stock Out', icon: FiArrowUpRight },
    { path: '/suppliers', name: 'Suppliers', icon: FiTruck },
    { path: '/reports', name: 'Reports', icon: FiBarChart2 },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarContent = (
    <motion.aside
      initial={{ x: -260 }}
      animate={{ x: 0 }}
      exit={{ x: -260 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="w-64 h-full bg-white text-slate-900 shadow-xl border-r border-slate-200/70 lg:translate-x-0"
    >
      <div className="p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-6 lg:mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-50 rounded-lg border border-primary-100">
              <FiHome className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">RMIMS</h2>
              <p className="text-xs text-slate-500">Inventory System</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-xs text-slate-500">Signed in as</p>
          <p className="font-semibold text-slate-900 truncate">{user?.username || 'User'}</p>
        </div>

        <nav className="space-y-2 flex-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </NavLink>
          ))}

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-100 transition-all duration-200 mt-4 border-t border-slate-200 pt-4"
          >
            <FiLogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </nav>
      </div>
    </motion.aside>
  );

  return (
    <>
      <div className="hidden lg:block w-64">
        {sidebarContent}
      </div>
      <AnimatePresence>
        {isOpen && (
          <div className="lg:hidden fixed inset-0 z-40">
            <motion.div
              className="absolute inset-0 bg-slate-900/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
            />
            <div className="absolute inset-y-0 left-0">
              {sidebarContent}
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;

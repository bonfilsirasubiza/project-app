import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ children, className = '', hoverable = true }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hoverable ? { y: -3, transition: { duration: 0.2 } } : {}}
      className={`card ${hoverable ? 'hover:shadow-md' : ''} transition-all duration-200 ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default Card;

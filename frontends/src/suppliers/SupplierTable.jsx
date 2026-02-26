import React from 'react';
import { motion } from 'framer-motion';
import { FiEdit2, FiTrash2, FiPhone, FiMail, FiMapPin } from 'react-icons/fi';
import Table from '../components/Table';

const SupplierTable = ({ suppliers, onEdit, onDelete, loading }) => {
  const columns = [
    { header: 'Supplier Code', accessor: 'supplierCode' },
    { header: 'Supplier Name', accessor: 'supplierName' },
    { 
      header: 'Phone', 
      accessor: 'phoneNumber',
      render: (value) => (
        <div className="flex items-center space-x-1">
          <FiPhone className="text-gray-400" />
          <span>{value}</span>
        </div>
      )
    },
    { 
      header: 'Email', 
      accessor: 'email',
      render: (value) => value || 'N/A'
    },
    { 
      header: 'Address', 
      accessor: 'address',
      render: (value) => value || 'N/A'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-xl shadow-md overflow-hidden"
    >
      <Table
        columns={columns}
        data={suppliers}
        onEdit={onEdit}
        onDelete={onDelete}
        loading={loading}
      />
    </motion.div>
  );
};

export default SupplierTable;
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiPhone, FiMapPin, FiMail } from 'react-icons/fi';
import Card from '../components/Card';
import Table from '../components/Table';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Supplier() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formData, setFormData] = useState({
    supplierCode: '',
    supplierName: '',
    phoneNumber: '',
    email: '',
    address: ''
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/suppliers');
      const data = Array.isArray(response.data) ? response.data : response.data?.suppliers;
      setSuppliers(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to fetch suppliers');
      setSuppliers([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSupplier) {
        await api.put(`/suppliers/${editingSupplier._id}`, formData);
        toast.success('Supplier updated successfully');
      } else {
        await api.post('/suppliers', formData);
        toast.success('Supplier added successfully');
      }
      setShowModal(false);
      resetForm();
      fetchSuppliers();
    } catch (error) {
      toast.error(editingSupplier ? 'Failed to update supplier' : 'Failed to add supplier');
    }
  };

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      supplierCode: supplier.supplierCode,
      supplierName: supplier.supplierName,
      phoneNumber: supplier.phoneNumber,
      email: supplier.email || '',
      address: supplier.address || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (supplier) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        await api.delete(`/suppliers/${supplier._id}`);
        toast.success('Supplier deleted successfully');
        fetchSuppliers();
      } catch (error) {
        toast.error('Failed to delete supplier');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      supplierCode: '',
      supplierName: '',
      phoneNumber: '',
      email: '',
      address: ''
    });
    setEditingSupplier(null);
  };

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

  // Ensure suppliers is an array before using map
  const suppliersList = Array.isArray(suppliers) ? suppliers : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Suppliers</h1>
          <p className="text-slate-500 mt-1">Manage your raw material suppliers</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <FiPlus />
          <span>Add Supplier</span>
        </button>
      </div>

      {/* Suppliers Grid */}
      {suppliersList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suppliersList.map((supplier, index) => (
            <motion.div
              key={supplier._id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-slate-900">{supplier.supplierName || 'N/A'}</h3>
                    <p className="text-sm text-slate-500">Code: {supplier.supplierCode || 'N/A'}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(supplier)}
                      className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      onClick={() => handleDelete(supplier)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2 text-slate-600">
                    <FiPhone className="w-4 h-4" />
                    <span>{supplier.phoneNumber || 'N/A'}</span>
                  </div>
                  {supplier.email && (
                    <div className="flex items-center space-x-2 text-slate-600">
                      <FiMail className="w-4 h-4" />
                      <span>{supplier.email}</span>
                    </div>
                  )}
                  {supplier.address && (
                    <div className="flex items-center space-x-2 text-slate-600">
                      <FiMapPin className="w-4 h-4" />
                      <span>{supplier.address}</span>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        !loading && (
          <Card className="p-12 text-center">
            <p className="text-slate-500">No suppliers found. Click "Add Supplier" to create one.</p>
          </Card>
        )
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-slate-500">Loading suppliers...</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="card p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-bold mb-4">
              {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Supplier Code
                </label>
                <input
                  type="text"
                  name="supplierCode"
                  value={formData.supplierCode}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Supplier Name
                </label>
                <input
                  type="text"
                  name="supplierName"
                  value={formData.supplierName}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Address (Optional)
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="input-field"
                  rows="3"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="btn-primary flex-1"
                >
                  {editingSupplier ? 'Update' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

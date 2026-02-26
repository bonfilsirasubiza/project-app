import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiPackage, FiCalendar, FiUser } from 'react-icons/fi';
import Card from '../components/Card';
import Table from '../components/Table';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function StockIn() {
  const [stockIns, setStockIns] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    materialId: '',
    supplierId: '',
    quantity: '',
    unitPrice: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchStockIns();
    fetchMaterials();
    fetchSuppliers();
  }, []);

  const fetchStockIns = async () => {
    setLoading(true);
    try {
      const response = await api.get('/stock');
      setStockIns(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error('Failed to fetch stock entries');
      setStockIns([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMaterials = async () => {
    try {
      const response = await api.get('/raw-materials');
      setMaterials(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error('Failed to fetch materials');
      setMaterials([]);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await api.get('/suppliers');
      setSuppliers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error('Failed to fetch suppliers');
      setSuppliers([]);
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
      await api.post('/stock', formData);
      toast.success('Stock in recorded successfully');
      setShowModal(false);
      resetForm();
      fetchStockIns();
    } catch (error) {
      toast.error('Failed to record stock in');
    }
  };

  const resetForm = () => {
    setFormData({
      materialId: '',
      supplierId: '',
      quantity: '',
      unitPrice: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  // Safe arrays for rendering
  const safeStockIns = Array.isArray(stockIns) ? stockIns : [];
  const safeMaterials = Array.isArray(materials) ? materials : [];
  const safeSuppliers = Array.isArray(suppliers) ? suppliers : [];

  const columns = [
    { 
      header: 'Date', 
      accessor: 'date',
      render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
    },
    { 
      header: 'Material', 
      accessor: 'materialId',
      render: (value) => value?.materialName || 'N/A'
    },
    { 
      header: 'Supplier', 
      accessor: 'supplierId',
      render: (value) => value?.supplierName || 'N/A'
    },
    { 
      header: 'Quantity', 
      accessor: 'quantity',
      render: (value) => value || 0
    },
    { 
      header: 'Unit Price', 
      accessor: 'unitPrice',
      render: (value) => `RWF ${(value || 0)?.toLocaleString()}`
    },
    {
      header: 'Total',
      accessor: 'total',
      render: (_, row) => `RWF ${((row.quantity || 0) * (row.unitPrice || 0))?.toLocaleString()}`
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Stock In</h1>
          <p className="text-slate-500 mt-1">Record incoming raw materials</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <FiPlus />
          <span>New Stock In</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary-100 rounded-lg">
              <FiPackage className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Stock In</p>
              <p className="text-2xl font-bold text-slate-900">{safeStockIns.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-emerald-100 rounded-lg">
              <FiPackage className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Quantity</p>
              <p className="text-2xl font-bold text-slate-900">
                {safeStockIns.reduce((acc, curr) => acc + (curr.quantity || 0), 0)}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <FiPackage className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Value</p>
              <p className="text-2xl font-bold text-slate-900">
                RWF {safeStockIns.reduce((acc, curr) => acc + ((curr.quantity || 0) * (curr.unitPrice || 0)), 0).toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Stock In Table */}
      <Card className="overflow-hidden">
        <Table
          columns={columns}
          data={safeStockIns}
          loading={loading}
        />
      </Card>

      {/* Add Stock In Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="card p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-bold mb-4">Record Stock In</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Material
                </label>
                <select
                  name="materialId"
                  value={formData.materialId}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="">Select Material</option>
                  {safeMaterials.map(material => (
                    <option key={material._id} value={material._id}>
                      {material.materialName || 'Unknown'} ({material.quantity || 0} {material.unit || 'units'} available)
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Supplier
                </label>
                <select
                  name="supplierId"
                  value={formData.supplierId}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="">Select Supplier</option>
                  {safeSuppliers.map(supplier => (
                    <option key={supplier._id} value={supplier._id}>
                      {supplier.supplierName || 'Unknown'}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  className="input-field"
                  min="1"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Unit Price (RWF)
                </label>
                <input
                  type="number"
                  name="unitPrice"
                  value={formData.unitPrice}
                  onChange={handleInputChange}
                  className="input-field"
                  min="0"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="btn-primary flex-1"
                >
                  Save
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

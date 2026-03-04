import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiArrowUpRight, FiAlertCircle } from 'react-icons/fi';
import Card from '../components/Card';
import Table from '../components/Table';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function StockOut() {
  const [stockOuts, setStockOuts] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    materialId: '',
    quantity: '',
    date: new Date().toISOString().split('T')[0],
    purpose: 'production',
    department: '',
    receivedBy: ''
  });

  useEffect(() => {
    fetchStockOuts();
    fetchMaterials();
  }, []);

  const fetchStockOuts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/stock/stockout');
      const data = Array.isArray(response.data) ? response.data : response.data?.stockOuts;
      setStockOuts(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to fetch stock out entries');
      setStockOuts([]);
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

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/stock/stockout', {
        material: formData.materialId,
        quantity: Number(formData.quantity),
        date: formData.date,
        purpose: formData.purpose,
        department: formData.department,
        receivedBy: formData.receivedBy
      });
      toast.success('Stock out recorded successfully');
      setShowModal(false);
      resetForm();
      fetchStockOuts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to record stock out');
    }
  };

  const resetForm = () => {
    setFormData({
      materialId: '',
      quantity: '',
      date: new Date().toISOString().split('T')[0],
      purpose: 'production',
      department: '',
      receivedBy: ''
    });
  };

  const columns = [
    {
      header: 'Date',
      accessor: 'date',
      render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
    },
    {
      header: 'Material',
      accessor: 'material',
      render: (value) => value?.materialName || 'N/A'
    },
    {
      header: 'Quantity',
      accessor: 'quantity',
      render: (value) => value || 0
    },
    {
      header: 'Unit',
      accessor: 'material',
      render: (value) => value?.unit || 'N/A'
    },
    {
      header: 'Purpose',
      accessor: 'purpose',
      render: (value) => value || 'N/A'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Stock Out</h1>
          <p className="text-slate-500 mt-1">Record issued raw materials</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <FiPlus />
          <span>New Stock Out</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-rose-100 rounded-lg">
              <FiArrowUpRight className="w-6 h-6 text-rose-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Stock Out</p>
              <p className="text-2xl font-bold text-slate-900">{stockOuts.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-amber-100 rounded-lg">
              <FiAlertCircle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Quantity</p>
              <p className="text-2xl font-bold text-slate-900">
                {stockOuts.reduce((acc, curr) => acc + (curr.quantity || 0), 0)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <Table columns={columns} data={stockOuts} loading={loading} />
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="card p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-bold mb-4">Record Stock Out</h2>
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
                  {materials.map((material) => (
                    <option key={material._id} value={material._id}>
                      {material.materialName || 'Unknown'} ({material.quantity || 0} {material.unit || 'units'} available)
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
                  Purpose
                </label>
                <select
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="production">Production</option>
                  <option value="damage">Damage</option>
                  <option value="sample">Sample</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Received By
                </label>
                <input
                  type="text"
                  name="receivedBy"
                  value={formData.receivedBy}
                  onChange={handleInputChange}
                  className="input-field"
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
                <button type="submit" className="btn-primary flex-1">
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

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiBox } from 'react-icons/fi';
import Card from '../components/Card';
import Table from '../components/Table';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function RawMaterial() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [formData, setFormData] = useState({
    materialCode: '',
    materialName: '',
    unit: '',
    quantity: '',
    unitPrice: ''
  });

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const response = await api.get('/raw-materials');
      setMaterials(response.data);
    } catch (error) {
      toast.error('Failed to fetch materials');
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
      if (editingMaterial) {
        await api.put(`/raw-materials/${editingMaterial._id}`, formData);
        toast.success('Material updated successfully');
      } else {
        await api.post('/raw-materials', formData);
        toast.success('Material added successfully');
      }
      setShowModal(false);
      resetForm();
      fetchMaterials();
    } catch (error) {
      toast.error(editingMaterial ? 'Failed to update material' : 'Failed to add material');
    }
  };

  const handleEdit = (material) => {
    setEditingMaterial(material);
    setFormData({
      materialCode: material.materialCode,
      materialName: material.materialName,
      unit: material.unit,
      quantity: material.quantity,
      unitPrice: material.unitPrice
    });
    setShowModal(true);
  };

  const handleDelete = async (material) => {
    if (window.confirm('Are you sure you want to delete this material?')) {
      try {
        await api.delete(`/raw-materials/${material._id}`);
        toast.success('Material deleted successfully');
        fetchMaterials();
      } catch (error) {
        toast.error('Failed to delete material');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      materialCode: '',
      materialName: '',
      unit: '',
      quantity: '',
      unitPrice: ''
    });
    setEditingMaterial(null);
  };

  // FIXED: Added safe array check for filter method
  const filteredMaterials = Array.isArray(materials) 
    ? materials.filter(material =>
        material.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.materialCode.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const columns = [
    { header: 'Material Code', accessor: 'materialCode' },
    { header: 'Material Name', accessor: 'materialName' },
    { header: 'Unit', accessor: 'unit' },
    { 
      header: 'Quantity', 
      accessor: 'quantity',
      render: (value) => (
        <span className={`font-medium ${value < 10 ? 'text-red-600' : 'text-green-600'}`}>
          {value}
        </span>
      )
    },
    { 
      header: 'Unit Price (RWF)', 
      accessor: 'unitPrice',
      render: (value) => `RWF ${value?.toLocaleString()}`
    },
    {
      header: 'Total Value',
      accessor: 'total',
      render: (_, row) => `RWF ${(row.quantity * row.unitPrice)?.toLocaleString()}`
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Raw Materials</h1>
          <p className="text-slate-500 mt-1">Manage your raw material inventory</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <FiPlus />
          <span>Add Material</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary-100 rounded-lg">
              <FiBox className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Materials</p>
              <p className="text-2xl font-bold text-slate-900">
                {Array.isArray(materials) ? materials.length : 0}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-emerald-100 rounded-lg">
              <FiBox className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Quantity</p>
              <p className="text-2xl font-bold text-slate-900">
                {Array.isArray(materials) 
                  ? materials.reduce((acc, curr) => acc + (curr.quantity || 0), 0)
                  : 0}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-amber-100 rounded-lg">
              <FiBox className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Low Stock Items</p>
              <p className="text-2xl font-bold text-slate-900">
                {Array.isArray(materials) 
                  ? materials.filter(m => (m.quantity || 0) < 10).length
                  : 0}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <FiBox className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Value</p>
              <p className="text-2xl font-bold text-slate-900">
                RWF {Array.isArray(materials)
                  ? materials.reduce((acc, curr) => acc + ((curr.quantity || 0) * (curr.unitPrice || 0)), 0).toLocaleString()
                  : 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search Bar */}
      <Card className="p-4">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search materials by name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10 pr-4 py-2"
          />
        </div>
      </Card>

      {/* Materials Table */}
      <Card className="overflow-hidden">
        <Table
          columns={columns}
          data={filteredMaterials}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
        />
      </Card>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="card p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-bold mb-4">
              {editingMaterial ? 'Edit Material' : 'Add New Material'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Material Code
                </label>
                <input
                  type="text"
                  name="materialCode"
                  value={formData.materialCode}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Material Name
                </label>
                <input
                  type="text"
                  name="materialName"
                  value={formData.materialName}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Unit (kg, pcs, liters)
                </label>
                <input
                  type="text"
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
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
                  min="0"
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
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="btn-primary flex-1"
                >
                  {editingMaterial ? 'Update' : 'Save'}
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

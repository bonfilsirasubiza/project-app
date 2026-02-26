import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiBarChart2, 
  FiDownload, 
  FiCalendar,
  FiPackage,
  FiTrendingUp,
  FiAlertCircle
} from 'react-icons/fi';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import Card from '../components/Card';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Reports() {
  const [materials, setMaterials] = useState([]);
  const [stockIns, setStockIns] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [materialsRes, stockInsRes] = await Promise.all([
        api.get('/raw-materials'),
        api.get('/stock', { params: dateRange })
      ]);
      setMaterials(materialsRes.data);
      setStockIns(stockInsRes.data);
    } catch (error) {
      toast.error('Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // Create CSV content
    const csvContent = [
      ['Material Name', 'Stored Quantity', 'Issued Quantity', 'Remaining Quantity'].join(','),
      ...materials.map(m => 
        [m.materialName, m.quantity, m.issuedQuantity || 0, m.quantity - (m.issuedQuantity || 0)].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stock-report-${dateRange.startDate}-to-${dateRange.endDate}.csv`;
    a.click();
  };

  const chartData = materials.map(m => ({
    name: m.materialName.length > 15 ? m.materialName.substring(0, 15) + '...' : m.materialName,
    stored: m.quantity,
    issued: m.issuedQuantity || 0,
    remaining: m.quantity - (m.issuedQuantity || 0)
  }));

  const pieData = materials.map(m => ({
    name: m.materialName,
    value: m.quantity
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
          <p className="text-slate-500 mt-1">View and analyze inventory data</p>
        </div>
        <button
          onClick={handleExport}
          className="btn-primary flex items-center space-x-2"
        >
          <FiDownload />
          <span>Export Report</span>
        </button>
      </div>

      {/* Date Range Filter */}
      <Card className="p-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <FiCalendar className="text-slate-400" />
            <span className="text-sm font-medium text-slate-700">Date Range:</span>
          </div>
          <div className="flex space-x-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Start Date</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="input-field text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">End Date</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="input-field text-sm"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary-100 rounded-lg">
              <FiPackage className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Materials</p>
              <p className="text-2xl font-bold text-slate-900">{materials.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-emerald-100 rounded-lg">
              <FiPackage className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Stock In</p>
              <p className="text-2xl font-bold text-slate-900">{stockIns.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-amber-100 rounded-lg">
              <FiTrendingUp className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Value</p>
              <p className="text-2xl font-bold text-slate-900">
                RWF {materials.reduce((acc, curr) => acc + (curr.quantity * curr.unitPrice), 0).toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-rose-100 rounded-lg">
              <FiAlertCircle className="w-6 h-6 text-rose-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Low Stock Items</p>
              <p className="text-2xl font-bold text-slate-900">
                {materials.filter(m => m.quantity < 10).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Status Chart */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Stock Status Overview</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="stored" fill="#3b82f6" name="Stored" />
                <Bar dataKey="issued" fill="#f59e0b" name="Issued" />
                <Bar dataKey="remaining" fill="#10b981" name="Remaining" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Distribution Chart */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Material Distribution</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Daily Stock Status Report */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Daily Stock Status Report</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Material Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Stored Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Issued Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Remaining Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {materials.map((material) => {
                const remaining = material.quantity - (material.issuedQuantity || 0);
                const status = remaining < 10 ? 'Low Stock' : remaining < 20 ? 'Moderate' : 'Sufficient';
                const statusColor = 
                  status === 'Low Stock' ? 'text-red-600 bg-red-100' :
                  status === 'Moderate' ? 'text-yellow-600 bg-yellow-100' :
                  'text-green-600 bg-green-100';
                
                return (
                  <tr key={material._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      {material.materialName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {material.quantity} {material.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {material.issuedQuantity || 0} {material.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {remaining} {material.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor}`}>
                        {status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Stock Out Report */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Daily Stock Out Report</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Material
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Unit
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Purpose
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {stockIns
                .filter(s => s.type === 'stock-out')
                .map((stock, index) => (
                  <tr key={stock._id || index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {new Date(stock.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      {stock.materialId?.materialName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {stock.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {stock.materialId?.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {stock.purpose || 'Production'}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

import React, { useState, useEffect, useMemo } from 'react';
import { FiCalendar, FiPackage, FiTrendingUp, FiAlertCircle } from 'react-icons/fi';
import Card from '../components/Card';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Reports() {
  const [materials, setMaterials] = useState([]);
  const [stockIns, setStockIns] = useState([]);
  const [stockOuts, setStockOuts] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [materialsRes, stockInsRes, stockOutsRes] = await Promise.all([
        api.get('/raw-materials'),
        api.get('/stock/stockin', { params: dateRange }),
        api.get('/stock/stockout', { params: dateRange })
      ]);
      setMaterials(Array.isArray(materialsRes.data) ? materialsRes.data : []);
      const stockInData = Array.isArray(stockInsRes.data) ? stockInsRes.data : stockInsRes.data?.stockIns;
      const stockOutData = Array.isArray(stockOutsRes.data) ? stockOutsRes.data : stockOutsRes.data?.stockOuts;
      setStockIns(Array.isArray(stockInData) ? stockInData : []);
      setStockOuts(Array.isArray(stockOutData) ? stockOutData : []);
    } catch (error) {
      toast.error('Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  };

  const stockOutByMaterial = useMemo(() => {
    const map = new Map();
    stockOuts.forEach((s) => {
      const materialId = s.material?._id;
      if (!materialId) return;
      map.set(materialId, (map.get(materialId) || 0) + (s.quantity || 0));
    });
    return map;
  }, [stockOuts]);

  const dailyStatusRows = useMemo(() => {
    return materials.map((m) => {
      const issuedQuantity = stockOutByMaterial.get(m._id) || 0;
      const remainingQuantity = (m.quantity || 0) - issuedQuantity;
      return {
        ...m,
        issuedQuantity,
        remainingQuantity
      };
    });
  }, [materials, stockOutByMaterial]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
          <p className="text-slate-500 mt-1">Daily stock status and stock out report</p>
        </div>
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
              {dailyStatusRows.map((material) => {
                const remaining = material.remainingQuantity;
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
              {stockOuts.map((stock, index) => (
                  <tr key={stock._id || index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {new Date(stock.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      {stock.material?.materialName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {stock.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {stock.material?.unit}
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

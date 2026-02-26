import React, { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";

import axios from "axios";
import { FaArrowUp } from "react-icons/fa";

const StockOut = () => {
  const [stockOuts, setStockOuts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ rawMaterial: "", stockQuantity: "" });

  const fetchStockOut = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/stock-out");
      setStockOuts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStockOut();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/stock-out", formData);
      setFormData({ rawMaterial: "", stockQuantity: "" });
      setShowForm(false);
      fetchStockOut();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-700 flex items-center gap-2">
          <FaArrowUp className="text-red-600" /> Stock Out
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow transition transform hover:scale-105"
        >
          Add Stock Out
        </button>
      </div>

      {showForm && (
        <div className="mb-6 p-6 bg-white rounded-xl shadow-lg animate-slide-down">
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              name="rawMaterial"
              placeholder="Material ID"
              value={formData.rawMaterial}
              onChange={handleChange}
              className="p-3 border rounded-lg focus:ring-2 focus:ring-red-500"
              required
            />
            <input
              type="number"
              name="stockQuantity"
              placeholder="Quantity"
              value={formData.stockQuantity}
              onChange={handleChange}
              className="p-3 border rounded-lg focus:ring-2 focus:ring-red-500"
              required
            />
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg shadow col-span-full transition transform hover:scale-105"
            >
              Add Stock Out
            </button>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded-lg shadow-lg overflow-hidden">
          <thead className="bg-red-100">
            <tr>
              <th className="p-3 text-left">Material</th>
              <th className="p-3 text-left">Quantity</th>
              <th className="p-3 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {stockOuts.map((s) => (
              <tr key={s._id} className="border-b hover:bg-red-50 transition">
                <td className="p-3">{s.rawMaterial}</td>
                <td className="p-3">{s.stockQuantity}</td>
                <td className="p-3">{new Date(s.stockOutDate).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default StockOut;

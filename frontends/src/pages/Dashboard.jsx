// src/pages/Dashboard.jsx
import DashboardLayout from "../layouts/DashboardLayout";
import Card from "../components/Card";
import React from 'react';
export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="grid grid-cols-3 gap-6">
        <Card title="Total Materials" value={120} />
        <Card title="Total Suppliers" value={25} />
        <Card title="Stock In Today" value={40} />
      </div>
    </DashboardLayout>
  );
}

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import RawMaterial from './pages/RawMaterial';
import StockIn from './pages/StockIn';
import Supplier from './pages/Suppliers';
import Reports from './pages/Reports';
import NotFound from './pages/NotFound';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <div className="min-h-screen bg-gray-50">
          <Toaster position="top-right" />
          
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<DashboardLayout />}>
              <Route index element={<Navigate to="/raw-material" replace />} />
              <Route path="raw-material" element={<RawMaterial />} />
              <Route path="stock-in" element={<StockIn />} />
              <Route path="suppliers" element={<Supplier />} />
              <Route path="reports" element={<Reports />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

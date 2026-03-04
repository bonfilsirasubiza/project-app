import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Login from './pages/Login';
import RawMaterial from './pages/RawMaterial';
import StockIn from './pages/StockIn';
import StockOut from './pages/StockOut';
import Supplier from './pages/Suppliers';
import Reports from './pages/Reports';
import NotFound from './pages/NotFound';
import DashboardLayout from './layouts/DashboardLayout';
import React from 'react';
const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <DashboardLayout />,
    children: [
      { index: true, element: <RawMaterial /> },
      { path: 'raw-material', element: <RawMaterial /> },
      { path: 'stock-in', element: <StockIn /> },
      { path: 'stock-out', element: <StockOut /> },
      { path: 'suppliers', element: <Supplier /> },
      { path: 'reports', element: <Reports /> },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_skipActionErrorRevalidation: true,
  }
});

export default router;

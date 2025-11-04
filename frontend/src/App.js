import TopNavBar from './components/TopNavBar';
import LoginPage from './pages/LoginPage';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import SupplierPage from './pages/SupplierPage';
import InvoicePage from './pages/InvoicePage';
import SupplierDetailPage from './pages/SupplierDetailPage';
import LowStockAlertsPage from './pages/LowStockAlertsPage';
import PurchaseOrdersPage from './pages/PurchaseOrdersPage';

function App() {
  // Simple auth check using localStorage token
  const token = localStorage.getItem('token');

  return (
    <Router>
      <TopNavBar />
      <div style={{ paddingTop: 60 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/suppliers" element={token ? <SupplierPage /> : <Navigate to="/login" />} />
          <Route path="/suppliers/:id" element={token ? <SupplierDetailPage /> : <Navigate to="/login" />} />
          <Route path="/alerts/low-stock" element={token ? <LowStockAlertsPage /> : <Navigate to="/login" />} />
          <Route path="/invoices" element={token ? <InvoicePage /> : <Navigate to="/login" />} />
          <Route path="/purchase-orders" element={token ? <PurchaseOrdersPage /> : <Navigate to="/login" />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </div>
      <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, background: '#eee', padding: '10px 0', textAlign: 'center' }}>
        <a href="/about" style={{ color: '#333', textDecoration: 'underline' }}>About</a>
      </div>
    </Router>
  );
}

export default App;

import TopNavBar from './components/TopNavBar';
import LoginPage from './pages/LoginPage';
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
import ReportsPage from './pages/ReportsPage';

import { useState, useEffect } from 'react';

function App() {
  // Use state for token so it updates on login/register/logout
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  useEffect(() => {
    // Listen for token changes in localStorage (e.g., from login/register/logout)
    const onStorage = () => setToken(localStorage.getItem('token'));
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Also update token on focus (for single tab usage)
  useEffect(() => {
    const onFocus = () => setToken(localStorage.getItem('token'));
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  return (
    <Router>
      <TopNavBar />
      <div>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage onLogin={() => setToken(localStorage.getItem('token'))} />} />
          <Route path="/register" element={<RegisterPage onRegister={() => setToken(localStorage.getItem('token'))} />} />
          <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/suppliers" element={token ? <SupplierPage /> : <Navigate to="/login" />} />
          <Route path="/suppliers/:id" element={token ? <SupplierDetailPage /> : <Navigate to="/login" />} />
          <Route path="/alerts/low-stock" element={token ? <LowStockAlertsPage /> : <Navigate to="/login" />} />
          <Route path="/invoices" element={token ? <InvoicePage /> : <Navigate to="/login" />} />
          <Route path="/purchase-orders" element={token ? <PurchaseOrdersPage /> : <Navigate to="/login" />} />
          <Route path="/reports" element={token ? <ReportsPage /> : <Navigate to="/login" />} />
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

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

function LowStockAlertsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    let mounted = true;
    const fetchLowStock = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await axios.get(`${API_BASE_URL}/api/products/alerts/low-stock`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (mounted) {
          setProducts(res.data);
        }
      } catch (err) {
        if (mounted) {
          setError(err.response?.data?.error || 'Failed to fetch low stock alerts');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    fetchLowStock();
    return () => { mounted = false; };
  }, [token]);

  if (loading) {
    return (
      <div className="container py-5 d-flex justify-content-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5 d-flex justify-content-center">
      <div className="card shadow w-100" style={{ maxWidth: '700px' }}>
        <div className="card-body">
          <h2 className="card-title mb-4">Low Stock Alerts</h2>
          {error && <div className="alert alert-danger">{error}</div>}
          {products.length === 0 ? (
            <div className="alert alert-success">All products are sufficiently stocked.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered align-middle">
                <thead className="table-danger">
                  <tr>
                    <th>Name</th>
                    <th>SKU</th>
                    <th>Quantity</th>
                    <th>Reorder Level</th>
                    <th>Supplier</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p._id}>
                      <td>{p.name}</td>
                      <td>{p.sku}</td>
                      <td><span className="badge bg-danger">{p.quantity}</span></td>
                      <td>{p.reorderLevel}</td>
                      <td>{p.supplier && p.supplier.name ? p.supplier.name : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LowStockAlertsPage;

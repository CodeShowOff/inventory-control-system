import React, { useEffect, useState } from 'react';
import axios from 'axios';

function LowStockAlertsPage() {
  const [products, setProducts] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchLowStock = async () => {
      const res = await axios.get('http://localhost:5000/api/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Consider low stock if quantity <= 5
      setProducts(res.data.filter(p => p.quantity <= 50));
    };
    fetchLowStock();
  }, [token]);

  return (
    <div className="container py-5 d-flex justify-content-center">
      <div className="card shadow w-100" style={{ maxWidth: '700px' }}>
        <div className="card-body">
          <h2 className="card-title mb-4">Low Stock Alerts</h2>
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
                    <th>Supplier</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p._id}>
                      <td>{p.name}</td>
                      <td>{p.sku}</td>
                      <td>{p.quantity}</td>
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

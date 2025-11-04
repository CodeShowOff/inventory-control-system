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
      setProducts(res.data.filter(p => p.quantity <= 5));
    };
    fetchLowStock();
  }, [token]);

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto' }}>
      <h2>Low Stock Alerts</h2>
      {products.length === 0 ? (
        <p>All products are sufficiently stocked.</p>
      ) : (
        <table border="1" cellPadding="10" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>SKU</th>
              <th>Quantity</th>
              <th>Supplier</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p._id} style={{ background: '#ffe5e5' }}>
                <td>{p.name}</td>
                <td>{p.sku}</td>
                <td>{p.quantity}</td>
                <td>{p.supplier && p.supplier.name ? p.supplier.name : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default LowStockAlertsPage;

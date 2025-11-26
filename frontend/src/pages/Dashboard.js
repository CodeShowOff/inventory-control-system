import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [token] = useState(localStorage.getItem('token'));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    category: '',
    price: '',
    quantity: '',
    reorderLevel: '10',
    supplier: '',
    expiryDate: '',
    costPrice: ''
  });
  const [suppliers, setSuppliers] = useState([]);
  const [lowStockCount, setLowStockCount] = useState(0);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };


  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(res.data);
      
      // Calculate low stock count
      const lowStock = res.data.filter(p => p.reorderLevel && p.quantity <= p.reorderLevel);
      setLowStockCount(lowStock.length);
      
      setError('');
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError(err.response?.data?.error || 'Failed to fetch products');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      if (mounted) {
        await fetchProducts();
        await fetchSuppliers();
      }
    };
    fetchData();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/suppliers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuppliers(res.data);
    } catch (err) {
      // ignore supplier error
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!newProduct.name.trim()) {
      setError('Product name is required');
      return;
    }
    if (!newProduct.sku.trim()) {
      setError('SKU is required');
      return;
    }
    if (newProduct.price && Number(newProduct.price) < 0) {
      setError('Price cannot be negative');
      return;
    }
    if (newProduct.quantity && Number(newProduct.quantity) < 0) {
      setError('Quantity cannot be negative');
      return;
    }
    if (newProduct.reorderLevel && Number(newProduct.reorderLevel) < 0) {
      setError('Reorder level cannot be negative');
      return;
    }
    if (newProduct.costPrice && Number(newProduct.costPrice) < 0) {
      setError('Cost price cannot be negative');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: newProduct.name.trim(),
        sku: newProduct.sku.trim(),
        category: newProduct.category.trim(),
        price: Number(newProduct.price) || 0,
        quantity: Number(newProduct.quantity) || 0,
        reorderLevel: Number(newProduct.reorderLevel) || 10,
        supplier: newProduct.supplier || null
      };
      
      // Add optional fields if provided
      if (newProduct.expiryDate) {
        payload.expiryDate = newProduct.expiryDate;
      }
      if (newProduct.costPrice) {
        payload.costPrice = Number(newProduct.costPrice);
      }
      
      await axios.post(
        `${API_BASE_URL}/api/products`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewProduct({ name: '', sku: '', category: '', price: '', quantity: '', reorderLevel: '10', supplier: '', expiryDate: '', costPrice: '' });
      await fetchProducts();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  // ---------- Stock IN ----------
  const handleAddStock = async (productId) => {
    const qty = prompt('Enter quantity to add:');
    if (qty === null) return; // User cancelled
    const quantity = Number(qty);
    if (!quantity || quantity <= 0 || isNaN(quantity)) {
      alert('Please enter a valid positive number');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        `${API_BASE_URL}/api/products/${productId}/add-stock`,
        { quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProducts(products.map(p => (p._id === productId ? res.data.product : p)));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add stock');
    } finally {
      setLoading(false);
    }
  };

  // ---------- Stock OUT ----------
  const handleRemoveStock = async (productId) => {
    const qty = prompt('Enter quantity to remove:');
    if (qty === null) return; // User cancelled
    const quantity = Number(qty);
    if (!quantity || quantity <= 0 || isNaN(quantity)) {
      alert('Please enter a valid positive number');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        `${API_BASE_URL}/api/products/${productId}/remove-stock`,
        { quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProducts(products.map(p => (p._id === productId ? res.data.product : p)));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to remove stock');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Dashboard</h2>
        <div className="d-flex gap-2 align-items-center">
          <Link to="/alerts/low-stock" style={{ textDecoration: 'none', position: 'relative' }}>
            <button className="btn btn-outline-warning position-relative">
              <span style={{ fontSize: '1.3rem' }}>🔔</span>
              {lowStockCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {lowStockCount}
                  <span className="visually-hidden">low stock alerts</span>
                </span>
              )}
            </button>
          </Link>
          <button className="btn btn-outline-danger" onClick={handleLogout}>Logout</button>
        </div>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row mb-4 g-2">
        <div className="col-md-3">
          <Link to="/suppliers" className="btn btn-primary w-100">Suppliers</Link>
        </div>
        <div className="col-md-3">
          <Link to="/invoices" className="btn btn-primary w-100">Invoices</Link>
        </div>
        <div className="col-md-3">
          <Link to="/purchase-orders" className="btn btn-primary w-100">Purchase Orders</Link>
        </div>
        <div className="col-md-3">
          <Link to="/reports" className="btn btn-primary w-100">Reports</Link>
        </div>
      </div>

      {/* Add Product Form */}
      <div className="card mb-4">
        <div className="card-body">
          <h4 className="card-title mb-3">Add New Product</h4>
          <form onSubmit={handleAddProduct}>
            <div className="row g-2">
              <div className="col-md-3">
                <label className="form-label small mb-1">Product Name <span className="text-danger">*</span></label>
                <input type="text" className="form-control form-control-sm" placeholder="Enter product name" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} required />
              </div>
              <div className="col-md-2">
                <label className="form-label small mb-1">SKU <span className="text-danger">*</span></label>
                <input type="text" className="form-control form-control-sm" placeholder="Enter SKU" value={newProduct.sku} onChange={e => setNewProduct({ ...newProduct, sku: e.target.value })} required />
              </div>
              <div className="col-md-2">
                <label className="form-label small mb-1">Category</label>
                <input type="text" className="form-control form-control-sm" placeholder="Enter category" value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })} />
              </div>
              <div className="col-md-2">
                <label className="form-label small mb-1">Selling Price (₹)</label>
                <input type="number" className="form-control form-control-sm" placeholder="0.00" step="0.01" min="0" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} />
              </div>
              <div className="col-md-2">
                <label className="form-label small mb-1">Cost Price (₹)</label>
                <input type="number" className="form-control form-control-sm" placeholder="0.00" min="0" step="0.01" value={newProduct.costPrice} onChange={e => setNewProduct({ ...newProduct, costPrice: e.target.value })} />
              </div>
              <div className="col-md-1">
                <label className="form-label small mb-1">Quantity</label>
                <input type="number" className="form-control form-control-sm" placeholder="0" min="0" value={newProduct.quantity} onChange={e => setNewProduct({ ...newProduct, quantity: e.target.value })} />
              </div>
            </div>
            <div className="row g-2 mt-2">
              <div className="col-md-2">
                <label className="form-label small mb-1">Reorder Level</label>
                <input type="number" className="form-control form-control-sm" placeholder="10" min="0" value={newProduct.reorderLevel} onChange={e => setNewProduct({ ...newProduct, reorderLevel: e.target.value })} />
              </div>
              <div className="col-md-3">
                <label className="form-label small mb-1">Expiry Date</label>
                <input type="date" className="form-control form-control-sm" value={newProduct.expiryDate} onChange={e => setNewProduct({ ...newProduct, expiryDate: e.target.value })} />
              </div>
              <div className="col-md-4">
                <label className="form-label small mb-1">Supplier</label>
                <select className="form-select form-select-sm" value={newProduct.supplier} onChange={e => setNewProduct({ ...newProduct, supplier: e.target.value })}>
                  <option value="">Select supplier (optional)</option>
                  {suppliers.map(s => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-3 d-flex align-items-end">
                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Product'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Product Table */}
      <div className="card">
        <div className="card-body">
          <h4 className="card-title mb-3">Products</h4>
          <div className="table-responsive">
            <table className="table table-bordered align-middle">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Cost Price</th>
                  <th>Quantity</th>
                  <th>Reorder Level</th>
                  <th>Expiry Date</th>
                  <th>Supplier</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => {
                  const isLowStock = p.reorderLevel && p.quantity <= p.reorderLevel;
                  const expiryDate = p.expiryDate ? new Date(p.expiryDate) : null;
                  const isExpired = expiryDate && expiryDate < new Date();
                  const isExpiringSoon = expiryDate && !isExpired && expiryDate < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                  
                  return (
                    <tr key={p._id} className={isLowStock ? 'table-warning' : ''}>
                      <td>{p.name}</td>
                      <td>{p.sku}</td>
                      <td>{p.category}</td>
                      <td>₹{p.price?.toFixed(2) || '0.00'}</td>
                      <td>₹{p.costPrice?.toFixed(2) || '0.00'}</td>
                      <td>
                        <span className={`badge ${isLowStock ? 'bg-danger' : 'bg-success'}`}>
                          {p.quantity}
                        </span>
                      </td>
                      <td>{p.reorderLevel || '-'}</td>
                      <td>
                        {expiryDate ? (
                          <span className={`badge ${isExpired ? 'bg-danger' : isExpiringSoon ? 'bg-warning text-dark' : 'bg-info'}`}>
                            {expiryDate.toLocaleDateString()}
                          </span>
                        ) : '-'}
                      </td>
                      <td>
                        {p.supplier && p.supplier.name ? (
                          <Link to={`/suppliers/${p.supplier._id}`}>{p.supplier.name}</Link>
                        ) : '-'}
                      </td>
                      <td>
                        <button className="btn btn-success btn-sm me-1" title="Add Stock" onClick={() => handleAddStock(p._id)} disabled={loading}>+</button>
                        <button className="btn btn-danger btn-sm" title="Remove Stock" onClick={() => handleRemoveStock(p._id)} disabled={loading}>-</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
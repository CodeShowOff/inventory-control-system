import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [token] = useState(localStorage.getItem('token'));
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Add this line

  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    category: '',
    price: '',
    quantity: '',
    supplier: ''
  });
  const [suppliers, setSuppliers] = useState([]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };


  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch products');
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchSuppliers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/suppliers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuppliers(res.data);
    } catch (err) {
      // ignore supplier error
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        'http://localhost:5000/api/products',
        {
          name: newProduct.name,
          sku: newProduct.sku,
          category: newProduct.category,
          price: Number(newProduct.price),
          quantity: Number(newProduct.quantity),
          supplier: newProduct.supplier || null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewProduct({ name: '', sku: '', category: '', price: '', quantity: '', supplier: '' });
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add product');
    }
  };

  // ---------- Stock IN ----------
  const handleAddStock = async (productId) => {
    const qty = prompt('Enter quantity to add:');
    const quantity = Number(qty);
    if (!quantity || quantity <= 0) return alert('Invalid quantity');

    try {
      const res = await axios.post(
        `http://localhost:5000/api/products/${productId}/add-stock`,
        { quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update product in state
      setProducts(products.map(p => (p._id === productId ? res.data.product : p)));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add stock');
    }
  };

  // ---------- Stock OUT ----------
  const handleRemoveStock = async (productId) => {
    const qty = prompt('Enter quantity to remove:');
    const quantity = Number(qty);
    if (!quantity || quantity <= 0) return alert('Invalid quantity');

    try {
      const res = await axios.post(
        `http://localhost:5000/api/products/${productId}/remove-stock`,
        { quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProducts(products.map(p => (p._id === productId ? res.data.product : p)));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to remove stock');
    }
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Dashboard</h2>
        <button className="btn btn-outline-danger" onClick={handleLogout}>Logout</button>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="mb-4 d-flex flex-wrap gap-2">
        <Link to="/suppliers" className="btn" style={{background:'#2196f3',color:'#fff'}}>Suppliers</Link>
        <Link to="/invoices" className="btn" style={{background:'#4caf50',color:'#fff'}}>Invoices</Link>
        <Link to="/alerts/low-stock" className="btn" style={{background:'#ff5252',color:'#fff'}}>Low Stock Alerts</Link>
        <Link to="/purchase-orders" className="btn" style={{background:'#ffeb3b',color:'#333',border:'1px solid #fbc02d'}}>Purchase Orders</Link>
      </div>

      {/* Add Product Form */}
      <div className="card mb-4">
        <div className="card-body">
          <h4 className="card-title mb-3">Add New Product</h4>
          <form onSubmit={handleAddProduct} className="row g-2 align-items-end">
            <div className="col-md-4">
              <input type="text" className="form-control" placeholder="Name" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} required />
            </div>
            <div className="col-md-2">
              <input type="text" className="form-control" placeholder="SKU" value={newProduct.sku} onChange={e => setNewProduct({ ...newProduct, sku: e.target.value })} required />
            </div>
            <div className="col-md-2">
              <input type="text" className="form-control" placeholder="Category" value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })} />
            </div>
            <div className="col-md-1">
              <input type="number" className="form-control" placeholder="Price" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} />
            </div>
            <div className="col-md-1">
              <input type="number" className="form-control" placeholder="Qty" value={newProduct.quantity} onChange={e => setNewProduct({ ...newProduct, quantity: e.target.value })} />
            </div>
            <div className="col-md-2">
              <select className="form-select" value={newProduct.supplier} onChange={e => setNewProduct({ ...newProduct, supplier: e.target.value })}>
                <option value="">Supplier (optional)</option>
                {suppliers.map(s => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-auto">
              <button type="submit" className="btn btn-primary">Add Product</button>
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
                  <th>Quantity</th>
                  <th>Supplier</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p._id}>
                    <td>{p.name}</td>
                    <td>{p.sku}</td>
                    <td>{p.category}</td>
                    <td>{p.price}</td>
                    <td>{p.quantity}</td>
                    <td>
                      {p.supplier && p.supplier.name ? (
                        <Link to={`/suppliers/${p.supplier._id}`}>{p.supplier.name}</Link>
                      ) : '-'}
                    </td>
                    <td>
                      <button className="btn btn-success btn-sm me-1" title="Add Stock" onClick={() => handleAddStock(p._id)}>+</button>
                      <button className="btn btn-danger btn-sm" title="Remove Stock" onClick={() => handleRemoveStock(p._id)}>-</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
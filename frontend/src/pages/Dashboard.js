import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
  });

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
  }, []);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        'http://localhost:5000/api/products',
        {
          name: newProduct.name,
          sku: newProduct.sku,
          category: newProduct.category,
          price: Number(newProduct.price),
          quantity: Number(newProduct.quantity),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProducts([res.data, ...products]);
      setNewProduct({ name: '', sku: '', category: '', price: '', quantity: '' });
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
    <div style={{ maxWidth: '800px', margin: '50px auto' }}>
      <h2>Dashboard</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ marginBottom: '20px' }}>
        <button onClick={handleLogout}>Logout</button>
      </div>


      {/* Add Product Form */}
      <h3>Add New Product</h3>
      <form onSubmit={handleAddProduct} style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Name"
          value={newProduct.name}
          onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="SKU"
          value={newProduct.sku}
          onChange={e => setNewProduct({ ...newProduct, sku: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Category"
          value={newProduct.category}
          onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
        />
        <input
          type="number"
          placeholder="Price"
          value={newProduct.price}
          onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
        />
        <input
          type="number"
          placeholder="Quantity"
          value={newProduct.quantity}
          onChange={e => setNewProduct({ ...newProduct, quantity: e.target.value })}
        />
        <button type="submit">Add Product</button>
      </form>

      {/* Product Table */}
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Name</th>
            <th>SKU</th>
            <th>Category</th>
            <th>Price</th>
            <th>Quantity</th>
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
                <button onClick={() => handleAddStock(p._id)}>+</button>{' '}
                <button onClick={() => handleRemoveStock(p._id)}>-</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
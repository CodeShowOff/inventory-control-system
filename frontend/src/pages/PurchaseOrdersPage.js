import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

function PurchaseOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ supplier: '', items: [] });
  const [item, setItem] = useState({ product: '', quantity: 1 });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      if (mounted) {
        await fetchOrders();
        await fetchSuppliers();
        await fetchProducts();
      }
    };
    fetchData();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/purchase-orders`, axiosConfig);
      setOrders(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch orders');
    }
  };
  const fetchSuppliers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/suppliers`, axiosConfig);
      setSuppliers(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch suppliers');
    }
  };
  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/products`, axiosConfig);
      setProducts(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch products');
    }
  };

  const handleFormChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleItemChange = e => setItem({ ...item, [e.target.name]: e.target.value });

  const addItem = () => {
    if (!item.product || !item.quantity) return;
    setForm({ ...form, items: [...form.items, { product: item.product, quantity: Number(item.quantity) }] });
    setItem({ product: '', quantity: 1 });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    // Prevent creating order if a product is selected but not added
    if (item.product) {
      setError('Please add the selected product to the order before submitting.');
      return;
    }
    if (!form.supplier) {
      setError('Please select a supplier');
      return;
    }
    if (!form.items.length) {
      setError('Please add at least one product to the order.');
      return;
    }
    try {
      setLoading(true);
      await axios.post(`${API_BASE_URL}/api/purchase-orders`, form, axiosConfig);
      setForm({ supplier: '', items: [] });
      await fetchOrders();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const receiveOrder = async id => {
    if (!window.confirm('Mark this order as received? This will add stock to inventory.')) {
      return;
    }
    try {
      setLoading(true);
      await axios.put(`${API_BASE_URL}/api/purchase-orders/${id}/receive`, {}, axiosConfig);
      await fetchOrders();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to receive order');
    } finally {
      setLoading(false);
    }
  };

  const deleteOrder = async id => {
    if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return;
    }
    try {
      setLoading(true);
      await axios.delete(`${API_BASE_URL}/api/purchase-orders/${id}`, axiosConfig);
      await fetchOrders();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="card mb-4">
        <div className="card-body">
          <h2 className="card-title mb-4">Create Purchase Order</h2>
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="row g-2">
              <div className="col-md-6">
                <label className="form-label small mb-1">Supplier <span className="text-danger">*</span></label>
                <select name="supplier" className="form-select form-select-sm" value={form.supplier} onChange={handleFormChange} disabled={loading} required>
                  <option value="">Select supplier</option>
                  {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
            </div>
            <div className="row g-2 mt-2">
              <div className="col-md-5">
                <label className="form-label small mb-1">Product</label>
                <select name="product" className="form-select form-select-sm" value={item.product} onChange={handleItemChange}>
                  <option value="">Select product</option>
                  {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label small mb-1">Quantity</label>
                <input name="quantity" type="number" min="1" className="form-control form-control-sm" placeholder="1" value={item.quantity} onChange={handleItemChange} />
              </div>
              <div className="col-md-2 d-flex align-items-end">
                <button type="button" className="btn btn-secondary w-100" onClick={addItem}>Add Item</button>
              </div>
            </div>
            {form.items.length > 0 && (
              <div className="row g-2 mt-2">
                <div className="col-12">
                  <label className="form-label small mb-1">Order Items</label>
                  <ul className="list-group">
                    {form.items.map((it, idx) => (
                      <li className="list-group-item list-group-item-sm d-flex justify-content-between align-items-center" key={idx}>
                        {products.find(p => p._id === it.product)?.name || it.product} x {it.quantity}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            <div className="row g-2 mt-3">
              <div className="col-12">
                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                  {loading ? 'Creating Order...' : 'Create Purchase Order'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h3 className="card-title mb-4">Order List</h3>
          <div className="table-responsive">
            <table className="table table-bordered align-middle">
              <thead className="table-light">
                <tr>
                  <th>Supplier</th>
                  <th>Status</th>
                  <th>Items</th>
                  <th>Received At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id}>
                    <td>{order.supplier?.name || order.supplier}</td>
                    <td>{order.status === 'pending' ? <span className="badge bg-warning text-dark">Pending</span> : <span className="badge bg-success">Received</span>}</td>
                    <td>
                      <ul className="mb-0 ps-3">
                        {order.items.map((it, idx) => (
                          <li key={idx}>{it.product?.name || it.product} x {it.quantity}</li>
                        ))}
                      </ul>
                    </td>
                    <td>{order.receivedAt ? new Date(order.receivedAt).toLocaleString() : '-'}</td>
                    <td>
                      {order.status === 'pending' && <button className="btn btn-success btn-sm me-1" onClick={() => receiveOrder(order._id)} disabled={loading}>Mark Received</button>}
                      <button className="btn btn-danger btn-sm" onClick={() => deleteOrder(order._id)} disabled={loading}>Delete</button>
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

export default PurchaseOrdersPage;

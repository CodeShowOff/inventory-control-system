import React, { useEffect, useState } from 'react';
import axios from 'axios';

function PurchaseOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ supplier: '', items: [] });
  const [item, setItem] = useState({ product: '', quantity: 1 });
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchOrders();
    fetchSuppliers();
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  const fetchOrders = async () => {
    const res = await axios.get('http://localhost:5000/api/purchase-orders', axiosConfig);
    setOrders(res.data);
  };
  const fetchSuppliers = async () => {
    const res = await axios.get('http://localhost:5000/api/suppliers', axiosConfig);
    setSuppliers(res.data);
  };
  const fetchProducts = async () => {
    const res = await axios.get('http://localhost:5000/api/products', axiosConfig);
    setProducts(res.data);
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
    // Prevent creating order if a product is selected but not added
    if (item.product) {
      alert('Please add the selected product to the order before submitting.');
      return;
    }
    if (!form.supplier || !form.items.length) {
      alert('Select supplier and add at least one product.');
      return;
    }
    await axios.post('http://localhost:5000/api/purchase-orders', form, axiosConfig);
    setForm({ supplier: '', items: [] });
    fetchOrders();
  };

  const receiveOrder = async id => {
    await axios.put(`http://localhost:5000/api/purchase-orders/${id}/receive`, {}, axiosConfig);
    fetchOrders();
  };

  const deleteOrder = async id => {
    await axios.delete(`http://localhost:5000/api/purchase-orders/${id}`, axiosConfig);
    fetchOrders();
  };

  return (
    <div className="container py-5">
      <div className="card mb-4">
        <div className="card-body">
          <h2 className="card-title mb-4">Create Purchase Order</h2>
          <form onSubmit={handleSubmit} className="row g-2 align-items-end">
            <div className="col-md-4">
              <label className="form-label">Supplier</label>
              <select name="supplier" className="form-select" value={form.supplier} onChange={handleFormChange} required>
                <option value="">Select Supplier</option>
                {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div className="w-100"></div>
            <div className="col-md-4">
              <label className="form-label">Product</label>
              <select name="product" className="form-select" value={item.product} onChange={handleItemChange}>
                <option value="">Select Product</option>
                {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">Quantity</label>
              <input name="quantity" type="number" min="1" className="form-control" value={item.quantity} onChange={handleItemChange} />
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <button type="button" className="btn btn-secondary w-100" onClick={addItem}>Add Item</button>
            </div>
            <div className="w-100"></div>
            <div className="col-12">
              {form.items.length > 0 && (
                <ul className="list-group mb-2">
                  {form.items.map((it, idx) => (
                    <li className="list-group-item d-flex justify-content-between align-items-center" key={idx}>
                      {products.find(p => p._id === it.product)?.name || it.product} x {it.quantity}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="col-12">
              <button type="submit" className="btn btn-primary">Create Order</button>
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
                      {order.status === 'pending' && <button className="btn btn-success btn-sm me-1" onClick={() => receiveOrder(order._id)}>Mark Received</button>}
                      <button className="btn btn-danger btn-sm" onClick={() => deleteOrder(order._id)}>Delete</button>
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

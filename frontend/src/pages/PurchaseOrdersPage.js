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
    <div style={{ maxWidth: '800px', margin: '40px auto' }}>
      <h2>Purchase Orders</h2>
      <form onSubmit={handleSubmit}>
        <select name="supplier" value={form.supplier} onChange={handleFormChange} required>
          <option value="">Select Supplier</option>
          {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
        </select>
        <div>
          <select name="product" value={item.product} onChange={handleItemChange} required>
            <option value="">Select Product</option>
            {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
          <input name="quantity" type="number" min="1" value={item.quantity} onChange={handleItemChange} />
          <button type="button" onClick={addItem}>Add Item</button>
        </div>
        <ul>
          {form.items.map((it, idx) => (
            <li key={idx}>{products.find(p => p._id === it.product)?.name || it.product} x {it.quantity}</li>
          ))}
        </ul>
        <button type="submit">Create Order</button>
      </form>
      <h3>Order List</h3>
      <ul>
        {orders.map(order => (
          <li key={order._id} style={{ marginBottom: 10 }}>
            <strong>Supplier:</strong> {order.supplier?.name || order.supplier} | <strong>Status:</strong> {order.status}
            <ul>
              {order.items.map((it, idx) => (
                <li key={idx}>{it.product?.name || it.product} x {it.quantity}</li>
              ))}
            </ul>
            {order.status === 'pending' && <button onClick={() => receiveOrder(order._id)}>Mark Received</button>}
            <button onClick={() => deleteOrder(order._id)}>Delete</button>
            {order.receivedAt && <span> | Received At: {new Date(order.receivedAt).toLocaleString()}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PurchaseOrdersPage;

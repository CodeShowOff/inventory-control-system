import React, { useEffect, useState } from 'react';
import axios from 'axios';

function InvoicePage() {
  const [invoices, setInvoices] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ customerName: '', items: [], tax: 0 });
  const [item, setItem] = useState({ product: '', quantity: 1, price: 0 });
  const token = localStorage.getItem('token');

  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchInvoices();
    fetchProducts();
  }, []);

  const fetchInvoices = async () => {
    const res = await axios.get('http://localhost:5000/api/invoices', axiosConfig);
    setInvoices(res.data);
  };

  const fetchProducts = async () => {
    const res = await axios.get('http://localhost:5000/api/products', axiosConfig);
    setProducts(res.data);
  };

  const handleFormChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleItemChange = e => setItem({ ...item, [e.target.name]: e.target.value });

  const addItem = () => {
    const prod = products.find(p => p._id === item.product);
    if (!prod) {
      alert('Please select a valid product.');
      return;
    }
    setForm({
      ...form,
      items: [...form.items, { product: prod._id, quantity: Number(item.quantity), price: prod.price }]
    });
    setItem({ product: '', quantity: 1, price: 0 });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.items.length) {
      alert('Please add at least one product to the invoice.');
      return;
    }
    // Validate items
    for (const it of form.items) {
      if (!it.product || !products.find(p => p._id === it.product)) {
        alert('Invalid product in invoice items.');
        return;
      }
      if (!it.quantity || it.quantity <= 0) {
        alert('Invalid quantity in invoice items.');
        return;
      }
    }
    try {
      await axios.post('http://localhost:5000/api/invoices', { ...form, tax: Number(form.tax) }, axiosConfig);
      setForm({ customerName: '', items: [], tax: 0 });
      fetchInvoices();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create invoice');
    }
  };

  const markPaid = async id => {
    await axios.put(`http://localhost:5000/api/invoices/${id}/pay`, {}, axiosConfig);
    fetchInvoices();
  };

  const deleteInvoice = async id => {
    await axios.delete(`http://localhost:5000/api/invoices/${id}`, axiosConfig);
    fetchInvoices();
  };

  return (
    <div>
      <h2>Invoices</h2>
      <form onSubmit={handleSubmit}>
        <input name="customerName" placeholder="Customer Name" value={form.customerName} onChange={handleFormChange} required />
        <input name="tax" type="number" placeholder="Tax" value={form.tax} onChange={handleFormChange} />
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
            <li key={idx}>{products.find(p => p._id === it.product)?.name || it.product} x {it.quantity} @ {it.price}</li>
          ))}
        </ul>
        <button type="submit">Create Invoice</button>
      </form>
      <ul>
        {invoices.map(inv => (
          <li key={inv._id}>
            {inv.customerName} | Total: {inv.total} | Tax: {inv.tax} | Paid: {inv.paid ? 'Yes' : 'No'}
            <button onClick={() => markPaid(inv._id)} disabled={inv.paid}>Mark Paid</button>
            <button onClick={() => deleteInvoice(inv._id)}>Delete</button>
            <ul>
              {inv.items.map((it, idx) => (
                <li key={idx}>{it.product?.name || it.product} x {it.quantity} @ {it.price}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default InvoicePage;

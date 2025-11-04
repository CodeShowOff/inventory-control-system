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
    // Prevent creating invoice if a product is selected but not added
    if (item.product) {
      alert('Please add the selected product to the invoice before submitting.');
      return;
    }
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
    <div className="container py-5">
      <div className="card mb-4">
        <div className="card-body">
          <h2 className="card-title mb-4">Create Invoice</h2>
          <form onSubmit={handleSubmit} className="row g-2 align-items-end">
            <div className="col-md-4">
              <label className="form-label">Customer Name</label>
              <input name="customerName" className="form-control" placeholder="Customer Name" value={form.customerName} onChange={handleFormChange} required />
            </div>
            <div className="col-md-2">
              <label className="form-label">Tax</label>
              <input name="tax" type="number" className="form-control" placeholder="Tax" value={form.tax} onChange={handleFormChange} />
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
                      {products.find(p => p._id === it.product)?.name || it.product} x {it.quantity} @ {it.price}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="col-12">
              <button type="submit" className="btn btn-primary">Create Invoice</button>
            </div>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h2 className="card-title mb-4">Invoices</h2>
          <div className="table-responsive">
            <table className="table table-bordered align-middle">
              <thead className="table-light">
                <tr>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Tax</th>
                  <th>Paid</th>
                  <th>Items</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => {
                  // Calculate subtotal
                  const subtotal = inv.items.reduce((sum, it) => sum + (it.price * it.quantity), 0);
                  // Tax can be percent (0-100) or absolute, here treat as percent if <= 100
                  let taxAmount = 0;
                  if (inv.tax > 0 && inv.tax <= 100) {
                    taxAmount = subtotal * (inv.tax / 100);
                  } else if (inv.tax > 100) {
                    taxAmount = inv.tax;
                  }
                  const total = subtotal + taxAmount;
                  return (
                    <tr key={inv._id}>
                      <td>{inv.customerName}</td>
                      <td>{total.toFixed(2)}</td>
                      <td>{inv.tax}</td>
                      <td>{inv.paid ? <span className="badge bg-success">Yes</span> : <span className="badge bg-warning text-dark">No</span>}</td>
                      <td>
                        <ul className="mb-0 ps-3">
                          {inv.items.map((it, idx) => (
                            <li key={idx}>{it.product?.name || it.product} x {it.quantity} @ {it.price}</li>
                          ))}
                        </ul>
                      </td>
                      <td>
                        <button className="btn btn-success btn-sm me-1" onClick={() => markPaid(inv._id)} disabled={inv.paid}>Mark Paid</button>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteInvoice(inv._id)}>Delete</button>
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

export default InvoicePage;

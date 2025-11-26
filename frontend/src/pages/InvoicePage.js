import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

function InvoicePage() {
  const [invoices, setInvoices] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ customerName: '', items: [], tax: 0 });
  const [item, setItem] = useState({ product: '', quantity: 1, price: 0 });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');

  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      if (mounted) {
        await fetchInvoices();
        await fetchProducts();
      }
    };
    fetchData();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/invoices`, axiosConfig);
      setInvoices(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch invoices');
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
    setError('');
    // Prevent creating invoice if a product is selected but not added
    if (item.product) {
      setError('Please add the selected product to the invoice before submitting.');
      return;
    }
    if (!form.customerName.trim()) {
      setError('Customer name is required');
      return;
    }
    if (!form.items.length) {
      setError('Please add at least one product to the invoice.');
      return;
    }
    // Validate items
    for (const it of form.items) {
      if (!it.product || !products.find(p => p._id === it.product)) {
        setError('Invalid product in invoice items.');
        return;
      }
      if (!it.quantity || it.quantity <= 0) {
        setError('Invalid quantity in invoice items.');
        return;
      }
    }
    try {
      setLoading(true);
      await axios.post(`${API_BASE_URL}/api/invoices`, { ...form, customerName: form.customerName.trim(), tax: Number(form.tax) }, axiosConfig);
      setForm({ customerName: '', items: [], tax: 0 });
      await fetchInvoices();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  const markPaid = async id => {
    try {
      setLoading(true);
      await axios.put(`${API_BASE_URL}/api/invoices/${id}/pay`, {}, axiosConfig);
      await fetchInvoices();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to mark invoice as paid');
    } finally {
      setLoading(false);
    }
  };

  const deleteInvoice = async id => {
    if (!window.confirm('Are you sure you want to delete this invoice? Stock will be restored.')) {
      return;
    }
    try {
      setLoading(true);
      await axios.delete(`${API_BASE_URL}/api/invoices/${id}`, axiosConfig);
      await fetchInvoices();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="card mb-4">
        <div className="card-body">
          <h2 className="card-title mb-4">Create Invoice</h2>
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="row g-2">
              <div className="col-md-6">
                <label className="form-label small mb-1">Customer Name <span className="text-danger">*</span></label>
                <input name="customerName" className="form-control form-control-sm" placeholder="Enter customer name" value={form.customerName} onChange={handleFormChange} disabled={loading} required />
              </div>
              <div className="col-md-3">
                <label className="form-label small mb-1">Tax (%)</label>
                <input name="tax" type="number" min="0" step="0.01" className="form-control form-control-sm" placeholder="0" value={form.tax} onChange={handleFormChange} disabled={loading} />
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
                  <label className="form-label small mb-1">Invoice Items</label>
                  <ul className="list-group">
                    {form.items.map((it, idx) => {
                      const itemTotal = it.price * it.quantity;
                      return (
                        <li className="list-group-item list-group-item-sm d-flex justify-content-between align-items-center" key={idx}>
                          <span>{products.find(p => p._id === it.product)?.name || it.product} x {it.quantity} @ ₹{it.price}</span>
                          <span className="badge bg-primary">₹{itemTotal.toFixed(2)}</span>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="mt-2 p-2 bg-light border rounded">
                    {(() => {
                      const subtotal = form.items.reduce((sum, it) => sum + (it.price * it.quantity), 0);
                      const taxValue = Number(form.tax) || 0;
                      let taxAmount = 0;
                      if (taxValue > 0 && taxValue <= 100) {
                        taxAmount = subtotal * (taxValue / 100);
                      } else if (taxValue > 100) {
                        taxAmount = taxValue;
                      }
                      const total = subtotal + taxAmount;
                      return (
                        <>
                          <div className="d-flex justify-content-between">
                            <strong>Subtotal:</strong>
                            <span>₹{subtotal.toFixed(2)}</span>
                          </div>
                          {taxAmount > 0 && (
                            <div className="d-flex justify-content-between">
                              <strong>Tax ({taxValue > 0 && taxValue <= 100 ? `${taxValue}%` : 'Fixed'}):</strong>
                              <span>₹{taxAmount.toFixed(2)}</span>
                            </div>
                          )}
                          <div className="d-flex justify-content-between border-top pt-2 mt-2">
                            <strong>Total:</strong>
                            <strong className="text-primary">₹{total.toFixed(2)}</strong>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}
            <div className="row g-2 mt-3">
              <div className="col-12">
                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                  {loading ? 'Creating Invoice...' : 'Create Invoice'}
                </button>
              </div>
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
                  <th>Invoice #</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Subtotal</th>
                  <th>Tax</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Items</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv._id}>
                    <td><strong>{inv.invoiceNumber || 'N/A'}</strong></td>
                    <td>{new Date(inv.createdAt).toLocaleDateString()}</td>
                    <td>{inv.customerName}</td>
                    <td>₹{(inv.subtotal || 0).toFixed(2)}</td>
                    <td>
                      {inv.tax > 0 && inv.tax <= 100 ? `${inv.tax}%` : `₹${inv.tax}`}
                      {inv.taxAmount ? ` (₹${inv.taxAmount.toFixed(2)})` : ''}
                    </td>
                    <td><strong>₹{inv.total.toFixed(2)}</strong></td>
                    <td>{inv.paid ? <span className="badge bg-success">Yes</span> : <span className="badge bg-warning text-dark">No</span>}</td>
                    <td>
                      <ul className="mb-0 ps-3">
                        {inv.items.map((it, idx) => (
                          <li key={idx}>{it.product?.name || it.product} x {it.quantity} @ ₹{it.price}</li>
                        ))}
                      </ul>
                    </td>
                    <td>
                      <button className="btn btn-success btn-sm me-1" onClick={() => markPaid(inv._id)} disabled={inv.paid || loading}>Mark Paid</button>
                      <button className="btn btn-danger btn-sm" onClick={() => deleteInvoice(inv._id)} disabled={loading}>Delete</button>
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

export default InvoicePage;

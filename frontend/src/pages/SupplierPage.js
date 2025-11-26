import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

function SupplierPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState({ name: '', contactEmail: '', phone: '', address: '', notes: '' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');

  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/suppliers`, axiosConfig);
      setSuppliers(res.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch suppliers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    if (mounted) fetchSuppliers();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) {
      setError('Supplier name is required');
      return;
    }

    try {
      setLoading(true);
      if (editingId) {
        await axios.put(`${API_BASE_URL}/api/suppliers/${editingId}`, form, axiosConfig);
      } else {
        await axios.post(`${API_BASE_URL}/api/suppliers`, form, axiosConfig);
      }
      setForm({ name: '', contactEmail: '', phone: '', address: '', notes: '' });
      setEditingId(null);
      await fetchSuppliers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save supplier');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = supplier => {
    setForm(supplier);
    setEditingId(supplier._id);
    setError('');
  };

  const handleDelete = async id => {
    if (!window.confirm('Are you sure you want to delete this supplier? This action cannot be undone.')) {
      return;
    }
    try {
      setLoading(true);
      await axios.delete(`${API_BASE_URL}/api/suppliers/${id}`, axiosConfig);
      await fetchSuppliers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete supplier');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="card mb-4">
        <div className="card-body">
          <h2 className="card-title mb-4">Suppliers</h2>
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="row g-2">
              <div className="col-md-3">
                <label className="form-label small mb-1">Supplier Name <span className="text-danger">*</span></label>
                <input name="name" className="form-control form-control-sm" placeholder="Enter name" value={form.name} onChange={handleChange} disabled={loading} required />
              </div>
              <div className="col-md-3">
                <label className="form-label small mb-1">Email</label>
                <input name="contactEmail" type="email" className="form-control form-control-sm" placeholder="Enter email" value={form.contactEmail} onChange={handleChange} disabled={loading} />
              </div>
              <div className="col-md-2">
                <label className="form-label small mb-1">Phone</label>
                <input name="phone" className="form-control form-control-sm" placeholder="Enter phone" value={form.phone} onChange={handleChange} disabled={loading} />
              </div>
              <div className="col-md-4">
                <label className="form-label small mb-1">Address</label>
                <input name="address" className="form-control form-control-sm" placeholder="Enter address" value={form.address} onChange={handleChange} disabled={loading} />
              </div>
            </div>
            <div className="row g-2 mt-2">
              <div className="col-md-6">
                <label className="form-label small mb-1">Notes</label>
                <input name="notes" className="form-control form-control-sm" placeholder="Enter notes" value={form.notes} onChange={handleChange} disabled={loading} />
              </div>
              <div className="col-md-3 d-flex align-items-end">
                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                  {loading ? 'Saving...' : (editingId ? 'Update Supplier' : 'Add Supplier')}
                </button>
              </div>
              {editingId && (
                <div className="col-md-3 d-flex align-items-end">
                  <button type="button" className="btn btn-secondary w-100" onClick={() => { setEditingId(null); setForm({ name: '', contactEmail: '', phone: '', address: '', notes: '' }); setError(''); }} disabled={loading}>Cancel</button>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
      <div className="card">
        <div className="card-body">
          <h4 className="card-title mb-3">Supplier List</h4>
          <ul className="list-group">
            {suppliers.map(s => (
              <li className="list-group-item d-flex justify-content-between align-items-center" key={s._id}>
                <div>
                  <strong>{s.name}</strong> <span className="text-muted">({s.contactEmail})</span>
                  <div className="small text-muted">{s.phone} | {s.address}</div>
                </div>
                <div>
                  <button className="btn btn-sm btn-info me-2" onClick={() => handleEdit(s)} disabled={loading}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(s._id)} disabled={loading}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default SupplierPage;

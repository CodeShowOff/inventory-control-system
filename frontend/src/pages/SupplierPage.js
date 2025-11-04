import React, { useEffect, useState } from 'react';
import axios from 'axios';

function SupplierPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState({ name: '', contactEmail: '', phone: '', address: '', notes: '' });
  const [editingId, setEditingId] = useState(null);
  const token = localStorage.getItem('token');

  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  const fetchSuppliers = async () => {
    const res = await axios.get('http://localhost:5000/api/suppliers', axiosConfig);
    setSuppliers(res.data);
  };

  useEffect(() => { fetchSuppliers(); }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    if (editingId) {
      await axios.put(`http://localhost:5000/api/suppliers/${editingId}`, form, axiosConfig);
    } else {
      await axios.post('http://localhost:5000/api/suppliers', form, axiosConfig);
    }
    setForm({ name: '', contactEmail: '', phone: '', address: '', notes: '' });
    setEditingId(null);
    fetchSuppliers();
  };

  const handleEdit = supplier => {
    setForm(supplier);
    setEditingId(supplier._id);
  };

  const handleDelete = async id => {
    await axios.delete(`http://localhost:5000/api/suppliers/${id}`, axiosConfig);
    fetchSuppliers();
  };

  return (
    <div className="container py-5">
      <div className="card mb-4">
        <div className="card-body">
          <h2 className="card-title mb-4">Suppliers</h2>
          <form onSubmit={handleSubmit} className="row g-2 align-items-end">
            <div className="col-md-3">
              <input name="name" className="form-control" placeholder="Name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="col-md-2">
              <input name="contactEmail" className="form-control" placeholder="Email" value={form.contactEmail} onChange={handleChange} />
            </div>
            <div className="col-md-2">
              <input name="phone" className="form-control" placeholder="Phone" value={form.phone} onChange={handleChange} />
            </div>
            <div className="col-md-3">
              <input name="address" className="form-control" placeholder="Address" value={form.address} onChange={handleChange} />
            </div>
            <div className="col-md-2">
              <input name="notes" className="form-control" placeholder="Notes" value={form.notes} onChange={handleChange} />
            </div>
            <div className="col-12 col-md-auto">
              <button type="submit" className="btn btn-primary me-2">{editingId ? 'Update' : 'Add'} Supplier</button>
              {editingId && <button type="button" className="btn btn-secondary" onClick={() => { setEditingId(null); setForm({ name: '', contactEmail: '', phone: '', address: '', notes: '' }); }}>Cancel</button>}
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
                  <button className="btn btn-sm btn-info me-2" onClick={() => handleEdit(s)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(s._id)}>Delete</button>
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

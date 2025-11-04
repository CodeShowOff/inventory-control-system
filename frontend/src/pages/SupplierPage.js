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
    <div>
      <h2>Suppliers</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
        <input name="contactEmail" placeholder="Email" value={form.contactEmail} onChange={handleChange} />
        <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
        <input name="address" placeholder="Address" value={form.address} onChange={handleChange} />
        <input name="notes" placeholder="Notes" value={form.notes} onChange={handleChange} />
        <button type="submit">{editingId ? 'Update' : 'Add'} Supplier</button>
        {editingId && <button type="button" onClick={() => { setEditingId(null); setForm({ name: '', contactEmail: '', phone: '', address: '', notes: '' }); }}>Cancel</button>}
      </form>
      <ul>
        {suppliers.map(s => (
          <li key={s._id}>
            {s.name} ({s.contactEmail})
            <button onClick={() => handleEdit(s)}>Edit</button>
            <button onClick={() => handleDelete(s._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SupplierPage;

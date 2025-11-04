import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function SupplierDetailPage() {
  const { id } = useParams();
  const [supplier, setSupplier] = useState(null);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/suppliers/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSupplier(res.data);
      } catch (err) {
        setError('Supplier not found');
      }
    };
    fetchSupplier();
  }, [id, token]);

  if (error) return <div>{error}</div>;
  if (!supplier) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto' }}>
      <h2>Supplier Details</h2>
      <p><strong>Name:</strong> {supplier.name}</p>
      <p><strong>Email:</strong> {supplier.contactEmail}</p>
      <p><strong>Phone:</strong> {supplier.phone}</p>
      <p><strong>Address:</strong> {supplier.address}</p>
      <p><strong>Notes:</strong> {supplier.notes}</p>
      <p><strong>Created At:</strong> {new Date(supplier.createdAt).toLocaleString()}</p>
    </div>
  );
}

export default SupplierDetailPage;

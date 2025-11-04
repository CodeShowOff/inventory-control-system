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

  if (error) return <div className="container py-5"><div className="alert alert-danger">{error}</div></div>;
  if (!supplier) return <div className="container py-5"><div>Loading...</div></div>;

  return (
    <div className="container py-5 d-flex justify-content-center">
      <div className="card shadow" style={{ maxWidth: '400px', width: '100%' }}>
        <div className="card-body">
          <h2 className="card-title mb-4">Supplier Details</h2>
          <ul className="list-group list-group-flush mb-3">
            <li className="list-group-item"><strong>Name:</strong> {supplier.name}</li>
            <li className="list-group-item"><strong>Email:</strong> {supplier.contactEmail}</li>
            <li className="list-group-item"><strong>Phone:</strong> {supplier.phone}</li>
            <li className="list-group-item"><strong>Address:</strong> {supplier.address}</li>
            <li className="list-group-item"><strong>Notes:</strong> {supplier.notes}</li>
            <li className="list-group-item"><strong>Created At:</strong> {new Date(supplier.createdAt).toLocaleString()}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default SupplierDetailPage;

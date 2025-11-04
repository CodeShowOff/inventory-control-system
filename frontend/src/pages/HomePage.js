
import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  return (
    <div className="w-100 min-vh-100 d-flex flex-column justify-content-center align-items-center bg-light" style={{paddingTop: 40, paddingBottom: 40}}>
      <h1 className="display-3 fw-bold mb-3 text-primary text-center">Inventory Control System</h1>
      <p className="lead text-center mb-4" style={{maxWidth: 900}}>
        Welcome to a modern inventory management solution for small businesses and organizations.<br/>
        <span className="text-muted">Easily track products, suppliers, purchase orders, invoices, and receive low stock alerts.</span>
      </p>
      <div className="row justify-content-center w-100 mb-4" style={{maxWidth: 1000}}>
        <div className="col-md-6">
          <ul className="list-group list-group-flush mb-4 text-start">
            <li className="list-group-item">✔️ Real-time stock management</li>
            <li className="list-group-item">✔️ Supplier and purchase order tracking</li>
            <li className="list-group-item">✔️ Invoice generation and payment status</li>
            <li className="list-group-item">✔️ Low stock alerts and notifications</li>
            <li className="list-group-item">✔️ Secure authentication</li>
          </ul>
        </div>
        
      </div>
      <div className="d-flex justify-content-center gap-3 mb-5">
        {token ? (
          <Link to="/dashboard">
            <button className="btn btn-success btn-lg px-4">Go to Dashboard{user && user.name ? ` (${user.name})` : ''}</button>
          </Link>
        ) : (
          <>
            <Link to="/login">
              <button className="btn btn-primary btn-lg px-4">Login</button>
            </Link>
            <Link to="/register">
              <button className="btn btn-outline-secondary btn-lg px-4">Register</button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default HomePage;

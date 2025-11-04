import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div style={{ maxWidth: '600px', margin: '60px auto', textAlign: 'center' }}>
      <h1>Inventory Control System</h1>
      <p>
        Motive: Manage stock levels and supply chain data.<br/>
        Track products, suppliers, purchase orders, and inventory alerts.<br/>
        Simple MERN stack demo for business inventory management.
      </p>
      <div style={{ margin: '30px 0' }}>
        <Link to="/login"><button>Login</button></Link>
        <Link to="/register" style={{ marginLeft: 20 }}><button>Register</button></Link>
      </div>
    </div>
  );
}

export default HomePage;

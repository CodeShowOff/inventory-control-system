import React from 'react';

function AboutPage() {
  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card shadow p-4 w-100" style={{ maxWidth: '500px' }}>
        <div className="card-body text-center">
          <h2 className="card-title mb-3">About This Project</h2>
          <p>This Inventory Control System was made by:</p>
          <ul className="list-unstyled mb-3">
            <li><strong>ADARSH KUMAR DUBEY</strong> - Roll No: 2315000087</li>
            <li><strong>GARGI SHARMA</strong> - Roll No: 2315000822</li>
            <li><strong>SHUBHAM KUMAR</strong> - Roll No: 2315002140</li>
            <li><strong>VANDANA YADAV</strong> - Roll No: 2315002394</li>
          </ul>
          <p className="mb-0">University: <strong>GLA University</strong></p>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;

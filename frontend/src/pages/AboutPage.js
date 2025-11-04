import React from 'react';

function AboutPage() {
  return (
    <div style={{ maxWidth: '600px', margin: '60px auto', textAlign: 'center' }}>
      <h2>About This Project</h2>
      <p>This Inventory Control System was made by:</p>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li><strong>Person1</strong> - Roll No: 21010101</li>
        <li><strong>Person2</strong> - Roll No: 21010102</li>
        <li><strong>Person3</strong> - Roll No: 21010103</li>
        <li><strong>Person4</strong> - Roll No: 21010104</li>
      </ul>
      <p>University: GLA University</p>
    </div>
  );
}

export default AboutPage;

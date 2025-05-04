// src/pages/PinCodePage.jsx
import React from 'react';

const PinCodePage = () => {
  return (
    <div style={{ padding: 20 }}>
      <h1>Enter PIN</h1>
      <input type="password" placeholder="••••" style={{ fontSize: '1.5rem', padding: '0.5rem' }} />
      <button style={{ marginLeft: 10, padding: '0.5rem 1rem' }}>Submit</button>
    </div>
  );
};

export default PinCodePage;

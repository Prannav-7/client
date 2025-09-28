// src/pages/TestContacts.js
import React from 'react';

const TestContacts = () => {
  const testWhatsApp = () => {
    const phone = "918838686407";
    const message = encodeURIComponent("Hi! I'm testing the WhatsApp integration from your website.");
    const url = `https://wa.me/${phone}?text=${message}`;
    console.log("WhatsApp URL:", url);
    window.open(url, '_blank');
  };

  const testEmail = () => {
    const subject = encodeURIComponent("Test Email from Website");
    const body = encodeURIComponent("Hi,\n\nThis is a test email from your website.\n\nRegards,");
    const url = `mailto:electrostore2511@gmail.com?subject=${subject}&body=${body}`;
    console.log("Email URL:", url);
    window.location.href = url;
  };

  const testPhone = () => {
    const url = "tel:+918838686407";
    console.log("Phone URL:", url);
    window.location.href = url;
  };

  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>Contact Integration Test</h1>
      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '30px' }}>
        <button 
          onClick={testWhatsApp}
          style={{
            background: '#25D366',
            color: 'white',
            border: 'none',
            padding: '15px 25px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Test WhatsApp
        </button>
        <button 
          onClick={testEmail}
          style={{
            background: '#667eea',
            color: 'white',
            border: 'none',
            padding: '15px 25px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Test Email
        </button>
        <button 
          onClick={testPhone}
          style={{
            background: '#28a745',
            color: 'white',
            border: 'none',
            padding: '15px 25px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Test Phone Call
        </button>
      </div>
      <div style={{ marginTop: '30px', fontSize: '14px', color: '#666' }}>
        <p>Phone: +91 8838686407</p>
        <p>Email: electrostore2511@gmail.com</p>
        <p>Address: 275 - A, Opposite to Essar Petrol Bunk, Veppampalayam Pirivu, Mettukadai-638107</p>
      </div>
    </div>
  );
};

export default TestContacts;

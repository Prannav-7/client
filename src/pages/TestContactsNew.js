import React, { useState } from 'react';
import Header from '../components/Header';

const TestContactsNew = () => {
  const [testResults, setTestResults] = useState([]);

  const addTestResult = (test, result) => {
    setTestResults(prev => [...prev, { test, result, timestamp: new Date().toLocaleTimeString() }]);
  };

  const handleWhatsAppTest = () => {
    const phone = "918838686407";
    const message = encodeURIComponent("Hi! I'm testing the WhatsApp integration from Jai Maruthi Electricals website.");
    
    try {
      // Try multiple WhatsApp methods
      const whatsappWeb = `https://web.whatsapp.com/send?phone=${phone}&text=${message}`;
      const whatsappApp = `whatsapp://send?phone=${phone}&text=${message}`;
      
      const userAgent = navigator.userAgent;
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      
      if (isMobile) {
        window.location.href = whatsappApp;
        setTimeout(() => {
          window.open(whatsappWeb, '_blank');
        }, 1000);
        addTestResult("WhatsApp Mobile", "Attempted to open WhatsApp app, fallback to web");
      } else {
        window.open(whatsappWeb, '_blank');
        addTestResult("WhatsApp Desktop", "Opened WhatsApp Web in new tab");
      }
    } catch (error) {
      addTestResult("WhatsApp Error", error.message);
    }
  };

  const handleEmailTest = () => {
    const email = "electrostore2511@gmail.com";
    const subject = encodeURIComponent("Test Email from Website");
    const body = encodeURIComponent(`This is a test email from the Jai Maruthi Electricals website contact system.

Testing email functionality.

Best regards,
Website Visitor`);
    
    try {
      const mailtoLink = `mailto:${email}?subject=${subject}&body=${body}`;
      window.location.href = mailtoLink;
      addTestResult("Email Client", "Opened default email client");
    } catch (error) {
      addTestResult("Email Error", error.message);
    }
  };

  const handleGmailTest = () => {
    const email = "electrostore2511@gmail.com";
    const subject = encodeURIComponent("Test Email from Website - Gmail Web");
    const body = encodeURIComponent(`This is a test email from the Jai Maruthi Electricals website using Gmail Web.

Testing Gmail web functionality.

Best regards,
Website Visitor`);
    
    try {
      const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`;
      window.open(gmailLink, '_blank');
      addTestResult("Gmail Web", "Opened Gmail web interface");
    } catch (error) {
      addTestResult("Gmail Error", error.message);
    }
  };

  const handlePhoneTest = () => {
    try {
      window.location.href = "tel:+918838686407";
      addTestResult("Phone Call", "Initiated phone call");
    } catch (error) {
      addTestResult("Phone Error", error.message);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#f8f9fb', minHeight: '100vh' }}>
      <Header />
      
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          margin: '0 0 30px 0', 
          textAlign: 'center',
          color: '#333',
          fontWeight: '700'
        }}>
          🧪 Contact Methods Test Center
        </h1>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '30px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          marginBottom: '30px'
        }}>
          <h2 style={{ marginBottom: '20px', color: '#333' }}>Test Contact Methods</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <button
              onClick={handleWhatsAppTest}
              style={{
                padding: '15px 20px',
                backgroundColor: '#25D366',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#20B954'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#25D366'}
            >
              💬 Test WhatsApp
            </button>

            <button
              onClick={handleEmailTest}
              style={{
                padding: '15px 20px',
                backgroundColor: '#FF6B6B',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#FF5252'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#FF6B6B'}
            >
              📧 Test Email Client
            </button>

            <button
              onClick={handleGmailTest}
              style={{
                padding: '15px 20px',
                backgroundColor: '#4285F4',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#3367D6'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#4285F4'}
            >
              📬 Test Gmail Web
            </button>

            <button
              onClick={handlePhoneTest}
              style={{
                padding: '15px 20px',
                backgroundColor: '#34C759',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#2DAA4A'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#34C759'}
            >
              📞 Test Phone Call
            </button>
          </div>
        </div>

        {/* Test Results */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '30px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0, color: '#333' }}>Test Results</h2>
            <button
              onClick={clearResults}
              style={{
                padding: '8px 16px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Clear Results
            </button>
          </div>

          {testResults.length === 0 ? (
            <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
              No tests performed yet. Click the buttons above to test contact methods.
            </p>
          ) : (
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {testResults.map((result, index) => (
                <div
                  key={index}
                  style={{
                    padding: '12px',
                    margin: '8px 0',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '6px',
                    borderLeft: '4px solid #007bff'
                  }}
                >
                  <div style={{ fontWeight: 'bold', color: '#333' }}>
                    {result.test} - {result.timestamp}
                  </div>
                  <div style={{ color: '#666', marginTop: '4px' }}>
                    {result.result}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contact Information */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '30px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          marginTop: '30px'
        }}>
          <h2 style={{ marginBottom: '20px', color: '#333' }}>📞 Contact Information</h2>
          <div style={{ color: '#666', lineHeight: '1.6' }}>
            <p><strong>📧 Email:</strong> electrostore2511@gmail.com</p>
            <p><strong>📱 Phone & WhatsApp:</strong> +91 8838686407</p>
            <p><strong>📍 Address:</strong> 275 - A, Opposite to Essar Petrol Bunk, Veppampalayam Pirivu, Mettukadai-638107</p>
            <p><strong>🕒 Business Hours:</strong> Monday to Sunday, 8:30 AM - 8:30 PM</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestContactsNew;

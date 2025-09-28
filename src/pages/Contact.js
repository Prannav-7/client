// src/pages/Contact.js
import React, { useState } from 'react';
import Header from '../components/Header';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  // Store address for map integration
  const storeAddress = "Jai Maruthi Electricals & Hardware Store, 275 - A, Opposite to Essar Petrol Bunk, Veppampalayam Pirivu, Mettukadai-638107, Tamil Nadu, India";

  const handleLocationClick = () => {
    // Open Google Maps with the store location
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(storeAddress)}`;
    window.open(mapsUrl, '_blank');
  };

  const handleDirectionsClick = () => {
    // Open Google Maps with directions to the store
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(storeAddress)}`;
    window.open(directionsUrl, '_blank');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Create email content
      const emailContent = {
        to: 'info.jaimaaruthi@gmail.com',
        subject: `Contact Form: ${formData.subject || 'General Inquiry'}`,
        body: `
Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone || 'Not provided'}
Subject: ${formData.subject}

Message:
${formData.message}

---
This message was sent from the Jai Maruthi Electricals website contact form.
        `
      };

      // For now, use mailto as a fallback since we don't have email service configured
      const subject = encodeURIComponent(emailContent.subject);
      const body = encodeURIComponent(emailContent.body);
      
      // Open email client
      window.location.href = `mailto:info.jaimaaruthi@gmail.com?subject=${subject}&body=${body}`;

      setSuccess('✅ Email client opened! Please send the email from your email application.');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      console.error('Error sending message:', error);
      alert('❌ There was an error. Please try again or contact us directly.');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppClick = () => {
    const phone = "918838686407";
    const message = encodeURIComponent("Hi! I'm interested in your electrical products from Jaimaaruthi Electricals and Hardware. Please provide more information.");
    
    // Check if user is on mobile device
    const userAgent = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    
    // Simple WhatsApp URL
    const whatsappUrl = `https://wa.me/${phone}?text=${message}`;
    
    try {
      if (isMobile) {
        // Try app first on mobile
        window.location.href = `whatsapp://send?phone=${phone}&text=${message}`;
        
        // Fallback to web after a short delay if app doesn't open
        setTimeout(() => {
          try {
            window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
          } catch (fallbackError) {
            alert(`Contact us:\n\nPhone: +91 8838686407\nWhatsApp: wa.me/918838686407\nEmail: info.jaimaaruthi@gmail.com`);
          }
        }, 3000);
      } else {
        // On desktop, try wa.me first
        const newWindow = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
        
        // Check if window was blocked or failed to open
        setTimeout(() => {
          if (!newWindow || newWindow.closed) {
            // Simple contact options
            alert(`Contact us:\n\nPhone: +91 8838686407\nWhatsApp: wa.me/918838686407\nEmail: info.jaimaaruthi@gmail.com`);
          }
        }, 2000);
      }
      
      console.log('WhatsApp link attempted');
    } catch (error) {
      console.error('WhatsApp error:', error);
      // Simple, clean contact information
      alert(`Contact Jaimaaruthi Electricals:\n\nPhone: +91 8838686407\nEmail: info.jaimaaruthi@gmail.com\nWhatsApp: wa.me/918838686407\n\nStore: 275-A, Opposite to Essar Petrol Bunk\nVeppampalayam Pirivu, Mettukadai-638107`);
    }
  };

  const handleEmailClick = () => {
    const email = "info.jaimaaruthi@gmail.com";
    const subject = encodeURIComponent("Inquiry from Jai Maruthi Electricals Website");
    const body = encodeURIComponent(`Hi,

I would like to inquire about your electrical products and services.

Please contact me at your earliest convenience.

Best regards,`);
    
    // Try to open email client first
    try {
      const mailtoLink = `mailto:${email}?subject=${subject}&body=${body}`;
      window.location.href = mailtoLink;
      
      // Show success message
      setTimeout(() => {
        alert("✅ Email client opened successfully! If it didn't open, please copy this email: info.jaimaaruthi@gmail.com");
      }, 1000);
    } catch (error) {
      // Fallback to Gmail web interface
      const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${encodeURIComponent(body)}`;
      window.open(gmailLink, '_blank');
      alert("📧 Opening Gmail web interface...");
    }
  };

  const handlePhoneClick = () => {
    window.location.href = "tel:+918838686407";
  };

  return (
    <div className="overflow-fix full-width" style={{ 
      fontFamily: 'Inter, sans-serif', 
      backgroundColor: '#f8f9fb', 
      minHeight: '100vh',
      width: '100%',
      maxWidth: '100vw',
      overflowX: 'hidden',
      boxSizing: 'border-box'
    }}>
      <Header />
      
      {/* Hero Section - Mobile First */}
      <section className="hero-section full-width" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: window.innerWidth <= 768 ? '40px 0 30px 0' : '80px 0 60px 0',
        textAlign: 'center',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div className="container" style={{ 
          maxWidth: window.innerWidth <= 768 ? '100%' : '800px', 
          margin: '0 auto', 
          padding: '0 12px',
          boxSizing: 'border-box'
        }}>
          <h1 className="hero-title text-wrap" style={{ 
            fontSize: window.innerWidth <= 768 ? '28px' : '3rem', 
            margin: '0 0 20px 0', 
            fontWeight: '700',
            lineHeight: '1.2'
          }}>
            📞 Contact Us
          </h1>
          <p className="text-wrap" style={{ 
            fontSize: window.innerWidth <= 768 ? '16px' : '1.2rem', 
            margin: '0', 
            opacity: '0.9',
            lineHeight: '1.6',
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            Get in touch with our electrical experts. We're here to help with all your electrical needs!
          </p>
        </div>
      </section>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'start' }}>
          
          {/* Contact Information */}
          <div>
            <h2 style={{ 
              fontSize: '2.2rem', 
              color: '#2c3e50', 
              marginBottom: '30px',
              fontWeight: '600'
            }}>
              Get In Touch
            </h2>
            
            <div style={{ marginBottom: '40px' }}>
              <p style={{ 
                fontSize: '1.1rem', 
                color: '#666', 
                lineHeight: '1.7',
                marginBottom: '30px'
              }}>
                Have questions about our electrical products or services? We're here to help! 
                Reach out to us through any of the channels below, and our team will get back to you promptly.
              </p>
            </div>

            {/* Contact Cards */}
            <div style={{ display: 'grid', gap: '20px', marginBottom: '40px' }}>
              
              {/* Phone */}
              <div className="contact-card" style={{
                background: 'white',
                padding: '25px',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                cursor: 'pointer'
              }}
              onClick={handlePhoneClick}
              >
                <div style={{
                  width: '60px',
                  height: '60px',
                  background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem'
                }}>
                  📞
                </div>
                <div>
                  <h4 style={{ margin: '0 0 8px 0', color: '#2c3e50', fontWeight: '600' }}>Phone</h4>
                  <p style={{ margin: '0', color: '#666' }}>+91 8838686407</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: '#999' }}>Click to call directly</p>
                </div>
              </div>

              {/* Email */}
              <div className="contact-card" style={{
                background: 'white',
                padding: '25px',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                cursor: 'pointer'
              }}
              onClick={handleEmailClick}
              >
                <div style={{
                  width: '60px',
                  height: '60px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem'
                }}>
                  ✉️
                </div>
                <div>
                  <h4 style={{ margin: '0 0 8px 0', color: '#2c3e50', fontWeight: '600' }}>Email</h4>
                  <p style={{ margin: '0', color: '#666' }}>info.jaimaaruthi@gmail.com</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: '#999' }}>Click to send email</p>
                </div>
              </div>

              {/* WhatsApp */}
              <div className="contact-card" style={{
                background: 'white',
                padding: '25px',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                cursor: 'pointer'
              }}
              onClick={handleWhatsAppClick}
              >
                <div style={{
                  width: '60px',
                  height: '60px',
                  background: 'linear-gradient(135deg, #25D366 0%, #1EAA5A 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem'
                }}>
                  💬
                </div>
                <div>
                  <h4 style={{ margin: '0 0 8px 0', color: '#2c3e50', fontWeight: '600' }}>WhatsApp</h4>
                  <p style={{ margin: '0', color: '#666' }}>+91 8838686407</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: '#999' }}>Click to chat instantly</p>
                </div>
              </div>

              {/* Address */}
              <div className="contact-card" style={{
                background: 'white',
                padding: '25px',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem'
                }}>
                  📍
                </div>
                <div>
                  <h4 style={{ margin: '0 0 8px 0', color: '#2c3e50', fontWeight: '600' }}>Address</h4>
                  <p style={{ margin: '0 0 15px 0', color: '#666', lineHeight: '1.5' }}>
                    Jai Maruthi Electricals & Hardware Store<br />
                    275 - A, Opposite to Essar Petrol Bunk,<br />
                    Veppampalayam Pirivu, Mettukadai-638107
                  </p>
                  
                  {/* Live Location Buttons */}
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button 
                      onClick={handleLocationClick}
                      style={{
                        background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
                        color: 'white',
                        border: 'none',
                        padding: '10px 16px',
                        borderRadius: '25px',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)'
                      }}
                      onMouseOver={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 20px rgba(255, 107, 107, 0.4)';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 15px rgba(255, 107, 107, 0.3)';
                      }}
                    >
                      📍 View on Map
                    </button>
                    <button 
                      onClick={handleDirectionsClick}
                      style={{
                        background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
                        color: 'white',
                        border: 'none',
                        padding: '10px 16px',
                        borderRadius: '25px',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 15px rgba(78, 205, 196, 0.3)'
                      }}
                      onMouseOver={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 20px rgba(78, 205, 196, 0.4)';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 15px rgba(78, 205, 196, 0.3)';
                      }}
                    >
                      🗺️ Get Directions
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Contact Buttons */}
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <button 
                onClick={handleWhatsAppClick}
                style={{
                  background: 'linear-gradient(135deg, #25D366 0%, #1EAA5A 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '15px 25px',
                  borderRadius: '50px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'transform 0.3s ease',
                  boxShadow: '0 4px 15px rgba(37, 211, 102, 0.3)'
                }}
                onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
              >
                💬 WhatsApp Now
              </button>
              <button 
                onClick={handleEmailClick}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '15px 25px',
                  borderRadius: '50px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'transform 0.3s ease',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                }}
                onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
              >
                ✉️ Send Email
              </button>
            </div>
          </div>

          {/* Contact Form */}
          <div className="contact-form-container" style={{
            background: 'white',
            padding: window.innerWidth <= 768 ? '20px' : '40px',
            borderRadius: '20px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ 
              fontSize: '1.8rem', 
              color: '#2c3e50', 
              marginBottom: '25px',
              fontWeight: '600'
            }}>
              Send us a Message
            </h3>

            {success && (
              <div style={{
                background: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
                color: '#155724',
                padding: '15px 20px',
                borderRadius: '12px',
                marginBottom: '25px',
                border: '1px solid #c3e6cb'
              }}>
                ✅ {success}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-row" style={{ 
                display: 'grid', 
                gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : '1fr 1fr', 
                gap: window.innerWidth <= 768 ? '15px' : '20px', 
                marginBottom: window.innerWidth <= 768 ? '15px' : '20px' 
              }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: '500',
                    color: '#333'
                  }}>
                    👤 Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your full name"
                    style={{
                      width: '100%',
                      padding: window.innerWidth <= 768 ? '12px' : '15px',
                      border: '2px solid #e9ecef',
                      borderRadius: '12px',
                      fontSize: '16px',
                      transition: 'border-color 0.3s ease',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                  />
                </div>
                
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: '500',
                    color: '#333'
                  }}>
                    ✉️ Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter your email"
                    style={{
                      width: '100%',
                      padding: window.innerWidth <= 768 ? '12px' : '15px',
                      border: '2px solid #e9ecef',
                      borderRadius: '12px',
                      fontSize: '16px',
                      transition: 'border-color 0.3s ease',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                  />
                </div>
              </div>

              <div className="form-row" style={{ 
                display: 'grid', 
                gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : '1fr 1fr', 
                gap: window.innerWidth <= 768 ? '15px' : '20px', 
                marginBottom: window.innerWidth <= 768 ? '15px' : '20px' 
              }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: '500',
                    color: '#333'
                  }}>
                    📞 Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    style={{
                      width: '100%',
                      padding: window.innerWidth <= 768 ? '12px' : '15px',
                      border: '2px solid #e9ecef',
                      borderRadius: '12px',
                      fontSize: '16px',
                      transition: 'border-color 0.3s ease',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: '500',
                    color: '#333'
                  }}>
                    📝 Subject *
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: window.innerWidth <= 768 ? '12px' : '15px',
                      border: '2px solid #e9ecef',
                      borderRadius: '12px',
                      fontSize: '16px',
                      transition: 'border-color 0.3s ease',
                      outline: 'none',
                      backgroundColor: 'white',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                  >
                    <option value="">Select a subject</option>
                    <option value="product-inquiry">Product Inquiry</option>
                    <option value="bulk-order">Bulk Order</option>
                    <option value="technical-support">Technical Support</option>
                    <option value="complaint">Complaint</option>
                    <option value="suggestion">Suggestion</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: window.innerWidth <= 768 ? '20px' : '25px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '500',
                  color: '#333'
                }}>
                  💬 Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={window.innerWidth <= 768 ? "4" : "6"}
                  placeholder="Tell us how we can help you..."
                  style={{
                    width: '100%',
                    padding: window.innerWidth <= 768 ? '12px' : '15px',
                    border: '2px solid #e9ecef',
                    borderRadius: '12px',
                    fontSize: '16px',
                    transition: 'border-color 0.3s ease',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: window.innerWidth <= 768 ? '16px' : '18px',
                  background: loading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: window.innerWidth <= 768 ? '16px' : '1.1rem',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                  marginTop: window.innerWidth <= 768 ? '15px' : '20px'
                }}
                onMouseOver={(e) => {
                  if (!loading) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!loading) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
                  }
                }}
              >
                {loading ? '📤 Sending...' : '📧 Send Message'}
              </button>
            </form>
          </div>
        </div>

        {/* Live Location Map Section */}
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '20px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          marginTop: '60px'
        }}>
          <h3 style={{ 
            fontSize: '1.8rem', 
            color: '#2c3e50', 
            marginBottom: '30px',
            fontWeight: '600',
            textAlign: 'center'
          }}>
            📍 Find Our Store
          </h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '40px',
            alignItems: 'center'
          }}>
            {/* Map Container */}
            <div style={{
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              borderRadius: '15px',
              padding: '20px',
              textAlign: 'center',
              minHeight: '300px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Interactive Map Placeholder */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                opacity: 0.1
              }}></div>
              
              <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{ 
                  fontSize: '4rem', 
                  marginBottom: '20px',
                  filter: 'drop-shadow(0 5px 15px rgba(102, 126, 234, 0.3))'
                }}>
                  🗺️
                </div>
                <h4 style={{ 
                  margin: '0 0 15px 0', 
                  color: '#2c3e50',
                  fontSize: '1.3rem',
                  fontWeight: '600'
                }}>
                  Interactive Store Location
                </h4>
                <p style={{ 
                  margin: '0 0 25px 0', 
                  color: '#666',
                  lineHeight: '1.6'
                }}>
                  Click below to open Google Maps and get real-time directions to our store.
                </p>
                
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button 
                    onClick={handleLocationClick}
                    style={{
                      background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
                      color: 'white',
                      border: 'none',
                      padding: '15px 25px',
                      borderRadius: '30px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 6px 20px rgba(255, 107, 107, 0.3)'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.transform = 'translateY(-3px)';
                      e.target.style.boxShadow = '0 8px 25px rgba(255, 107, 107, 0.4)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 6px 20px rgba(255, 107, 107, 0.3)';
                    }}
                  >
                    🎯 Open in Maps
                  </button>
                  <button 
                    onClick={handleDirectionsClick}
                    style={{
                      background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
                      color: 'white',
                      border: 'none',
                      padding: '15px 25px',
                      borderRadius: '30px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 6px 20px rgba(78, 205, 196, 0.3)'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.transform = 'translateY(-3px)';
                      e.target.style.boxShadow = '0 8px 25px rgba(78, 205, 196, 0.4)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 6px 20px rgba(78, 205, 196, 0.3)';
                    }}
                  >
                    🧭 Get Directions
                  </button>
                </div>
              </div>
            </div>

            {/* Store Information */}
            <div>
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '30px',
                borderRadius: '15px',
                marginBottom: '20px'
              }}>
                <h4 style={{ 
                  margin: '0 0 15px 0', 
                  fontSize: '1.4rem',
                  fontWeight: '600'
                }}>
                  🏪 Store Location
                </h4>
                <p style={{ 
                  margin: '0 0 20px 0', 
                  fontSize: '1.1rem',
                  lineHeight: '1.6',
                  opacity: 0.95
                }}>
                  <strong>Jai Maruthi Electricals & Hardware Store</strong><br />
                  275 - A, Opposite to Essar Petrol Bunk,<br />
                  Veppampalayam Pirivu, Mettukadai-638107<br />
                  Tamil Nadu, India
                </p>
              </div>

              <div style={{ display: 'grid', gap: '15px' }}>
                <div style={{
                  background: '#f8f9fa',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '2px solid #e9ecef'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{
                      width: '50px',
                      height: '50px',
                      background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem'
                    }}>
                      🚗
                    </div>
                    <div>
                      <h5 style={{ margin: '0 0 5px 0', color: '#2c3e50', fontWeight: '600' }}>
                        Easy to Find
                      </h5>
                      <p style={{ margin: '0', color: '#666', fontSize: '0.9rem' }}>
                        Located opposite Essar Petrol Bunk for easy identification
                      </p>
                    </div>
                  </div>
                </div>

                <div style={{
                  background: '#f8f9fa',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '2px solid #e9ecef'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{
                      width: '50px',
                      height: '50px',
                      background: 'linear-gradient(135deg, #ffc107 0%, #ff8f00 100%)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem'
                    }}>
                      🅿️
                    </div>
                    <div>
                      <h5 style={{ margin: '0 0 5px 0', color: '#2c3e50', fontWeight: '600' }}>
                        Parking Available
                      </h5>
                      <p style={{ margin: '0', color: '#666', fontSize: '0.9rem' }}>
                        Convenient parking space available for customers
                      </p>
                    </div>
                  </div>
                </div>

                <div style={{
                  background: '#f8f9fa',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '2px solid #e9ecef'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{
                      width: '50px',
                      height: '50px',
                      background: 'linear-gradient(135deg, #6f42c1 0%, #e83e8c 100%)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem'
                    }}>
                      📍
                    </div>
                    <div>
                      <h5 style={{ margin: '0 0 5px 0', color: '#2c3e50', fontWeight: '600' }}>
                        Prime Location
                      </h5>
                      <p style={{ margin: '0', color: '#666', fontSize: '0.9rem' }}>
                        Easily accessible from all parts of Mettukadai and surrounding areas
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Business Hours */}
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '20px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          marginTop: '60px',
          textAlign: 'center'
        }}>
          <h3 style={{ 
            fontSize: '1.8rem', 
            color: '#2c3e50', 
            marginBottom: '30px',
            fontWeight: '600'
          }}>
            🕒 Business Hours
          </h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '20px',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            <div style={{
              padding: '20px',
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              borderRadius: '12px'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>Monday - Friday</h4>
              <p style={{ margin: '0', color: '#666', fontWeight: '500' }}>8:30 AM - 8:30 PM</p>
            </div>
            <div style={{
              padding: '20px',
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              borderRadius: '12px'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>Saturday</h4>
              <p style={{ margin: '0', color: '#666', fontWeight: '500' }}>8:30 AM - 8:30 PM</p>
            </div>
            <div style={{
              padding: '20px',
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              borderRadius: '12px'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>Sunday</h4>
              <p style={{ margin: '0', color: '#666', fontWeight: '500' }}>8:30 AM - 8:30 PM</p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Styles */}
      <style>{`
        .contact-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 30px rgba(0,0,0,0.15);
        }

        @media (max-width: 768px) {
          .grid-responsive {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Contact;

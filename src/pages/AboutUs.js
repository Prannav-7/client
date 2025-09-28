// src/pages/AboutUs.js
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';

const AboutUs = () => {
  return (
    <div>
      <Header />
      <div style={{ backgroundColor: '#f8f9fa' }}>
        {/* Hero Section */}
        <section style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '80px 0',
          textAlign: 'center'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '20px', fontWeight: 'bold' }}>
              About JAI MARUTHI ELECTRICALS
            </h1>
            <p style={{ fontSize: '1.2rem', opacity: '0.9', maxWidth: '600px', margin: '0 auto' }}>
              Your trusted partner in electrical solutions for over 14 years, serving customers with quality products and exceptional service.
            </p>
          </div>
        </section>

        {/* Main Content */}
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' }}>
          
          {/* Company Overview */}
          <section style={{ marginBottom: '60px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '20px', color: '#333' }}>
                  Our Story
                </h2>
                <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#666', marginBottom: '20px' }}>
                  Established in 2010, JAI MARUTHI ELECTRICALS has been at the forefront of providing 
                  high-quality electrical products and solutions to residential, commercial, and industrial 
                  customers across the region.
                </p>
                <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#666' }}>
                  What started as a small electrical shop has grown into a comprehensive electrical 
                  solutions provider, offering everything from basic switches to advanced industrial 
                  equipment.
                </p>
              </div>
              <div style={{
                backgroundColor: '#667eea',
                borderRadius: '15px',
                padding: '40px',
                color: 'white',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>⚡</div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>14+ Years</h3>
                <p style={{ opacity: '0.9' }}>Of Excellence in Electrical Solutions</p>
              </div>
            </div>
          </section>

          {/* Mission & Vision */}
          <section style={{ marginBottom: '60px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
              <div style={{
                backgroundColor: 'white',
                padding: '40px',
                borderRadius: '15px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🎯</div>
                <h3 style={{ fontSize: '1.8rem', marginBottom: '20px', color: '#333' }}>Our Mission</h3>
                <p style={{ color: '#666', lineHeight: '1.6' }}>
                  To provide our customers with the highest quality electrical products and exceptional 
                  service, ensuring safe and reliable electrical solutions for every need.
                </p>
              </div>
              <div style={{
                backgroundColor: 'white',
                padding: '40px',
                borderRadius: '15px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🔮</div>
                <h3 style={{ fontSize: '1.8rem', marginBottom: '20px', color: '#333' }}>Our Vision</h3>
                <p style={{ color: '#666', lineHeight: '1.6' }}>
                  To be the leading electrical solutions provider in the region, known for innovation, 
                  quality, and customer satisfaction in all our endeavors.
                </p>
              </div>
            </div>
          </section>

          {/* Why Choose Us */}
          <section style={{ marginBottom: '60px' }}>
            <h2 style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '40px', color: '#333' }}>
              Why Choose Us?
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>
              {[
                { icon: '✅', title: 'Genuine Products', desc: 'All products are sourced directly from authorized manufacturers' },
                { icon: '🚚', title: 'Fast Delivery', desc: 'Quick and reliable delivery to your doorstep' },
                { icon: '🔧', title: 'Expert Support', desc: 'Technical assistance from experienced professionals' },
                { icon: '💯', title: '14+ Years Experience', desc: 'Trusted by thousands of satisfied customers' },
                { icon: '🏆', title: 'Quality Assurance', desc: 'Rigorous quality checks on all products' },
                { icon: '💰', title: 'Competitive Pricing', desc: 'Best prices in the market with no compromise on quality' }
              ].map((feature, index) => (
                <div key={index} style={{
                  backgroundColor: 'white',
                  padding: '30px',
                  borderRadius: '10px',
                  boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>{feature.icon}</div>
                  <h4 style={{ fontSize: '1.2rem', marginBottom: '10px', color: '#333' }}>{feature.title}</h4>
                  <p style={{ color: '#666', fontSize: '0.95rem' }}>{feature.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Services */}
          <section style={{ marginBottom: '60px' }}>
            <h2 style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '40px', color: '#333' }}>
              Our Services
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
              {[
                {
                  title: 'Electrical Consultation',
                  desc: 'Expert advice on electrical installations and upgrades',
                  icon: '🔍'
                },
                {
                  title: 'Bulk Supply',
                  desc: 'Special pricing for contractors and bulk orders',
                  icon: '📦'
                },
                {
                  title: 'Installation Support',
                  desc: 'Guidance and support for proper installation',
                  icon: '🔧'
                },
                {
                  title: 'After-Sales Service',
                  desc: 'Comprehensive support even after purchase',
                  icon: '🛠️'
                }
              ].map((service, index) => (
                <div key={index} style={{
                  backgroundColor: 'white',
                  padding: '30px',
                  borderRadius: '15px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  border: '1px solid #eee'
                }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>{service.icon}</div>
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '15px', color: '#333' }}>{service.title}</h3>
                  <p style={{ color: '#666', lineHeight: '1.5' }}>{service.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Contact Info */}
          <section style={{
            backgroundColor: 'white',
            padding: '50px',
            borderRadius: '15px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '30px', color: '#333' }}>
              Get in Touch
            </h2>
            <p style={{ fontSize: '1.1rem', marginBottom: '30px', color: '#666' }}>
              Ready to start your electrical project? Contact us today for a consultation.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap' }}>
              <Link 
                to="/products"
                style={{
                  backgroundColor: '#667eea',
                  color: 'white',
                  padding: '15px 30px',
                  borderRadius: '25px',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  display: 'inline-block'
                }}
              >
                🛒 Browse Products
              </Link>
              <a 
                href="tel:+919876543210"
                style={{
                  backgroundColor: '#28a745',
                  color: 'white',
                  padding: '15px 30px',
                  borderRadius: '25px',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  display: 'inline-block'
                }}
              >
                📞 Call Us Now
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;

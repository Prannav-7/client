import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import AdminIndicator from '../components/AdminIndicator';
import SalesDashboard from '../components/SalesDashboard';
import ProfessionalSalesAnalytics from '../components/ProfessionalSalesAnalytics';
import CustomerOrders from '../components/CustomerOrders';
import AuthDebug from '../components/AuthDebug';
import { useAdmin } from '../hooks/useAdmin';
import api from '../api';
import PDFReportGenerator from '../utils/pdfReportGenerator';

const NewAdminDashboard = () => {
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [activeTab, setActiveTab] = useState('products');
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalValue: 0,
    lowStock: 0,
    outOfStock: 0
  });

  const categories = [
    'Electrical Goods',
    'Hardware & Tools', 
    'Wiring & Cables',
    'Switches & Sockets',
    'Lighting Solutions',
    'Fans & Ventilation',
    'Electrical Motors',
    'Safety Equipment'
  ];

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    fetchProducts();
  }, [isAdmin, navigate]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products');
      if (response.data?.data) {
        setProducts(response.data.data);
        calculateStats(response.data.data);
      } else if (response.data?.products) {
        setProducts(response.data.products);
        calculateStats(response.data.products);
      } else if (Array.isArray(response.data)) {
        setProducts(response.data);
        calculateStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Failed to fetch products. Please check if the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (productsData) => {
    const totalProducts = productsData.length;
    const totalValue = productsData.reduce((sum, product) => sum + (product.price * product.stock), 0);
    const lowStock = productsData.filter(product => product.stock > 0 && product.stock <= 10).length;
    const outOfStock = productsData.filter(product => product.stock === 0).length;

    setStats({
      totalProducts,
      totalValue,
      lowStock,
      outOfStock
    });
  };

  const handleDeleteProduct = async (productId, productName) => {
    const confirmMessage = `Are you sure you want to delete "${productName}"?\\n\\nType "DELETE" to confirm:`;
    const userInput = window.prompt(confirmMessage);
    
    if (userInput !== 'DELETE') {
      if (userInput !== null) {
        alert('Product deletion cancelled. You must type "DELETE" exactly to confirm.');
      }
      return;
    }

    try {
      const response = await api.delete(`/products/${productId}`);
      if (response.data?.success) {
        const updatedProducts = products.filter(product => product._id !== productId);
        setProducts(updatedProducts);
        calculateStats(updatedProducts);
        alert(`✅ Product "${productName}" deleted successfully!`);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert(`❌ Failed to delete product: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleUpdateProduct = async (productId, updatedData) => {
    try {
      const response = await api.put(`/products/${productId}`, updatedData);
      if (response.data?.success || response.data?._id) {
        const updatedProducts = products.map(product => 
          product._id === productId ? { ...product, ...updatedData } : product
        );
        setProducts(updatedProducts);
        setEditingProduct(null);
        calculateStats(updatedProducts);
        alert(`✅ Product updated successfully!`);
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert(`❌ Failed to update product: ${error.response?.data?.message || error.message}`);
    }
  };

  // PDF Report Generation Functions
  const handleMonthlyReport = async () => {
    try {
      const success = await PDFReportGenerator.generateMonthlyReport();
      if (success) {
        alert('✅ Monthly report generated and downloaded successfully!');
      }
    } catch (error) {
      console.error('Error generating monthly report:', error);
      alert('❌ Failed to generate monthly report. Please try again.');
    }
  };

  const handleYearlyReport = async () => {
    try {
      const success = await PDFReportGenerator.generateYearlyReport();
      if (success) {
        alert('✅ Yearly report generated and downloaded successfully!');
      }
    } catch (error) {
      console.error('Error generating yearly report:', error);
      alert('❌ Failed to generate yearly report. Please try again.');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === '' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="professional-admin-dashboard" style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 25%, #2d3561 50%, #1a1f3a 75%, #0a0e27 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Elements */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: `
          radial-gradient(circle at 20% 80%, rgba(255, 215, 0, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(0, 188, 212, 0.08) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(102, 126, 234, 0.06) 0%, transparent 50%)
        `,
        pointerEvents: 'none',
        zIndex: 0
      }}></div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <Header />
        
        {/* Professional Admin Header */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(26, 32, 44, 0.95) 0%, rgba(45, 55, 72, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 215, 0, 0.2)',
          color: '#f7fafc',
          padding: '50px 0',
          textAlign: 'center',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
          animation: 'headerSlideIn 1s ease-out'
        }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}>
            <h1 style={{
              fontSize: '3.5rem',
              fontWeight: '900',
              margin: '0 0 15px 0',
              background: 'linear-gradient(135deg, #ffd700 0%, #ff8c00 50%, #00bcd4 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 4px 20px rgba(255, 215, 0, 0.3)',
              letterSpacing: '-1px'
            }}>
              ⚡ Executive Dashboard
            </h1>
            <p style={{
              fontSize: '1.4rem',
              opacity: '0.9',
              margin: 0,
              color: '#cbd5e0',
              fontWeight: '300',
              letterSpacing: '0.5px'
            }}>
              Premium Business Intelligence & Management System
            </p>
          </div>
        </div>

        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '50px 20px' }}>
          {/* Professional Statistics Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '25px',
            marginBottom: '50px'
          }}>
            {[
              { 
                icon: '📦', 
                value: stats.totalProducts, 
                label: 'Total Products',
                gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                shadow: 'rgba(102, 126, 234, 0.4)',
                delay: '0.1s'
              },
              { 
                icon: '💰', 
                value: `₹${stats.totalValue.toLocaleString()}`, 
                label: 'Total Inventory Value',
                gradient: 'linear-gradient(135deg, #ffd700 0%, #ff8c00 100%)',
                shadow: 'rgba(255, 215, 0, 0.4)',
                delay: '0.2s'
              },
              { 
                icon: '⚠️', 
                value: stats.lowStock, 
                label: 'Low Stock Alert',
                gradient: 'linear-gradient(135deg, #ff9500 0%, #ff6b35 100%)',
                shadow: 'rgba(255, 149, 0, 0.4)',
                delay: '0.3s'
              },
              { 
                icon: '🚫', 
                value: stats.outOfStock, 
                label: 'Out of Stock',
                gradient: 'linear-gradient(135deg, #ff4757 0%, #ff3838 100%)',
                shadow: 'rgba(255, 71, 87, 0.4)',
                delay: '0.4s'
              }
            ].map((stat, index) => (
              <div
                key={index}
                style={{
                  background: 'linear-gradient(135deg, rgba(45, 55, 72, 0.95) 0%, rgba(26, 32, 44, 0.95) 100%)',
                  backdropFilter: 'blur(20px)',
                  color: '#f7fafc',
                  padding: '35px',
                  borderRadius: '24px',
                  textAlign: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: `0 15px 45px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)`,
                  position: 'relative',
                  overflow: 'hidden',
                  animation: `cardSlideUp 0.8s ease-out ${stat.delay}`,
                  animationFillMode: 'both',
                  transition: 'all 0.4s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-10px) scale(1.02)';
                  e.target.style.boxShadow = `0 25px 60px rgba(0, 0, 0, 0.4), 0 0 30px ${stat.shadow}`;
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0) scale(1)';
                  e.target.style.boxShadow = '0 15px 45px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)';
                }}
              >
                {/* Gradient border effect */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: stat.gradient,
                  borderRadius: '24px 24px 0 0'
                }}></div>
                
                <div style={{ 
                  fontSize: '4rem', 
                  marginBottom: '15px',
                  background: stat.gradient,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  animation: 'iconPulse 3s ease-in-out infinite'
                }}>
                  {stat.icon}
                </div>
                <div style={{ 
                  fontSize: '3rem', 
                  fontWeight: '900', 
                  marginBottom: '10px',
                  background: stat.gradient,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  animation: 'countUp 2s ease-out'
                }}>
                  {stat.value}
                </div>
                <div style={{ 
                  fontSize: '1.1rem', 
                  opacity: '0.8',
                  fontWeight: '500',
                  color: '#cbd5e0',
                  letterSpacing: '0.5px'
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Professional Tab Navigation */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(45, 55, 72, 0.95) 0%, rgba(26, 32, 44, 0.95) 100%)',
            backdropFilter: 'blur(20px)',
            borderRadius: '30px',
            padding: '25px',
            marginBottom: '40px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 15px 45px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ 
              display: 'flex', 
              gap: '15px', 
              justifyContent: 'center', 
              flexWrap: 'wrap',
              alignItems: 'center'
            }}>
              {[
                { id: 'products', label: 'Product Management', icon: '📦' },
                { id: 'analytics', label: 'Sales Analytics', icon: '📊' },
                { id: 'sales', label: 'Daily Sales Report', icon: '📈' },
                { id: 'orders', label: 'Customer Orders', icon: '🛍️' },
                { id: 'reports', label: 'Advanced Reports', icon: '📋', action: () => navigate('/sales-report') },
                { id: 'monthly-pdf', label: 'Monthly PDF Report', icon: '📄', action: handleMonthlyReport, isPdfButton: true },
                { id: 'yearly-pdf', label: 'Yearly PDF Report', icon: '📊', action: handleYearlyReport, isPdfButton: true }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => tab.action ? tab.action() : setActiveTab(tab.id)}
                  style={{
                    background: tab.isPdfButton
                      ? 'linear-gradient(135deg, #28a745 0%, #20c997 100%)'
                      : activeTab === tab.id 
                        ? 'linear-gradient(135deg, #ffd700 0%, #ff8c00 100%)'
                        : 'rgba(255, 255, 255, 0.05)',
                    color: tab.isPdfButton || activeTab === tab.id ? '#fff' : '#f7fafc',
                    border: tab.isPdfButton
                      ? 'none'
                      : activeTab === tab.id 
                        ? 'none' 
                        : '1px solid rgba(255, 255, 255, 0.2)',
                    padding: '15px 30px',
                    borderRadius: '20px',
                    fontSize: '16px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.4s ease',
                    boxShadow: tab.isPdfButton
                      ? '0 8px 25px rgba(40, 167, 69, 0.4)'
                      : activeTab === tab.id 
                        ? '0 10px 30px rgba(255, 215, 0, 0.4)'
                        : '0 5px 15px rgba(0, 0, 0, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== tab.id) {
                      e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== tab.id) {
                      e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.2)';
                    }
                  }}
                >
                  <span style={{ fontSize: '18px' }}>{tab.icon}</span>
                  {tab.label}
                  
                  {/* Shine effect for active tab */}
                  {activeTab === tab.id && (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                      animation: 'shine 2s infinite'
                    }}></div>
                  )}
                </button>
              ))}
            </div>
          </div>

        {/* Tab Content */}
        {activeTab === 'products' && (
          <div>
            {/* Professional Product Management Section */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(45, 55, 72, 0.95) 0%, rgba(26, 32, 44, 0.95) 100%)',
              backdropFilter: 'blur(20px)',
              borderRadius: '30px',
              padding: '40px',
              marginBottom: '40px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
              animation: 'contentFadeIn 0.8s ease-out'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '30px',
                flexWrap: 'wrap',
                gap: '20px'
              }}>
                <h2 style={{ 
                  fontSize: '2.2rem', 
                  fontWeight: '800', 
                  margin: 0, 
                  background: 'linear-gradient(135deg, #ffd700 0%, #ff8c00 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  📦 Product Management Hub
                </h2>
                <button
                  onClick={() => navigate('/add-product')}
                  style={{
                    background: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '18px 35px',
                    borderRadius: '25px',
                    fontSize: '16px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.4s ease',
                    boxShadow: '0 10px 30px rgba(0, 210, 255, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-3px) scale(1.05)';
                    e.target.style.boxShadow = '0 15px 40px rgba(0, 210, 255, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0) scale(1)';
                    e.target.style.boxShadow = '0 10px 30px rgba(0, 210, 255, 0.4)';
                  }}
                >
                  <span style={{ fontSize: '20px' }}>➕</span>
                  Add New Product
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                    animation: 'buttonShine 3s infinite'
                  }}></div>
                </button>
              </div>

              {/* Advanced Search and Filter */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
                gap: '25px',
                marginBottom: '35px'
              }}>
                <div>
                  <label style={{ 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#cbd5e0', 
                    marginBottom: '10px', 
                    display: 'block',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    🔍 Search Products
                  </label>
                  <input
                    type="text"
                    placeholder="Search by name, description, or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '15px 20px',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '15px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      background: 'rgba(26, 32, 44, 0.6)',
                      color: '#f7fafc',
                      backdropFilter: 'blur(10px)'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#ffd700';
                      e.target.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.3)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <div>
                  <label style={{ 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#cbd5e0', 
                    marginBottom: '10px', 
                    display: 'block',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    📂 Filter by Category
                  </label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '15px 20px',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '15px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      background: 'rgba(26, 32, 44, 0.6)',
                      color: '#f7fafc',
                      backdropFilter: 'blur(10px)',
                      cursor: 'pointer'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#ffd700';
                      e.target.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.3)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <option value="" style={{ background: '#1a202c', color: '#f7fafc' }}>All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category} style={{ background: '#1a202c', color: '#f7fafc' }}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {loading ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '80px',
                  background: 'rgba(26, 32, 44, 0.4)',
                  borderRadius: '20px',
                  backdropFilter: 'blur(10px)'
                }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    border: '8px solid rgba(255, 215, 0, 0.1)',
                    borderTop: '8px solid #ffd700',
                    borderRadius: '50%',
                    animation: 'professionalSpin 1.2s linear infinite',
                    marginBottom: '25px'
                  }}></div>
                  <p style={{ 
                    fontSize: '20px', 
                    color: '#cbd5e0',
                    fontWeight: '600',
                    margin: 0
                  }}>
                    Loading products...
                  </p>
                </div>
              ) : (
                <>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '25px',
                    padding: '15px 25px',
                    background: 'rgba(255, 215, 0, 0.1)',
                    borderRadius: '15px',
                    border: '1px solid rgba(255, 215, 0, 0.2)'
                  }}>
                    <p style={{ 
                      color: '#ffd700', 
                      margin: 0,
                      fontSize: '16px',
                      fontWeight: '600'
                    }}>
                      📊 Showing {filteredProducts.length} of {products.length} products
                    </p>
                    {filteredProducts.length > 0 && (
                      <div style={{ 
                        fontSize: '14px', 
                        color: '#cbd5e0',
                        display: 'flex',
                        gap: '20px'
                      }}>
                        <span>✅ In Stock: {filteredProducts.filter(p => p.stock > 10).length}</span>
                        <span>⚠️ Low Stock: {filteredProducts.filter(p => p.stock > 0 && p.stock <= 10).length}</span>
                        <span>🚫 Out of Stock: {filteredProducts.filter(p => p.stock === 0).length}</span>
                      </div>
                    )}
                  </div>
                  
                  {filteredProducts.length === 0 ? (
                    <div style={{
                      textAlign: 'center',
                      padding: '80px',
                      background: 'rgba(26, 32, 44, 0.4)',
                      borderRadius: '25px',
                      border: '2px dashed rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(10px)'
                    }}>
                      <div style={{ 
                        fontSize: '6rem', 
                        marginBottom: '25px',
                        background: 'linear-gradient(135deg, #ffd700 0%, #ff8c00 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}>
                        📦
                      </div>
                      <h3 style={{ 
                        color: '#f7fafc', 
                        marginBottom: '15px',
                        fontSize: '24px',
                        fontWeight: '700'
                      }}>
                        No products found
                      </h3>
                      <p style={{ 
                        color: '#a0aec0',
                        fontSize: '16px'
                      }}>
                        Try adjusting your search or filter criteria
                      </p>
                    </div>
                  ) : (
                    <div style={{ 
                      overflowX: 'auto',
                      background: 'rgba(26, 32, 44, 0.4)',
                      borderRadius: '20px',
                      backdropFilter: 'blur(10px)'
                    }}>
                      <table style={{ 
                        width: '100%', 
                        borderCollapse: 'collapse',
                        minWidth: '800px'
                      }}>
                        <thead>
                          <tr style={{ 
                            background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 140, 0, 0.2) 100%)',
                            borderBottom: '2px solid rgba(255, 215, 0, 0.3)'
                          }}>
                            {['Product Details', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map((header, index) => (
                              <th key={index} style={{ 
                                padding: '20px 15px', 
                                textAlign: index > 1 ? 'center' : 'left', 
                                color: '#ffd700', 
                                fontWeight: '800',
                                fontSize: '14px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                              }}>
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredProducts.map((product, index) => (
                            <ProductRow
                              key={product._id}
                              product={product}
                              index={index}
                              onEdit={setEditingProduct}
                              onDelete={handleDeleteProduct}
                              onUpdate={handleUpdateProduct}
                              isEditing={editingProduct?._id === product._id}
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && <ProfessionalSalesAnalytics />}
        {activeTab === 'sales' && <SalesDashboard />}
        {activeTab === 'orders' && <CustomerOrders />}
      </div>

      {/* Admin Mode Indicator */}
      <AdminIndicator showStatus={true} />
      
      {/* Auth Debug Info - Remove this in production */}
      <AuthDebug />
      </div>
    </div>
  );
};

// Professional Product Row Component
const ProductRow = ({ product, index, onEdit, onDelete, onUpdate, isEditing }) => {
  const [editData, setEditData] = useState({
    name: product.name,
    price: product.price,
    stock: product.stock,
    category: product.category,
    description: product.description
  });

  const handleSave = () => {
    onUpdate(product._id, editData);
  };

  const handleCancel = () => {
    onEdit(null);
    setEditData({
      name: product.name,
      price: product.price,
      stock: product.stock,
      category: product.category,
      description: product.description
    });
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { 
      text: 'Out of Stock', 
      color: '#ff4757', 
      bg: 'linear-gradient(135deg, rgba(255, 71, 87, 0.2) 0%, rgba(255, 56, 56, 0.1) 100%)',
      icon: '🚫'
    };
    if (stock <= 10) return { 
      text: 'Low Stock', 
      color: '#ffa502', 
      bg: 'linear-gradient(135deg, rgba(255, 165, 2, 0.2) 0%, rgba(255, 149, 0, 0.1) 100%)',
      icon: '⚠️'
    };
    return { 
      text: 'In Stock', 
      color: '#2ed573', 
      bg: 'linear-gradient(135deg, rgba(46, 213, 115, 0.2) 0%, rgba(45, 206, 112, 0.1) 100%)',
      icon: '✅'
    };
  };

  const stockStatus = getStockStatus(product.stock);

  return (
    <tr style={{ 
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      backgroundColor: index % 2 === 0 ? 'rgba(45, 55, 72, 0.3)' : 'rgba(26, 32, 44, 0.3)',
      transition: 'all 0.3s ease'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = 'rgba(255, 215, 0, 0.1)';
      e.currentTarget.style.transform = 'scale(1.01)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'rgba(45, 55, 72, 0.3)' : 'rgba(26, 32, 44, 0.3)';
      e.currentTarget.style.transform = 'scale(1)';
    }}>
      <td style={{ padding: '20px', verticalAlign: 'top' }}>
        {isEditing ? (
          <input
            type="text"
            value={editData.name}
            onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
            style={{
              width: '100%',
              padding: '12px 15px',
              border: '1px solid rgba(255, 215, 0, 0.3)',
              borderRadius: '12px',
              fontSize: '14px',
              background: 'rgba(26, 32, 44, 0.8)',
              color: '#f7fafc',
              outline: 'none'
            }}
          />
        ) : (
          <div>
            <div style={{ 
              fontWeight: '700', 
              color: '#f7fafc', 
              marginBottom: '8px',
              fontSize: '16px'
            }}>
              {product.name}
            </div>
            <div style={{ 
              fontSize: '13px', 
              color: '#a0aec0',
              maxWidth: '250px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              background: 'rgba(26, 32, 44, 0.6)',
              padding: '4px 8px',
              borderRadius: '8px'
            }}>
              {product.description}
            </div>
          </div>
        )}
      </td>
      
      <td style={{ padding: '20px', color: '#cbd5e0' }}>
        {isEditing ? (
          <select
            value={editData.category}
            onChange={(e) => setEditData(prev => ({ ...prev, category: e.target.value }))}
            style={{
              width: '100%',
              padding: '12px 15px',
              border: '1px solid rgba(255, 215, 0, 0.3)',
              borderRadius: '12px',
              fontSize: '14px',
              background: 'rgba(26, 32, 44, 0.8)',
              color: '#f7fafc',
              outline: 'none'
            }}
          >
            {['Electrical Goods', 'Hardware & Tools', 'Wiring & Cables', 'Switches & Sockets', 'Lighting Solutions', 'Fans & Ventilation', 'Electrical Motors', 'Safety Equipment'].map(cat => (
              <option key={cat} value={cat} style={{ background: '#1a202c' }}>{cat}</option>
            ))}
          </select>
        ) : (
          <span style={{
            background: 'rgba(102, 126, 234, 0.2)',
            color: '#667eea',
            padding: '6px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '600',
            border: '1px solid rgba(102, 126, 234, 0.3)'
          }}>
            {product.category}
          </span>
        )}
      </td>
      
      <td style={{ padding: '20px', textAlign: 'center' }}>
        {isEditing ? (
          <input
            type="number"
            value={editData.price}
            onChange={(e) => setEditData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
            style={{
              width: '100px',
              padding: '12px 15px',
              border: '1px solid rgba(255, 215, 0, 0.3)',
              borderRadius: '12px',
              fontSize: '14px',
              background: 'rgba(26, 32, 44, 0.8)',
              color: '#f7fafc',
              outline: 'none',
              textAlign: 'center'
            }}
          />
        ) : (
          <span style={{ 
            fontWeight: '800', 
            background: 'linear-gradient(135deg, #ffd700 0%, #ff8c00 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: '18px'
          }}>
            ₹{product.price.toLocaleString()}
          </span>
        )}
      </td>
      
      <td style={{ padding: '20px', textAlign: 'center' }}>
        {isEditing ? (
          <input
            type="number"
            value={editData.stock}
            onChange={(e) => setEditData(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
            style={{
              width: '100px',
              padding: '12px 15px',
              border: '1px solid rgba(255, 215, 0, 0.3)',
              borderRadius: '12px',
              fontSize: '14px',
              background: 'rgba(26, 32, 44, 0.8)',
              color: '#f7fafc',
              outline: 'none',
              textAlign: 'center'
            }}
          />
        ) : (
          <span style={{ 
            fontWeight: '800', 
            fontSize: '20px', 
            color: '#f7fafc',
            background: 'rgba(45, 55, 72, 0.6)',
            padding: '8px 16px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            {product.stock}
          </span>
        )}
      </td>
      
      <td style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{
          background: stockStatus.bg,
          color: stockStatus.color,
          padding: '10px 16px',
          borderRadius: '20px',
          fontSize: '13px',
          fontWeight: '700',
          border: `1px solid ${stockStatus.color}30`,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span>{stockStatus.icon}</span>
          {stockStatus.text}
        </div>
      </td>
      
      <td style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                style={{
                  background: 'linear-gradient(135deg, #2ed573 0%, #1dd65a 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.1)';
                  e.target.style.boxShadow = '0 8px 20px rgba(46, 213, 115, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                ✓ Save
              </button>
              <button
                onClick={handleCancel}
                style={{
                  background: 'linear-gradient(135deg, #6c757d 0%, #495057 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.1)';
                  e.target.style.boxShadow = '0 8px 20px rgba(108, 117, 125, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                ✕ Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onEdit(product)}
                style={{
                  background: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.1)';
                  e.target.style.boxShadow = '0 8px 20px rgba(0, 210, 255, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                ✏️ Edit
              </button>
              <button
                onClick={() => onDelete(product._id, product.name)}
                style={{
                  background: 'linear-gradient(135deg, #ff4757 0%, #ff3838 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.1)';
                  e.target.style.boxShadow = '0 8px 20px rgba(255, 71, 87, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                🗑️ Delete
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
};

export default NewAdminDashboard;

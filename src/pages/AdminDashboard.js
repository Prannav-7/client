import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import AdminIndicator from '../components/AdminIndicator';
import SalesDashboard from '../components/SalesDashboard';
import ProfessionalMonthlySalesReport from '../components/ProfessionalMonthlySalesReport';
import CustomerOrders from '../components/CustomerOrders';
import { useAdmin } from '../hooks/useAdmin';
import api from '../api';

const AdminDashboard = () => {
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [activeTab, setActiveTab] = useState('products'); // products, sales, monthly-sales, orders
  const [salesData, setSalesData] = useState(null);
  const [ordersData, setOrdersData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loadingSales, setLoadingSales] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
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
      console.log('Products API Response:', response.data); // Debug log
      if (response.data?.data) {
        setProducts(response.data.data);
        calculateStats(response.data.data);
      } else if (response.data?.products) {
        setProducts(response.data.products);
        calculateStats(response.data.products);
      } else if (Array.isArray(response.data)) {
        setProducts(response.data);
        calculateStats(response.data);
      } else {
        console.error('Unexpected products response format:', response.data);
        setProducts([]);
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
    const confirmMessage = `Are you sure you want to delete "${productName}"?\n\nThis action cannot be undone and will permanently remove:\n• Product information\n• Stock data\n• All related records\n\nType "DELETE" to confirm:`;
    
    const userInput = window.prompt(confirmMessage);
    
    if (userInput !== 'DELETE') {
      if (userInput !== null) { // User didn't cancel, but typed wrong confirmation
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
      } else {
        throw new Error(response.data?.message || 'Delete operation failed');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert(`❌ Failed to delete product "${productName}": ${error.response?.data?.message || error.message}`);
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
        
        // Show success message with product name
        const productName = updatedData.name || products.find(p => p._id === productId)?.name;
        alert(`✅ Product "${productName}" updated successfully!`);
        calculateStats(updatedProducts);
      } else {
        throw new Error(response.data?.message || 'Update operation failed');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      const productName = updatedData.name || products.find(p => p._id === productId)?.name;
      alert(`❌ Failed to update product "${productName}": ${error.response?.data?.message || error.message}`);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === '' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Fetch daily sales report
  const fetchSalesData = async (date = selectedDate) => {
    try {
      setLoadingSales(true);
      const response = await api.get(`/orders/admin/daily-sales?date=${date}`);
      if (response.data?.success) {
        setSalesData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching sales data:', error);
      alert('Failed to fetch sales data. Please check if you have admin privileges.');
    } finally {
      setLoadingSales(false);
    }
  };

  // Fetch all orders for admin
  const fetchOrdersData = async (page = 1) => {
    try {
      setLoadingOrders(true);
      const response = await api.get(`/orders/admin/all-orders?page=${page}&limit=20`);
      if (response.data?.success) {
        setOrdersData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching orders data:', error);
      alert('Failed to fetch orders data. Please check if you have admin privileges.');
    } finally {
      setLoadingOrders(false);
    }
  };

  // Load sales and orders data when tab changes
  useEffect(() => {
    if (isAdmin && activeTab === 'sales') {
      fetchSalesData();
    } else if (isAdmin && activeTab === 'orders') {
      fetchOrdersData();
    }
  }, [activeTab, isAdmin]);

  // Handle date change for sales report
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    if (activeTab === 'sales') {
      fetchSalesData(newDate);
    }
  };

  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 15s ease infinite'
    }}>
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
      <Header />
      
      {/* Admin Dashboard Header */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(30px)',
        color: 'white',
        padding: '60px 0',
        textAlign: 'center',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 6s ease-in-out infinite'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '10%',
          right: '15%',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 8s ease-in-out infinite reverse'
        }}></div>
        
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 2 }}>
          <div style={{ 
            fontSize: '5rem', 
            marginBottom: '20px',
            animation: 'bounce 2s ease-in-out infinite'
          }}>
            ⚡
          </div>
          <h1 style={{
            fontSize: '4.5rem',
            fontWeight: '900',
            margin: '0 0 20px 0',
            textShadow: '0 4px 20px rgba(0,0,0,0.3)',
            background: 'linear-gradient(45deg, #fff, #f0f8ff, #e6f3ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'shimmer 3s ease-in-out infinite'
          }}>
            ELECTROSTORE
          </h1>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: '700',
            margin: '0 0 15px 0',
            opacity: '0.95',
            letterSpacing: '2px',
            animation: 'fadeInUp 1s ease-out'
          }}>
            Admin Control Center
          </h2>
          <p style={{
            fontSize: '1.4rem',
            opacity: '0.9',
            margin: 0,
            fontWeight: '600',
            letterSpacing: '1px',
            animation: 'fadeInUp 1s ease-out 0.3s both'
          }}>
            Jaimaaruthi Electrics and Hardware - Advanced Business Intelligence
          </p>
        </div>
        
        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
          }
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-20px); }
            60% { transform: translateY(-10px); }
          }
          @keyframes shimmer {
            0% { background-position: -200% center; }
            100% { background-position: 200% center; }
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px' }}>
        {/* Statistics Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '30px',
          marginBottom: '50px'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            color: '#2c3e50',
            padding: '40px',
            borderRadius: '25px',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(78, 205, 196, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            position: 'relative',
            overflow: 'hidden',
            transform: 'translateY(0)',
            transition: 'all 0.4s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-10px)';
            e.currentTarget.style.boxShadow = '0 30px 80px rgba(78, 205, 196, 0.3)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 20px 60px rgba(78, 205, 196, 0.2)';
          }}>
            <div style={{
              position: 'absolute',
              top: '-50%',
              right: '-50%',
              width: '200%',
              height: '200%',
              background: 'linear-gradient(45deg, transparent, rgba(78, 205, 196, 0.1), transparent)',
              transform: 'rotate(45deg)',
              pointerEvents: 'none'
            }}></div>
            <div style={{ fontSize: '4rem', marginBottom: '15px', position: 'relative', zIndex: 2 }}>📦</div>
            <div style={{ fontSize: '3.5rem', fontWeight: '900', marginBottom: '8px', position: 'relative', zIndex: 2 }}>{stats.totalProducts}</div>
            <div style={{ fontSize: '1.1rem', opacity: '0.8', fontWeight: '600', position: 'relative', zIndex: 2 }}>Total Products</div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            color: '#2c3e50',
            padding: '40px',
            borderRadius: '25px',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(102, 126, 234, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            position: 'relative',
            overflow: 'hidden',
            transform: 'translateY(0)',
            transition: 'all 0.4s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-10px)';
            e.currentTarget.style.boxShadow = '0 30px 80px rgba(102, 126, 234, 0.3)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 20px 60px rgba(102, 126, 234, 0.2)';
          }}>
            <div style={{
              position: 'absolute',
              top: '-50%',
              right: '-50%',
              width: '200%',
              height: '200%',
              background: 'linear-gradient(45deg, transparent, rgba(102, 126, 234, 0.1), transparent)',
              transform: 'rotate(45deg)',
              pointerEvents: 'none'
            }}></div>
            <div style={{ fontSize: '4rem', marginBottom: '15px', position: 'relative', zIndex: 2 }}>💰</div>
            <div style={{ fontSize: '3.5rem', fontWeight: '900', marginBottom: '8px', position: 'relative', zIndex: 2 }}>₹{stats.totalValue.toLocaleString()}</div>
            <div style={{ fontSize: '1.1rem', opacity: '0.8', fontWeight: '600', position: 'relative', zIndex: 2 }}>Total Inventory Value</div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            color: '#2c3e50',
            padding: '40px',
            borderRadius: '25px',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(255, 193, 7, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            position: 'relative',
            overflow: 'hidden',
            transform: 'translateY(0)',
            transition: 'all 0.4s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-10px)';
            e.currentTarget.style.boxShadow = '0 30px 80px rgba(255, 193, 7, 0.3)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 20px 60px rgba(255, 193, 7, 0.2)';
          }}>
            <div style={{
              position: 'absolute',
              top: '-50%',
              right: '-50%',
              width: '200%',
              height: '200%',
              background: 'linear-gradient(45deg, transparent, rgba(255, 193, 7, 0.1), transparent)',
              transform: 'rotate(45deg)',
              pointerEvents: 'none'
            }}></div>
            <div style={{ fontSize: '4rem', marginBottom: '15px', position: 'relative', zIndex: 2 }}>⚠️</div>
            <div style={{ fontSize: '3.5rem', fontWeight: '900', marginBottom: '8px', position: 'relative', zIndex: 2 }}>{stats.lowStock}</div>
            <div style={{ fontSize: '1.1rem', opacity: '0.8', fontWeight: '600', position: 'relative', zIndex: 2 }}>Low Stock Items</div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            color: '#2c3e50',
            padding: '40px',
            borderRadius: '25px',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(255, 107, 107, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            position: 'relative',
            overflow: 'hidden',
            transform: 'translateY(0)',
            transition: 'all 0.4s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-10px)';
            e.currentTarget.style.boxShadow = '0 30px 80px rgba(255, 107, 107, 0.3)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 20px 60px rgba(255, 107, 107, 0.2)';
          }}>
            <div style={{
              position: 'absolute',
              top: '-50%',
              right: '-50%',
              width: '200%',
              height: '200%',
              background: 'linear-gradient(45deg, transparent, rgba(255, 107, 107, 0.1), transparent)',
              transform: 'rotate(45deg)',
              pointerEvents: 'none'
            }}></div>
            <div style={{ fontSize: '4rem', marginBottom: '15px', position: 'relative', zIndex: 2 }}>🚫</div>
            <div style={{ fontSize: '3.5rem', fontWeight: '900', marginBottom: '8px', position: 'relative', zIndex: 2 }}>{stats.outOfStock}</div>
            <div style={{ fontSize: '1.1rem', opacity: '0.8', fontWeight: '600', position: 'relative', zIndex: 2 }}>Out of Stock</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(30px)',
          borderRadius: '30px',
          padding: '25px',
          marginBottom: '40px',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { id: 'products', label: '📦 Product Management', icon: '📦', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
              { id: 'sales', label: '📊 Daily Sales Report', icon: '📊', gradient: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)' },
              { id: 'monthly-sales', label: '📈 Monthly Analytics', icon: '📈', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
              { id: 'orders', label: '🛍️ Customer Orders', icon: '🛍️', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: activeTab === tab.id ? tab.gradient : 'rgba(255, 255, 255, 0.7)',
                  color: activeTab === tab.id ? 'white' : '#2c3e50',
                  border: activeTab === tab.id ? 'none' : '2px solid rgba(102, 126, 234, 0.2)',
                  padding: '15px 30px',
                  borderRadius: '25px',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.4s ease',
                  boxShadow: activeTab === tab.id ? '0 15px 40px rgba(0,0,0,0.2)' : '0 8px 25px rgba(0,0,0,0.05)',
                  transform: activeTab === tab.id ? 'translateY(-3px)' : 'translateY(0)',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseOver={(e) => {
                  if (activeTab !== tab.id) {
                    e.target.style.background = 'rgba(102, 126, 234, 0.1)';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 12px 30px rgba(0,0,0,0.1)';
                  }
                }}
                onMouseOut={(e) => {
                  if (activeTab !== tab.id) {
                    e.target.style.background = 'rgba(255, 255, 255, 0.7)';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.05)';
                  }
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'products' && (
          <div>
            {/* Controls Section */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              borderRadius: '25px',
              padding: '30px',
              marginBottom: '30px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: '700', margin: 0, color: '#2c3e50' }}>
                  Product Management
                </h2>
                <button
              onClick={() => navigate('/add-product')}
              style={{
                background: 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)',
                color: 'white',
                border: 'none',
                padding: '15px 30px',
                borderRadius: '25px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 25px rgba(76, 175, 80, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 12px 30px rgba(76, 175, 80, 0.4)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 25px rgba(76, 175, 80, 0.3)';
              }}
            >
              ➕ Add New Product
            </button>
          </div>

          {/* Search and Filter */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '20px',
            marginBottom: '20px'
          }}>
            <div>
              <label style={{ fontSize: '14px', fontWeight: '600', color: '#666', marginBottom: '8px', display: 'block' }}>
                Search Products
              </label>
              <input
                type="text"
                placeholder="Search by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '15px 20px',
                  border: '2px solid #f0f0f0',
                  borderRadius: '15px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#f0f0f0'}
              />
            </div>

            <div>
              <label style={{ fontSize: '14px', fontWeight: '600', color: '#666', marginBottom: '8px', display: 'block' }}>
                Filter by Category
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '15px 20px',
                  border: '2px solid #f0f0f0',
                  borderRadius: '15px',
                  fontSize: '16px',
                  outline: 'none',
                  background: 'white',
                  cursor: 'pointer'
                }}
              >
                <option value="">All Categories</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Products Table */}
        {loading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '300px',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              border: '6px solid #f3f3f3',
              borderTop: '6px solid #667eea',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <p style={{ color: '#666', fontSize: '18px', fontWeight: '600' }}>Loading products...</p>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '25px',
            padding: '60px 30px',
            textAlign: 'center',
            border: '2px dashed #ddd'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px', opacity: '0.5' }}>📦</div>
            <h3 style={{ fontSize: '1.5rem', color: '#666', marginBottom: '10px' }}>No Products Found</h3>
            <p style={{ color: '#999', fontSize: '16px' }}>
              {searchTerm || filterCategory ? 'Try adjusting your search or filter criteria.' : 'Start by adding your first product.'}
            </p>
          </div>
        ) : (
          <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            borderRadius: '25px',
            padding: '30px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            overflowX: 'auto'
          }}>
            <div style={{ minWidth: '1200px' }}>
              {/* Table Header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '100px 2fr 1fr 1fr 100px 100px 150px 200px',
                gap: '20px',
                padding: '20px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: '15px',
                marginBottom: '20px',
                fontWeight: '700',
                fontSize: '14px'
              }}>
                <div>IMAGE</div>
                <div>PRODUCT NAME</div>
                <div>CATEGORY</div>
                <div>PRICE</div>
                <div>STOCK</div>
                <div>STATUS</div>
                <div>LAST UPDATED</div>
                <div>ACTIONS</div>
              </div>

              {/* Product Rows */}
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
            </div>
          </div>
        )}
        </div>
        )}

        {/* Sales Tab Content */}
        {activeTab === 'sales' && <SalesDashboard />}

        {/* Monthly Sales Tab Content */}
        {activeTab === 'monthly-sales' && <ProfessionalMonthlySalesReport />}

        {/* Orders Tab Content */}
        {activeTab === 'orders' && <CustomerOrders />}
      </div>

      <AdminIndicator showStatus={true} />
    </div>
  );
};

// Product Row Component with Inline Editing
const ProductRow = ({ product, index, onEdit, onDelete, onUpdate, isEditing }) => {
  const [editData, setEditData] = useState({
    name: product.name,
    price: product.price,
    stock: product.stock,
    description: product.description,
    category: product.category
  });

  const handleSave = () => {
    onUpdate(product._id, editData);
  };

  const handleCancel = () => {
    setEditData({
      name: product.name,
      price: product.price,
      stock: product.stock,
      description: product.description,
      category: product.category
    });
    onEdit(null);
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { text: 'Out of Stock', color: '#ff6b6b', bg: 'rgba(255, 107, 107, 0.1)' };
    if (stock <= 10) return { text: 'Low Stock', color: '#ffd54f', bg: 'rgba(255, 213, 79, 0.1)' };
    return { text: 'In Stock', color: '#4caf50', bg: 'rgba(76, 175, 80, 0.1)' };
  };

  const status = getStockStatus(product.stock);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '100px 2fr 1fr 1fr 100px 100px 150px 200px',
      gap: '20px',
      padding: '20px',
      background: index % 2 === 0 ? 'rgba(248, 249, 255, 0.5)' : 'white',
      borderRadius: '15px',
      marginBottom: '10px',
      border: isEditing ? '2px solid #667eea' : '1px solid rgba(0,0,0,0.1)',
      alignItems: 'center',
      transition: 'all 0.3s ease'
    }}>
      {/* Product Image */}
      <div>
        <img
          src={product.imageUrl ? `http://localhost:5000${product.imageUrl}` : 'http://localhost:5000/images/placeholder-product.png'}
          alt={product.name}
          style={{
            width: '60px',
            height: '60px',
            objectFit: 'cover',
            borderRadius: '10px',
            border: '2px solid #f0f0f0'
          }}
          onError={(e) => {
            e.target.src = '/placeholder-product.png';
          }}
        />
      </div>

      {/* Product Name */}
      <div>
        {isEditing ? (
          <input
            type="text"
            value={editData.name}
            onChange={(e) => setEditData({...editData, name: e.target.value})}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '2px solid #667eea',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600'
            }}
          />
        ) : (
          <div>
            <div style={{ fontWeight: '700', fontSize: '16px', color: '#2c3e50', marginBottom: '4px' }}>
              {product.name}
            </div>
            <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.4' }}>
              {product.description?.substring(0, 60)}...
            </div>
          </div>
        )}
      </div>

      {/* Category */}
      <div>
        <span style={{
          background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
          color: 'white',
          padding: '6px 12px',
          borderRadius: '15px',
          fontSize: '12px',
          fontWeight: '600'
        }}>
          {product.category}
        </span>
      </div>

      {/* Price */}
      <div>
        {isEditing ? (
          <input
            type="number"
            value={editData.price}
            onChange={(e) => setEditData({...editData, price: parseFloat(e.target.value)})}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '2px solid #667eea',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600'
            }}
          />
        ) : (
          <div style={{ fontWeight: '700', fontSize: '16px', color: '#2c3e50' }}>
            ₹{product.price?.toLocaleString()}
          </div>
        )}
      </div>

      {/* Stock */}
      <div>
        {isEditing ? (
          <input
            type="number"
            value={editData.stock}
            onChange={(e) => setEditData({...editData, stock: parseInt(e.target.value)})}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '2px solid #667eea',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600'
            }}
          />
        ) : (
          <div style={{ fontWeight: '700', fontSize: '16px', color: '#2c3e50' }}>
            {product.stock}
          </div>
        )}
      </div>

      {/* Status */}
      <div>
        <span style={{
          background: status.bg,
          color: status.color,
          padding: '6px 10px',
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: '700',
          border: `1px solid ${status.color}`
        }}>
          {status.text}
        </span>
      </div>

      {/* Last Updated */}
      <div style={{ fontSize: '12px', color: '#666' }}>
        {new Date(product.updatedAt || product.createdAt).toLocaleDateString()}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {isEditing ? (
          <>
            <button
              onClick={handleSave}
              style={{
                background: 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)',
                color: 'white',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              ✓ Save
            </button>
            <button
              onClick={handleCancel}
              style={{
                background: '#f0f0f0',
                color: '#666',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
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
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              title="Edit Product"
            >
              ✏️ Edit
            </button>
            <button
              onClick={() => onDelete(product._id, product.name)}
              style={{
                background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%)',
                color: 'white',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              title="Delete Product"
            >
              🗑️ Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

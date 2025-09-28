import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiHome, FiPackage, FiUsers, FiBarChart, FiSettings, 
  FiTrendingUp, FiShoppingCart, FiDollarSign, FiEye,
  FiPlus, FiEdit, FiTrash2, FiSearch, FiFilter,
  FiRefreshCw, FiBell, FiMenu, FiX
} from 'react-icons/fi';
import { useAdmin } from '../hooks/useAdmin';
import { useAuth } from '../contexts/AuthContext';
import { SalesLineChart, RevenueBarChart, CategoryChart } from '../components/Charts';
import QuickAdminLogin from '../components/QuickAdminLogin';
import api from '../api';
import './FlipkartAdminDashboard.css';

const FlipkartAdminDashboard = () => {
  const { isAdmin } = useAdmin();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0
  });
  const [products, setProducts] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    fetchDashboardData();
  }, [isAdmin, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching dashboard data...');
      
      // Fetch products first (public endpoint)
      const productsRes = await api.get('/products').catch(err => {
        console.error('Products API error:', err);
        return { data: [] };
      });
      
      const productsData = productsRes.data?.data || productsRes.data?.products || productsRes.data || [];
      setProducts(productsData);
      console.log('📦 Products loaded:', productsData.length);

      // Try to fetch sales data (admin endpoint)
      try {
        console.log('📊 Attempting to fetch sales analytics...');
        const salesRes = await api.get('/orders/admin/sales-analytics');
        console.log('✅ Sales data received:', salesRes.data);
        
        const salesInfo = salesRes.data?.summary || salesRes.data || {};
        setSalesData(salesRes.data?.dailyRevenue || []);
        
        setStats({
          totalRevenue: salesInfo.totalRevenue || 243677,
          totalOrders: salesInfo.totalOrders || 45,
          totalProducts: productsData.length,
          totalCustomers: 150
        });
        
      } catch (salesError) {
        console.error('❌ Sales API error:', salesError.response?.data || salesError.message);
        console.log('📋 Using fallback data...');
        
        // Use fallback data
        setStats({
          totalRevenue: 243677,
          totalOrders: 45,
          totalProducts: productsData.length,
          totalCustomers: 150
        });
        
        // Generate mock sales data for charts
        setSalesData([
          { date: 'Jan', revenue: 45000 },
          { date: 'Feb', revenue: 52000 },
          { date: 'Mar', revenue: 48000 },
          { date: 'Apr', revenue: 61000 },
          { date: 'May', revenue: 55000 },
          { date: 'Jun', revenue: 67000 }
        ]);
      }

    } catch (error) {
      console.error('💥 Dashboard data fetch error:', error);
      // Set fallback data
      setStats({
        totalRevenue: 243677,
        totalOrders: 45,
        totalProducts: 25,
        totalCustomers: 150
      });
      setSalesData([
        { date: 'Jan', revenue: 45000 },
        { date: 'Feb', revenue: 52000 },
        { date: 'Mar', revenue: 48000 },
        { date: 'Apr', revenue: 61000 },
        { date: 'May', revenue: 55000 },
        { date: 'Jun', revenue: 67000 }
      ]);
    } finally {
      setLoading(false);
      console.log('✅ Dashboard loading complete');
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, change }) => (
    <div className="stat-card">
      <div className="stat-card-content">
        <div className="stat-info">
          <h3>{title}</h3>
          <p>{value}</p>
          {change && (
            <div className="stat-change">
              <span>↗</span> {change}
            </div>
          )}
        </div>
        <div className={`stat-icon ${color}`}>
          <Icon />
        </div>
      </div>
    </div>
  );

  const Sidebar = () => (
    <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <h1 className="sidebar-title">Admin Panel</h1>
        <button onClick={() => setSidebarOpen(false)} className="sidebar-close">
          <FiX />
        </button>
      </div>
      
      <nav className="sidebar-nav">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: FiHome },
          { id: 'products', label: 'Products', icon: FiPackage },
          { id: 'orders', label: 'Orders', icon: FiShoppingCart },
          { id: 'analytics', label: 'Analytics', icon: FiBarChart },
          { id: 'customers', label: 'Customers', icon: FiUsers },
          { id: 'settings', label: 'Settings', icon: FiSettings }
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
          >
            <item.icon />
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );

  const TopBar = () => (
    <div className="top-bar">
      <div className="top-bar-content">
        <div className="top-bar-left">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="menu-button"
          >
            <FiMenu />
          </button>
          <h2 className="page-title">{activeTab}</h2>
        </div>
        
        <div className="top-bar-right">
          <button className="notification-button">
            <FiBell />
          </button>
          <div className="profile-avatar">
            <span>A</span>
          </div>
        </div>
      </div>
    </div>
  );

  const DashboardContent = () => (
    <div>
      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard
          title="Total Revenue"
          value={`₹${stats.totalRevenue.toLocaleString()}`}
          icon={FiDollarSign}
          color="green"
          change="+12.5% from last month"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders.toLocaleString()}
          icon={FiShoppingCart}
          color="blue"
          change="+8.2% from last month"
        />
        <StatCard
          title="Products"
          value={stats.totalProducts.toLocaleString()}
          icon={FiPackage}
          color="purple"
        />
        <StatCard
          title="Customers"
          value={stats.totalCustomers.toLocaleString()}
          icon={FiUsers}
          color="orange"
          change="+5.1% from last month"
        />
      </div>

      {/* Charts Row */}
      <div className="charts-row">
        <div className="chart-card">
          <h3 className="chart-title">Revenue Overview</h3>
          <SalesLineChart data={salesData} />
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Monthly Revenue</h3>
          <RevenueBarChart data={salesData} />
        </div>
      </div>
      
      {/* Additional Charts Row */}
      <div className="charts-row">
        <div className="chart-card">
          <h3 className="chart-title">Category Distribution</h3>
          <CategoryChart />
        </div>
        
        <div className="chart-card">
          <h3 className="chart-title">Recent Orders</h3>
          <div>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="order-item">
                <div className="order-info">
                  <h4>Order #{1000 + i}</h4>
                  <p>Customer {i}</p>
                </div>
                <div className="order-amount">
                  <p>₹{(Math.random() * 5000 + 1000).toFixed(0)}</p>
                  <span className="status-badge">Completed</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const ProductsContent = () => (
    <div>
      {/* Header Actions */}
      <div className="products-header">
        <div className="products-actions">
          <div className="search-input">
            <FiSearch />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="filter-button">
            <FiFilter />
            Filter
          </button>
          <button
            onClick={() => navigate('/add-product')}
            className="add-button"
          >
            <FiPlus />
            Add Product
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="products-table">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.slice(0, 10).map((product, index) => (
                <tr key={product._id || index}>
                  <td>
                    <div className="product-info">
                      <div className="product-image">
                        <FiPackage />
                      </div>
                      <div className="product-details">
                        <h4>{product.name}</h4>
                        <p>{product.description?.substring(0, 50)}...</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="category-badge">
                      {product.category}
                    </span>
                  </td>
                  <td>
                    <span className="price">₹{product.price?.toLocaleString()}</span>
                  </td>
                  <td>
                    {product.stock}
                  </td>
                  <td>
                    <span className={`stock-badge ${
                      product.stock > 10 
                        ? 'in-stock' 
                        : product.stock > 0 
                        ? 'low-stock'
                        : 'out-of-stock'
                    }`}>
                      {product.stock > 10 ? 'In Stock' : product.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-button view">
                        <FiEye />
                      </button>
                      <button className="action-button edit">
                        <FiEdit />
                      </button>
                      <button className="action-button delete">
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {products.length === 0 && !loading && (
          <div className="empty-state">
            <FiPackage />
            <h3>No products found</h3>
            <p>Get started by adding your first product.</p>
            <button
              onClick={() => navigate('/add-product')}
              className="add-button"
            >
              <FiPlus />
              Add Product
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardContent />;
      case 'products':
        return <ProductsContent />;
      default:
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">{activeTab} Coming Soon</h3>
            <p className="text-gray-500">This section is under development.</p>
          </div>
        );
    }
  };

  if (!isAdmin) {
    return null;
  }

  // Show login if not authenticated
  if (!isAuthenticated || !user || user.email !== 'admin@gmail.com') {
    return <QuickAdminLogin onSuccess={() => window.location.reload()} />;
  }

  return (
    <div className="flipkart-admin">
      <Sidebar />
      
      {/* Main Content */}
      <div className={`main-content ${!sidebarOpen ? 'expanded' : ''}`}>
        <TopBar />
        
        <main className="dashboard-content">
          {loading ? (
            <div className="loading-container">
              <FiRefreshCw />
              <span>Loading dashboard...</span>
            </div>
          ) : (
            renderContent()
          )}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      <div
        className={`mobile-overlay ${sidebarOpen ? 'show' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />
    </div>
  );
};

export default FlipkartAdminDashboard;
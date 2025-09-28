// src/pages/ProductList.js
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const ProductList = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('');
  const [keyword, setKeyword] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Debug authentication state
  useEffect(() => {
    console.log('ProductList: Auth state changed:', {
      isAuthenticated,
      authLoading,
      user: user?.email,
      tokenInStorage: !!localStorage.getItem('token')
    });
  }, [isAuthenticated, authLoading, user]);

  const categories = [
    'Electrical Goods',
    'Hardware & Tools', 
    'Wiring & Cables',
    'Switches & Sockets',
    'Lighting Solutions',
    'Fans & Ventilation',
    'Electrical Motors',
    'Safety Equipment',
    'Building Materials',
    'Plumbing Supplies',
    'Paint & Finishes',
    'Steel & Metal Products',
    'Pipes & Fittings',
    'Power Tools',
    'Hand Tools'
  ];

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products');
      console.log('API Response:', response.data);
      
      if (response.data.success) {
        setProducts(response.data.data);
      } else {
        setError('Failed to fetch products');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Error fetching products: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    // Check if category is passed as URL parameter
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setCategory(decodeURIComponent(categoryParam));
    } else {
      setCategory('');
    }
  }, [searchParams]);

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesKeyword = keyword === '' || 
        product.name.toLowerCase().includes(keyword.toLowerCase()) ||
        product.description.toLowerCase().includes(keyword.toLowerCase()) ||
        product.brand.toLowerCase().includes(keyword.toLowerCase());
      
      const matchesCategory = category === '' || product.category === category;
      
      return matchesKeyword && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low': return a.price - b.price;
        case 'price-high': return b.price - a.price;
        case 'name': return a.name.localeCompare(b.name);
        case 'brand': return a.brand.localeCompare(b.brand);
        default: return 0;
      }
    });

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div style={{ 
          display: 'inline-block',
          width: '50px',
          height: '50px',
          border: '3px solid #f3f3f3',
          borderTop: '3px solid #667eea',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ marginTop: '20px', color: '#666' }}>Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '50px',
        backgroundColor: '#f8d7da',
        margin: '20px',
        borderRadius: '8px',
        color: '#721c24'
      }}>
        <h3>⚠️ Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <Header />
      
      {/* Page Header */}
      <div style={{
        backgroundColor: 'white',
        padding: '20px 0',
        borderBottom: '1px solid #dee2e6',
        marginBottom: '20px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <h1 style={{ margin: '0 0 10px 0', color: '#333' }}>🛍️ Our Products</h1>
          <p style={{ margin: '0', color: '#666' }}>
            Showing {filteredProducts.length} of {products.length} products
            {category && ` in "${category}"`}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        {/* Search and Filter Controls */}
        <div style={{ 
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '30px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '15px',
            alignItems: 'end'
          }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#333' }}>
                🔍 Search Products
              </label>
              <input 
                type="text" 
                placeholder="Search by name, brand, or description..." 
                value={keyword} 
                onChange={(e) => setKeyword(e.target.value)}
                style={{ 
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e9ecef',
                  borderRadius: '8px',
                  fontSize: '14px',
                  transition: 'border-color 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#333' }}>
                📂 Category
              </label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ 
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e9ecef',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: 'white'
                }}
              >
                <option value=''>All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#333' }}>
                🔄 Sort By
              </label>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ 
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e9ecef',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: 'white'
                }}
              >
                <option value='name'>Name (A-Z)</option>
                <option value='brand'>Brand</option>
                <option value='price-low'>Price (Low to High)</option>
                <option value='price-high'>Price (High to Low)</option>
              </select>
            </div>
            
            {(keyword || category) && (
              <div>
                <button
                  onClick={() => {
                    setKeyword('');
                    setCategory('');
                  }}
                  style={{
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  🗑️ Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
            gap: '25px',
            marginBottom: '40px'
          }}>
            {filteredProducts.map((product) => (
              <div key={product._id} style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                border: '1px solid #e9ecef',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
              }}
              onClick={() => navigate(`/products/${product._id}`)}
              >
                {/* Product Image/Icon */}
                <div style={{
                  width: '100%',
                  height: '180px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '15px',
                  backgroundImage: `url(${product.imageUrl ? `http://localhost:5000${product.imageUrl}` : '/images/default-product.jpg'})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative',
                  border: '2px solid #dee2e6'
                }}>
                  {/* Category Icon Overlay */}
                  <div style={{
                    position: 'absolute',
                    bottom: '10px',
                    right: '10px',
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                  }}>
                    {product.category === 'Electrical Goods' && '⚡'}
                    {product.category === 'Switches & Sockets' && '🔌'}
                    {product.category === 'Lighting Solutions' && '💡'}
                    {product.category === 'Fans & Ventilation' && '🌀'}
                    {product.category === 'Wiring & Cables' && '🔗'}
                    {product.category === 'Hardware & Tools' && '🔧'}
                    {product.category === 'Power Tools' && '⚒️'}
                    {product.category === 'Electrical Motors' && '⚙️'}
                    {!['Electrical Goods', 'Switches & Sockets', 'Lighting Solutions', 'Fans & Ventilation', 'Wiring & Cables', 'Hardware & Tools', 'Power Tools', 'Electrical Motors'].includes(product.category) && '📦'}
                  </div>
                </div>
                
                {/* Product Info */}
                <div style={{ marginBottom: '15px' }}>
                  <h4 style={{ 
                    margin: '0 0 8px 0', 
                    fontSize: '1.1rem', 
                    color: '#333',
                    lineHeight: '1.4'
                  }}>
                    {product.name}
                  </h4>
                  <p style={{ 
                    color: '#6c757d', 
                    fontSize: '0.9rem', 
                    margin: '0 0 10px 0',
                    lineHeight: '1.4'
                  }}>
                    {product.description.substring(0, 120)}...
                  </p>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '10px'
                  }}>
                    <span style={{ 
                      fontSize: '0.85rem',
                      color: '#fff',
                      backgroundColor: '#667eea',
                      padding: '4px 8px',
                      borderRadius: '12px'
                    }}>
                      {product.category}
                    </span>
                    <span style={{ 
                      fontSize: '0.9rem',
                      color: '#666',
                      fontWeight: '500'
                    }}>
                      Brand: {product.brand}
                    </span>
                  </div>
                </div>

                {/* Price and Stock */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '15px'
                }}>
                  <div>
                    <span style={{ 
                      fontSize: '1.4rem', 
                      fontWeight: 'bold', 
                      color: '#28a745'
                    }}>
                      ₹{product.price}
                    </span>
                  </div>
                  <span style={{ 
                    padding: '6px 12px', 
                    borderRadius: '20px', 
                    backgroundColor: product.stock > 0 ? '#d4edda' : '#f8d7da',
                    color: product.stock > 0 ? '#155724' : '#721c24',
                    fontSize: '0.8rem',
                    fontWeight: '500'
                  }}>
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </span>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                  <Link 
                    to={`/products/${product._id}`}
                    style={{
                      backgroundColor: '#667eea',
                      color: 'white',
                      border: 'none',
                      padding: '12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'background-color 0.3s ease',
                      textDecoration: 'none',
                      textAlign: 'center',
                      display: 'block'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.backgroundColor = '#5a6fd8'
                    }}
                    onMouseOut={(e) => {
                      e.target.style.backgroundColor = '#667eea'
                    }}
                  >
                    🔍 View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🔍</div>
            <h3 style={{ color: '#666', marginBottom: '15px' }}>No products found</h3>
            <p style={{ color: '#999', marginBottom: '20px' }}>
              {keyword || category 
                ? 'Try adjusting your search criteria' 
                : 'No products available at the moment'}
            </p>
            {(keyword || category) && (
              <button
                onClick={() => {
                  setKeyword('');
                  setCategory('');
                }}
                style={{
                  backgroundColor: '#667eea',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ProductList;

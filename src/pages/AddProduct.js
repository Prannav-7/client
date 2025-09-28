import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import AdminIndicator from '../components/AdminIndicator';
import { ValidationUtils } from '../utils/validation';

const AddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    mrp: '',
    stock: '',
    brand: '',
    unit: 'piece',
    specifications: '',
    tags: '',
    isFeatured: false,
    isActive: true
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

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

  const units = ['piece', 'meter', 'kg', 'liter', 'set', 'box', 'roll', 'pack'];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Comprehensive form validation
    const validationRules = {
      name: [ValidationUtils.validateProductName],
      description: [ValidationUtils.validateDescription],
      category: [ValidationUtils.validateCategory],
      price: [(value) => ValidationUtils.validatePrice(value, "Selling Price")],
      stock: [ValidationUtils.validateQuantity],
      brand: [ValidationUtils.validateBrand],
      unit: [(value) => ValidationUtils.validateRequired(value, "Unit")]
    };

    // Add MRP validation if provided
    if (formData.mrp) {
      validationRules.mrp = [(value) => ValidationUtils.validatePrice(value, "MRP")];
    }

    const { isFormValid, errors } = ValidationUtils.validateForm(formData, validationRules);
    
    if (!isFormValid) {
      const errorFields = Object.keys(errors);
      const errorMessage = `Please fix the following errors:\n${errorFields.map(field => `• ${errors[field]}`).join('\n')}`;
      alert(errorMessage);
      setLoading(false);
      return;
    }

    // Additional business logic validation
    const price = parseFloat(formData.price);
    const mrp = formData.mrp ? parseFloat(formData.mrp) : price;
    
    if (mrp < price) {
      alert('MRP cannot be less than selling price');
      setLoading(false);
      return;
    }

    try {
      let imageUrl = `/images/${formData.category.toLowerCase().replace(/[^a-z0-9]/g, '-')}.svg`;
      
      // If user uploaded an image, upload it first
      if (imageFile) {
        const uploadData = new FormData();
        uploadData.append('image', imageFile);
        
        const uploadResponse = await axios.post('http://localhost:5000/api/upload', uploadData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        if (uploadResponse.data.success) {
          imageUrl = uploadResponse.data.imageUrl;
        }
      }

      // Prepare form data for submission
      const productData = {
        ...formData,
        price: price,
        mrp: mrp,
        stock: parseInt(formData.stock),
        specifications: formData.specifications ? JSON.parse(formData.specifications) : {},
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        imageUrl: imageUrl
      };

      const response = await axios.post('http://localhost:5000/api/products', productData);
      
      if (response.data.success) {
        alert('Product added successfully!');
        navigate('/products');
      } else {
        throw new Error(response.data.message || 'Failed to add product');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Error adding product: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <Header />
      
      {/* Page Header */}
      <div style={{
        backgroundColor: 'white',
        padding: '20px 0',
        borderBottom: '1px solid #dee2e6',
        marginBottom: '30px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <h1 style={{ margin: '0 0 10px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
            ➕ Add New Product
          </h1>
          <p style={{ margin: '0', color: '#666' }}>
            Fill in the details below to add a new product to your inventory
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>
        <form onSubmit={handleSubmit} style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          {/* Basic Information */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#333', borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>
              📝 Basic Information
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter product name (e.g., Havells 32A MCB)"
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
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="3"
                  placeholder="Enter detailed product description..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e9ecef',
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'vertical',
                    transition: 'border-color 0.3s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e9ecef',
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: 'white'
                    }}
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                    Brand *
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Havells, Schneider, Philips"
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
              </div>
            </div>
          </div>

          {/* Pricing and Inventory */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#333', borderBottom: '2px solid #28a745', paddingBottom: '10px' }}>
              💰 Pricing & Inventory
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                  Selling Price (₹) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
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
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                  MRP (₹)
                </label>
                <input
                  type="number"
                  name="mrp"
                  value={formData.mrp}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  placeholder="Leave empty to use selling price"
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
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  required
                  min="0"
                  placeholder="0"
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
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                  Unit
                </label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e9ecef',
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: 'white'
                  }}
                >
                  {units.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Product Image */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#333', borderBottom: '2px solid #ff9800', paddingBottom: '10px' }}>
              🖼️ Product Image
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: imagePreview ? '1fr 200px' : '1fr', gap: '20px', alignItems: 'start' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                  Upload Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px dashed #e9ecef',
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: '#f8f9fa'
                  }}
                />
                <p style={{ fontSize: '12px', color: '#666', margin: '8px 0 0 0' }}>
                  Supported formats: JPG, PNG, SVG. Max size: 5MB
                </p>
              </div>

              {imagePreview && (
                <div style={{
                  border: '2px solid #e9ecef',
                  borderRadius: '8px',
                  padding: '10px',
                  backgroundColor: '#f8f9fa'
                }}>
                  <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#666', textAlign: 'center' }}>
                    Preview:
                  </p>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{
                      width: '100%',
                      height: '150px',
                      objectFit: 'cover',
                      borderRadius: '4px'
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Additional Details */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#333', borderBottom: '2px solid #9c27b0', paddingBottom: '10px' }}>
              ⚙️ Additional Details
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                  Specifications (JSON format)
                </label>
                <textarea
                  name="specifications"
                  value={formData.specifications}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder='{"voltage": "240V", "current": "32A", "poles": "2"}'
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e9ecef',
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'vertical',
                    fontFamily: 'monospace',
                    transition: 'border-color 0.3s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                />
                <p style={{ fontSize: '12px', color: '#666', margin: '8px 0 0 0' }}>
                  Enter specifications in JSON format. Leave empty if none.
                </p>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="electrical, safety, certified, premium"
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

              <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleInputChange}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <span style={{ fontWeight: '500', color: '#333' }}>⭐ Featured Product</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <span style={{ fontWeight: '500', color: '#333' }}>✅ Active Product</span>
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', paddingTop: '20px', borderTop: '1px solid #dee2e6' }}>
            <button
              type="button"
              onClick={() => navigate('/products')}
              style={{
                backgroundColor: 'white',
                color: '#6c757d',
                border: '2px solid #6c757d',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#6c757d';
                e.target.style.color = 'white';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'white';
                e.target.style.color = '#6c757d';
              }}
            >
              ❌ Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: loading ? '#6c757d' : '#28a745',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'background-color 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid transparent',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Adding...
                </>
              ) : (
                <>✅ Add Product</>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      
      {/* Admin Mode Indicator */}
      <AdminIndicator showStatus={true} />
    </div>
  );
};

export default AddProduct;

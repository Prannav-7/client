import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import './ProductDetails.css';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { addToCart: addToCartContext } = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSection, setSelectedSection] = useState('description');
  const [reviews, setReviews] = useState([]);
  const [userHasPurchased, setUserHasPurchased] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: '',
    images: []
  });
  const [submitingReview, setSubmitingReview] = useState(false);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        console.log('Product API Response:', response.data);
        
        if (response.data.success) {
          setProduct(response.data.data);
        } else {
          setProduct(response.data);
        }
        
        // Check if user has purchased this product
        if (isAuthenticated) {
          await checkUserPurchaseHistory();
        }
        
        // Fetch reviews
        await fetchProductReviews();
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching product:", error);
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id, isAuthenticated]);

  const checkUserPurchaseHistory = async () => {
    try {
      const response = await api.get(`/orders/user-orders`);
      if (response.data.success) {
        const hasPurchased = response.data.orders.some(order => 
          order.items.some(item => item.productId === id && order.status === 'delivered')
        );
        setUserHasPurchased(hasPurchased);
      }
    } catch (error) {
      console.error("Error checking purchase history:", error);
    }
  };

  const fetchProductReviews = async () => {
    try {
      const response = await api.get(`/products/${id}/reviews`);
      if (response.data.success) {
        setReviews(response.data.reviews);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      alert('Please login to add items to cart');
      navigate('/login');
      return;
    }

    setAddingToCart(true);
    try {
      const success = await addToCartContext(id, quantity);
      
      if (success) {
        alert('Product added to cart successfully!');
      } else {
        alert('Failed to add product to cart');
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert('Error adding to cart: ' + (error.response?.data?.message || error.message));
    }
    setAddingToCart(false);
  };

  const handleAddToWishlist = async () => {
    if (!isAuthenticated) {
      alert('Please login to add items to wishlist');
      navigate('/login');
      return;
    }

    setAddingToWishlist(true);
    try {
      const response = await api.post('/wishlist/add', {
        productId: id
      });
      
      if (response.data.success) {
        alert('Product added to wishlist successfully!');
      } else {
        alert('Failed to add product to wishlist');
      }
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      alert('Error adding to wishlist: ' + (error.response?.data?.message || error.message));
    }
    setAddingToWishlist(false);
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      alert('Please login to buy products');
      navigate('/login');
      return;
    }

    // Add to cart first, then redirect to checkout
    setAddingToCart(true);
    try {
      const success = await addToCartContext(id, quantity);
      
      if (success) {
        navigate('/checkout');
      } else {
        alert('Failed to process buy now request');
      }
    } catch (error) {
      console.error("Error processing buy now:", error);
      alert('Error processing buy now: ' + (error.response?.data?.message || error.message));
    }
    setAddingToCart(false);
  };

  const calculateDiscount = () => {
    if (product.mrp && product.price < product.mrp) {
      return Math.round(((product.mrp - product.price) / product.mrp) * 100);
    }
    return 0;
  };

  const mockReviews = [
    {
      id: 1,
      user: "Rajesh Kumar",
      rating: 5,
      comment: "Excellent quality product. Highly recommended!",
      date: "2024-01-15",
      verified: true
    },
    {
      id: 2,
      user: "Priya Sharma",
      rating: 4,
      comment: "Good value for money. Fast delivery.",
      date: "2024-01-10",
      verified: true
    },
    {
      id: 3,
      user: "Amit Singh",
      rating: 5,
      comment: "Perfect product as described. Will buy again.",
      date: "2024-01-05",
      verified: false
    }
  ];

  if (loading) {
    return (
      <div>
        <Header />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div>
        <Header />
        <div className="error-container">
          <h2>Product not found</h2>
          <button onClick={() => navigate('/products')} className="back-btn">
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const discount = calculateDiscount();
  const avgRating = mockReviews.reduce((acc, review) => acc + review.rating, 0) / mockReviews.length;

  return (
    <div className="flipkart-style-page">
      <Header />
      <div className="flipkart-container">
        <div className="flipkart-product-layout">
          {/* Left Side - Product Images (Flipkart Style) */}
          <div className="flipkart-image-section">
            <div className="flipkart-image-gallery">
              <div className="flipkart-thumbnails">
                <img 
                  src={product.imageUrl ? `http://localhost:5000${product.imageUrl}` : '/images/default-product.jpg'} 
                  alt={product.name}
                  className={`flipkart-thumbnail ${activeImage === 0 ? 'active' : ''}`}
                  onClick={() => setActiveImage(0)}
                  onError={(e) => {
                    e.target.src = '/images/default-product.jpg';
                  }}
                />
              </div>
              <div className="flipkart-main-image">
                <img 
                  src={product.imageUrl ? `http://localhost:5000${product.imageUrl}` : '/images/default-product.jpg'} 
                  alt={product.name}
                  onError={(e) => {
                    e.target.src = '/images/default-product.jpg';
                  }}
                />
                <div className="flipkart-image-actions">
                  <button className="flipkart-wishlist-btn">♡</button>
                </div>
              </div>
            </div>
            
            <div className="flipkart-action-buttons">
              <button 
                className="flipkart-add-to-cart"
                onClick={handleAddToCart}
                disabled={addingToCart || product.stock === 0}
              >
                <span>🛒</span>
                {addingToCart ? 'Adding...' : 'ADD TO CART'}
              </button>
              <button 
                className="flipkart-buy-now"
                onClick={() => navigate('/checkout')}
                disabled={product.stock === 0}
              >
                <span>⚡</span>
                BUY NOW
              </button>
            </div>
          </div>

          {/* Right Side - Product Information (Flipkart Style) */}
          <div className="flipkart-info-section">
            {/* Breadcrumb */}
            <div className="flipkart-breadcrumb">
              <span onClick={() => navigate('/')} className="breadcrumb-link">Home</span>
              <span> &gt; </span>
              <span onClick={() => navigate('/products')} className="breadcrumb-link">Products</span>
              <span> &gt; </span>
              <span>{product.category}</span>
            </div>

            {/* Product Title */}
            <h1 className="flipkart-title">
              {product.name}
            </h1>

            {/* Rating and Reviews */}
            <div className="flipkart-rating-section">
              <div className="flipkart-rating-badge">
                <span className="rating-stars">★★★★☆</span>
                <span className="rating-value">4.2</span>
              </div>
              <span className="flipkart-rating-text">
                {reviews.length || 0} Ratings & {reviews.length || 0} Reviews
              </span>
            </div>

            {/* Price Section */}
            <div className="flipkart-price-section">
              <div className="price-container">
                <span className="flipkart-current-price">
                  ₹{product.price?.toLocaleString()}
                </span>
                {product.mrp && product.mrp > product.price && (
                  <>
                    <span className="flipkart-original-price">
                      ₹{product.mrp?.toLocaleString()}
                    </span>
                    <span className="flipkart-discount-percent">
                      {Math.round((product.mrp - product.price) / product.mrp * 100)}% off
                    </span>
                  </>
                )}
              </div>
              <div className="flipkart-price-offers">
                <span className="offer-tag">🚚 Free delivery</span>
                {product.price > 500 && <span className="offer-tag">⚡ No cost EMI available</span>}
              </div>
            </div>

            {/* Quantity and Stock */}
            <div className="flipkart-quantity-section">
              <div className="quantity-controls">
                <span className="quantity-label">Quantity:</span>
                <div className="quantity-selector">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <span className="quantity-value">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="stock-status">
                <span className={`stock-indicator ${product.stock > 10 ? 'in-stock' : product.stock > 0 ? 'low-stock' : 'out-of-stock'}`}>
                  {product.stock > 10 ? "In Stock" : 
                   product.stock > 0 ? `Only ${product.stock} left` : 
                   "Out of Stock"}
                </span>
              </div>
            </div>

            {/* Key Features */}
            <div className="flipkart-highlights">
              <h3>Highlights</h3>
              <ul>
                <li><strong>Brand:</strong> {product.brand}</li>
                <li><strong>Category:</strong> {product.category}</li>
                {product.specifications && Object.entries(product.specifications).map(([key, value]) => (
                  <li key={key}><strong>{key}:</strong> {value}</li>
                ))}
                <li><strong>Warranty:</strong> 1 Year Manufacturing Warranty</li>
                <li><strong>Country of Origin:</strong> India</li>
              </ul>
            </div>

            {/* Seller Information */}
            <div className="flipkart-seller-info">
              <div className="seller-details">
                <span className="seller-label">Sold by:</span>
                <span className="seller-name">Electrostore - Jaimaaruthi Electrics</span>
                <div className="seller-rating">
                  <span className="seller-stars">★★★★☆</span>
                  <span>(4.3/5)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Sections (Flipkart Style Tabs) */}
        <div className="flipkart-details-section">
          <div className="flipkart-tabs">
            <button 
              className={`flipkart-tab ${selectedSection === 'description' ? 'active' : ''}`}
              onClick={() => setSelectedSection('description')}
            >
              Description
            </button>
            <button 
              className={`flipkart-tab ${selectedSection === 'specifications' ? 'active' : ''}`}
              onClick={() => setSelectedSection('specifications')}
            >
              Specifications
            </button>
            <button 
              className={`flipkart-tab ${selectedSection === 'reviews' ? 'active' : ''}`}
              onClick={() => setSelectedSection('reviews')}
            >
              Ratings & Reviews ({reviews.length})
            </button>
          </div>

          <div className="flipkart-tab-content">
            {selectedSection === 'description' && (
              <div className="flipkart-description">
                <h3>Product Description</h3>
                <div className="description-content">
                  <p>{product.description}</p>
                  
                  <div className="feature-highlights">
                    <h4>Key Features:</h4>
                    <ul>
                      <li>High-quality {product.category.toLowerCase()}</li>
                      <li>Durable construction for long-lasting performance</li>
                      <li>Easy installation and maintenance</li>
                      <li>Compliant with safety standards</li>
                      <li>Suitable for residential and commercial use</li>
                    </ul>
                  </div>

                  <div className="technical-info">
                    <h4>Technical Information:</h4>
                    <div className="tech-grid">
                      <div className="tech-item">
                        <span className="tech-label">Brand</span>
                        <span className="tech-value">{product.brand}</span>
                      </div>
                      <div className="tech-item">
                        <span className="tech-label">Category</span>
                        <span className="tech-value">{product.category}</span>
                      </div>
                      <div className="tech-item">
                        <span className="tech-label">Stock</span>
                        <span className="tech-value">{product.stock} units</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedSection === 'specifications' && (
              <div className="flipkart-specifications">
                <h3>Specifications</h3>
                <div className="spec-table">
                  <div className="spec-row">
                    <span className="spec-label">Brand</span>
                    <span className="spec-value">{product.brand}</span>
                  </div>
                  <div className="spec-row">
                    <span className="spec-label">Category</span>
                    <span className="spec-value">{product.category}</span>
                  </div>
                  <div className="spec-row">
                    <span className="spec-label">Model</span>
                    <span className="spec-value">{product.model || 'Standard Model'}</span>
                  </div>
                  <div className="spec-row">
                    <span className="spec-label">Warranty</span>
                    <span className="spec-value">1 Year Manufacturing Warranty</span>
                  </div>
                  {product.specifications && Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="spec-row">
                      <span className="spec-label">{key}</span>
                      <span className="spec-value">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedSection === 'reviews' && (
              <div className="flipkart-reviews">
                <div className="reviews-header">
                  <div className="reviews-summary">
                    <div className="rating-overview">
                      <span className="overall-rating">4.2 ★</span>
                      <span className="rating-count">{reviews.length} Ratings & Reviews</span>
                    </div>
                  </div>
                  
                  {userHasPurchased && (
                    <button className="write-review-btn">
                      Write a Review
                    </button>
                  )}
                </div>

                <div className="reviews-list">
                  {reviews.length > 0 ? reviews.map((review, index) => (
                    <div key={index} className="review-item">
                      <div className="review-header">
                        <div className="reviewer-info">
                          <span className="reviewer-name">{review.userName}</span>
                          <div className="review-rating">
                            <span className="stars">{'★'.repeat(review.rating)}{'☆'.repeat(5-review.rating)}</span>
                          </div>
                        </div>
                        <span className="review-date">{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="review-content">
                        <p>{review.comment}</p>
                        {review.images && review.images.length > 0 && (
                          <div className="review-images">
                            {review.images.map((img, imgIndex) => (
                              <img key={imgIndex} src={img} alt="Review" className="review-image" />
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="review-actions">
                        <button className="helpful-btn">👍 Helpful</button>
                        <button className="report-btn">Report</button>
                      </div>
                    </div>
                  )) : (
                    <div className="no-reviews">
                      <div className="no-reviews-icon">📝</div>
                      <h4>No reviews yet</h4>
                      <p>{userHasPurchased ? 'Be the first to write a review!' : 'Purchase this product to write a review'}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

            {/* Action Buttons */}
            <div className="action-section">
              <div className="quantity-selector">
                <label>Quantity:</label>
                <div className="quantity-controls">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >-</button>
                  <span>{quantity}</span>
                  <button 
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                  >+</button>
                </div>
              </div>

              <div style={{ 
                display: 'flex', 
                gap: '12px', 
                marginBottom: '24px',
                flexWrap: 'wrap'
              }}>
                <button 
                  onClick={handleAddToCart}
                  disabled={addingToCart || product.stock === 0}
                  style={{
                    backgroundColor: '#ff9f00',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '2px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    flex: window.innerWidth <= 768 ? '1 1 calc(50% - 6px)' : 'none',
                    minWidth: window.innerWidth <= 768 ? 'auto' : '140px'
                  }}
                >
                  {addingToCart ? "Adding..." : "🛒 ADD TO CART"}
                </button>
                
                <button 
                  onClick={handleBuyNow}
                  disabled={addingToCart || product.stock === 0}
                  style={{
                    backgroundColor: '#fb641b',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '2px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    flex: window.innerWidth <= 768 ? '1 1 calc(50% - 6px)' : 'none',
                    minWidth: window.innerWidth <= 768 ? 'auto' : '140px'
                  }}
                >
                  {addingToCart ? "Processing..." : "⚡ BUY NOW"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Specifications */}
        {product.specifications && (
          <div className="specifications-section">
            <h3>Specifications</h3>
            <div className="specs-grid">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="spec-item">
                  <span className="spec-label">{key.charAt(0).toUpperCase() + key.slice(1)}:</span>
                  <span className="spec-value">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Supplier Information */}
        {product.supplier && (
          <div className="supplier-section">
            <h3>Supplier Information</h3>
            <div className="supplier-info">
              <p><strong>Company:</strong> {product.supplier.name}</p>
              <p><strong>Contact:</strong> {product.supplier.contact}</p>
              <p><strong>Location:</strong> {product.supplier.location}</p>
            </div>
          </div>
        )}

        {/* Customer Reviews */}
        <div className="reviews-section">
          <h3>Customer Reviews</h3>
          <div className="reviews-list">
            {mockReviews.map((review) => (
              <div key={review.id} className="review-item">
                <div className="review-header">
                  <div className="reviewer-info">
                    <span className="reviewer-name">{review.user}</span>
                    {review.verified && <span className="verified-badge">Verified Purchase</span>}
                  </div>
                  <div className="review-rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className={star <= review.rating ? "star filled" : "star"}>★</span>
                    ))}
                  </div>
                </div>
                <p className="review-comment">{review.comment}</p>
                <span className="review-date">{new Date(review.date).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;

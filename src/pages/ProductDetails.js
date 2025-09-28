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
  const { isAuthenticated } = useAuth();
  const { addToCart: addToCartContext } = useCart();
  
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [userReviews, setUserReviews] = useState([]);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewImages, setReviewImages] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get('/products/' + id);
        
        if (response.data.success) {
          setProduct(response.data.data);
        } else {
          setProduct(response.data);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching product:", error);
        setLoading(false);
      }
    };

    const checkPurchaseHistory = async () => {
      if (isAuthenticated) {
        try {
          const response = await api.get(`/orders/check-purchase/${id}`);
          setHasPurchased(response.data.hasPurchased);
        } catch (error) {
          console.error("Error checking purchase history:", error);
        }
      }
    };

    const fetchReviews = async () => {
      try {
        const response = await api.get(`/products/${id}/reviews`);
        setUserReviews(response.data.reviews || []);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    fetchProduct();
    checkPurchaseHistory();
    fetchReviews();
  }, [id, isAuthenticated]);

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
      alert('Error adding to cart');
    }
    setAddingToCart(false);
  };

  const handleSubmitReview = async () => {
    if (!hasPurchased) {
      alert('You can only review products you have purchased.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('productId', id);
      formData.append('rating', reviewRating);
      formData.append('comment', reviewText);
      
      console.log('Submitting review with:');
      console.log('Product ID:', id);
      console.log('Rating:', reviewRating);
      console.log('Comment:', reviewText);
      console.log('Images count:', reviewImages.length);
      
      reviewImages.forEach((image, index) => {
        formData.append('images', image);
        console.log(`Image ${index}:`, image.name, image.size, 'bytes');
      });

      const response = await api.post('/products/reviews', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      console.log('Review submission response:', response.data);

      alert('Review submitted successfully!');
      setShowReviewModal(false);
      setReviewText('');
      setReviewRating(5);
      setReviewImages([]);
      
      // Refresh reviews
      const reviewsResponse = await api.get(`/products/${id}/reviews`);
      setUserReviews(reviewsResponse.data.reviews || []);
    } catch (error) {
      console.error('Error submitting review:', error);
      console.error('Error response:', error.response?.data);
      alert('Error submitting review: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + reviewImages.length > 3) {
      alert('You can upload maximum 3 images');
      return;
    }
    setReviewImages([...reviewImages, ...files]);
  };

  const removeReviewImage = (index) => {
    setReviewImages(reviewImages.filter((_, i) => i !== index));
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      alert('Please login to buy this product');
      navigate('/login');
      return;
    }

    console.log('Buy Now: Starting process for product:', id, 'quantity:', quantity);

    try {
      setAddingToCart(true);
      console.log('Buy Now: Adding to cart...');
      
      // Add product to cart first
      const success = await addToCartContext(id, quantity);
      
      console.log('Buy Now: Add to cart result:', success);
      
      if (success) {
        console.log('Buy Now: Successfully added to cart, redirecting to checkout...');
        // Redirect to checkout page
        navigate('/checkout');
      } else {
        console.error('Buy Now: Failed to add to cart');
        alert('Failed to process buy now request. Please try again.');
      }
    } catch (error) {
      console.error("Buy Now: Error occurred:", error);
      
      // Check if it's an authentication error
      if (error.response && error.response.status === 401) {
        alert('Your session has expired. Please log in again.');
        // Clear expired token
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.reload();
        navigate('/login');
      } else if (error.message && error.message.includes('log in')) {
        alert('Please log in to add items to cart');
        navigate('/login');
      } else {
        alert('Error processing buy now request. Please try again.');
      }
    } finally {
      setAddingToCart(false);
    }
  };

  const StarRating = ({ rating, onRatingChange, readonly = false }) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          style={{
            color: i <= rating ? '#ffa500' : '#e0e0e0',
            cursor: readonly ? 'default' : 'pointer',
            fontSize: '20px'
          }}
          onClick={() => !readonly && onRatingChange && onRatingChange(i)}
        >
          ★
        </span>
      );
    }
    return <div>{stars}</div>;
  };

  if (loading) {
    return (
      <div className="flipkart-style-page">
        <Header />
        <div style={{ 
          textAlign: 'center', 
          padding: '50px',
          background: '#f1f3f6',
          minHeight: 'calc(100vh - 80px)'
        }}>
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flipkart-style-page">
        <Header />
        <div style={{ 
          textAlign: 'center', 
          padding: '50px',
          background: '#f1f3f6',
          minHeight: 'calc(100vh - 80px)'
        }}>
          <h2>Product not found</h2>
          <button 
            onClick={() => navigate('/products')}
            style={{
              marginTop: '20px',
              padding: '12px 24px',
              backgroundColor: '#2874f0',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  // Mock product images - in real app, these would come from the API
  const productImages = [
    product.imageUrl ? 'http://localhost:5000' + product.imageUrl : '/images/default-product.jpg'
  ];

  return (
    <div className="flipkart-style-page">
      <Header />
      
      <div className="flipkart-container">
        {/* Breadcrumb */}
        <div className="flipkart-breadcrumb">
          <span 
            className="breadcrumb-link" 
            onClick={() => navigate('/')}
          >
            Home
          </span>
          <span> &gt; </span>
          <span 
            className="breadcrumb-link" 
            onClick={() => navigate('/products')}
          >
            Products
          </span>
          <span> &gt; </span>
          <span>{product.category || 'Electrical'}</span>
          <span> &gt; </span>
          <span>{product.name}</span>
        </div>

        <div className="flipkart-product-layout">
          {/* Image Section */}
          <div className="flipkart-image-section">
            <div className="flipkart-image-gallery">
              <div className="flipkart-thumbnails">
                {productImages.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`${product.name} ${index + 1}`}
                    className={`flipkart-thumbnail ${index === selectedImageIndex ? 'active' : ''}`}
                    onClick={() => setSelectedImageIndex(index)}
                    onError={(e) => {
                      e.target.src = '/images/default-product.jpg';
                    }}
                  />
                ))}
              </div>
              
              <div className="flipkart-main-image">
                <img
                  src={productImages[selectedImageIndex]}
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
                disabled={addingToCart}
              >
                <span>🛒</span>
                {addingToCart ? 'Adding...' : 'Add to Cart'}
              </button>
              <button 
                className="flipkart-buy-now"
                onClick={handleBuyNow}
                disabled={addingToCart}
                style={{
                  opacity: addingToCart ? 0.6 : 1,
                  cursor: addingToCart ? 'not-allowed' : 'pointer'
                }}
              >
                <span>⚡</span>
                {addingToCart ? 'Processing...' : 'Buy Now'}
              </button>
            </div>
          </div>

          {/* Info Section */}
          <div className="flipkart-info-section">
            <h1 className="flipkart-title">{product.name}</h1>
            
            <div className="flipkart-rating-section">
              <div className="flipkart-rating-badge">
                <span className="rating-value">4.2</span>
                <div className="rating-stars">★</div>
              </div>
              <span className="flipkart-rating-text">
                {userReviews.length} Ratings & {userReviews.length} Reviews
              </span>
            </div>

            <div className="flipkart-price-section">
              <div className="price-container">
                <span className="flipkart-current-price">₹{product.price}</span>
                <span className="flipkart-original-price">₹{Math.floor(product.price * 1.2)}</span>
                <span className="flipkart-discount-percent">17% off</span>
              </div>
              <div className="flipkart-price-offers">
                <span className="offer-tag">Free delivery</span>
                <span className="offer-tag">Save extra with combo offers</span>
              </div>
            </div>

            <div className="flipkart-quantity-section">
              <span className="quantity-label">Quantity</span>
              <div className="quantity-controls">
                <div className="quantity-selector">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <span className="quantity-value">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </button>
                </div>
                <div className="stock-status">
                  <span className="stock-indicator in-stock">In Stock</span>
                </div>
              </div>
            </div>

            <div className="flipkart-highlights">
              <h3>Highlights</h3>
              <ul>
                <li>High quality electrical product</li>
                <li>ISI certified for safety</li>
                <li>1 year manufacturer warranty</li>
                <li>Easy installation</li>
                <li>Durable construction</li>
              </ul>
            </div>

            <div className="flipkart-seller-info">
              <div className="seller-details">
                <span className="seller-label">Sold by</span>
                <span className="seller-name">Jaimaruthi Electrical Store</span>
                <div className="seller-rating">
                  <span className="seller-stars">★★★★☆</span>
                  <span>4.1</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Details Section with Tabs */}
        <div className="flipkart-details-section">
          <div className="flipkart-tabs">
            <button 
              className={`flipkart-tab ${activeTab === 'description' ? 'active' : ''}`}
              onClick={() => setActiveTab('description')}
            >
              Description
            </button>
            <button 
              className={`flipkart-tab ${activeTab === 'specifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('specifications')}
            >
              Specifications
            </button>
            <button 
              className={`flipkart-tab ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews ({userReviews.length})
            </button>
          </div>

          <div className="flipkart-tab-content">
            {activeTab === 'description' && (
              <div className="flipkart-description">
                <h3>Product Description</h3>
                <div className="description-content">
                  <p>{product.description || 'High-quality electrical product designed for reliable performance and safety. This product meets all industry standards and comes with manufacturer warranty.'}</p>
                </div>
                
                <div className="feature-highlights">
                  <h4>Key Features</h4>
                  <ul>
                    <li>Premium quality construction</li>
                    <li>ISI certified for safety compliance</li>
                    <li>Easy installation and maintenance</li>
                    <li>Long-lasting durability</li>
                    <li>Excellent performance</li>
                  </ul>
                </div>

                <div className="technical-info">
                  <h4>Technical Information</h4>
                  <div className="tech-grid">
                    <div className="tech-item">
                      <span className="tech-label">Brand</span>
                      <span className="tech-value">{product.brand || 'Premium Brand'}</span>
                    </div>
                    <div className="tech-item">
                      <span className="tech-label">Model</span>
                      <span className="tech-value">{product.model || product.name}</span>
                    </div>
                    <div className="tech-item">
                      <span className="tech-label">Warranty</span>
                      <span className="tech-value">1 Year</span>
                    </div>
                    <div className="tech-item">
                      <span className="tech-label">Country of Origin</span>
                      <span className="tech-value">India</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="flipkart-specifications">
                <h3>Specifications</h3>
                <div className="spec-table">
                  <div className="spec-row">
                    <div className="spec-label">Product Name</div>
                    <div className="spec-value">{product.name}</div>
                  </div>
                  <div className="spec-row">
                    <div className="spec-label">Category</div>
                    <div className="spec-value">{product.category || 'Electrical Components'}</div>
                  </div>
                  <div className="spec-row">
                    <div className="spec-label">Price</div>
                    <div className="spec-value">₹{product.price}</div>
                  </div>
                  <div className="spec-row">
                    <div className="spec-label">Availability</div>
                    <div className="spec-value">In Stock</div>
                  </div>
                  <div className="spec-row">
                    <div className="spec-label">Warranty</div>
                    <div className="spec-value">1 Year Manufacturer Warranty</div>
                  </div>
                  <div className="spec-row">
                    <div className="spec-label">Certification</div>
                    <div className="spec-value">ISI Certified</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="flipkart-reviews">
                <div className="reviews-header">
                  <div className="reviews-summary">
                    <div className="rating-overview">
                      <span className="overall-rating">4.2</span>
                      <div className="rating-stars">★★★★☆</div>
                      <span className="rating-count">{userReviews.length} reviews</span>
                    </div>
                  </div>
                  {isAuthenticated && hasPurchased && (
                    <button 
                      className="write-review-btn"
                      onClick={() => setShowReviewModal(true)}
                    >
                      Write Review
                    </button>
                  )}
                </div>

                {userReviews.length > 0 ? (
                  <div className="reviews-list">
                    {userReviews.map((review, index) => (
                      <div key={index} className="review-item">
                        <div className="review-header">
                          <div className="reviewer-info">
                            <span className="reviewer-name">{review.userName}</span>
                            <div className="review-rating">
                              <StarRating rating={review.rating} readonly />
                            </div>
                            <span className="review-date">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="review-content">
                          <p>{review.comment}</p>
                          {review.images && review.images.length > 0 && (
                            <div className="review-images">
                              {review.images.map((img, imgIndex) => {
                                // Handle different image path formats
                                let imageSrc;
                                if (img.startsWith('http')) {
                                  imageSrc = img;
                                } else if (img.startsWith('/uploads/')) {
                                  imageSrc = `http://localhost:5000${img}`;
                                } else if (img.startsWith('uploads/')) {
                                  imageSrc = `http://localhost:5000/${img}`;
                                } else {
                                  imageSrc = `http://localhost:5000/uploads/reviews/${img}`;
                                }
                                
                                return (
                                  <img
                                    key={imgIndex}
                                    src={imageSrc}
                                    alt="Review"
                                    className="review-image"
                                    onError={(e) => {
                                      console.log('Failed to load review image:', img, 'Tried URL:', imageSrc);
                                      e.target.style.display = 'none';
                                    }}
                                    onLoad={() => {
                                      console.log('Successfully loaded review image:', imageSrc);
                                    }}
                                  />
                                );
                              })}
                            </div>
                          )}
                        </div>
                        <div className="review-actions">
                          <button className="helpful-btn">Helpful</button>
                          <button className="report-btn">Report</button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-reviews">
                    <div className="no-reviews-icon">📝</div>
                    <h4>No reviews yet</h4>
                    <p>Be the first to review this product</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3>Write a Review</h3>
            
            <div style={{ margin: '16px 0' }}>
              <label>Rating:</label>
              <StarRating 
                rating={reviewRating} 
                onRatingChange={setReviewRating}
              />
            </div>

            <div style={{ margin: '16px 0' }}>
              <label>Review:</label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your experience with this product..."
                style={{
                  width: '100%',
                  height: '100px',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ margin: '16px 0' }}>
              <label>Upload Images (max 3):</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                style={{ margin: '8px 0' }}
              />
              
              {reviewImages.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                  {reviewImages.map((img, index) => (
                    <div key={index} style={{ position: 'relative' }}>
                      <img
                        src={URL.createObjectURL(img)}
                        alt="Review preview"
                        style={{
                          width: '60px',
                          height: '60px',
                          objectFit: 'cover',
                          borderRadius: '4px'
                        }}
                      />
                      <button
                        onClick={() => removeReviewImage(index)}
                        style={{
                          position: 'absolute',
                          top: '-5px',
                          right: '-5px',
                          background: '#ff4757',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={handleSubmitReview}
                style={{
                  backgroundColor: '#2874f0',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Submit Review
              </button>
              <button
                onClick={() => setShowReviewModal(false)}
                style={{
                  backgroundColor: '#ccc',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;

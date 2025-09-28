import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import './OrderSuccess.css';

const OrderSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshCart } = useCart();
  const [orderData, setOrderData] = useState(null);
  
  const orderState = location.state;

  useEffect(() => {
    if (!orderState) {
      navigate('/');
    } else {
      setOrderData(orderState);
      // Refresh cart to reflect cleared items after successful order
      refreshCart();
    }
  }, [orderState, navigate, refreshCart]);

  const generateBill = () => {
    const billContent = `
      <!DOCTYPE html>
      <html>
      <head>
          <title>Electric Store - Order Receipt</title>
          <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .logo { font-size: 24px; font-weight: bold; color: #3498db; }
              .receipt { max-width: 600px; margin: 0 auto; }
              .section { margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; }
              .row { display: flex; justify-content: space-between; margin-bottom: 10px; }
              .label { font-weight: bold; }
              .success { color: #4CAF50; font-weight: bold; }
              .items-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
              .items-table th, .items-table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
              .items-table th { background-color: #f9f9f9; }
              .total { font-size: 18px; font-weight: bold; color: #3498db; }
              @media print {
                  body { margin: 0; }
                  .no-print { display: none; }
              }
          </style>
      </head>
      <body>
          <div class="receipt">
              <div class="header">
                  <div class="logo">Electric Store</div>
                  <p>Your Trusted Electronics Partner</p>
              </div>
              
              <div class="section">
                  <h3>Order Receipt</h3>
                  <div class="row">
                      <span class="label">Order Number:</span>
                      <span>${orderData?.orderNumber || 'N/A'}</span>
                  </div>
                  <div class="row">
                      <span class="label">Payment ID:</span>
                      <span>${orderData?.paymentId || 'N/A'}</span>
                  </div>
                  <div class="row">
                      <span class="label">Payment Method:</span>
                      <span>${orderData?.paymentMethod || 'N/A'}</span>
                  </div>
                  <div class="row">
                      <span class="label">Status:</span>
                      <span class="success">Payment Successful</span>
                  </div>
                  <div class="row">
                      <span class="label">Date:</span>
                      <span>${new Date().toLocaleString()}</span>
                  </div>
              </div>
              
              ${orderData?.orderData?.items ? `
              <div class="section">
                  <h3>Order Items</h3>
                  <table class="items-table">
                      <thead>
                          <tr>
                              <th>Item</th>
                              <th>Quantity</th>
                              <th>Price</th>
                              <th>Total</th>
                          </tr>
                      </thead>
                      <tbody>
                          ${orderData.orderData.items.map(item => `
                              <tr>
                                  <td>${item.name || 'Product'}</td>
                                  <td>${item.quantity}</td>
                                  <td>₹${item.price}</td>
                                  <td>₹${(item.quantity * item.price).toFixed(2)}</td>
                              </tr>
                          `).join('')}
                      </tbody>
                  </table>
              </div>
              ` : ''}
              
              ${orderData?.orderData?.customerDetails ? `
              <div class="section">
                  <h3>Delivery Address</h3>
                  <div class="row">
                      <span class="label">Name:</span>
                      <span>${orderData.orderData.customerDetails.firstName} ${orderData.orderData.customerDetails.lastName}</span>
                  </div>
                  <div class="row">
                      <span class="label">Email:</span>
                      <span>${orderData.orderData.customerDetails.email}</span>
                  </div>
                  <div class="row">
                      <span class="label">Phone:</span>
                      <span>${orderData.orderData.customerDetails.phone}</span>
                  </div>
                  <div class="row">
                      <span class="label">Address:</span>
                      <span>${orderData.orderData.customerDetails.address}, ${orderData.orderData.customerDetails.city}, ${orderData.orderData.customerDetails.state} - ${orderData.orderData.customerDetails.pincode}</span>
                  </div>
              </div>
              ` : ''}
              
              <div class="section">
                  <h3>Payment Summary</h3>
                  ${orderData?.orderData?.orderSummary ? `
                  <div class="row">
                      <span class="label">Subtotal:</span>
                      <span>₹${orderData.orderData.orderSummary.subtotal}</span>
                  </div>
                  <div class="row">
                      <span class="label">Shipping:</span>
                      <span>₹${orderData.orderData.orderSummary.shipping}</span>
                  </div>
                  <div class="row">
                      <span class="label">Tax:</span>
                      <span>₹${orderData.orderData.orderSummary.tax}</span>
                  </div>
                  <div class="row total">
                      <span>Total Amount:</span>
                      <span>₹${orderData.orderData.orderSummary.total}</span>
                  </div>
                  ` : `
                  <div class="row total">
                      <span>Total Amount:</span>
                      <span>₹${orderData?.amount?.toFixed(2) || '0.00'}</span>
                  </div>
                  `}
              </div>
              
              <div class="section no-print">
                  <p style="text-align: center; color: #666;">
                      Thank you for shopping with Electric Store!<br>
                      Expected delivery: 5-7 business days
                  </p>
              </div>
          </div>
      </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(billContent);
    printWindow.document.close();
    printWindow.focus();
    
    // Auto print after a delay
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  if (!orderData) {
    return null;
  }

  return (
    <div className="order-success-container">
      <div className="success-card">
        <div className="success-animation">
          <div className="checkmark-circle">
            <div className="checkmark"></div>
          </div>
        </div>
        
        <div className="success-content">
          <h1 className="success-title">Order Placed Successfully!</h1>
          <p className="success-subtitle">Thank you for your purchase</p>
          
          <div className="order-details">
            <div className="detail-row">
              <span className="label">Order ID:</span>
              <span className="value">{orderData.orderNumber || orderData.orderId}</span>
            </div>
            
            {orderData.paymentId && (
              <div className="detail-row">
                <span className="label">Payment ID:</span>
                <span className="value">{orderData.paymentId}</span>
              </div>
            )}
            
            <div className="detail-row">
              <span className="label">Payment Method:</span>
              <span className="value">{orderData.paymentMethod}</span>
            </div>
            
            {orderData.amount && (
              <div className="detail-row">
                <span className="label">Amount Paid:</span>
                <span className="value">₹{orderData.amount.toFixed(2)}</span>
              </div>
            )}
            
            <div className="detail-row">
              <span className="label">Status:</span>
              <span className="value status-confirmed">Payment Successful</span>
            </div>
          </div>
          
          <div className="success-message">
            <i className="fas fa-truck"></i>
            <div>
              <h3>What's Next?</h3>
              <p>We'll send you an email with tracking details once your order is shipped.</p>
              <p>Expected delivery: <strong>5-7 business days</strong></p>
            </div>
          </div>
          
          <div className="action-buttons">
            <button 
              className="download-bill-btn"
              onClick={generateBill}
            >
              <i className="fas fa-download"></i>
              Generate Bill
            </button>
            
            <button 
              className="continue-shopping-btn"
              onClick={() => navigate('/products')}
            >
              <i className="fas fa-shopping-cart"></i>
              Continue Shopping
            </button>
            
            <button 
              className="view-orders-btn"
              onClick={() => navigate('/my-account')}
            >
              <i className="fas fa-list"></i>
              View My Orders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;

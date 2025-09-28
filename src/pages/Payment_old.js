import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Payment.css';

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Get order data from checkout
  const orderData = location.state?.orderData;
  const orderTotal = location.state?.orderTotal || 0;

  useEffect(() => {
    if (!orderData) {
      navigate('/checkout');
      return;
    }
    fetchPaymentMethods();
    loadRazorpayScript();
  }, []);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/payment/methods');
      const data = await response.json();
      
      if (data.success) {
        setPaymentMethods(data.paymentMethods);
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSelection = (methodId, optionId = '') => {
    setSelectedMethod(methodId);
    setSelectedOption(optionId);
  };

  const processPayment = async () => {
    if (!selectedMethod) {
      alert('Please select a payment method');
      return;
    }

    setProcessing(true);

    try {
      if (selectedMethod === 'cod') {
        await handleCODPayment();
      } else if (selectedMethod === 'upi') {
        await handleUPIPayment();
      } else {
        await handleRazorpayPayment();
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleCODPayment = async () => {
    try {
      const token = localStorage.getItem('token');
      
      console.log('Processing COD payment with order data:', orderData);
      console.log('Order total:', orderTotal);
      
      // Validate order data
      if (!orderData || !orderData.items || !orderData.customerDetails || !orderData.orderSummary) {
        throw new Error('Invalid order data structure');
      }
      
      // Calculate correct total if orderTotal seems incorrect
      const calculatedTotal = orderData.orderSummary.total || 
                             (orderData.orderSummary.subtotal + orderData.orderSummary.shipping + orderData.orderSummary.tax) ||
                             orderTotal;
      
      console.log('Using total amount for COD:', calculatedTotal);
      
      const response = await fetch('http://localhost:5000/api/payment/verify-cod', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: calculatedTotal,
          orderData: {
            ...orderData,
            // Ensure items have correct structure
            items: orderData.items.map(item => ({
              productId: item.productId || item._id,
              quantity: parseInt(item.quantity) || 1,
              price: parseFloat(item.price) || 0,
              name: item.name || item.productId?.name || 'Product'
            })),
            // Ensure order summary is properly formatted
            orderSummary: {
              subtotal: parseFloat(orderData.orderSummary.subtotal) || 0,
              shipping: parseFloat(orderData.orderSummary.shipping) || 0,
              tax: parseFloat(orderData.orderSummary.tax) || 0,
              total: calculatedTotal,
              itemCount: parseInt(orderData.orderSummary.itemCount) || orderData.items.length
            },
            paymentDetails: {
              method: 'cod',
              status: 'pending',
              selectedOption: 'cash_on_delivery'
            }
          }
        })
      });

      const result = await response.json();
      console.log('COD payment result:', result);
      
      if (result.success) {
        // Clear cart
        await fetch('http://localhost:5000/api/cart/clear', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        navigate('/order-success', { 
          state: { 
            orderId: result.order._id,
            orderNumber: result.order.orderNumber,
            paymentMethod: 'Cash on Delivery',
            amount: calculatedTotal,
            orderData: orderData
          } 
        });
      } else {
        throw new Error(result.message || 'COD order creation failed');
      }
    } catch (error) {
      console.error('COD payment error:', error);
      throw error;
    }
  };

  const handleUPIPayment = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Create UPI payment order
      const orderResponse = await fetch('http://localhost:5000/api/payment/create-upi-order', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: orderTotal,
          currency: 'INR',
          receipt: `upi_receipt_${Date.now()}`,
          customer: {
            name: `${orderData.customerDetails.firstName} ${orderData.customerDetails.lastName}`,
            email: orderData.customerDetails.email,
            contact: orderData.customerDetails.phone
          }
        })
      });

      const orderResult = await orderResponse.json();
      
      if (!orderResult.success) {
        throw new Error(orderResult.message || 'Failed to create UPI payment order');
      }

      // For real UPI payment, redirect to UPI app or show QR code
      if (orderResult.upi_link) {
        // Try to open UPI app directly
        const upiLink = orderResult.upi_link;
        
        // Check if we're on mobile device
        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
          // On mobile: Try multiple UPI app links for better compatibility
          const tryUPIApp = (link) => {
            return new Promise((resolve) => {
              const iframe = document.createElement('iframe');
              iframe.style.display = 'none';
              iframe.src = link;
              document.body.appendChild(iframe);
              
              setTimeout(() => {
                document.body.removeChild(iframe);
                resolve();
              }, 1000);
            });
          };

          // Try GPay first, then PhonePe, then generic UPI
          try {
            if (orderResult.gpay_link) {
              await tryUPIApp(orderResult.gpay_link);
            } else if (orderResult.phonepe_link) {
              await tryUPIApp(orderResult.phonepe_link);
            } else {
              // Fallback to direct window location change
              window.location.href = upiLink;
            }
          } catch (error) {
            // If iframe method fails, try direct method
            window.location.href = upiLink;
          }
          
          // Fallback: Show manual instructions after a delay
          setTimeout(async () => {
            const userConfirmed = window.confirm(
              `If GPay/PhonePe didn't open automatically:\n\n` +
              `Amount: ₹${orderTotal}\n` +
              `Pay to: ${orderResult.vpa}\n` +
              `Merchant: ${orderResult.merchant_name}\n\n` +
              `Please open your UPI app manually and pay to the above UPI ID.\n\n` +
              `Click OK after completing payment, or Cancel to try another method.`
            );

            if (userConfirmed) {
              try {
                await handleUPIPaymentVerification(orderResult.order);
              } catch (error) {
                console.error('Payment verification error:', error);
                alert('Payment verification failed. Please try again.');
                setProcessing(false);
              }
            } else {
              setProcessing(false);
              return;
            }
          }, 3000);
        } else {
          // On desktop: Show QR code and manual payment options
          const paymentModal = document.createElement('div');
          paymentModal.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10000; display: flex; justify-content: center; align-items: center;">
              <div style="background: white; padding: 30px; border-radius: 10px; text-align: center; max-width: 400px; width: 90%;">
                <h3 style="margin-bottom: 20px; color: #333;">UPI Payment</h3>
                <p style="margin-bottom: 15px; color: #666;">Amount: <strong>₹${orderTotal}</strong></p>
                <p style="margin-bottom: 20px; color: #666;">Pay to: <strong>${orderResult.vpa}</strong></p>
                
                <div style="margin-bottom: 20px;">
                  <p style="margin-bottom: 10px; font-weight: bold;">Quick Pay Options:</p>
                  <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin-bottom: 15px;">
                    <button onclick="window.open('${orderResult.gpay_link || upiLink}', '_blank')" style="background: #4285f4; color: white; padding: 8px 15px; border: none; border-radius: 20px; cursor: pointer; font-size: 12px;">📱 GPay</button>
                    <button onclick="window.open('${orderResult.phonepe_link || upiLink}', '_blank')" style="background: #5f259f; color: white; padding: 8px 15px; border: none; border-radius: 20px; cursor: pointer; font-size: 12px;">📱 PhonePe</button>
                    <button onclick="window.open('${orderResult.paytm_link || upiLink}', '_blank')" style="background: #00baf2; color: white; padding: 8px 15px; border: none; border-radius: 20px; cursor: pointer; font-size: 12px;">📱 Paytm</button>
                  </div>
                </div>
                
                <div style="margin-bottom: 20px;">
                  <p style="margin-bottom: 10px; font-weight: bold;">Scan QR Code:</p>
                  <img src="${orderResult.qr_code_url}" alt="UPI QR Code" style="max-width: 200px; height: auto; border: 1px solid #ddd; padding: 10px;">
                </div>
                
                <div style="margin-bottom: 20px;">
                  <p style="margin-bottom: 10px; font-weight: bold;">Or copy UPI ID:</p>
                  <input type="text" value="${orderResult.vpa}" readonly style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; text-align: center; background: #f9f9f9;">
                </div>
                
                <div style="margin-bottom: 20px;">
                  <p style="font-size: 14px; color: #888;">Open your UPI app (GPay, PhonePe, Paytm) and pay to the above UPI ID</p>
                </div>
                
                <div>
                  <button onclick="handlePaymentComplete()" style="background: #4CAF50; color: white; padding: 10px 20px; border: none; border-radius: 5px; margin-right: 10px; cursor: pointer;">Payment Done</button>
                  <button onclick="handlePaymentCancel()" style="background: #f44336; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">Cancel</button>
                </div>
              </div>
            </div>
          `;
          
          document.body.appendChild(paymentModal);
          
          // Add global functions for modal buttons
          window.handlePaymentComplete = async () => {
            document.body.removeChild(paymentModal);
            try {
              await handleUPIPaymentVerification(orderResult.order);
            } catch (error) {
              console.error('Payment verification error:', error);
              alert('Payment verification failed. Please try again.');
              setProcessing(false);
            }
          };
          
          window.handlePaymentCancel = () => {
            document.body.removeChild(paymentModal);
            setProcessing(false);
          };
        }
      }
    } catch (error) {
      throw error;
    }
  };

  const handleUPIPaymentVerification = async (order) => {
    try {
      const token = localStorage.getItem('token');
      
      console.log('Starting UPI payment verification...');
      console.log('Order data being sent:', JSON.stringify(orderData, null, 2));
      console.log('Order total:', orderTotal);
      console.log('Order data items:', orderData?.items);
      console.log('Order data summary:', orderData?.orderSummary);
      
      // Validate order data before sending
      if (!orderData || !orderData.items || !orderData.customerDetails || !orderData.orderSummary) {
        throw new Error('Invalid order data structure');
      }

      // Calculate correct total if orderTotal seems incorrect
      const calculatedTotal = orderData.orderSummary.total || 
                             (orderData.orderSummary.subtotal + orderData.orderSummary.shipping + orderData.orderSummary.tax) ||
                             orderTotal;
      
      console.log('Using total amount:', calculatedTotal);
      
      // Show processing modal
      const processingModal = document.createElement('div');
      processingModal.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10001; display: flex; justify-content: center; align-items: center;">
          <div style="background: white; padding: 30px; border-radius: 10px; text-align: center; max-width: 400px; width: 90%;">
            <div style="margin-bottom: 20px;">
              <div style="width: 50px; height: 50px; border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
              <style>
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              </style>
            </div>
            <h3 style="margin-bottom: 15px; color: #333;">Verifying Payment...</h3>
            <p style="color: #666; margin-bottom: 20px;">Please wait while we confirm your payment.</p>
          </div>
        </div>
      `;
      document.body.appendChild(processingModal);
      
      // Verify payment
      const verifyResponse = await fetch('http://localhost:5000/api/payment/verify-upi', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId: order.id,
          amount: calculatedTotal,
          orderData: {
            ...orderData,
            // Ensure items have correct structure
            items: orderData.items.map(item => ({
              productId: item.productId || item._id,
              quantity: parseInt(item.quantity) || 1,
              price: parseFloat(item.price) || 0,
              name: item.name || item.productId?.name || 'Product'
            })),
            // Ensure order summary is properly formatted
            orderSummary: {
              subtotal: parseFloat(orderData.orderSummary.subtotal) || 0,
              shipping: parseFloat(orderData.orderSummary.shipping) || 0,
              tax: parseFloat(orderData.orderSummary.tax) || 0,
              total: parseFloat(orderData.orderSummary.total) || calculatedTotal,
              itemCount: parseInt(orderData.orderSummary.itemCount) || orderData.items.length
            }
          }
        })
      });

      const result = await verifyResponse.json();
      console.log('Payment verification result:', result);
      
      // Remove processing modal
      if (document.body.contains(processingModal)) {
        document.body.removeChild(processingModal);
      }
      
      if (result.success) {
        // Show success popup with proper details
        const successModal = document.createElement('div');
        successModal.innerHTML = `
          <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10001; display: flex; justify-content: center; align-items: center;">
            <div style="background: white; padding: 30px; border-radius: 10px; text-align: center; max-width: 500px; width: 90%;">
              <div style="margin-bottom: 20px;">
                <div style="width: 60px; height: 60px; border-radius: 50%; background: #4CAF50; margin: 0 auto; display: flex; align-items: center; justify-content: center; margin-bottom: 15px;">
                  <span style="color: white; font-size: 30px;">✓</span>
                </div>
              </div>
              <h3 style="margin-bottom: 15px; color: #4CAF50;">Payment Successful!</h3>
              <p style="color: #666; margin-bottom: 10px;"><strong>Amount Paid:</strong> ₹${calculatedTotal.toFixed(2)}</p>
              <p style="color: #666; margin-bottom: 10px;"><strong>Order Number:</strong> ${result.order.orderNumber}</p>
              <p style="color: #666; margin-bottom: 10px;"><strong>Payment ID:</strong> ${result.paymentId}</p>
              <p style="color: #666; margin-bottom: 20px;"><strong>Items:</strong> ${result.order.items?.length || orderData.items.length} item(s)</p>
              <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0; text-align: left;">
                <h4 style="margin: 0 0 10px 0; color: #333;">Order Summary:</h4>
                <p style="margin: 5px 0; color: #666;">Subtotal: ₹${orderData.orderSummary.subtotal}</p>
                <p style="margin: 5px 0; color: #666;">Tax: ₹${orderData.orderSummary.tax}</p>
                <p style="margin: 5px 0; color: #666;">Shipping: ₹${orderData.orderSummary.shipping}</p>
                <hr style="margin: 10px 0;">
                <p style="margin: 5px 0; font-weight: bold; color: #333;">Total: ₹${orderData.orderSummary.total}</p>
              </div>
              <div>
                <button onclick="handleSuccessClose()" style="background: #4CAF50; color: white; padding: 12px 30px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; margin-right: 10px;">Continue</button>
                <button onclick="handlePrintBill()" style="background: #2196F3; color: white; padding: 12px 30px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">Print Receipt</button>
              </div>
            </div>
          </div>
        `;
        document.body.appendChild(successModal);
        
        window.handleSuccessClose = async () => {
          document.body.removeChild(successModal);
          
          // Clear cart
          try {
            await fetch('http://localhost:5000/api/cart/clear', {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
          } catch (error) {
            console.error('Error clearing cart:', error);
          }

          navigate('/order-success', { 
            state: { 
              orderId: result.order._id,
              orderNumber: result.order.orderNumber,
              paymentMethod: 'UPI Payment',
              paymentId: result.paymentId,
              amount: orderTotal,
              orderData: orderData
            } 
          });
        };

        window.handlePrintBill = () => {
          const printWindow = window.open('', '_blank');
          const billContent = `
            <!DOCTYPE html>
            <html>
            <head>
              <title>Payment Receipt</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
                .detail { margin: 10px 0; }
                .total { font-size: 18px; font-weight: bold; border-top: 2px solid #333; padding-top: 10px; margin-top: 20px; }
                @media print { body { margin: 0; } }
              </style>
            </head>
            <body>
              <div class="header">
                <h2>Electric Store</h2>
                <h3>Payment Receipt</h3>
              </div>
              <div class="detail"><strong>Order Number:</strong> ${result.order.orderNumber}</div>
              <div class="detail"><strong>Payment ID:</strong> ${result.paymentId}</div>
              <div class="detail"><strong>Payment Method:</strong> UPI Payment</div>
              <div class="detail"><strong>Date:</strong> ${new Date().toLocaleString()}</div>
              <div class="detail"><strong>Customer:</strong> ${orderData.customerDetails.firstName} ${orderData.customerDetails.lastName}</div>
              <div class="detail"><strong>Items:</strong> ${orderData.items.length} item(s)</div>
              <div class="detail"><strong>Subtotal:</strong> ₹${orderData.orderSummary.subtotal}</div>
              <div class="detail"><strong>Tax:</strong> ₹${orderData.orderSummary.tax}</div>
              <div class="detail"><strong>Shipping:</strong> ₹${orderData.orderSummary.shipping}</div>
              <div class="total">Total Amount: ₹${orderData.orderSummary.total}</div>
              <div style="margin-top: 30px; text-align: center; color: #666;">
                <p>Thank you for your purchase!</p>
              </div>
            </body>
            </html>
          `;
          printWindow.document.write(billContent);
          printWindow.document.close();
          setTimeout(() => {
            printWindow.print();
            printWindow.close();
          }, 500);
        };
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      
      // Remove any existing modals
      const modals = document.querySelectorAll('[style*="position: fixed"]');
      modals.forEach(modal => {
        if (document.body.contains(modal)) {
          document.body.removeChild(modal);
        }
      });
      
      // Show error modal
      const errorModal = document.createElement('div');
      errorModal.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10001; display: flex; justify-content: center; align-items: center;">
          <div style="background: white; padding: 30px; border-radius: 10px; text-align: center; max-width: 400px; width: 90%;">
            <div style="margin-bottom: 20px;">
              <div style="width: 60px; height: 60px; border-radius: 50%; background: #f44336; margin: 0 auto; display: flex; align-items: center; justify-content: center; margin-bottom: 15px;">
                <span style="color: white; font-size: 30px;">✗</span>
              </div>
            </div>
            <h3 style="margin-bottom: 15px; color: #f44336;">Payment Verification Failed</h3>
            <p style="color: #666; margin-bottom: 20px;">${error.message || 'Please try again or contact support.'}</p>
            <div>
              <button onclick="handleErrorClose()" style="background: #f44336; color: white; padding: 10px 25px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">Try Again</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(errorModal);
      
      window.handleErrorClose = () => {
        document.body.removeChild(errorModal);
        setProcessing(false);
      };
      
      throw error;
    }
  };

  const handleRazorpayPayment = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const orderResponse = await fetch('http://localhost:5000/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: orderTotal,
          currency: 'INR',
          receipt: `receipt_${Date.now()}`
        })
      });

      const orderResult = await orderResponse.json();
      
      if (!orderResult.success) {
        if (orderResult.setup_required) {
          alert('Payment system setup required. Please configure Razorpay credentials in the backend.');
          return;
        }
        throw new Error(orderResult.message || 'Failed to create payment order');
      }

      // Check if we're in demo mode
      if (orderResult.demo_mode || orderResult.key_id === 'rzp_test_demo_key') {
        // Demo mode - simulate successful payment
        alert('Demo Mode: Simulating payment processing...\nThis will complete in 2 seconds.');
        setTimeout(async () => {
          const simulatedResponse = {
            razorpay_payment_id: `pay_demo_${Date.now()}`,
            razorpay_order_id: orderResult.order.id,
            razorpay_signature: 'demo_signature_' + Math.random().toString(36).substr(2, 9)
          };
          await verifyPayment(simulatedResponse, orderResult.order);
        }, 2000); // 2 second delay to simulate processing
        return;
      }

      // Real Razorpay checkout (only if valid credentials)
      const options = {
        key: orderResult.key_id,
        amount: orderResult.order.amount,
        currency: orderResult.order.currency,
        name: 'Electric Store',
        description: 'Order Payment',
        image: '/logo192.png', // Your store logo
        order_id: orderResult.order.id,
        handler: async function (response) {
          await verifyPayment(response, orderResult.order);
        },
        prefill: {
          name: `${orderData.customerDetails.firstName} ${orderData.customerDetails.lastName}`,
          email: orderData.customerDetails.email,
          contact: orderData.customerDetails.phone
        },
        notes: {
          address: orderData.customerDetails.address
        },
        theme: {
          color: '#3498db'
        },
        modal: {
          ondismiss: function() {
            setProcessing(false);
            alert('Payment cancelled by user');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (response) {
        setProcessing(false);
        alert('Payment failed: ' + response.error.description);
      });
      
      razorpay.open();
    } catch (error) {
      throw error;
    }
  };

  const verifyPayment = async (paymentResponse, razorpayOrder) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/payment/verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          razorpay_order_id: paymentResponse.razorpay_order_id,
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_signature: paymentResponse.razorpay_signature,
          orderData: {
            ...orderData,
            paymentDetails: {
              method: selectedMethod,
              status: 'completed',
              selectedOption: selectedOption
            }
          }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        await fetch('http://localhost:5000/api/cart/clear', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        navigate('/order-success', { 
          state: { 
            orderId: result.orderId,
            paymentId: paymentResponse.razorpay_payment_id,
            paymentMethod: getPaymentMethodName()
          } 
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Payment verification failed:', error);
      alert('Payment verification failed. Please contact support.');
    }
  };

  const getPaymentMethodName = () => {
    const method = paymentMethods.find(m => m.id === selectedMethod);
    if (!method) return 'Online Payment';
    
    if (selectedOption) {
      const option = method.options.find(o => o.id === selectedOption);
      return option ? option.name : method.name;
    }
    
    return method.name;
  };

  if (loading) {
    return (
      <div className="payment-loading">
        <div className="spinner"></div>
        <p>Loading payment methods...</p>
      </div>
    );
  }

  return (
    <div className="payment-container">
      <div className="payment-header">
        <h1>
          <i className="fas fa-credit-card"></i>
          Choose Payment Method
        </h1>
        <div className="order-amount">
          <span>Total Amount: </span>
          <span className="amount">₹{orderTotal.toFixed(2)}</span>
        </div>
      </div>

      <div className="secure-notice">
        <i className="fas fa-shield-alt"></i>
        <span>Demo Mode - Secure Payment Simulation</span>
      </div>

      <div className="payment-content">
        <div className="payment-methods">
          {paymentMethods.map(method => (
            <div key={method.id} className="payment-method-section">
              <div 
                className={`payment-method ${selectedMethod === method.id ? 'selected' : ''}`}
                onClick={() => handlePaymentSelection(method.id)}
              >
                <div className="method-info">
                  <span className="method-icon">{method.icon}</span>
                  <div className="method-details">
                    <h3>{method.name}</h3>
                    <p>{method.description}</p>
                  </div>
                </div>
                <div className="method-radio">
                  <input 
                    type="radio" 
                    checked={selectedMethod === method.id}
                    onChange={() => handlePaymentSelection(method.id)}
                  />
                </div>
              </div>

              {selectedMethod === method.id && method.options.length > 0 && (
                <div className="payment-options">
                  {method.options.map(option => (
                    <div 
                      key={option.id}
                      className={`payment-option ${selectedOption === option.id ? 'selected' : ''}`}
                      onClick={() => setSelectedOption(option.id)}
                    >
                      <span className="option-icon">{option.icon}</span>
                      <span className="option-name">{option.name}</span>
                      <input 
                        type="radio" 
                        checked={selectedOption === option.id}
                        onChange={() => setSelectedOption(option.id)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="payment-footer">
          <button 
            className="back-btn"
            onClick={() => navigate('/checkout')}
            disabled={processing}
          >
            <i className="fas fa-arrow-left"></i>
            Back to Checkout
          </button>
          
          <button 
            className="pay-btn"
            onClick={processPayment}
            disabled={!selectedMethod || processing}
          >
            {processing ? (
              <>
                <div className="btn-spinner"></div>
                Processing...
              </>
            ) : (
              <>
                <i className="fas fa-lock"></i>
                {selectedMethod === 'cod' ? 'Place Order' : `Pay ₹${orderTotal.toFixed(2)}`}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Payment;

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ValidationUtils } from '../utils/validation';
import Header from '../components/Header';

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState({
    name: user?.name || '',
    mobile: '',
    pincode: '',
    locality: '',
    address: '',
    city: '',
    state: '',
    landmark: '',
    alternatePhone: ''
  });

  // Get order data from checkout
  const orderData = location.state?.orderData;
  const orderTotal = location.state?.orderTotal || 0;

  useEffect(() => {
    if (!orderData) {
      navigate('/cart');
      return;
    }
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [orderData, navigate, isAuthenticated]);

  const handlePlaceOrder = async () => {
    if (!orderData || !paymentMethod || !deliveryAddress.address) return;
    
    setLoading(true);
    try {
      // Handle Razorpay online payment
      if (paymentMethod === 'razorpay') {
        await handleRazorpayPayment();
        return;
      }

      // Handle other payment methods (COD, UPI, Card)
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          items: orderData.items,
      
          customerDetails: {
            firstName: deliveryAddress.name.split(' ')[0] || '',
            lastName: deliveryAddress.name.split(' ').slice(1).join(' ') || '',
            email: user?.email || '',
            phone: deliveryAddress.mobile,
            address: deliveryAddress.address,
            city: deliveryAddress.city,
            state: deliveryAddress.state,
            pincode: deliveryAddress.pincode,
            landmark: deliveryAddress.landmark || ''
          },
          orderSummary: orderData.orderSummary || {},
          paymentDetails: {
            method: paymentMethod,
            status: paymentMethod === 'cod' ? 'pending' : 'completed'
          }
        })
      });

      if (response.ok) {
        const order = await response.json();
        navigate('/order-success', { 
          state: { 
            message: 'Order placed successfully!',
            orderId: order._id,
            orderNumber: order.orderNumber || order._id,
            paymentMethod: paymentMethod === 'cod' ? 'Cash on Delivery' : 
                          paymentMethod === 'upi' ? 'UPI Payment' : 'Credit/Debit Card',
            amount: orderTotal,
            orderData: {
              items: orderData.items,
              customerDetails: {
                firstName: deliveryAddress.name.split(' ')[0] || '',
                lastName: deliveryAddress.name.split(' ').slice(1).join(' ') || '',
                email: user?.email || '',
                phone: deliveryAddress.mobile,
                address: deliveryAddress.address,
                city: deliveryAddress.city,
                state: deliveryAddress.state,
                pincode: deliveryAddress.pincode,
                landmark: deliveryAddress.landmark || ''
              },
              orderSummary: {
                subtotal: orderTotal,
                shipping: 0,
                tax: 0,
                total: orderTotal
              }
            }
          }
        });
      } else {
        alert('Failed to place order. Please try again.');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Razorpay Payment Handler
  const handleRazorpayPayment = async () => {
    try {
      console.log('🔄 Initiating Razorpay payment process...');
      console.log('📊 Order total:', orderTotal);
      
      // Validate order total
      if (!orderTotal || orderTotal <= 0) {
        alert('Invalid order amount. Please try again.');
        setLoading(false);
        return;
      }
      
      const amountInPaise = Math.round(orderTotal * 100);
      console.log('💰 Amount in paise:', amountInPaise);
      
      // Instead of using payment links, let's try multiple approaches
      const approaches = [
        {
          name: 'Direct Razorpay Integration',
          method: 'direct',
          url: null
        },
        {
          name: 'Payment Gateway Redirect',
          method: 'redirect',
          url: `https://checkout.razorpay.com/v1/checkout.js`
        },
        {
          name: 'Alternative Payment Link Format',
          method: 'link_alt',
          url: `https://pages.razorpay.com/jaimaaruthi`
        },
        {
          name: 'Basic UPI Payment',
          method: 'upi',
          url: `upi://pay?pa=jaimaaruthi@razorpay&pn=Jaimaaruthi Electrical Store&am=${orderTotal}&cu=INR`
        }
      ];
      
      console.log('🎯 Available payment approaches:', approaches);
      
      // Try Razorpay Checkout integration first (most reliable)
      const tryRazorpayCheckout = () => {
        return new Promise((resolve, reject) => {
          // Check if Razorpay script is loaded
          if (typeof window.Razorpay === 'undefined') {
            // Load Razorpay script dynamically
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => {
              console.log('✅ Razorpay script loaded successfully');
              initializeRazorpayCheckout();
            };
            script.onerror = () => {
              console.log('❌ Failed to load Razorpay script');
              reject('Failed to load Razorpay script');
            };
            document.head.appendChild(script);
          } else {
            console.log('✅ Razorpay already available');
            initializeRazorpayCheckout();
          }
          
          function initializeRazorpayCheckout() {
            try {
              const options = {
                key: 'rzp_live_RJWCTmk27IKagd', // Live key from server logs
                amount: amountInPaise, // Amount in paise
                currency: 'INR',
                name: 'Jaimaaruthi Electrical Store',
                description: `Order Payment - Total: ₹${orderTotal}`,
                image: '/logo192.png', // Optional: your store logo
                order_id: `order_${Date.now()}`, // Generate order ID
                handler: function (response) {
                  console.log('✅ Payment successful:', response);
                  resolve(response);
                },
                prefill: {
                  name: deliveryAddress.name,
                  email: user?.email || '',
                  contact: deliveryAddress.mobile
                },
                notes: {
                  address: deliveryAddress.address,
                  city: deliveryAddress.city,
                  order_total: orderTotal
                },
                theme: {
                  color: '#2874f0'
                },
                modal: {
                  ondismiss: function() {
                    console.log('❌ Payment cancelled by user');
                    reject('Payment cancelled');
                  }
                }
              };
              
              const rzp = new window.Razorpay(options);
              
              rzp.on('payment.failed', function (response) {
                console.log('❌ Payment failed:', response.error);
                reject(response.error);
              });
              
              console.log('🚀 Opening Razorpay checkout...');
              rzp.open();
              
            } catch (error) {
              console.error('❌ Error initializing Razorpay:', error);
              reject(error);
            }
          }
        });
      };
      
      // Show payment confirmation dialog
      const confirmPayment = window.confirm(
        `💳 Razorpay Secure Payment\n\n` +
        `Amount: ₹${orderTotal.toFixed(2)}\n` +
        `Store: Jaimaaruthi Electrical Store\n\n` +
        `✅ Payment Methods Available:\n` +
        `• Credit/Debit Cards\n` +
        `• UPI (GPay, PhonePe, Paytm)\n` +
        `• Net Banking\n` +
        `• Digital Wallets\n\n` +
        `🔒 100% Secure Payment Gateway\n` +
        `📱 Mobile Optimized Checkout\n\n` +
        `Click OK to open secure payment window`
      );

      if (confirmPayment) {
        try {
          console.log('🔄 Starting Razorpay checkout process...');
          
          // Try Razorpay Checkout first (most reliable method)
          const paymentResponse = await tryRazorpayCheckout();
          
          if (paymentResponse) {
            console.log('✅ Payment completed:', paymentResponse);
            
            // Store successful payment data
            const tempOrderData = {
              items: orderData.items,
              customerDetails: {
                firstName: deliveryAddress.name.split(' ')[0] || '',
                lastName: deliveryAddress.name.split(' ').slice(1).join(' ') || '',
                email: user?.email || '',
                phone: deliveryAddress.mobile,
                address: deliveryAddress.address,
                city: deliveryAddress.city,
                state: deliveryAddress.state,
                pincode: deliveryAddress.pincode,
                landmark: deliveryAddress.landmark || ''
              },
              orderSummary: {
                subtotal: orderTotal,
                shipping: 0,
                tax: 0,
                total: orderTotal,
                itemCount: orderData.items?.length || 0
              },
              razorpayOrderId: paymentResponse.razorpay_order_id || `order_${Date.now()}`,
              razorpayPaymentId: paymentResponse.razorpay_payment_id,
              razorpaySignature: paymentResponse.razorpay_signature,
              amountInPaise: amountInPaise,
              timestamp: new Date().toISOString(),
              paymentMethod: 'razorpay_checkout'
            };
            
            // Process successful payment
            await handlePaymentSuccess(tempOrderData);
          }
        } catch (error) {
          console.log('❌ Razorpay checkout failed:', error);
          
          // Fallback to alternative payment methods
          const tryAlternative = window.confirm(
            `⚠️ Payment Gateway Issue\n\n` +
            `The primary payment method encountered an issue.\n\n` +
            `Would you like to try alternative payment options?\n\n` +
            `Alternatives available:\n` +
            `• Direct UPI Payment\n` +
            `• Manual Bank Transfer\n` +
            `• Cash on Delivery\n\n` +
            `Click OK to see alternatives`
          );
          
          if (tryAlternative) {
            await handleAlternativePayment();
          } else {
            setLoading(false);
            alert('Payment cancelled. You can try again later.');
          }
        }
      } else {
        setLoading(false);
      }
          orderSummary: {
            subtotal: orderTotal,
            shipping: 0,
            tax: 0,
            total: orderTotal,
            itemCount: orderData.items?.length || 0
          },
          razorpayOrderId: `order_${Date.now()}`,
          amountInPaise: amountInPaise,
          paymentLink: finalPaymentLink,
          timestamp: new Date().toISOString()
        };

        localStorage.setItem('pendingRazorpayOrder', JSON.stringify(tempOrderData));
        
        // Open payment link - try with amount parameter
        console.log('🌐 Opening payment window...');
        const paymentWindow = window.open(finalPaymentLink, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
        
        // Check if window was successfully opened
        if (!paymentWindow) {
          alert(
            `❌ Payment Window Blocked\n\n` +
            `Your browser blocked the payment popup.\n\n` +
            `Please:\n` +
            `1. Allow popups for this site\n` +
            `2. Try again\n` +
            `3. Or manually open: ${finalPaymentLink}`
          );
          setLoading(false);
          return;
        }
        
        // Provide instructions about potential issues
        setTimeout(() => {
          const hasIssues = window.confirm(
            `🔄 Payment Window Status Check\n\n` +
            `Is the payment page showing correctly?\n\n` +
            `✅ Click "OK" if:\n` +
            `• Payment page loaded successfully\n` +
            `• Amount shows: ₹${orderTotal.toFixed(2)}\n` +
            `• You can proceed with payment\n\n` +
            `❌ Click "Cancel" if:\n` +
            `• Page shows "Something went wrong"\n` +
            `• Amount is not pre-filled\n` +
            `• Page doesn't load properly\n\n` +
            `We'll provide alternative options if needed.`
          );
          
          if (!hasIssues) {
            // Offer alternative payment options
            const useBasicLink = window.confirm(
              `🔧 Alternative Payment Option\n\n` +
              `Let's try the basic payment link where you\n` +
              `can manually enter the amount.\n\n` +
              `Amount to enter: ₹${orderTotal.toFixed(2)}\n` +
              `Merchant: @jaimaaruthi\n\n` +
              `Click "OK" to open basic payment link\n` +
              `Click "Cancel" to retry with original link`
            );
            
            if (useBasicLink) {
              // Close previous window if still open
              if (paymentWindow && !paymentWindow.closed) {
                paymentWindow.close();
              }
              
              // Open basic link without parameters
              const basicWindow = window.open(basePaymentLink, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
              
              if (basicWindow) {
                alert(
                  `📝 Manual Payment Instructions\n\n` +
                  `1. Enter amount: ₹${orderTotal.toFixed(2)}\n` +
                  `2. Add note: "Order from Jaimaruthi Store"\n` +
                  `3. Complete payment\n` +
                  `4. Return here after payment\n\n` +
                  `⚠️ Important: Use exact amount ₹${orderTotal.toFixed(2)}`
                );
              }
            }
          }
        }, 3000); // Give time for page to load

        // Wait longer before asking for confirmation (give time for actual payment)
        setTimeout(() => {
          const paymentCompleted = window.confirm(
            `💳 Payment Verification\n\n` +
            `Have you successfully completed the payment of ₹${orderTotal.toFixed(2)} on Razorpay?\n\n` +
            `✅ Click "OK" only if:\n` +
            `• Payment was successfully processed\n` +
            `• You received payment confirmation from Razorpay\n` +
            `• Money was deducted from your account\n\n` +
            `❌ Click "Cancel" if:\n` +
            `• Payment failed or was cancelled\n` +
            `• No money was deducted\n` +
            `• You encountered any errors\n\n` +
            `⚠️ Note: Bill will be generated only after merchant\n` +
            `confirms payment receipt. False confirmation may\n` +
            `delay your order processing.`
          );

          if (paymentCompleted) {
            handlePaymentPending(tempOrderData);
          } else {
            handlePaymentFailure();
          }
        }, 10000); // Give 10 seconds for payment processing

      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('❌ Error in Razorpay payment:', error);
      alert(`Payment initialization failed: ${error.message}`);
      setLoading(false);
    }
  };

  const handlePaymentPending = async (tempOrderData) => {
    try {
      console.log('⏳ Creating pending order for payment verification...');
      
      // Create order with pending status - bill will be generated after payment confirmation
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          items: tempOrderData.items,
          customerDetails: tempOrderData.customerDetails,
          orderSummary: tempOrderData.orderSummary,
          paymentDetails: {
            method: 'razorpay',
            status: 'pending_verification', // Payment pending verification
            razorpay_order_id: tempOrderData.razorpayOrderId,
            amount: tempOrderData.orderSummary.total,
            payment_link: tempOrderData.paymentLink,
            timestamp: tempOrderData.timestamp
          }
        })
      });

      if (orderResponse.ok) {
        const order = await orderResponse.json();
        localStorage.removeItem('pendingRazorpayOrder');
        
        // Navigate to a pending payment confirmation page
        navigate('/order-success', {
          state: {
            message: 'Order Created - Payment Under Verification',
            orderId: order._id,
            orderNumber: order.orderNumber || order._id,
            paymentMethod: '💳 Online Payment (Razorpay)',
            amount: tempOrderData.orderSummary.total,
            orderData: tempOrderData,
            isPending: true, // Flag to show pending status
            pendingMessage: `Your order has been created and is awaiting payment verification. 
            Bill will be generated after the merchant confirms payment receipt. 
            You will receive a confirmation email once payment is verified.`
          }
        });
      } else {
        const errorData = await orderResponse.json();
        throw new Error(errorData.message || 'Failed to create pending order');
      }
    } catch (error) {
      console.error('❌ Error creating pending order:', error);
      alert('Order creation failed. Please try again or contact support.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (tempOrderData) => {
    try {
      console.log('✅ Processing successful Razorpay payment...');
      
      // Create order directly through the regular orders API
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          items: tempOrderData.items,
          customerDetails: tempOrderData.customerDetails,
          orderSummary: tempOrderData.orderSummary,
          paymentDetails: {
            method: 'razorpay',
            status: 'completed',
            razorpay_order_id: tempOrderData.razorpayOrderId,
            razorpay_payment_id: `pay_${Date.now()}`,
            amount: tempOrderData.orderSummary.total
          }
        })
      });

      if (orderResponse.ok) {
        const order = await orderResponse.json();
        localStorage.removeItem('pendingRazorpayOrder');
        
        navigate('/order-success', {
          state: {
            message: 'Payment completed successfully!',
            orderId: order._id,
            orderNumber: order.orderNumber || order._id,
            paymentMethod: '💳 Online Payment (Razorpay)',
            amount: tempOrderData.orderSummary.total,
            orderData: tempOrderData
          }
        });
      } else {
        const errorData = await orderResponse.json();
        throw new Error(errorData.message || 'Failed to confirm order');
      }
    } catch (error) {
      console.error('❌ Error confirming payment:', error);
      alert('Payment was successful but order confirmation failed. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentFailure = () => {
    console.log('❌ Razorpay payment failed or cancelled');
    localStorage.removeItem('pendingRazorpayOrder');
    alert('Payment was cancelled or failed. You can try again.');
    setLoading(false);
  };

  const handleAddressSubmit = () => {
    // Comprehensive address validation
    const validationRules = {
      name: [ValidationUtils.validateName],
      mobile: [ValidationUtils.validatePhone],
      address: [(value) => ValidationUtils.validateAddress(value, "Address")],
      city: [ValidationUtils.validateCity],
      state: [ValidationUtils.validateState],
      pincode: [ValidationUtils.validatePincode]
    };

    const { isFormValid, errors } = ValidationUtils.validateForm(deliveryAddress, validationRules);
    
    if (!isFormValid) {
      const errorFields = Object.keys(errors);
      const errorMessage = `Please fix the following errors:\n${errorFields.map(field => `• ${errors[field]}`).join('\n')}`;
      alert(errorMessage);
      return;
    }
    
    setCurrentStep(2);
  };

  if (!orderData) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ backgroundColor: '#f1f3f6', minHeight: '100vh' }}>
      <Header />
      
      {/* Flipkart-style Progress Steps */}
      <div style={{
        backgroundColor: '#fff',
        padding: '12px 0',
        borderBottom: '1px solid #e0e0e0'
      }}>
        <div style={{
          maxWidth: '1248px',
          margin: '0 auto',
          padding: window.innerWidth <= 768 ? '0 12px' : '0 20px',
          display: 'flex',
          alignItems: 'center',
          gap: window.innerWidth <= 768 ? '16px' : '40px',
          overflow: window.innerWidth <= 480 ? 'hidden' : 'visible'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: currentStep >= 1 ? '#2874f0' : '#878787'
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: currentStep >= 1 ? '#2874f0' : '#878787',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              1
            </div>
            <span style={{ 
              fontWeight: '500', 
              fontSize: window.innerWidth <= 480 ? '12px' : '14px',
              display: window.innerWidth <= 480 ? 'none' : 'inline'
            }}>DELIVERY ADDRESS</span>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: currentStep >= 2 ? '#2874f0' : '#878787'
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: currentStep >= 2 ? '#2874f0' : '#878787',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              2
            </div>
            <span style={{ 
              fontWeight: '500', 
              fontSize: window.innerWidth <= 480 ? '12px' : '14px',
              display: window.innerWidth <= 480 ? 'none' : 'inline'
            }}>PAYMENT OPTIONS</span>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: currentStep >= 3 ? '#2874f0' : '#878787'
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: currentStep >= 3 ? '#2874f0' : '#878787',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              3
            </div>
            <span style={{ 
              fontWeight: '500', 
              fontSize: window.innerWidth <= 480 ? '12px' : '14px',
              display: window.innerWidth <= 480 ? 'none' : 'inline'
            }}>SUMMARY</span>
          </div>
        </div>
      </div>

      <div style={{
        maxWidth: '1248px',
        margin: '0 auto',
        padding: window.innerWidth <= 768 ? '12px' : '20px',
        display: 'grid',
        gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : '2fr 1fr',
        gap: window.innerWidth <= 768 ? '12px' : '20px'
      }}>
        {/* Left Column */}
        <div>
          {/* Step 1: Delivery Address */}
          {currentStep === 1 && (
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '2px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
              marginBottom: '16px'
            }}>
              <div style={{
                padding: window.innerWidth <= 768 ? '16px 20px' : '20px 24px',
                borderBottom: '1px solid #f0f0f0',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: '#2874f0',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  1
                </div>
                <h2 style={{
                  fontSize: '18px',
                  fontWeight: '500',
                  color: '#212121',
                  margin: 0
                }}>
                  DELIVERY ADDRESS
                </h2>
              </div>
              
              <div style={{ padding: window.innerWidth <= 768 ? '16px' : '24px' }}>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : '1fr 1fr', 
                  gap: '16px',
                  marginBottom: '16px'
                }}>
                  <input
                    type="text"
                    placeholder="Name*"
                    value={deliveryAddress.name}
                    onChange={(e) => setDeliveryAddress({...deliveryAddress, name: e.target.value})}
                    style={{
                      padding: '12px 16px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '2px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Mobile No*"
                    value={deliveryAddress.mobile}
                    onChange={(e) => setDeliveryAddress({...deliveryAddress, mobile: e.target.value})}
                    style={{
                      padding: '12px 16px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '2px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : '1fr 2fr', 
                  gap: '16px',
                  marginBottom: '16px'
                }}>
                  <input
                    type="text"
                    placeholder="Pincode*"
                    value={deliveryAddress.pincode}
                    onChange={(e) => setDeliveryAddress({...deliveryAddress, pincode: e.target.value})}
                    style={{
                      padding: '12px 16px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '2px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Locality*"
                    value={deliveryAddress.locality}
                    onChange={(e) => setDeliveryAddress({...deliveryAddress, locality: e.target.value})}
                    style={{
                      padding: '12px 16px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '2px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
                
                <textarea
                  placeholder="Address (Area and Street)*"
                  rows="3"
                  value={deliveryAddress.address}
                  onChange={(e) => setDeliveryAddress({...deliveryAddress, address: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '2px',
                    fontSize: '14px',
                    outline: 'none',
                    marginBottom: '16px',
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                />
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : '1fr 1fr', 
                  gap: '16px',
                  marginBottom: '16px'
                }}>
                  <input
                    type="text"
                    placeholder="City/District/Town*"
                    value={deliveryAddress.city}
                    onChange={(e) => setDeliveryAddress({...deliveryAddress, city: e.target.value})}
                    style={{
                      padding: '12px 16px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '2px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                  <input
                    type="text"
                    placeholder="State*"
                    value={deliveryAddress.state}
                    onChange={(e) => setDeliveryAddress({...deliveryAddress, state: e.target.value})}
                    style={{
                      padding: '12px 16px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '2px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
                
                <button
                  onClick={handleAddressSubmit}
                  style={{
                    backgroundColor: '#ff9f00',
                    color: 'white',
                    border: 'none',
                    padding: window.innerWidth <= 768 ? '14px 20px' : '12px 24px',
                    borderRadius: '2px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    marginTop: '16px',
                    width: window.innerWidth <= 480 ? '100%' : 'auto'
                  }}
                >
                  SAVE AND DELIVER HERE
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Payment Options */}
          {currentStep === 2 && (
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '2px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
              marginBottom: '16px'
            }}>
              <div style={{
                padding: window.innerWidth <= 768 ? '16px 20px' : '20px 24px',
                borderBottom: '1px solid #f0f0f0',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: '#2874f0',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  2
                </div>
                <h2 style={{
                  fontSize: '18px',
                  fontWeight: '500',
                  color: '#212121',
                  margin: 0
                }}>
                  PAYMENT OPTIONS
                </h2>
              </div>
              
              <div style={{ padding: window.innerWidth <= 768 ? '16px' : '24px' }}>
                <div style={{ marginBottom: '20px' }}>
                  {/* Razorpay Online Payment Option */}
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px',
                    border: paymentMethod === 'razorpay' ? '2px solid #2874f0' : '1px solid #e0e0e0',
                    borderRadius: '2px',
                    cursor: 'pointer',
                    marginBottom: '12px',
                    background: paymentMethod === 'razorpay' ? '#f8f9fa' : 'transparent'
                  }}>
                    <input
                      type="radio"
                      value="razorpay"
                      checked={paymentMethod === 'razorpay'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      style={{ accentColor: '#2874f0' }}
                    />
                    <div>
                      <div style={{ fontWeight: '500', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        💳 Online Payment
                        <span style={{ 
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                          color: 'white', 
                          padding: '2px 8px', 
                          borderRadius: '10px', 
                          fontSize: '10px', 
                          fontWeight: 'bold' 
                        }}>
                          RECOMMENDED
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#878787' }}>
                        Secure payments with Cards, UPI, Net Banking & Wallets via Razorpay
                      </div>
                      <div style={{ fontSize: '11px', color: '#28a745', marginTop: '4px', fontWeight: '500' }}>
                        🔒 100% Secure • Instant Processing • All Payment Methods
                      </div>
                    </div>
                  </label>

                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px',
                    border: paymentMethod === 'upi' ? '2px solid #2874f0' : '1px solid #e0e0e0',
                    borderRadius: '2px',
                    cursor: 'pointer',
                    marginBottom: '12px'
                  }}>
                    <input
                      type="radio"
                      value="upi"
                      checked={paymentMethod === 'upi'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      style={{ accentColor: '#2874f0' }}
                    />
                    <div>
                      <div style={{ fontWeight: '500', fontSize: '14px' }}>📱 Direct UPI</div>
                      <div style={{ fontSize: '12px', color: '#878787' }}>Pay directly using any UPI app</div>
                    </div>
                  </label>

                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px',
                    border: paymentMethod === 'card' ? '2px solid #2874f0' : '1px solid #e0e0e0',
                    borderRadius: '2px',
                    cursor: 'pointer',
                    marginBottom: '12px'
                  }}>
                    <input
                      type="radio"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      style={{ accentColor: '#2874f0' }}
                    />
                    <div>
                      <div style={{ fontWeight: '500', fontSize: '14px' }}>💳 Credit / Debit Card</div>
                      <div style={{ fontSize: '12px', color: '#878787' }}>Add and secure cards as per RBI guidelines</div>
                    </div>
                  </label>

                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px',
                    border: paymentMethod === 'cod' ? '2px solid #2874f0' : '1px solid #e0e0e0',
                    borderRadius: '2px',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="radio"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      style={{ accentColor: '#2874f0' }}
                    />
                    <div>
                      <div style={{ fontWeight: '500', fontSize: '14px' }}>Cash on Delivery</div>
                      <div style={{ fontSize: '12px', color: '#878787' }}>Pay digitally with SMS & OTP on delivery</div>
                    </div>
                  </label>
                </div>

                <button
                  onClick={() => setCurrentStep(3)}
                  disabled={!paymentMethod}
                  style={{
                    backgroundColor: paymentMethod ? '#ff9f00' : '#ccc',
                    color: 'white',
                    border: 'none',
                    padding: window.innerWidth <= 768 ? '14px 20px' : '12px 24px',
                    borderRadius: '2px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: paymentMethod ? 'pointer' : 'not-allowed',
                    width: window.innerWidth <= 480 ? '100%' : 'auto'
                  }}
                >
                  CONTINUE
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Order Summary */}
          {currentStep === 3 && (
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '2px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
              marginBottom: '16px'
            }}>
              <div style={{
                padding: '20px 24px',
                borderBottom: '1px solid #f0f0f0'
              }}>
                <h2 style={{
                  fontSize: '18px',
                  fontWeight: '500',
                  color: '#212121',
                  margin: 0
                }}>
                  ORDER SUMMARY
                </h2>
              </div>
              
              <div style={{ padding: '24px' }}>
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Delivery Address:</h3>
                  <div style={{
                    backgroundColor: '#f8f8f8',
                    padding: '12px',
                    borderRadius: '4px',
                    fontSize: '14px',
                    lineHeight: '1.5'
                  }}>
                    <strong>{deliveryAddress.name}</strong><br/>
                    {deliveryAddress.address}<br/>
                    {deliveryAddress.locality}, {deliveryAddress.city}<br/>
                    {deliveryAddress.state} - {deliveryAddress.pincode}<br/>
                    <strong>Phone:</strong> {deliveryAddress.mobile}
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Payment Method:</h3>
                  <div style={{ fontSize: '14px', textTransform: 'uppercase', fontWeight: '500' }}>
                    {paymentMethod === 'cod' ? '💵 Cash on Delivery' : 
                     paymentMethod === 'upi' ? '📱 UPI Payment' : 
                     paymentMethod === 'card' ? '💳 Credit/Debit Card' : 
                     paymentMethod === 'razorpay' ? '💳 Online Payment (Razorpay)' : paymentMethod}
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  style={{
                    backgroundColor: loading ? '#ccc' : '#ff9f00',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '2px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    width: '100%'
                  }}
                >
                  {loading ? 'PLACING ORDER...' : 'PLACE ORDER'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Price Details */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '2px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
          height: 'fit-content',
          position: window.innerWidth <= 768 ? 'static' : 'sticky',
          top: '20px'
        }}>
          <div style={{
            padding: window.innerWidth <= 768 ? '12px 16px' : '16px 24px',
            borderBottom: '1px solid #f0f0f0'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '500',
              color: '#878787',
              margin: 0
            }}>
              PRICE DETAILS
            </h3>
          </div>
          
          <div style={{ padding: window.innerWidth <= 768 ? '12px 16px' : '16px 24px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '12px',
              fontSize: '14px'
            }}>
              <span>Price ({orderData?.items?.length || 0} items)</span>
              <span>₹{orderTotal?.toLocaleString()}</span>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '12px',
              fontSize: '14px'
            }}>
              <span>Delivery Charges</span>
              <span style={{ color: '#388e3c' }}>FREE</span>
            </div>
            
            <div style={{
              borderTop: '1px dashed #e0e0e0',
              paddingTop: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '16px',
              fontWeight: '500'
            }}>
              <span>Total Amount</span>
              <span>₹{orderTotal?.toLocaleString()}</span>
            </div>
            
            <div style={{
              color: '#388e3c',
              fontSize: '14px',
              fontWeight: '500',
              marginTop: '8px'
            }}>
              You will save ₹0 on this order
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
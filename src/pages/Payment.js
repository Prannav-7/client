import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { ValidationUtils } from '../utils/validation';
import Header from '../components/Header';

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { clearCart } = useCart();
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
      // Handle Direct UPI Payment
      if (paymentMethod === 'direct_upi') {
        showDirectUPIPayment();
        return;
      }

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

  // Enhanced Razorpay Payment Handler with Proper Checkout
  const handleRazorpayPayment = async () => {
    try {
      console.log('🔄 Initiating Razorpay payment process...');
      
      // Validate order total
      if (!orderTotal || orderTotal <= 0) {
        alert('Invalid order amount. Please try again.');
        setLoading(false);
        return;
      }
      
      const amountInPaise = Math.round(orderTotal * 100);
      console.log('💰 Amount in paise:', amountInPaise);
      
      // Load and initialize Razorpay Checkout
      await loadRazorpayScript();
      
      // Show confirmation before opening Razorpay
      const confirmPayment = window.confirm(
        `💳 Razorpay Secure Payment\n\n` +
        `Amount: ₹${orderTotal.toFixed(2)}\n` +
        `Store: Jaimaaruthi Electrical Store\n\n` +
        `✅ Payment Methods Available:\n` +
        `• Credit/Debit Cards\n` +
        `• UPI (GPay, PhonePe, Paytm)\n` +
        `• Net Banking\n` +
        `• Digital Wallets\n\n` +
        `� 100% Secure Payment by Razorpay\n\n` +
        `Click OK to proceed to payment`
      );
      
      if (confirmPayment) {
        await initiateRazorpayCheckout(amountInPaise);
      } else {
        // Show alternative payment options including direct UPI
        showAlternativePaymentOptions();
      }
      
    } catch (error) {
      console.error('❌ Error in Razorpay payment:', error);
      alert(`Payment initialization failed: ${error.message}`);
      setLoading(false);
    }
  };

  // Load Razorpay script dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve, reject) => {
      if (window.Razorpay) {
        console.log('✅ Razorpay already loaded');
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        console.log('✅ Razorpay script loaded successfully');
        resolve();
      };
      script.onerror = (error) => {
        console.error('❌ Failed to load Razorpay script:', error);
        reject(new Error('Failed to load Razorpay payment gateway'));
      };
      document.head.appendChild(script);
    });
  };

  // Initialize Razorpay Checkout with server-side order creation
  const initiateRazorpayCheckout = async (amountInPaise) => {
    try {
      console.log('🚀 Creating Razorpay order on server...');
      
      // Step 1: Create order on server first
      const orderResponse = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          amount: orderTotal,
          currency: 'INR',
          receipt: `order_${Date.now()}`,
          customerDetails: {
            name: deliveryAddress.name || 'Customer',
            email: user?.email || '',
            phone: deliveryAddress.mobile || ''
          },
          items: orderData.items
        })
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.message || 'Failed to create order');
      }

      const orderData_server = await orderResponse.json();
      console.log('✅ Server order created:', orderData_server);

      // Step 2: Open Razorpay checkout with server-generated order ID
      const options = {
        key: orderData_server.key_id, // Use key from server
        amount: orderData_server.order.amount, // Amount from server (in paise)
        currency: orderData_server.order.currency,
        name: 'Jaimaaruthi Electrical Store',
        description: `Order Payment - ₹${orderTotal.toFixed(2)}`,
        order_id: orderData_server.order.id, // Server-generated order ID
        handler: function (response) {
          console.log('✅ Payment successful:', response);
          handleRazorpaySuccess(response);
        },
        prefill: {
          name: deliveryAddress.name || 'Customer',
          email: user?.email || '',
          contact: deliveryAddress.mobile || ''
        },
        notes: {
          address: deliveryAddress.address,
          order_items: orderData.items?.map(item => `${item.name} (Qty: ${item.quantity})`).join(', ')
        },
        theme: {
          color: '#2874f0'
        },
        modal: {
          ondismiss: function() {
            console.log('⚠️ Payment window closed by user');
            setLoading(false);
            const retry = window.confirm(
              'Payment was cancelled. Would you like to try again?'
            );
            if (retry) {
              handleRazorpayPayment();
            }
          }
        },
        retry: {
          enabled: true,
          max_count: 3
        }
      };
      
      const rzp = new window.Razorpay(options);
      
      // Handle payment failure
      rzp.on('payment.failed', function (response) {
        console.error('❌ Payment failed:', response.error);
        setLoading(false);
        
        const errorMessage = response.error.description || response.error.reason || 'Payment could not be processed';
        
        alert(
          `Payment Failed\n\n` +
          `Error: ${errorMessage}\n\n` +
          `Possible reasons:\n` +
          `• Insufficient balance\n` +
          `• Card expired or blocked\n` +
          `• Network connectivity issue\n` +
          `• Bank server down\n\n` +
          `Please try again or use a different payment method.`
        );
        
        // Offer retry option
        const retry = window.confirm('Would you like to try payment again?');
        if (retry) {
          setTimeout(() => handleRazorpayPayment(), 1000);
        }
      });
      
      // Open Razorpay checkout
      console.log('🎯 Opening Razorpay checkout with server order...');
      rzp.open();
      
    } catch (error) {
      console.error('❌ Error creating order or opening checkout:', error);
      setLoading(false);
      
      alert(
        `Payment Setup Failed\n\n` +
        `Error: ${error.message}\n\n` +
        `Please try again. If the problem persists, contact support.`
      );
    }
  };

  // Handle successful Razorpay payment
  const handleRazorpaySuccess = async (paymentResponse) => {
    try {
      console.log('🎉 Processing successful payment...', paymentResponse);
      
      // Prepare order data for verification and database storage
      const orderDataForVerification = {
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
        }
      };
      
      // Verify payment with server
      console.log('🔍 Verifying payment with server...');
      const verifyResponse = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          razorpay_order_id: paymentResponse.razorpay_order_id,
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_signature: paymentResponse.razorpay_signature,
          orderData: orderDataForVerification
        })
      });

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json();
        throw new Error(errorData.message || 'Payment verification failed');
      }

      const verificationResult = await verifyResponse.json();
      console.log('✅ Payment verified successfully:', verificationResult);

      // Clear cart after successful payment
      if (clearCart) {
        clearCart();
      }

      // Navigate to success page
      navigate('/order-success', {
        state: {
          message: 'Payment Successful!',
          orderId: verificationResult.orderId,
          orderNumber: verificationResult.order?.orderNumber || verificationResult.orderId,
          paymentMethod: '💳 Razorpay Payment',
          amount: orderTotal,
          paymentDetails: {
            razorpay_payment_id: paymentResponse.razorpay_payment_id,
            razorpay_order_id: paymentResponse.razorpay_order_id,
            method: 'razorpay',
            status: 'completed'
          },
          orderData: orderDataForVerification
        }
      });
      
    } catch (error) {
      console.error('❌ Error processing successful payment:', error);
      setLoading(false);
      
      alert(
        `Payment Processing Error\n\n` +
        `Your payment was successful, but there was an issue processing your order.\n\n` +
        `Payment ID: ${paymentResponse.razorpay_payment_id}\n\n` +
        `Please contact support with this Payment ID for assistance.\n` +
        `We will process your order manually.`
      );
    }
  };

  // Show alternative payment options including direct UPI
  const showAlternativePaymentOptions = () => {
    const choice = window.confirm(
      `� Alternative Payment Options\n\n` +
      `Choose your preferred payment method:\n\n` +
      `✅ Click "OK" for Direct Bank Payment\n` +
      `   • Pay directly to Karur Vysya Bank 1054\n` +
      `   • UPI ID: prannav2511@okhdfcbank\n` +
      `   • No processing fees • Instant credit\n\n` +
      `� Click "Cancel" for Cash on Delivery\n` +
      `   • Pay when order is delivered\n` +
      `   • No advance payment required\n\n` +
      `Choose your option:`
    );
    
    if (choice) {
      showDirectUPIPayment();
    } else {
      switchToCOD();
    }
  };

  // Show direct UPI payment with QR and UPI ID
  const showDirectUPIPayment = () => {
    const upiId = 'prannav2511@okhdfcbank';
    const merchantName = 'Prannav P - Jaimaaruthi Electrical Store';
    const bankName = 'Karur Vysya Bank 1054';
    const amount = orderTotal.toFixed(2);
    
    // Create UPI payment URL for QR code and deep linking
    const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(`Order Payment - ₹${amount}`)}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiUrl)}`;
    
    // Create a custom dialog with UPI details
    const upiDialog = document.createElement('div');
    upiDialog.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      font-family: Arial, sans-serif;
    `;
    
    upiDialog.innerHTML = `
      <div style="
        background: white;
        padding: 30px;
        border-radius: 15px;
        text-align: center;
        max-width: 400px;
        width: 90%;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      ">
        <div style="
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
          color: white;
          padding: 20px;
          border-radius: 15px;
          margin-bottom: 25px;
          text-align: center;
        ">
          <h2 style="margin: 0 0 10px 0; font-size: 26px; font-weight: bold;">� Direct Bank Payment</h2>
          <p style="margin: 5px 0; font-size: 20px; font-weight: bold;">₹${amount}</p>
          <p style="margin: 5px 0; font-size: 16px; opacity: 0.9;">${bankName}</p>
          <div style="
            background: rgba(255,255,255,0.2);
            padding: 8px 16px;
            border-radius: 20px;
            display: inline-block;
            margin-top: 10px;
            font-size: 14px;
            font-weight: bold;
          ">
            🔒 Direct to Your Account • No Intermediary
          </div>
        </div>
        
        <div style="margin: 20px 0;">
          <img src="${qrCodeUrl}" alt="Direct UPI Payment QR Code" style="
            width: 250px;
            height: 250px;
            border: 3px solid #28a745;
            border-radius: 15px;
            margin: 15px 0;
            box-shadow: 0 8px 25px rgba(40, 167, 69, 0.3);
          " />
        </div>
        
        <div style="
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          padding: 20px;
          border-radius: 15px;
          margin: 20px 0;
          border: 2px solid #28a745;
          box-shadow: 0 5px 15px rgba(40, 167, 69, 0.2);
        ">
          <div style="text-align: center; margin-bottom: 15px;">
            <h3 style="margin: 0 0 10px 0; font-size: 18px; color: #28a745; font-weight: bold;">
              🏦 Direct Bank Transfer Details
            </h3>
          </div>
          
          <div style="
            background: white;
            padding: 15px;
            border-radius: 10px;
            margin: 10px 0;
            border-left: 4px solid #28a745;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          ">
            <p style="margin: 8px 0; font-weight: bold; color: #333; font-size: 16px;">📱 UPI ID:</p>
            <p style="
              margin: 5px 0;
              font-family: 'Courier New', monospace;
              font-size: 18px;
              color: #28a745;
              font-weight: bold;
              background: #f8f9fa;
              padding: 8px 12px;
              border-radius: 6px;
              border: 1px solid #e9ecef;
            ">${upiId}</p>
          </div>
          
          <div style="
            background: white;
            padding: 15px;
            border-radius: 10px;
            margin: 10px 0;
            border-left: 4px solid #17a2b8;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          ">
            <p style="margin: 8px 0; font-weight: bold; color: #333; font-size: 16px;">🏦 Bank Details:</p>
            <p style="margin: 5px 0; font-size: 16px; color: #17a2b8; font-weight: bold;">${bankName}</p>
            <p style="margin: 5px 0; font-size: 14px; color: #666;">Account Holder: Prannav P</p>
          </div>
          
          <div style="
            background: #e8f5e8;
            padding: 12px;
            border-radius: 8px;
            margin: 15px 0;
            border: 1px solid #28a745;
          ">
            <p style="margin: 0; font-size: 14px; color: #155724; font-weight: bold; text-align: center;">
              💡 Payment goes directly to merchant's bank account
            </p>
            <p style="margin: 5px 0 0 0; font-size: 13px; color: #155724; text-align: center;">
              No third-party processing fees • Instant credit to seller
            </p>
          </div>
        </div>
        
        <div style="margin: 25px 0; text-align: left; background: #f8f9fa; padding: 15px; border-radius: 10px; border: 1px solid #dee2e6;">
          <p style="margin: 8px 0; font-size: 16px; color: #333; font-weight: bold;">
            📲 How to Pay:
          </p>
          <div style="margin-left: 10px;">
            <p style="margin: 8px 0; font-size: 14px; color: #555;">
              <strong>1.</strong> Open any UPI app (GPay, PhonePe, Paytm, etc.)
            </p>
            <p style="margin: 8px 0; font-size: 14px; color: #555;">
              <strong>2.</strong> Scan QR code OR enter UPI ID manually
            </p>
            <p style="margin: 8px 0; font-size: 14px; color: #555;">
              <strong>3.</strong> Verify amount: <span style="color: #28a745; font-weight: bold;">₹${amount}</span>
            </p>
            <p style="margin: 8px 0; font-size: 14px; color: #555;">
              <strong>4.</strong> Complete payment using your UPI PIN
            </p>
            <p style="margin: 8px 0; font-size: 14px; color: #555;">
              <strong>5.</strong> Screenshot payment confirmation for your records
            </p>
          </div>
        </div>
        
        <div style="margin-top: 30px; display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;">
          <button onclick="window.handleUPIPaymentDone()" style="
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 25px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            min-width: 160px;
            box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
            transition: all 0.3s ease;
          " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(40, 167, 69, 0.4)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(40, 167, 69, 0.3)';">
            ✅ Payment Completed
          </button>
          
          <button onclick="window.tryUPIApp()" style="
            background: linear-gradient(135deg, #007bff 0%, #6610f2 100%);
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 25px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            min-width: 160px;
            box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
            transition: all 0.3s ease;
          " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(0, 123, 255, 0.4)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(0, 123, 255, 0.3)';">
            📱 Open UPI App
          </button>
          
          <button onclick="window.closeUPIDialog()" style="
            background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 25px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            min-width: 160px;
            box-shadow: 0 4px 15px rgba(108, 117, 125, 0.3);
            transition: all 0.3s ease;
          " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(108, 117, 125, 0.4)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(108, 117, 125, 0.3)';">
            ❌ Cancel
          </button>
        </div>
        
        <p style="
          margin: 20px 0 0 0;
          font-size: 13px;
          color: #666;
          font-style: italic;
          text-align: center;
          background: #e8f5e8;
          padding: 12px;
          border-radius: 8px;
          border: 1px solid #d4edda;
        ">
          💡 <strong>Important:</strong> After completing your UPI payment, click "Payment Completed" to confirm your order.<br/>
          Your payment goes directly to the merchant's Karur Vysya Bank account.
        </p>
      </div>
    `;
    
    document.body.appendChild(upiDialog);
    
    // Add global functions for the dialog
    window.handleUPIPaymentDone = () => {
      document.body.removeChild(upiDialog);
      handleDirectUPIConfirmation();
    };
    
    window.tryUPIApp = () => {
      // Try to open UPI app on mobile
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isMobile) {
        window.location.href = upiUrl;
      } else {
        alert('UPI apps work best on mobile devices. Please scan the QR code with your phone.');
      }
    };
    
    window.closeUPIDialog = () => {
      document.body.removeChild(upiDialog);
      setLoading(false);
      // Clean up global functions
      delete window.handleUPIPaymentDone;
      delete window.tryUPIApp;
      delete window.closeUPIDialog;
    };
  };

  // Handle UPI payment confirmation
  const handleDirectUPIConfirmation = async () => {
    try {
      console.log('🎉 Processing UPI payment confirmation...');
      
      const orderDataForUPI = {
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
        }
      };
      
      // Call UPI verification endpoint
      const response = await fetch('/api/payment/verify-upi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          orderId: `upi_${Date.now()}`,
          amount: orderTotal,
          orderData: orderDataForUPI
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to process UPI payment');
      }

      const result = await response.json();
      console.log('✅ UPI payment processed:', result);

      // Clear cart
      if (clearCart) {
        clearCart();
      }

      // Navigate to success page
      navigate('/order-success', {
        state: {
          message: 'Direct UPI Payment Confirmed!',
          orderId: result.order?._id,
          orderNumber: result.order?.orderNumber,
          paymentMethod: '� Direct Bank Payment',
          amount: orderTotal,
          paymentDetails: {
            upi_id: 'prannav2511@okhdfcbank',
            bank_name: 'Karur Vysya Bank 1054',
            method: 'direct_upi',
            status: 'completed'
          },
          orderData: orderDataForUPI,
          isPending: false,
          successMessage: `Your payment has been sent directly to Karur Vysya Bank (Account 1054). 
          Your order is confirmed and will be processed immediately.
          UPI ID: prannav2511@okhdfcbank`
        }
      });
      
    } catch (error) {
      console.error('❌ Error processing UPI payment:', error);
      alert(`UPI Payment Error: ${error.message}\nPlease contact support if you completed the payment.`);
    } finally {
      setLoading(false);
      // Clean up global functions
      if (window.handleUPIPaymentDone) delete window.handleUPIPaymentDone;
      if (window.tryUPIApp) delete window.tryUPIApp;
      if (window.closeUPIDialog) delete window.closeUPIDialog;
    }
  };

  // Switch to Cash on Delivery
  const switchToCOD = () => {
    const confirmCOD = window.confirm(
      `💰 Cash on Delivery\n\n` +
      `Amount: ₹${orderTotal.toFixed(2)}\n\n` +
      `✅ Benefits:\n` +
      `• Pay when order is delivered\n` +
      `• No advance payment required\n` +
      `• 100% secure\n\n` +
      `📦 Your order will be prepared and\n` +
      `delivered to your address.\n\n` +
      `Click OK to confirm COD order`
    );
    
    if (confirmCOD) {
      handleCODPayment();
    } else {
      setLoading(false);
    }
  };

  // Handle COD payment
  const handleCODPayment = async () => {
    try {
      console.log('💰 Processing COD order...');
      
      const orderDataForCOD = {
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
        }
      };
      
      const response = await fetch('/api/payment/verify-cod', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          orderId: `cod_${Date.now()}`,
          orderData: orderDataForCOD
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to place COD order');
      }

      const result = await response.json();
      console.log('✅ COD order placed:', result);

      // Clear cart
      if (clearCart) {
        clearCart();
      }

      // Navigate to success page
      navigate('/order-success', {
        state: {
          message: 'COD Order Placed Successfully!',
          orderId: result.order?._id,
          orderNumber: result.order?.orderNumber,
          paymentMethod: '💰 Cash on Delivery',
          amount: orderTotal,
          paymentDetails: {
            method: 'cod',
            status: 'pending'
          },
          orderData: orderDataForCOD
        }
      });
      
    } catch (error) {
      console.error('❌ Error placing COD order:', error);
      alert(`COD Order Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };



  const handlePaymentSuccess = async (orderData) => {
    try {
      console.log('✅ Processing successful payment...');
      
      // Create order with completed payment status
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          items: orderData.items,
          customerDetails: orderData.customerDetails,
          orderSummary: orderData.orderSummary,
          paymentDetails: {
            method: 'razorpay',
            status: 'completed',
            razorpay_order_id: orderData.razorpayOrderId,
            razorpay_payment_id: orderData.razorpayPaymentId,
            razorpay_signature: orderData.razorpaySignature,
            amount: orderData.orderSummary.total,
            timestamp: orderData.timestamp
          }
        })
      });

      if (orderResponse.ok) {
        const order = await orderResponse.json();
        
        navigate('/order-success', {
          state: {
            message: 'Payment completed successfully!',
            orderId: order._id,
            orderNumber: order.orderNumber || order._id,
            paymentMethod: '💳 Online Payment (Razorpay)',
            amount: orderData.orderSummary.total,
            orderData: orderData
          }
        });
      } else {
        throw new Error('Failed to create order');
      }
    } catch (error) {
      console.error('❌ Error confirming payment:', error);
      alert('Payment was successful but order confirmation failed. Please contact support.');
    } finally {
      setLoading(false);
    }
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
      
      {/* Progress Steps */}
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
          gap: window.innerWidth <= 768 ? '16px' : '40px'
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
            <span style={{ fontWeight: '500', fontSize: '14px' }}>DELIVERY ADDRESS</span>
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
            <span style={{ fontWeight: '500', fontSize: '14px' }}>PAYMENT OPTIONS</span>
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
            <span style={{ fontWeight: '500', fontSize: '14px' }}>SUMMARY</span>
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
                padding: '20px 24px',
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
              
              <div style={{ padding: '24px' }}>
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
                    padding: '12px 24px',
                    borderRadius: '2px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    marginTop: '16px'
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
                padding: '20px 24px',
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
              
              <div style={{ padding: '24px' }}>
                <div style={{ marginBottom: '20px' }}>
                  {/* Direct UPI Payment Option - Primary */}
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '20px',
                    border: paymentMethod === 'direct_upi' ? '3px solid #28a745' : '2px solid #e0e0e0',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    marginBottom: '15px',
                    background: paymentMethod === 'direct_upi' ? 'linear-gradient(135deg, #e8f5e8 0%, #d4edda 100%)' : '#fff',
                    boxShadow: paymentMethod === 'direct_upi' ? '0 4px 15px rgba(40, 167, 69, 0.2)' : '0 2px 8px rgba(0,0,0,0.1)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <input
                      type="radio"
                      value="direct_upi"
                      checked={paymentMethod === 'direct_upi'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      style={{ accentColor: '#28a745', transform: 'scale(1.2)' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontWeight: 'bold', 
                        fontSize: '16px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '10px',
                        marginBottom: '5px'
                      }}>
                        � Direct Bank Payment
                        <span style={{ 
                          background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)', 
                          color: 'white', 
                          padding: '3px 10px', 
                          borderRadius: '12px', 
                          fontSize: '11px', 
                          fontWeight: 'bold',
                          animation: 'pulse 2s infinite'
                        }}>
                          INSTANT CREDIT
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', color: '#28a745', marginBottom: '5px', fontWeight: '500' }}>
                        Pay directly to Karur Vysya Bank 1054 via UPI
                      </div>
                      <div style={{ fontSize: '12px', color: '#155724', fontWeight: '500' }}>
                        🏦 prannav2511@okhdfcbank • 🔒 No intermediary fees • ⚡ Instant transfer
                      </div>
                    </div>
                    {paymentMethod === 'direct_upi' && (
                      <div style={{
                        position: 'absolute',
                        top: '10px',
                        right: '15px',
                        background: '#28a745',
                        color: 'white',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px'
                      }}>
                        ✓
                      </div>
                    )}
                  </label>

                  {/* Razorpay Online Payment Option */}
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px',
                    border: paymentMethod === 'razorpay' ? '2px solid #2874f0' : '1px solid #e0e0e0',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    marginBottom: '12px',
                    background: paymentMethod === 'razorpay' ? '#f8f9fa' : 'transparent',
                    opacity: 0.8
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
                        💳 Online Payment Gateway
                        <span style={{ 
                          background: '#6c757d', 
                          color: 'white', 
                          padding: '2px 8px', 
                          borderRadius: '10px', 
                          fontSize: '10px', 
                          fontWeight: 'bold' 
                        }}>
                          VIA GATEWAY
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#878787' }}>
                        Cards, UPI, Net Banking via Razorpay (Processing fees may apply)
                      </div>
                    </div>
                  </label>

                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px',
                    border: paymentMethod === 'cod' ? '2px solid #2874f0' : '1px solid #e0e0e0',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    opacity: 0.8
                  }}>
                    <input
                      type="radio"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      style={{ accentColor: '#2874f0' }}
                    />
                    <div>
                      <div style={{ fontWeight: '500', fontSize: '14px' }}>💵 Cash on Delivery</div>
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
                    padding: '12px 24px',
                    borderRadius: '2px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: paymentMethod ? 'pointer' : 'not-allowed'
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
                    {paymentMethod === 'cod' ? '💵 Cash on Delivery' : '💳 Online Payment (Razorpay)'}
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
            padding: '16px 24px',
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
          
          <div style={{ padding: '16px 24px' }}>
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
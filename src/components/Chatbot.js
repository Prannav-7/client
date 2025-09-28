// src/components/Chatbot.js
import React, { useState, useEffect, useRef } from 'react';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm your electrical assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickReplies = [
    "What products do you have?",
    "Do you offer bulk discounts?",
    "What are your delivery charges?",
    "How can I contact support?",
    "What are your business hours?"
  ];

  const botResponses = {
    "what products do you have": "We offer a wide range of electrical products including switches, sockets, lighting solutions, fans, wiring cables, power tools, and much more! You can browse our complete catalog on the Products page.",
    "products": "We specialize in electrical goods, hardware tools, wiring & cables, switches & sockets, lighting solutions, fans & ventilation, electrical motors, and safety equipment.",
    "bulk discounts": "Yes! We offer attractive bulk discounts for large orders. Please contact us at electrostore2511@gmail.com or WhatsApp +91 8838686407 for bulk pricing.",
    "delivery charges": "We offer FREE delivery on orders above ₹999. For orders below ₹999, delivery charges may apply based on location.",
    "contact support": "You can reach us via:\n📞 Phone: +91 8838686407\n✉️ Email: electrostore2511@gmail.com\n💬 WhatsApp: +91 8838686407",
    "business hours": "We're open Monday to Sunday, 8:30 AM - 8:30 PM. Feel free to contact us during these hours!",
    "payment": "We accept various payment methods including Credit/Debit cards, UPI, Net Banking, and Cash on Delivery.",
    "warranty": "Most of our products come with manufacturer warranty. Warranty period varies by product and brand. Check individual product pages for specific warranty information.",
    "installation": "We provide installation services for electrical products. Contact us for professional installation assistance.",
    "return": "We have a hassle-free return policy. Products can be returned within 7 days if unused and in original packaging.",
    "hi": "Hello! Welcome to Jai Maruthi Electricals. How can I assist you today?",
    "hello": "Hi there! I'm here to help you with any questions about our electrical products and services.",
    "help": "I'm here to help! You can ask me about our products, pricing, delivery, contact information, or anything else related to our electrical store.",
    "price": "Our products are competitively priced with regular discounts and offers. Check our website for current prices and special deals!",
    "location": "We're located at 275 - A, Opposite to Essar Petrol Bunk, Veppampalayam Pirivu, Mettukadai-638107. Contact us for directions!",
    "thank you": "You're welcome! Is there anything else I can help you with?",
    "thanks": "Happy to help! Feel free to ask if you have any other questions.",
    "contact": "Here are our contact details:\n📞 Phone: +91 8838686407\n✉️ Email: electrostore2511@gmail.com\n💬 WhatsApp: +91 8838686407\n📍 275 - A, Opposite to Essar Petrol Bunk, Veppampalayam Pirivu, Mettukadai-638107"
  };

  const getBotResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    // Check for exact matches first
    for (const [key, response] of Object.entries(botResponses)) {
      if (message.includes(key)) {
        return response;
      }
    }
    
    // Default response with improved contact methods
    return `I'd be happy to help you with that! For specific inquiries, please contact us directly:
    
📞 Phone: +91 8838686407 (Click to call)
✉️ Email: electrostore2511@gmail.com
💬 WhatsApp: +91 8838686407 (Click for instant chat)
📍 Address: 275 - A, Opposite to Essar Petrol Bunk, Veppampalayam Pirivu, Mettukadai-638107

You can also type "contact" for direct contact options!`;
  };

  const handleSendMessage = (messageText = inputMessage) => {
    if (!messageText.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: messageText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate bot typing delay
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        text: getBotResponse(messageText),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleQuickReply = (reply) => {
    handleSendMessage(reply);
  };

  const handleContactAction = (type) => {
    if (type === 'whatsapp') {
      const phone = "918838686407";
      const message = encodeURIComponent("Hi! I need help with electrical products from Jai Maruthi Electricals.");
      // Use web.whatsapp.com for better compatibility
      window.open(`https://web.whatsapp.com/send?phone=${phone}&text=${message}`, '_blank');
    } else if (type === 'email') {
      const subject = encodeURIComponent("Inquiry from Website Chatbot");
      const body = encodeURIComponent("Hi,\n\nI have an inquiry about your electrical products.\n\nRegards,");
      window.location.href = `mailto:electrostore2511@gmail.com?subject=${subject}&body=${body}`;
    }
  };

  if (!isOpen) {
    return (
      <div 
        className="chatbot-button"
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '60px',
          height: '60px',
          backgroundColor: '#667eea',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
          zIndex: 1000,
          transition: 'transform 0.3s ease',
          animation: 'pulse 2s infinite'
        }}
        onMouseOver={(e) => e.target.style.transform = 'scale(1.1)'}
        onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
      >
        <span style={{ fontSize: '1.5rem' }}>💬</span>
        <style>{`
          @keyframes pulse {
            0% { box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3); }
            50% { box-shadow: 0 4px 30px rgba(102, 126, 234, 0.6); }
            100% { box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div 
      className="chatbot-container"
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: 'min(350px, calc(100vw - 40px))',
        height: 'min(500px, calc(100vh - 80px))',
        maxWidth: '350px',
        maxHeight: '500px',
        backgroundColor: 'white',
        borderRadius: '20px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: 'Inter, sans-serif',
        boxSizing: 'border-box'
      }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '15px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem'
          }}>
            ⚡
          </div>
          <div>
            <h4 style={{ margin: '0', fontSize: '1rem', fontWeight: '600' }}>Electrical Assistant</h4>
            <p style={{ margin: '0', fontSize: '0.8rem', opacity: '0.9' }}>Online now</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '1.2rem',
            cursor: 'pointer',
            padding: '5px',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '15px',
        backgroundColor: '#f8f9fa'
      }}>
        {messages.map((message) => (
          <div key={message.id} style={{
            display: 'flex',
            justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
            marginBottom: '12px'
          }}>
            <div style={{
              maxWidth: '80%',
              padding: '10px 15px',
              borderRadius: message.sender === 'user' ? '18px 18px 5px 18px' : '18px 18px 18px 5px',
              backgroundColor: message.sender === 'user' ? '#667eea' : 'white',
              color: message.sender === 'user' ? 'white' : '#333',
              fontSize: '0.9rem',
              lineHeight: '1.4',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
              whiteSpace: 'pre-line'
            }}>
              {message.text}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div style={{
            display: 'flex',
            justifyContent: 'flex-start',
            marginBottom: '12px'
          }}>
            <div style={{
              padding: '10px 15px',
              borderRadius: '18px 18px 18px 5px',
              backgroundColor: 'white',
              color: '#333',
              fontSize: '0.9rem',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
            }}>
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      {messages.length <= 2 && (
        <div style={{
          padding: '10px 15px',
          backgroundColor: '#f8f9fa',
          borderTop: '1px solid #eee'
        }}>
          <p style={{ 
            margin: '0 0 10px 0', 
            fontSize: '0.8rem', 
            color: '#666',
            fontWeight: '500'
          }}>
            Quick questions:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
            {quickReplies.slice(0, 3).map((reply, index) => (
              <button
                key={index}
                onClick={() => handleQuickReply(reply)}
                style={{
                  backgroundColor: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '15px',
                  padding: '5px 10px',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  color: '#667eea'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#667eea';
                  e.target.style.color = 'white';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'white';
                  e.target.style.color = '#667eea';
                }}
              >
                {reply}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Contact Actions */}
      <div style={{
        padding: '10px 15px',
        backgroundColor: 'white',
        borderTop: '1px solid #eee',
        display: 'flex',
        gap: '10px'
      }}>
        <button
          onClick={() => handleContactAction('whatsapp')}
          style={{
            flex: 1,
            background: 'linear-gradient(135deg, #25D366 0%, #1EAA5A 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '8px',
            fontSize: '0.8rem',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          💬 WhatsApp
        </button>
        <button
          onClick={() => handleContactAction('email')}
          style={{
            flex: 1,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '8px',
            fontSize: '0.8rem',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          ✉️ Email
        </button>
      </div>

      {/* Input */}
      <div style={{
        padding: '15px',
        backgroundColor: 'white',
        borderTop: '1px solid #eee',
        display: 'flex',
        gap: '10px'
      }}>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Type your message..."
          style={{
            flex: 1,
            padding: '10px 15px',
            border: '2px solid #e9ecef',
            borderRadius: '20px',
            fontSize: '0.9rem',
            outline: 'none'
          }}
          onFocus={(e) => e.target.style.borderColor = '#667eea'}
          onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={!inputMessage.trim()}
          style={{
            backgroundColor: inputMessage.trim() ? '#667eea' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: inputMessage.trim() ? 'pointer' : 'not-allowed',
            fontSize: '1rem'
          }}
        >
          📤
        </button>
      </div>

      {/* Typing Animation */}
      <style>{`
        .typing-indicator {
          display: flex;
          gap: 3px;
          align-items: center;
        }
        
        .typing-indicator span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: #999;
          animation: typing 1.4s infinite ease-in-out both;
        }
        
        .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
        .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }
        
        @keyframes typing {
          0%, 80%, 100% {
            transform: scale(0);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }

        /* Mobile responsiveness */
        @media (max-width: 768px) {
          .chatbot-container {
            width: calc(100vw - 20px) !important;
            height: calc(100vh - 80px) !important;
            bottom: 10px !important;
            right: 10px !important;
            left: 10px !important;
            border-radius: 15px !important;
            max-width: none !important;
            max-height: none !important;
          }
          
          .chatbot-button {
            bottom: 15px !important;
            right: 15px !important;
          }
        }

        /* Ensure chatbot doesn't overflow viewport */
        .chatbot-container {
          box-sizing: border-box;
          max-width: min(350px, calc(100vw - 40px));
          max-height: min(500px, calc(100vh - 40px));
        }
      `}</style>
    </div>
  );
};

export default Chatbot;

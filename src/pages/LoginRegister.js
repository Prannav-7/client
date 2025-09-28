// src/pages/LoginRegister.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ValidationUtils } from '../utils/validation';

const LoginRegister = () => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const navigate = useNavigate();

  // Enhanced validation using ValidationUtils
  const validateForm = () => {
    const errors = {};
    
    if (!isLogin) {
      const nameValidation = ValidationUtils.validateName(formData.name, "Name");
      if (!nameValidation.isValid) errors.name = nameValidation.message;
    }
    
    const emailValidation = ValidationUtils.validateEmail(formData.email);
    if (!emailValidation.isValid) errors.email = emailValidation.message;
    
    const passwordValidation = ValidationUtils.validatePassword(formData.password);
    if (!passwordValidation.isValid) errors.password = passwordValidation.message;
    
    if (!isLogin) {
      const confirmPasswordValidation = ValidationUtils.validateConfirmPassword(
        formData.password, 
        formData.confirmPassword
      );
      if (!confirmPasswordValidation.isValid) errors.confirmPassword = confirmPasswordValidation.message;
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    setError('');

    // Real-time validation using ValidationUtils
    const newValidationErrors = { ...validationErrors };
    
    switch (name) {
      case 'name':
        const nameValidation = ValidationUtils.validateName(value, "Name");
        newValidationErrors.name = nameValidation.isValid ? '' : nameValidation.message;
        break;
      case 'email':
        const emailValidation = ValidationUtils.validateEmail(value);
        newValidationErrors.email = emailValidation.isValid ? '' : emailValidation.message;
        break;
      case 'password':
        const passwordValidation = ValidationUtils.validatePassword(value);
        newValidationErrors.password = passwordValidation.isValid ? '' : passwordValidation.message;
        if (formData.confirmPassword && value !== formData.confirmPassword) {
          newValidationErrors.confirmPassword = 'Passwords do not match';
        } else {
          newValidationErrors.confirmPassword = '';
        }
        break;
      case 'confirmPassword':
        const confirmPasswordValidation = ValidationUtils.validateConfirmPassword(formData.password, value);
        newValidationErrors.confirmPassword = confirmPasswordValidation.isValid ? '' : confirmPasswordValidation.message;
        break;
      default:
        break;
    }
    
    setValidationErrors(newValidationErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate form using comprehensive validation
    if (!validateForm()) {
      setError('Please fix the validation errors before submitting');
      setLoading(false);
      return;
    }

    console.log('LoginRegister: Form submitted', { isLogin, email: formData.email });

    try {
      let result;
      if (isLogin) {
        console.log('LoginRegister: Attempting login...');
        result = await login(formData.email, formData.password);
      } else {
        console.log('LoginRegister: Attempting registration...');
        result = await register(formData.name, formData.email, formData.password);
      }

      console.log('LoginRegister: Auth result:', result);

      if (result.success) {
        if (isLogin) {
          setSuccess('Login successful!');
        } else {
          setSuccess('Registration successful! A welcome email has been sent to your email address.');
        }
        setTimeout(() => {
          navigate('/');
        }, 2500); // Increased timeout for email message
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(45deg, #667eea 0%, #764ba2 25%, #ff6b6b 50%, #4ecdc4 75%, #45b7d1 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 8s ease infinite',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Background Elements */}
      <div className="floating-shapes">
        <div className="shape shape-1">⚡</div>
        <div className="shape shape-2">🔧</div>
        <div className="shape shape-3">💡</div>
        <div className="shape shape-4">🔌</div>
        <div className="shape shape-5">⚙️</div>
        <div className="shape shape-6">🔋</div>
      </div>

      <div className="login-container" style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '30px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.2)',
        overflow: 'hidden',
        width: '100%',
        maxWidth: '1000px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        minHeight: '650px',
        position: 'relative',
        border: '1px solid rgba(255,255,255,0.3)'
      }}>
        {/* Left Side - Branding with Enhanced Animations */}
        <div className="left-panel" style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '60px 40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Animated Background Pattern */}
          <div className="pattern-bg"></div>
          
          <div className="brand-content" style={{ position: 'relative', zIndex: 2 }}>
            <div className="brand-icon" style={{ marginBottom: '30px' }}>
              <div className="animated-logo" style={{ 
                fontSize: '5rem',
                marginBottom: '20px',
                textShadow: '0 10px 30px rgba(0,0,0,0.3)'
              }}>
                ⚡
              </div>
            </div>
            <h2 className="brand-title" style={{ 
              margin: '0 0 15px 0', 
              fontSize: '2.2rem',
              fontWeight: 'bold',
              textShadow: '0 5px 15px rgba(0,0,0,0.2)'
            }}>
              JAI MARUTHI ELECTRICALS
            </h2>
            <p className="brand-subtitle" style={{ 
              margin: '0 0 40px 0', 
              fontSize: '1.2rem',
              opacity: 0.9,
              textShadow: '0 3px 10px rgba(0,0,0,0.2)'
            }}>
              Powering Your World with Quality & Trust
            </p>
          
            <div className="features-grid" style={{ 
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '20px',
              padding: '30px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <h3 className="features-title" style={{ margin: '0 0 25px 0', fontSize: '1.4rem' }}>
                Why Choose Us?
              </h3>
              <div className="features-list" style={{ textAlign: 'left' }}>
                {[
                  { icon: '✅', text: 'Genuine Products Only', delay: '0.1s' },
                  { icon: '🚚', text: 'Fast & Free Delivery', delay: '0.2s' },
                  { icon: '🔧', text: 'Expert Technical Support', delay: '0.3s' },
                  { icon: '💯', text: '14+ Years Experience', delay: '0.4s' },
                  { icon: '⭐', text: '10,000+ Happy Customers', delay: '0.5s' },
                  { icon: '🏆', text: 'Award Winning Service', delay: '0.6s' }
                ].map((feature, index) => (
                  <div key={index} className="feature-item" style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    marginBottom: '15px',
                    animationDelay: feature.delay
                  }}>
                    <span className="feature-icon" style={{ 
                      marginRight: '12px', 
                      fontSize: '1.3rem',
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                    }}>
                      {feature.icon}
                    </span>
                    <span className="feature-text" style={{ fontWeight: '500' }}>
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Enhanced Form with Validation */}
        <div className="right-panel" style={{ 
          padding: '60px 40px',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,249,250,0.9) 100%)'
        }}>
          <div className="form-header" style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h3 className="form-title" style={{ 
              margin: '0 0 10px 0', 
              fontSize: '2.2rem',
              color: '#2c3e50',
              fontWeight: '700'
            }}>
              {isLogin ? 'Welcome Back!' : 'Join Our Family'}
            </h3>
            <p className="form-subtitle" style={{ 
              margin: '0', 
              color: '#666',
              fontSize: '1.1rem',
              opacity: 0.8
            }}>
              {isLogin 
                ? 'Sign in to continue your electrical journey'
                : 'Create account to unlock exclusive deals'
              }
            </p>
          </div>

          {/* Enhanced Error/Success Messages */}
          {error && (
            <div className="alert alert-error" style={{
              background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
              color: 'white',
              padding: '16px 20px',
              borderRadius: '15px',
              marginBottom: '25px',
              textAlign: 'center',
              fontWeight: '500',
              boxShadow: '0 8px 25px rgba(255, 107, 107, 0.3)',
              animation: 'slideInDown 0.5s ease-out'
            }}>
              <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>⚠️</span>
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success" style={{
              background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
              color: 'white',
              padding: '16px 20px',
              borderRadius: '15px',
              marginBottom: '25px',
              textAlign: 'center',
              fontWeight: '500',
              boxShadow: '0 8px 25px rgba(78, 205, 196, 0.3)',
              animation: 'slideInDown 0.5s ease-out'
            }}>
              <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>✅</span>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="enhanced-form">
            {!isLogin && (
              <div className="form-group" style={{ marginBottom: '25px' }}>
                <label className="form-label" style={{ 
                  display: 'block', 
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#2c3e50',
                  fontSize: '1rem'
                }}>
                  👤 Full Name <span style={{ color: '#ff6b6b' }}>*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required={!isLogin}
                  placeholder="Enter your full name (alphabets only)"
                  className={`form-input ${validationErrors.name ? 'error' : ''}`}
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    border: `2px solid ${validationErrors.name ? '#ff6b6b' : '#e9ecef'}`,
                    borderRadius: '15px',
                    fontSize: '16px',
                    transition: 'all 0.3s ease',
                    outline: 'none',
                    backgroundColor: 'rgba(255,255,255,0.8)',
                    backdropFilter: 'blur(10px)'
                  }}
                  onFocus={(e) => {
                    if (!validationErrors.name) {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.boxShadow = '0 0 20px rgba(102, 126, 234, 0.2)';
                    }
                  }}
                  onBlur={(e) => {
                    if (!validationErrors.name) {
                      e.target.style.borderColor = '#e9ecef';
                      e.target.style.boxShadow = 'none';
                    }
                  }}
                />
                {validationErrors.name && (
                  <div className="validation-error" style={{
                    color: '#ff6b6b',
                    fontSize: '0.85rem',
                    marginTop: '5px',
                    fontWeight: '500',
                    animation: 'shake 0.5s ease-in-out'
                  }}>
                    ❌ {validationErrors.name}
                  </div>
                )}
              </div>
            )}

            <div className="form-group" style={{ marginBottom: '25px' }}>
              <label className="form-label" style={{ 
                display: 'block', 
                marginBottom: '8px',
                fontWeight: '600',
                color: '#2c3e50',
                fontSize: '1rem'
              }}>
                ✉️ Email Address <span style={{ color: '#ff6b6b' }}>*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email address"
                className={`form-input ${validationErrors.email ? 'error' : ''}`}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  border: `2px solid ${validationErrors.email ? '#ff6b6b' : '#e9ecef'}`,
                  borderRadius: '15px',
                  fontSize: '16px',
                  transition: 'all 0.3s ease',
                  outline: 'none',
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  backdropFilter: 'blur(10px)'
                }}
                onFocus={(e) => {
                  if (!validationErrors.email) {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.boxShadow = '0 0 20px rgba(102, 126, 234, 0.2)';
                  }
                }}
                onBlur={(e) => {
                  if (!validationErrors.email) {
                    e.target.style.borderColor = '#e9ecef';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              />
              {validationErrors.email && (
                <div className="validation-error" style={{
                  color: '#ff6b6b',
                  fontSize: '0.85rem',
                  marginTop: '5px',
                  fontWeight: '500',
                  animation: 'shake 0.5s ease-in-out'
                }}>
                  ❌ {validationErrors.email}
                </div>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: '25px' }}>
              <label className="form-label" style={{ 
                display: 'block', 
                marginBottom: '8px',
                fontWeight: '600',
                color: '#2c3e50',
                fontSize: '1rem'
              }}>
                🔒 Password <span style={{ color: '#ff6b6b' }}>*</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder={isLogin ? 'Enter your password' : 'Create a strong password'}
                className={`form-input ${validationErrors.password ? 'error' : ''}`}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  border: `2px solid ${validationErrors.password ? '#ff6b6b' : '#e9ecef'}`,
                  borderRadius: '15px',
                  fontSize: '16px',
                  transition: 'all 0.3s ease',
                  outline: 'none',
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  backdropFilter: 'blur(10px)'
                }}
                onFocus={(e) => {
                  if (!validationErrors.password) {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.boxShadow = '0 0 20px rgba(102, 126, 234, 0.2)';
                  }
                }}
                onBlur={(e) => {
                  if (!validationErrors.password) {
                    e.target.style.borderColor = '#e9ecef';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              />
              {validationErrors.password && (
                <div className="validation-error" style={{
                  color: '#ff6b6b',
                  fontSize: '0.85rem',
                  marginTop: '5px',
                  fontWeight: '500',
                  animation: 'shake 0.5s ease-in-out'
                }}>
                  ❌ {validationErrors.password}
                </div>
              )}
              {!isLogin && (
                <div className="password-requirements" style={{
                  fontSize: '0.8rem',
                  color: '#666',
                  marginTop: '8px',
                  padding: '10px',
                  backgroundColor: 'rgba(102, 126, 234, 0.1)',
                  borderRadius: '8px'
                }}>
                  <strong>Password must contain:</strong>
                  <ul style={{ margin: '5px 0 0 0', paddingLeft: '20px' }}>
                    <li>At least 8 characters</li>
                    <li>One uppercase letter</li>
                    <li>One lowercase letter</li>
                    <li>One number</li>
                    <li>One special character (@$!%*?&)</li>
                  </ul>
                </div>
              )}
            </div>

            {!isLogin && (
              <div className="form-group" style={{ marginBottom: '25px' }}>
                <label className="form-label" style={{ 
                  display: 'block', 
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#2c3e50',
                  fontSize: '1rem'
                }}>
                  🔒 Confirm Password <span style={{ color: '#ff6b6b' }}>*</span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required={!isLogin}
                  placeholder="Confirm your password"
                  className={`form-input ${validationErrors.confirmPassword ? 'error' : ''}`}
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    border: `2px solid ${validationErrors.confirmPassword ? '#ff6b6b' : '#e9ecef'}`,
                    borderRadius: '15px',
                    fontSize: '16px',
                    transition: 'all 0.3s ease',
                    outline: 'none',
                    backgroundColor: 'rgba(255,255,255,0.8)',
                    backdropFilter: 'blur(10px)'
                  }}
                  onFocus={(e) => {
                    if (!validationErrors.confirmPassword) {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.boxShadow = '0 0 20px rgba(102, 126, 234, 0.2)';
                    }
                  }}
                  onBlur={(e) => {
                    if (!validationErrors.confirmPassword) {
                      e.target.style.borderColor = '#e9ecef';
                      e.target.style.boxShadow = 'none';
                    }
                  }}
                />
                {validationErrors.confirmPassword && (
                  <div className="validation-error" style={{
                    color: '#ff6b6b',
                    fontSize: '0.85rem',
                    marginTop: '5px',
                    fontWeight: '500',
                    animation: 'shake 0.5s ease-in-out'
                  }}>
                    ❌ {validationErrors.confirmPassword}
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="submit-btn"
              style={{
                width: '100%',
                padding: '18px 24px',
                background: loading 
                  ? 'linear-gradient(135deg, #ccc 0%, #bbb 100%)' 
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '15px',
                fontSize: '1.1rem',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                marginBottom: '25px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                boxShadow: loading ? 'none' : '0 8px 25px rgba(102, 126, 234, 0.3)'
              }}
              onMouseOver={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(-3px)';
                  e.target.style.boxShadow = '0 12px 35px rgba(102, 126, 234, 0.4)';
                }
              }}
              onMouseOut={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.3)';
                }
              }}
            >
              {loading 
                ? '⏳ Processing...' 
                : isLogin 
                  ? '🚪 Sign In Now' 
                  : '🎉 Create Account'
              }
            </button>

            <div className="form-footer" style={{ textAlign: 'center' }}>
              <p style={{ margin: '0 0 20px 0', color: '#666', fontSize: '1rem' }}>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setValidationErrors({});
                    setError('');
                    setFormData({
                      name: '',
                      email: '',
                      password: '',
                      confirmPassword: ''
                    });
                  }}
                  className="toggle-btn"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#667eea',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    fontWeight: '700',
                    fontSize: '1rem',
                    transition: 'color 0.3s ease'
                  }}
                  onMouseOver={(e) => e.target.style.color = '#764ba2'}
                  onMouseOut={(e) => e.target.style.color = '#667eea'}
                >
                  {isLogin ? '🎯 Sign Up Here' : '🔑 Sign In Here'}
                </button>
              </p>
            </div>

            <div className="back-to-home" style={{ 
              textAlign: 'center', 
              marginTop: '25px',
              paddingTop: '25px',
              borderTop: '2px solid rgba(102, 126, 234, 0.1)'
            }}>
              <Link 
                to="/" 
                className="home-link"
                style={{ 
                  color: '#667eea', 
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseOver={(e) => {
                  e.target.style.color = '#764ba2';
                  e.target.style.transform = 'translateX(-5px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.color = '#667eea';
                  e.target.style.transform = 'translateX(0)';
                }}
              >
                ← Back to Home
              </Link>
            </div>
          </form>
        </div>
      </div>
      {/* Enhanced CSS Animations */}
      <style>{`
        /* Background Gradient Animation */
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        /* Floating Shapes */
        .floating-shapes {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
        }

        .shape {
          position: absolute;
          font-size: 2rem;
          opacity: 0.1;
          animation: float 6s ease-in-out infinite;
        }

        .shape-1 { top: 10%; left: 10%; animation-delay: 0s; }
        .shape-2 { top: 20%; right: 20%; animation-delay: 1s; }
        .shape-3 { top: 50%; left: 5%; animation-delay: 2s; }
        .shape-4 { bottom: 30%; right: 10%; animation-delay: 3s; }
        .shape-5 { bottom: 10%; left: 20%; animation-delay: 4s; }
        .shape-6 { top: 70%; right: 30%; animation-delay: 5s; }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.1; }
          50% { transform: translateY(-30px) rotate(180deg); opacity: 0.3; }
        }

        /* Container Animation */
        .login-container {
          animation: slideInUp 1s ease-out;
        }

        @keyframes slideInUp {
          0% { 
            opacity: 0; 
            transform: translateY(100px) scale(0.9); 
          }
          100% { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }

        /* Left Panel Animations */
        .left-panel {
          animation: slideInLeft 1s ease-out;
        }

        @keyframes slideInLeft {
          0% { 
            opacity: 0; 
            transform: translateX(-100px); 
          }
          100% { 
            opacity: 1; 
            transform: translateX(0); 
          }
        }

        /* Pattern Background */
        .pattern-bg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0.1;
          background-image: 
            radial-gradient(circle at 20% 50%, white 2px, transparent 2px),
            radial-gradient(circle at 80% 50%, white 2px, transparent 2px);
          background-size: 60px 60px;
          animation: patternMove 10s linear infinite;
        }

        @keyframes patternMove {
          0% { background-position: 0 0; }
          100% { background-position: 60px 60px; }
        }

        /* Brand Animations */
        .animated-logo {
          animation: logoSpin 3s ease-in-out infinite;
        }

        @keyframes logoSpin {
          0%, 100% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(10deg) scale(1.1); }
        }

        .brand-title {
          animation: titleGlow 2s ease-in-out infinite alternate;
        }

        @keyframes titleGlow {
          0% { text-shadow: 0 5px 15px rgba(0,0,0,0.2); }
          100% { text-shadow: 0 5px 15px rgba(0,0,0,0.2), 0 0 20px rgba(255,255,255,0.3); }
        }

        .brand-subtitle {
          animation: subtitleFade 2s ease-in-out infinite alternate;
        }

        @keyframes subtitleFade {
          0% { opacity: 0.9; }
          100% { opacity: 1; }
        }

        /* Feature Items Animation */
        .feature-item {
          animation: featureSlideIn 0.6s ease-out both;
        }

        @keyframes featureSlideIn {
          0% { 
            opacity: 0; 
            transform: translateX(-30px); 
          }
          100% { 
            opacity: 1; 
            transform: translateX(0); 
          }
        }

        .feature-icon {
          transition: transform 0.3s ease;
        }

        .feature-item:hover .feature-icon {
          transform: scale(1.3) rotate(10deg);
        }

        /* Right Panel Animations */
        .right-panel {
          animation: slideInRight 1s ease-out;
        }

        @keyframes slideInRight {
          0% { 
            opacity: 0; 
            transform: translateX(100px); 
          }
          100% { 
            opacity: 1; 
            transform: translateX(0); 
          }
        }

        /* Form Animations */
        .form-title {
          animation: titleBounce 1s ease-out 0.5s both;
        }

        @keyframes titleBounce {
          0% { 
            opacity: 0; 
            transform: translateY(-30px); 
          }
          60% { 
            opacity: 1; 
            transform: translateY(10px); 
          }
          100% { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }

        .form-subtitle {
          animation: subtitleSlide 1s ease-out 0.7s both;
        }

        @keyframes subtitleSlide {
          0% { 
            opacity: 0; 
            transform: translateY(20px); 
          }
          100% { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }

        /* Alert Animations */
        @keyframes slideInDown {
          0% { 
            opacity: 0; 
            transform: translateY(-50px); 
          }
          100% { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }

        /* Form Group Animations */
        .form-group {
          animation: formGroupFade 0.8s ease-out both;
        }

        @keyframes formGroupFade {
          0% { 
            opacity: 0; 
            transform: translateY(30px); 
          }
          100% { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }

        /* Validation Error Animation */
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        /* Button Animations */
        .submit-btn {
          position: relative;
          overflow: hidden;
        }

        .submit-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: left 0.5s;
        }

        .submit-btn:hover::before {
          left: 100%;
        }

        .submit-btn:active {
          transform: scale(0.98);
        }

        /* Toggle Button Animation */
        .toggle-btn {
          position: relative;
        }

        .toggle-btn::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          transition: width 0.3s ease;
        }

        .toggle-btn:hover::after {
          width: 100%;
        }

        /* Home Link Animation */
        .home-link {
          position: relative;
        }

        .home-link::before {
          content: '';
          position: absolute;
          bottom: -3px;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          transition: width 0.3s ease;
        }

        .home-link:hover::before {
          width: 100%;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .login-container {
            grid-template-columns: 1fr !important;
            max-width: 500px !important;
          }
          
          .left-panel {
            padding: 40px 20px !important;
          }
          
          .right-panel {
            padding: 40px 20px !important;
          }
          
          .form-title {
            font-size: 1.8rem !important;
          }
          
          .brand-title {
            font-size: 1.8rem !important;
          }
          
          .animated-logo {
            font-size: 4rem !important;
          }

          .features-grid {
            padding: 20px !important;
          }
        }

        /* Enhanced Focus States */
        .form-input:focus {
          transform: scale(1.02);
        }

        /* Loading Animation */
        .submit-btn:disabled {
          position: relative;
        }

        .submit-btn:disabled::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 20px;
          height: 20px;
          margin: -10px 0 0 -10px;
          border: 2px solid transparent;
          border-top: 2px solid #fff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Glassmorphism Effects */
        .form-input {
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .alert {
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        /* Performance Optimizations */
        * {
          will-change: auto;
        }

        .login-container,
        .left-panel,
        .right-panel {
          backface-visibility: hidden;
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
};

export default LoginRegister;

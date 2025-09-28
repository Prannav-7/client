import { useState } from 'react';

// Form validation utilities for comprehensive validation
export const ValidationUtils = {
  // Email validation
  validateEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return { isValid: false, message: "Email is required" };
    if (!emailRegex.test(email)) return { isValid: false, message: "Please enter a valid email address" };
    return { isValid: true, message: "" };
  },

  // Phone validation
  validatePhone: (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phone) return { isValid: false, message: "Phone number is required" };
    if (!phoneRegex.test(phone)) return { isValid: false, message: "Please enter a valid 10-digit Indian mobile number" };
    return { isValid: true, message: "" };
  },

  // Name validation
  validateName: (name, fieldName = "Name") => {
    if (!name || name.trim().length === 0) return { isValid: false, message: `${fieldName} is required` };
    if (name.trim().length < 2) return { isValid: false, message: `${fieldName} must be at least 2 characters long` };
    if (name.trim().length > 50) return { isValid: false, message: `${fieldName} must be less than 50 characters` };
    if (!/^[a-zA-Z\s]+$/.test(name)) return { isValid: false, message: `${fieldName} should only contain letters and spaces` };
    return { isValid: true, message: "" };
  },

  // Password validation
  validatePassword: (password) => {
    if (!password) return { isValid: false, message: "Password is required" };
    if (password.length < 6) return { isValid: false, message: "Password must be at least 6 characters long" };
    if (password.length > 128) return { isValid: false, message: "Password must be less than 128 characters" };
    return { isValid: true, message: "" };
  },

  // Confirm password validation
  validateConfirmPassword: (password, confirmPassword) => {
    if (!confirmPassword) return { isValid: false, message: "Please confirm your password" };
    if (password !== confirmPassword) return { isValid: false, message: "Passwords do not match" };
    return { isValid: true, message: "" };
  },

  // Pincode validation
  validatePincode: (pincode) => {
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    if (!pincode) return { isValid: false, message: "Pincode is required" };
    if (!pincodeRegex.test(pincode)) return { isValid: false, message: "Please enter a valid 6-digit pincode" };
    return { isValid: true, message: "" };
  },

  // Address validation
  validateAddress: (address, fieldName = "Address") => {
    if (!address || address.trim().length === 0) return { isValid: false, message: `${fieldName} is required` };
    if (address.trim().length < 10) return { isValid: false, message: `${fieldName} must be at least 10 characters long` };
    if (address.trim().length > 500) return { isValid: false, message: `${fieldName} must be less than 500 characters` };
    return { isValid: true, message: "" };
  },

  // City validation
  validateCity: (city) => {
    if (!city || city.trim().length === 0) return { isValid: false, message: "City is required" };
    if (city.trim().length < 2) return { isValid: false, message: "City must be at least 2 characters long" };
    if (city.trim().length > 50) return { isValid: false, message: "City must be less than 50 characters" };
    if (!/^[a-zA-Z\s]+$/.test(city)) return { isValid: false, message: "City should only contain letters and spaces" };
    return { isValid: true, message: "" };
  },

  // State validation
  validateState: (state) => {
    if (!state || state.trim().length === 0) return { isValid: false, message: "State is required" };
    if (state.trim().length < 2) return { isValid: false, message: "State must be at least 2 characters long" };
    if (state.trim().length > 50) return { isValid: false, message: "State must be less than 50 characters" };
    return { isValid: true, message: "" };
  },

  // Product name validation
  validateProductName: (name) => {
    if (!name || name.trim().length === 0) return { isValid: false, message: "Product name is required" };
    if (name.trim().length < 3) return { isValid: false, message: "Product name must be at least 3 characters long" };
    if (name.trim().length > 100) return { isValid: false, message: "Product name must be less than 100 characters" };
    return { isValid: true, message: "" };
  },

  // Price validation
  validatePrice: (price, fieldName = "Price") => {
    if (!price && price !== 0) return { isValid: false, message: `${fieldName} is required` };
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return { isValid: false, message: `${fieldName} must be a valid number` };
    if (numPrice < 0) return { isValid: false, message: `${fieldName} must be greater than or equal to 0` };
    if (numPrice > 1000000) return { isValid: false, message: `${fieldName} must be less than 10,00,000` };
    return { isValid: true, message: "" };
  },

  // Quantity validation
  validateQuantity: (quantity) => {
    if (!quantity && quantity !== 0) return { isValid: false, message: "Quantity is required" };
    const numQuantity = parseInt(quantity);
    if (isNaN(numQuantity)) return { isValid: false, message: "Quantity must be a valid number" };
    if (numQuantity < 0) return { isValid: false, message: "Quantity must be greater than or equal to 0" };
    if (numQuantity > 10000) return { isValid: false, message: "Quantity must be less than 10,000" };
    return { isValid: true, message: "" };
  },

  // Description validation
  validateDescription: (description) => {
    if (!description || description.trim().length === 0) return { isValid: false, message: "Description is required" };
    if (description.trim().length < 10) return { isValid: false, message: "Description must be at least 10 characters long" };
    if (description.trim().length > 1000) return { isValid: false, message: "Description must be less than 1000 characters" };
    return { isValid: true, message: "" };
  },

  // Category validation
  validateCategory: (category) => {
    const validCategories = [
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
    if (!category) return { isValid: false, message: "Category is required" };
    if (!validCategories.includes(category)) return { isValid: false, message: "Please select a valid category" };
    return { isValid: true, message: "" };
  },

  // Brand validation
  validateBrand: (brand) => {
    if (!brand || brand.trim().length === 0) return { isValid: false, message: "Brand is required" };
    if (brand.trim().length < 2) return { isValid: false, message: "Brand must be at least 2 characters long" };
    if (brand.trim().length > 50) return { isValid: false, message: "Brand must be less than 50 characters" };
    return { isValid: true, message: "" };
  },

  // GST validation
  validateGST: (gst) => {
    if (!gst) return { isValid: true, message: "" }; // GST is optional
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gstRegex.test(gst)) return { isValid: false, message: "Please enter a valid GST number" };
    return { isValid: true, message: "" };
  },

  // Generic required field validation
  validateRequired: (value, fieldName) => {
    if (!value || (typeof value === 'string' && value.trim().length === 0)) {
      return { isValid: false, message: `${fieldName} is required` };
    }
    return { isValid: true, message: "" };
  },

  // Validate entire form
  validateForm: (formData, validationRules) => {
    const errors = {};
    let isFormValid = true;

    for (const [field, rules] of Object.entries(validationRules)) {
      const value = formData[field];
      
      for (const rule of rules) {
        const validation = rule(value);
        if (!validation.isValid) {
          errors[field] = validation.message;
          isFormValid = false;
          break; // Stop at first error for this field
        }
      }
    }

    return { isFormValid, errors };
  }
};

// Form validation hook
export const useFormValidation = (initialState, validationRules) => {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate field on blur
    if (validationRules[name]) {
      const value = formData[name];
      for (const rule of validationRules[name]) {
        const validation = rule(value);
        if (!validation.isValid) {
          setErrors(prev => ({ ...prev, [name]: validation.message }));
          break;
        }
      }
    }
  };

  const validateAll = () => {
    const { isFormValid, errors: formErrors } = ValidationUtils.validateForm(formData, validationRules);
    setErrors(formErrors);
    setTouched(Object.keys(validationRules).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    return isFormValid;
  };

  const resetForm = () => {
    setFormData(initialState);
    setErrors({});
    setTouched({});
  };

  return {
    formData,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    resetForm,
    setFormData
  };
};

export default ValidationUtils;
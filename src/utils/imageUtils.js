// Image utility functions
const API_BASE_URL = 'http://localhost:5000';

/**
 * Get the full image URL for a product
 * @param {string} imageUrl - The relative image URL from the database
 * @returns {string} - The full image URL
 */
export const getImageUrl = (imageUrl) => {
  if (!imageUrl) {
    return `${API_BASE_URL}/images/default-product.svg`;
  }
  
  // If it's already a full URL, return as is
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  
  // If it starts with /, prepend the base URL
  if (imageUrl.startsWith('/')) {
    return `${API_BASE_URL}${imageUrl}`;
  }
  
  // Otherwise, assume it's a relative path and add the base URL and leading slash
  return `${API_BASE_URL}/${imageUrl}`;
};

/**
 * Get the default image URL for error fallback
 * @returns {string} - The default image URL
 */
export const getDefaultImageUrl = () => {
  return `${API_BASE_URL}/images/default-product.svg`;
};

export default {
  getImageUrl,
  getDefaultImageUrl
};

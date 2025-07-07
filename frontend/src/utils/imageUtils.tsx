/**
 * Image utility functions for handling product images
 */
import React from 'react';

// Get the API base URL (same as used in api.ts)
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

/**
 * Convert a relative image path to a complete URL
 * @param imagePath - The relative path from the API (e.g., "/media/products/image.jpg")
 * @returns Complete URL (e.g., "http://localhost:8000/media/products/image.jpg")
 */
export const getImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) {
    return '';
  }

  // If the path is already a complete URL, return it as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // If the path starts with /, it's a relative path from the root
  if (imagePath.startsWith('/')) {
    return `${API_BASE_URL}${imagePath}`;
  }

  // Otherwise, assume it's a relative path and prepend the API base URL with a slash
  return `${API_BASE_URL}/${imagePath}`;
};

/**
 * Get the primary image URL for a product
 * @param product - Product object with primary_image property
 * @returns Complete image URL or empty string if no image
 */
export const getProductImageUrl = (product: { primary_image?: string | null }): string => {
  return getImageUrl(product.primary_image);
};

/**
 * Component for displaying product images with proper error handling
 */
export interface ProductImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  fallbackText?: string;
}

export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  className = "w-full h-full object-cover",
  fallbackClassName = "w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 text-base",
  fallbackText = "No Image"
}) => {
  const imageUrl = getImageUrl(src);

  if (!imageUrl) {
    return (
      <div className={fallbackClassName}>
        {fallbackText}
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      onError={(e) => {
        // Hide the broken image and show fallback
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
        
        // Create fallback div if it doesn't exist
        const parent = target.parentElement;
        if (parent && !parent.querySelector('.image-fallback')) {
          const fallback = document.createElement('div');
          fallback.className = `image-fallback ${fallbackClassName}`;
          fallback.textContent = fallbackText;
          parent.appendChild(fallback);
        }
      }}
    />
  );
};

export default {
  getImageUrl,
  getProductImageUrl,
  ProductImage
};
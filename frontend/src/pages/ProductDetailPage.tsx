import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsAPI } from '../services/api';
import { useCartStore } from '../store/useStore';
import { Product } from '../types';
import { getImageUrl } from '../utils/imageUtils';

const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [error, setError] = useState('');
  
  const { addToCart } = useCartStore();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;
      
      setIsLoading(true);
      try {
        const response = await productsAPI.getProduct(slug);
        setProduct(response.data);
      } catch (error) {
        console.error('Error fetching product:', error);
        setError('Product not found');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  const handleAddToCart = async () => {
    if (!product) return;
    
    setIsAddingToCart(true);
    setError('');
    
    try {
      await addToCart(product.id, quantity);
      // Show success feedback
      alert('Product added to cart!');
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to add to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= (product?.stock_quantity || 1)) {
      setQuantity(newQuantity);
    }
  };

  if (isLoading) {
    return (
      <div className="product-detail-page">
        <div className="container">
          <div className="loading">Loading product...</div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container">
          <div className="text-center py-16">
            <h2 className="text-accent mb-4">{error || 'Product not found'}</h2>
            <button onClick={() => navigate('/products')} className="btn btn-primary">
              Back to Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  const primaryImage = product.images?.[selectedImageIndex] || product.images?.[0];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container">
        <button onClick={() => navigate('/products')} className="bg-transparent border-0 text-primary text-base cursor-pointer mb-8 py-2 no-underline transition-colors duration-200 hover:text-primary-hover hover:underline">
          ← Back to Products
        </button>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 bg-white rounded-xl p-8 shadow-md">
          <div className="flex flex-col gap-4">
            <div className="w-full h-96 rounded-lg overflow-hidden bg-gray-200">
              {primaryImage ? (
                <img src={getImageUrl(primaryImage.image)} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500 text-lg">No Image Available</div>
              )}
            </div>
            
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 flex-wrap">
                {product.images.map((image, index) => (
                  <img
                    key={image.id}
                    src={getImageUrl(image.image)}
                    alt={`${product.name} ${index + 1}`}
                    className={`w-20 h-20 rounded-md object-cover cursor-pointer border-2 transition-colors duration-200 ${index === selectedImageIndex ? 'border-primary' : 'border-transparent hover:border-primary'}`}
                    onClick={() => setSelectedImageIndex(index)}
                  />
                ))}
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-6">
            <h1 className="text-4xl text-gray-800 m-0 leading-tight">{product.name}</h1>
            <p className="text-3xl font-bold text-accent m-0">${product.price}</p>
            
            <div className="text-base">
              {product.stock_quantity > 0 ? (
                <span className="text-success font-semibold">✓ In Stock ({product.stock_quantity} available)</span>
              ) : (
                <span className="text-accent font-semibold">✗ Out of Stock</span>
              )}
            </div>
            
            <div>
              <h3 className="text-gray-800 mb-4 text-xl">Description</h3>
              <p className="text-gray-600 leading-relaxed m-0">{product.description}</p>
            </div>
            
            <div>
              <h3 className="text-gray-800 mb-4 text-xl">Specifications</h3>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between md:flex-row flex-col md:gap-0 gap-1 py-2 border-b border-gray-100">
                  <span className="font-semibold text-gray-800">Dimensions:</span>
                  <span className="text-gray-600">
                    {product.length}L × {product.width}W × {product.height}H cm
                  </span>
                </div>
                <div className="flex justify-between md:flex-row flex-col md:gap-0 gap-1 py-2 border-b border-gray-100">
                  <span className="font-semibold text-gray-800">Weight:</span>
                  <span className="text-gray-600">{product.weight}g</span>
                </div>
              </div>
            </div>
            
            {product.stock_quantity > 0 && (
              <div className="pt-4 border-t-2 border-gray-100">
                <div className="mb-6">
                  <label htmlFor="quantity" className="block mb-2 font-semibold text-gray-800">Quantity:</label>
                  <div className="flex items-center gap-2 justify-center md:justify-start">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="w-10 h-10 border border-gray-300 bg-white rounded-md cursor-pointer font-bold text-lg flex items-center justify-center transition-all duration-200 hover:bg-gray-50 hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      id="quantity"
                      value={quantity}
                      onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                      min="1"
                      max={product.stock_quantity}
                      className="w-20 h-10 text-center border border-gray-300 rounded-md text-base focus:outline-none focus:border-primary"
                    />
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= product.stock_quantity}
                      className="w-10 h-10 border border-gray-300 bg-white rounded-md cursor-pointer font-bold text-lg flex items-center justify-center transition-all duration-200 hover:bg-gray-50 hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                </div>
                
                {error && <div className="bg-red-50 text-red-600 px-3 py-3 rounded-md mb-4 border border-red-200 text-sm">{error}</div>}
                
                <button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || product.stock_quantity < quantity}
                  className="bg-primary text-white border-0 px-8 py-4 rounded-lg text-lg font-semibold cursor-pointer transition-colors duration-200 w-full hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isAddingToCart ? 'Adding to Cart...' : 'Add to Cart'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
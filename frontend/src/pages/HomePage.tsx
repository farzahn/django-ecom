import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI } from '../services/api';
import { Product } from '../types';
import { getProductImageUrl } from '../utils/imageUtils';

const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await productsAPI.getProducts(1);
        setFeaturedProducts(response.data.results?.slice(0, 6) || []);
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary-hover text-white py-32 text-center">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl mb-4 font-bold">Welcome to Pasargad Prints</h1>
            <p className="text-lg mb-8 opacity-90">Discover our amazing collection of custom 3D printed items</p>
            <Link to="/products" className="inline-block bg-white text-primary px-8 py-4 no-underline rounded-lg font-bold text-lg transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lg">
              Shop Now
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <h2 className="text-center text-4xl mb-12 text-gray-800">Featured Products</h2>
          
          {isLoading ? (
            <div className="text-center py-8 text-gray-600 text-lg">Loading products...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {featuredProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-xl overflow-hidden shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
                  <Link to={`/products/${product.slug}`}>
                    <div className="w-full h-48 relative overflow-hidden">
                      {product.primary_image ? (
                        <img src={getProductImageUrl(product)} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 text-sm">No Image</div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg mb-2 text-gray-800">{product.name}</h3>
                      <p className="text-xl font-bold text-accent m-0">${product.price}</p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
          
          <div className="text-center">
            <Link to="/products" className="text-primary no-underline text-lg font-semibold py-4 px-8 border-2 border-primary rounded-lg transition-all duration-200 hover:bg-primary hover:text-white">
              View All Products →
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-4xl mb-8 text-gray-800">About Pasargad Prints</h2>
            <p className="text-lg leading-relaxed text-gray-600 mb-12">
              We specialize in creating high-quality, custom 3D printed items tailored to your needs. 
              From prototypes to finished products, we bring your ideas to life with precision and creativity.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 bg-gray-50 rounded-xl">
                <h3 className="text-xl mb-4 text-gray-800">🎯 Precision</h3>
                <p className="text-gray-600 m-0">High-quality 3D printing with attention to detail</p>
              </div>
              <div className="p-8 bg-gray-50 rounded-xl">
                <h3 className="text-xl mb-4 text-gray-800">🚀 Fast Delivery</h3>
                <p className="text-gray-600 m-0">Quick turnaround times for your projects</p>
              </div>
              <div className="p-8 bg-gray-50 rounded-xl">
                <h3 className="text-xl mb-4 text-gray-800">🛠️ Custom Solutions</h3>
                <p className="text-gray-600 m-0">Tailored designs to meet your specific requirements</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI } from '../services/api';
import { Product } from '../types';
import { getProductImageUrl } from '../utils/imageUtils';

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchProducts = async (page: number, search = '') => {
    setIsLoading(true);
    try {
      const response = await productsAPI.getProducts(page, search);
      setProducts(response.data.results || []);
      
      // Calculate total pages from API response
      const count = response.data.count || 0;
      const pageSize = 12; // Default page size from backend
      setTotalPages(Math.ceil(count / pageSize));
      
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts(1, searchTerm);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container">
        <div className="text-center mb-12">
          <h1 className="text-4xl text-gray-800 mb-8">Our Products</h1>
          
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-primary"
            />
            <button type="submit" className="bg-primary text-white px-6 py-3 border-0 rounded-lg cursor-pointer font-semibold transition-colors duration-200 hover:bg-primary-hover">Search</button>
          </form>
        </div>

        {isLoading ? (
          <div className="text-center py-16 text-gray-600 text-xl">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-gray-600">
            <p className="text-xl mb-4">No products found.</p>
            {searchTerm && (
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setCurrentPage(1);
                }}
                className="bg-gray-500 text-white px-4 py-2 border-0 rounded-md cursor-pointer font-medium hover:bg-gray-600"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-xl overflow-hidden shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
                  <Link to={`/products/${product.slug}`}>
                    <div className="w-full h-56 relative overflow-hidden">
                      {product.primary_image ? (
                        <img src={getProductImageUrl(product)} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 text-base">No Image</div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl mb-2 text-gray-800 leading-tight">{product.name}</h3>
                      <p className="text-xl font-bold text-accent my-2">${product.price}</p>
                      <p className="text-sm text-gray-600 m-0">
                        {product.stock_quantity > 0 
                          ? `In Stock (${product.stock_quantity})` 
                          : 'Out of Stock'
                        }
                      </p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-md cursor-pointer transition-all duration-200 hover:bg-primary hover:text-white hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 border rounded-md cursor-pointer transition-all duration-200 ${currentPage === page ? 'bg-primary text-white border-primary' : 'border-gray-300 bg-white text-gray-700 hover:bg-primary hover:text-white hover:border-primary'}`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-md cursor-pointer transition-all duration-200 hover:bg-primary hover:text-white hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
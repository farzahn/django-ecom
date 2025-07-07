import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HomePage from '../HomePage';
import { productsAPI } from '../../services/api';

// Mock the API
jest.mock('../../services/api');
const mockProductsAPI = productsAPI as jest.Mocked<typeof productsAPI>;

const renderHomePage = () => {
  return render(
    <BrowserRouter>
      <HomePage />
    </BrowserRouter>
  );
};

describe('HomePage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders hero section', () => {
    mockProductsAPI.getProducts.mockResolvedValue({
      data: { results: [] }
    } as any);

    renderHomePage();
    
    expect(screen.getByText('Welcome to Pasargad Prints')).toBeInTheDocument();
    expect(screen.getByText('Discover our amazing collection of custom 3D printed items')).toBeInTheDocument();
    expect(screen.getByText('Shop Now')).toBeInTheDocument();
  });

  test('shows loading state initially', () => {
    mockProductsAPI.getProducts.mockImplementation(() => new Promise(() => {}));

    renderHomePage();
    
    expect(screen.getByText('Loading products...')).toBeInTheDocument();
  });

  test('displays featured products when loaded', async () => {
    const mockProducts = [
      {
        id: 1,
        name: 'Test Product 1',
        price: '29.99',
        slug: 'test-product-1',
        primary_image: 'test-image-1.jpg'
      },
      {
        id: 2,
        name: 'Test Product 2',
        price: '39.99',
        slug: 'test-product-2',
        primary_image: 'test-image-2.jpg'
      }
    ];

    mockProductsAPI.getProducts.mockResolvedValue({
      data: { results: mockProducts }
    } as any);

    renderHomePage();
    
    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument();
      expect(screen.getByText('$29.99')).toBeInTheDocument();
      expect(screen.getByText('Test Product 2')).toBeInTheDocument();
      expect(screen.getByText('$39.99')).toBeInTheDocument();
    });
  });

  test('renders about section', () => {
    mockProductsAPI.getProducts.mockResolvedValue({
      data: { results: [] }
    } as any);

    renderHomePage();
    
    expect(screen.getByText('About Pasargad Prints')).toBeInTheDocument();
    expect(screen.getByText('🎯 Precision')).toBeInTheDocument();
    expect(screen.getByText('🚀 Fast Delivery')).toBeInTheDocument();
    expect(screen.getByText('🛠️ Custom Solutions')).toBeInTheDocument();
  });

  test('handles API error gracefully', async () => {
    mockProductsAPI.getProducts.mockRejectedValue(new Error('API Error'));

    renderHomePage();
    
    await waitFor(() => {
      expect(screen.queryByText('Loading products...')).not.toBeInTheDocument();
    });

    // Should still show the rest of the page even if products fail to load
    expect(screen.getByText('Welcome to Pasargad Prints')).toBeInTheDocument();
  });
});
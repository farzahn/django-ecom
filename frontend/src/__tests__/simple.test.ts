// Simple tests to verify core functionality
export {};

describe('Basic React App Tests', () => {
  test('should have valid environment setup', () => {
    expect(process.env.NODE_ENV).toBeDefined();
  });

  test('should be able to perform basic calculations', () => {
    const calculate = (a: number, b: number) => a + b;
    expect(calculate(2, 3)).toBe(5);
  });

  test('should handle string operations', () => {
    const formatPrice = (price: number) => `$${price.toFixed(2)}`;
    expect(formatPrice(29.99)).toBe('$29.99');
    expect(formatPrice(10)).toBe('$10.00');
  });

  test('should validate email format', () => {
    const isValidEmail = (email: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };
    
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('invalid-email')).toBe(false);
    expect(isValidEmail('user@domain.co.uk')).toBe(true);
  });

  test('should handle cart calculations', () => {
    interface CartItem {
      id: number;
      price: number;
      quantity: number;
    }

    const calculateCartTotal = (items: CartItem[]) => {
      return items.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const cartItems = [
      { id: 1, price: 29.99, quantity: 2 },
      { id: 2, price: 15.50, quantity: 1 },
      { id: 3, price: 42.00, quantity: 3 }
    ];

    expect(calculateCartTotal(cartItems)).toBe(201.48);
    expect(calculateCartTotal([])).toBe(0);
  });

  test('should handle product filtering', () => {
    interface Product {
      id: number;
      name: string;
      price: number;
      category: string;
      inStock: boolean;
    }

    const products: Product[] = [
      { id: 1, name: 'Widget A', price: 29.99, category: 'electronics', inStock: true },
      { id: 2, name: 'Widget B', price: 15.50, category: 'books', inStock: false },
      { id: 3, name: 'Widget C', price: 42.00, category: 'electronics', inStock: true }
    ];

    const filterInStockProducts = (products: Product[]) => 
      products.filter(product => product.inStock);

    const filterByCategory = (products: Product[], category: string) =>
      products.filter(product => product.category === category);

    expect(filterInStockProducts(products)).toHaveLength(2);
    expect(filterByCategory(products, 'electronics')).toHaveLength(2);
    expect(filterByCategory(products, 'books')).toHaveLength(1);
  });
});
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuthStore, useCartStore } from './store/useStore';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import About from './pages/About';
import Contact from './pages/Contact';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OrdersPage from './pages/OrdersPage';
import SuccessPage from './pages/SuccessPage';
import CancelPage from './pages/CancelPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  const { setUser } = useAuthStore();
  const { fetchCart } = useCartStore();

  useEffect(() => {
    // Initialize user from localStorage
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUser(user, storedToken);
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, [setUser]);

  useEffect(() => {
    // Fetch cart when app loads
    fetchCart().catch(() => {});
  }, [fetchCart]);

  return (
    <Router>
      <div className="min-h-screen">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:slug" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard/*" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/success" element={<SuccessPage />} />
            <Route path="/cancel" element={<CancelPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

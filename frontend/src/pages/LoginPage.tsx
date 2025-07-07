import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useStore';

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(formData);
      navigate('/');
    } catch (error: any) {
      setError(error.response?.data?.non_field_errors?.[0] || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg">
          <h1 className="text-center text-2xl font-bold text-gray-800 mb-8">Login to Your Account</h1>
          
          {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4 text-center border border-red-200">{error}</div>}
          
          <form onSubmit={handleSubmit} className="flex flex-col w-full">
            <div className="mb-6 w-full">
              <label htmlFor="username" className="block mb-2 text-gray-800 font-semibold">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg text-base transition-all duration-200 bg-white text-gray-800 min-h-[42px] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder-gray-500"
              />
            </div>
            
            <div className="mb-6 w-full">
              <label htmlFor="password" className="block mb-2 text-gray-800 font-semibold">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg text-base transition-all duration-200 bg-white text-gray-800 min-h-[42px] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder-gray-500"
              />
            </div>
            
            <button type="submit" disabled={isLoading} className="bg-primary text-white p-4 border-none rounded-lg text-base font-semibold cursor-pointer transition-colors duration-200 mb-4 hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed">
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-gray-600 m-0">Don't have an account? <Link to="/register" className="text-primary font-semibold no-underline hover:underline">Register here</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useStore';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { register } = useAuthStore();
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

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...registrationData } = formData;
      await register(registrationData);
      navigate('/');
    } catch (error: any) {
      setError(error.response?.data?.username?.[0] || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg">
          <h1 className="text-center text-2xl font-bold text-gray-800 mb-8">Create Account</h1>
          
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
                placeholder="Enter your username"
                required
                className="w-full p-3 border border-gray-300 rounded-lg text-base transition-all duration-200 bg-white text-gray-800 min-h-[42px] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder-gray-500"
              />
            </div>
            
            <div className="mb-6 w-full">
              <label htmlFor="email" className="block mb-2 text-gray-800 font-semibold">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                className="w-full p-3 border border-gray-300 rounded-lg text-base transition-all duration-200 bg-white text-gray-800 min-h-[42px] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder-gray-500"
              />
            </div>
            
            <div className="mb-6 w-full">
              <label htmlFor="first_name" className="block mb-2 text-gray-800 font-semibold">First Name</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="Enter your first name"
                required
                className="w-full p-3 border border-gray-300 rounded-lg text-base transition-all duration-200 bg-white text-gray-800 min-h-[42px] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder-gray-500"
              />
            </div>
            
            <div className="mb-6 w-full">
              <label htmlFor="last_name" className="block mb-2 text-gray-800 font-semibold">Last Name</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Enter your last name"
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
                placeholder="Enter your password"
                required
                className="w-full p-3 border border-gray-300 rounded-lg text-base transition-all duration-200 bg-white text-gray-800 min-h-[42px] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder-gray-500"
              />
            </div>
            
            <div className="mb-6 w-full">
              <label htmlFor="confirmPassword" className="block mb-2 text-gray-800 font-semibold">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
                className="w-full p-3 border border-gray-300 rounded-lg text-base transition-all duration-200 bg-white text-gray-800 min-h-[42px] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder-gray-500"
              />
            </div>
            
            <button type="submit" disabled={isLoading} className="bg-primary text-white p-4 border-none rounded-lg text-base font-semibold cursor-pointer transition-colors duration-200 mb-4 hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed">
              {isLoading ? 'Creating Account...' : 'Register'}
            </button>
          </form>
          
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-gray-600 m-0">Already have an account? <Link to="/login" className="text-primary font-semibold no-underline hover:underline">Login here</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
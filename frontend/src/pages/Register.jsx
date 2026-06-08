import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      console.log('Attempting registration with:', {
        username: formData.username,
        email: formData.email
      });
      
      const result = await register(formData.username, formData.email, formData.password);
      console.log('Registration successful:', result);
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration failed:', err);
      console.error('Error response:', err.response);
      console.error('Error message:', err.message);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      if (err.response) {
        // Server responded with error
        errorMessage = err.response.data?.message || errorMessage;
      } else if (err.request) {
        // Request made but no response
        errorMessage = 'Cannot connect to server. Please check if backend is running.';
      } else {
        // Something else happened
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <main className="register-container">
        {/* Logo Section */}
        <div className="logo-section">
          <div className="logo-placeholder">
            <img 
              src="https://play-lh.googleusercontent.com/Z5aOARn89MpGrTp_GeVe5tnT-2YgD15I8drTOEzim_6ncc9wQN9O0xjr8-uLa6o7Dw=w480-h960-rw" 
              alt="PaymentManage Logo"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div className="brand-name">PaymentManage</div>
          <div className="brand-subtitle">Secure Payment Ecosystem</div>
        </div>

        {/* Form Header */}
        <div className="form-header">
          <h1>Create your account</h1>
          <p>Join our secure financial network today.</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <span className="material-symbols-outlined">error</span>
            {error}
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div className="form-group">
            <label className="label" htmlFor="username">Username</label>
            <div className="input-wrapper">
              <span className="material-symbols-outlined input-icon">person</span>
              <input
                className="input-field"
                id="username"
                name="username"
                type="text"
                placeholder="Choose a unique username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="form-group">
            <label className="label" htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <span className="material-symbols-outlined input-icon">mail</span>
              <input
                className="input-field"
                id="email"
                name="email"
                type="email"
                placeholder="name@company.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="label" htmlFor="password">Password</label>
            <div className="input-wrapper">
              <span className="material-symbols-outlined input-icon">lock</span>
              <input
                className="input-field"
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label className="label" htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-wrapper">
              <span className="material-symbols-outlined input-icon">lock_reset</span>
              <input
                className="input-field"
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength="6"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button 
            className="btn-register" 
            type="submit"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        {/* Disclaimer */}
        <div className="disclaimer">
          By clicking Register, you agree to our Terms of Service and Privacy Policy. 
          We use bank-level encryption to protect your data.
        </div>

        {/* Footer Link */}
        <div className="footer-link">
          Already have an account? <Link to="/login">Login here</Link>
        </div>
      </main>
    </div>
  );
};

export default Register;

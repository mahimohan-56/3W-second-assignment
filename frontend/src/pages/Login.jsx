import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      alert(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <main className="login-main">
        {/* Brand Logo Header */}
        <header className="login-header">
          <div className="logo-container soft-shadow">
            <img 
              alt="TaskPlanet Logo" 
              src="https://play-lh.googleusercontent.com/Z5aOARn89MpGrTp_GeVe5tnT-2YgD15I8drTOEzim_6ncc9wQN9O0xjr8-uLa6o7Dw=w480-h960-rw"
            />
          </div>
          <h1>PaymentManage</h1>
          <p className="subtitle">Secure financial access</p>
        </header>

        {/* Login Card */}
        <section className="login-card soft-shadow">
          <h2>Welcome back</h2>
          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <span className="material-symbols-outlined input-icon">mail</span>
                <input 
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

            {/* Password Field */}
            <div className="form-group">
              <div className="label-row">
                <label htmlFor="password">Password</label>
                <Link to="/forgot-password" className="forgot-link">Forgot?</Link>
              </div>
              <div className="input-wrapper">
                <span className="material-symbols-outlined input-icon">lock</span>
                <input 
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  style={{ paddingRight: '48px' }}
                  required
                />
                <button 
                  className="password-toggle" 
                  onClick={togglePassword} 
                  type="button"
                  aria-label="Toggle password visibility"
                >
                  <span className="material-symbols-outlined" id="passToggleIcon">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="checkbox-group">
              <input 
                id="remember"
                name="remember"
                type="checkbox"
                checked={formData.remember}
                onChange={handleChange}
              />
              <label htmlFor="remember">Remember this device</label>
            </div>

            {/* Submit Button */}
            <button 
              className="submit-btn" 
              type="submit"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Login to Account'}
            </button>
          </form>
        </section>

        {/* Footer */}
        <footer className="login-footer">
          <p>Don't have an account? <Link to="/register">Register now</Link></p>
        </footer>
      </main>

      {/* Decorative Elements */}
      <div className="bg-decoration">
        <div className="blob-1"></div>
        <div className="blob-2"></div>
      </div>
    </div>
  );
};

export default Login;

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import Logo from '../components/Logo';
import './AuthPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { signIn, resetPassword, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error.message);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };


  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const { error } = await resetPassword(email);
      if (error) {
        setError(error.message);
      } else {
        setError('');
        alert('Password reset email sent! Check your inbox.');
        setShowForgotPassword(false);
      }
    } catch (err) {
      setError('Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <div className="auth-page">
        <div className="auth-page-container">
          <div className="auth-page-header">
            <Link to="/" className="auth-logo">
              <Logo size="large" />
            </Link>
          </div>
          <div className="auth-form-container">
            <div className="auth-form-card">
              <h2 className="auth-form-title">Reset Password</h2>
              <p className="auth-form-subtitle">
                Enter your email address and we'll send you a link to reset your password.
              </p>
              <form onSubmit={handleForgotPassword} className="auth-form">
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                    className="form-input"
                  />
                </div>

                {error && <div className="error-message">{error}</div>}

                <button type="submit" disabled={loading} className="auth-button">
                  {loading ? 'Sending...' : 'Send Reset Email'}
                </button>

                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="link-button"
                >
                  ← Back to Sign In
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-page-container">
        <div className="auth-page-header">
          <Link to="/" className="auth-logo">
            <Logo size="medium" />
          </Link>
        </div>
        <div className="auth-form-container">
          <div className="auth-form-card">
            <h2 className="auth-form-title">Welcome Back</h2>
            <p className="auth-form-subtitle">
              Sign in to continue tracking your carbon footprint
            </p>
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  minLength={6}
                  className="form-input"
                />
              </div>

              {error && <div className="error-message">{error}</div>}

              <button type="submit" disabled={loading} className="auth-button">
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <div className="auth-links">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="link-button"
              >
                Forgot Password?
              </button>
              
              <p>
                Don't have an account?{' '}
                <Link to="/signup" className="link-button">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;


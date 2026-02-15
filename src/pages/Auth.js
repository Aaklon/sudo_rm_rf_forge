import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate();
  const { login, signup, loginWithGoogle } = useAuth();

  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  // Register form state
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    agreeTerms: false
  });

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength += 25;
    if (password.length >= 10) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 10;
    return strength;
  };

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setRegisterData({ ...registerData, password });
    setPasswordStrength(calculatePasswordStrength(password));
  };

  const getStrengthColor = () => {
    if (passwordStrength < 40) return 'var(--accent-danger)';
    if (passwordStrength < 70) return 'var(--accent-gold)';
    return 'var(--accent-success)';
  };

  const getStrengthText = () => {
    if (passwordStrength < 40) return 'Weak password';
    if (passwordStrength < 70) return 'Moderate password';
    return 'Strong password';
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const { profile } = await loginWithGoogle();
      
      if (profile.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Google login error:', error);
      alert(error.message || 'Failed to login with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { profile } = await login(loginData.email, loginData.password);
      
      if (profile.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert(error.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    if (registerData.name.length < 2) {
      alert('Please enter a valid name');
      return;
    }

    if (registerData.password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    if (!registerData.agreeTerms) {
      alert('Please agree to the terms and conditions');
      return;
    }

    try {
      setLoading(true);
      await signup(registerData);
      alert('Account created successfully! Please login.');
      setIsLogin(true);
      setLoginData({ ...loginData, email: registerData.email });
      setRegisterData({
        name: '',
        email: '',
        password: '',
        agreeTerms: false
      });
    } catch (error) {
      console.error('Registration error:', error);
      alert(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="hero-bg"></div>
      <div className="hero-glow"></div>

      <div className="glass-panel auth-box">
        {/* Header */}
        <div className="text-center" style={{ marginBottom: '40px' }}>
          <div className="logo" style={{ marginBottom: '12px', fontSize: '2rem' }}>
            BookMySeat.
          </div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>Welcome Back</h2>
          <p className="text-muted">Enter the zone of deep focus</p>
        </div>

        {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="btn"
          style={{
            width: '100%',
            marginBottom: '24px',
            background: 'white',
            color: '#333',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            border: '1px solid #ddd'
          }}
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            style={{ width: '18px', height: '18px' }}
          />
          <span>Sign in with Google</span>
        </button>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '24px',
            color: 'var(--text-muted)',
            fontSize: '0.875rem'
          }}
        >
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
          <span>OR</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
        </div>

        {/* Toggle Buttons */}
        <div className="flex gap-2" style={{ marginBottom: '32px' }}>
          <button
            onClick={() => setIsLogin(true)}
            className={`btn ${isLogin ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1 }}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`btn ${!isLogin ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1 }}
          >
            Sign Up
          </button>
        </div>

        {/* Login Form */}
        {isLogin ? (
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                required
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                required
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
              <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={loginData.rememberMe}
                  onChange={(e) => setLoginData({ ...loginData, rememberMe: e.target.checked })}
                  style={{ cursor: 'pointer' }}
                />
                <span className="text-muted" style={{ fontSize: '0.875rem' }}>
                  Remember me
                </span>
              </label>
              <a href="#" className="text-primary" style={{ fontSize: '0.875rem' }}>
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', marginBottom: '16px' }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegisterSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={registerData.name}
                onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                required
                placeholder="John Doe"
                autoComplete="name"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                value={registerData.email}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                required
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                value={registerData.password}
                onChange={handlePasswordChange}
                required
                placeholder="••••••••"
                autoComplete="new-password"
                minLength={6}
              />
              <div className="progress-bar" style={{ marginTop: '8px' }}>
                <div
                  className="progress-fill"
                  style={{
                    width: `${passwordStrength}%`,
                    background: getStrengthColor()
                  }}
                ></div>
              </div>
              <p
                className="text-muted"
                style={{
                  fontSize: '0.75rem',
                  marginTop: '4px',
                  color: getStrengthColor()
                }}
              >
                {registerData.password && getStrengthText()}
              </p>
            </div>

            <div className="form-group">
              <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={registerData.agreeTerms}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, agreeTerms: e.target.checked })
                  }
                  required
                  style={{ cursor: 'pointer' }}
                />
                <span className="text-muted" style={{ fontSize: '0.875rem' }}>
                  I agree to the <a href="#" className="text-primary">Terms</a> and{' '}
                  <a href="#" className="text-primary">Privacy Policy</a>
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        )}

        {/* Back to Home */}
        <div className="text-center" style={{ marginTop: '24px' }}>
          <Link to="/" className="text-muted" style={{ fontSize: '0.875rem' }}>
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Auth;

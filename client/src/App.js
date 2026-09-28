import React, { useState } from 'react';
import Chat from './Chat';
import './App.css';

const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';

function AuthForm({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/users/login' : '/users/register';
      const res = await fetch(`${SERVER_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.msg || 'Something went wrong');
      } else if (mode === 'register') {
        setSuccess('Account created! Please log in.');
        setMode('login');
        setPassword('');
      } else {
        // Login success
        localStorage.setItem('unichat_token', data.token);
        localStorage.setItem('unichat_email', data.email);
        onLogin(data.email);
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-logo">🐻</div>
        <h1 className="auth-title">UniChat</h1>
        <p className="auth-subtitle">Anonymous opposite-gender chat</p>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
          >
            Log In
          </button>
          <button
            className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="auth-input"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="auth-input"
          />
          {error && <p className="auth-error">{error}</p>}
          {success && <p className="auth-success">{success}</p>}
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Log In' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">Your identity stays anonymous in chat 🔒</p>
      </div>
    </div>
  );
}

function GenderSelect({ onSelect, onLogout, email }) {
  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-logo">🐻</div>
        <h1 className="auth-title">UniChat</h1>
        <p className="auth-subtitle">Welcome! Choose your gender to start chatting.</p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 24 }}>
          <button className="gender-btn male" onClick={() => onSelect('male')}>
            👦 Male
          </button>
          <button className="gender-btn female" onClick={() => onSelect('female')}>
            👧 Female
          </button>
        </div>
        <button className="logout-btn" onClick={onLogout}>
          Log out ({email})
        </button>
      </div>
    </div>
  );
}

function App() {
  const [email, setEmail] = useState(() => localStorage.getItem('unichat_email') || '');
  const [gender, setGender] = useState('');

  const handleLogin = (userEmail) => {
    setEmail(userEmail);
  };

  const handleLogout = () => {
    localStorage.removeItem('unichat_token');
    localStorage.removeItem('unichat_email');
    setEmail('');
    setGender('');
  };

  if (!email) {
    return <AuthForm onLogin={handleLogin} />;
  }

  if (!gender) {
    return <GenderSelect onSelect={setGender} onLogout={handleLogout} email={email} />;
  }

  return <Chat gender={gender} onLogout={handleLogout} />;
}

export default App;


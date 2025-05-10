import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import styles from './Login.module.css';
import bilkentLogo from '../../assets/bilkent-logo.png';

function Login() {
  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [rememberMe,   setRememberMe]   = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading,    setIsLoading]    = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // 1) Only on first mount
  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const role  = localStorage.getItem('role')  || sessionStorage.getItem('role');

    // 2) If no token, bail out — no redirect, no history changes
    if (!token || !role) {
      return;
    }

    // 3) Compute your target path
    let target = '/';
    switch (role) {
      case 'admin':      target = '/admin'; break;
      case 'instructor': target = '/instructor/home'; break;
      case 'ta':         target = '/ta/tamain'; break;
      case 'chair':      target = '/departmentchair/home'; break;
      case 'dean':       target = '/deansoffice/home'; break;
      case 'student':    target = '/student/home'; break;
      case 'secretary':  target = '/secretary/home'; break;
    }
  }, []); // ← empty array ensures this runs exactly once

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');

      const { token, role } = data;
      // remember‐me storage choice
      if (rememberMe) {
        localStorage.setItem('token', token);
        localStorage.setItem('role',  role);
      } else {
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('role',  role);
      }

      // redirect immediately after login
      let path = '/';
      switch (role) {
        case 'admin':      path = '/admin'; break;
        case 'instructor': path = '/instructor/home'; break;
        case 'ta':         path = '/ta/tamain'; break;
        case 'chair':      path = '/departmentchair/home'; break;
        case 'dean':       path = '/deansoffice/home'; break;
        case 'student':    path = '/student/home'; break;
        case 'secretary':  path = '/secretary/home'; break;
      }
      navigate(path, { replace: true });

    } catch (err) {
      console.error('Login error:', err);
      setErrorMessage(err.message || 'E-mail or Password is Incorrect!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        <div className={styles.logoContainer}>
          <img src={bilkentLogo} alt="Bilkent Logo" className={styles.universityLogo} />
        </div>
        <form className={styles.loginFormContainer} onSubmit={handleSubmit}>
          <div className={styles.formField}>
            <label htmlFor="email">Bilkent Email</label>
            <input
              id="email" type="email" placeholder="Enter email"
              value={email}
              onChange={e => { setEmail(e.target.value); setErrorMessage(''); }}
            />
          </div>
          <div className={styles.formField}>
            <label htmlFor="password">Password</label>
            <input
              id="password" type="password" placeholder="Enter password"
              value={password}
              onChange={e => { setPassword(e.target.value); setErrorMessage(''); }}
            />
          </div>
          {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
          <button type="submit" className={styles.signInButton} disabled={isLoading}>
            {isLoading ? 'Signing In…' : 'Sign In'}
          </button>
          <div className={styles.loginOptions}>
            <Link to="/forgotpassword" className={styles.forgotPasswordLink}>
              Forgot password?
            </Link>
            <label className={styles.rememberMeContainer}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(v => !v)}
              />
              <span className={styles.checkboxLabel}>Remember Me</span>
            </label>
          </div>
        </form>
        <div className={styles.footer}>
          <p>2025 ProctorHub. All rights reserved.</p>
          <Link to="/about" className={styles.aboutLink}>About Us</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
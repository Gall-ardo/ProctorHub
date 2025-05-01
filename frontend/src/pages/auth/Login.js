import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './Login.module.css';
import bilkentLogo from '../../assets/bilkent-logo.png'; // Ensure you have this logo in your assets folder

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token and role consistently
      const { token, role } = data;
      
      // Store in localStorage (we don't use sessionStorage for consistency)
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      
      console.log('Login successful, role:', role);
      console.log('Token stored:', token);

      // Redirect based on role
      switch (role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'instructor':
          navigate('/instructor/home');
          break;
        case 'ta':
          navigate('/ta/tamain');
          break;
        case 'chair':
          navigate('/departmentchair/home');
          break;
        case 'dean':
          navigate('/deansoffice/home');
          break;
        case 'student':
          navigate('/student/home');
          break;
        default:
          navigate('/');
      }
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
          <img src={bilkentLogo} alt="Bilkent University Logo" className={styles.universityLogo} />
        </div>
        
        <div className={styles.loginFormContainer}>
          <div className={styles.formField}>
            <label htmlFor="email">Bilkent Email</label>
            <input
              type="email"
              id="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrorMessage(''); // Clear error on input change
              }}
            />
          </div>
          
          <div className={styles.formField}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrorMessage(''); // Clear error on input change
              }}
            />
          </div>
          
          {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
          
          <button
            className={styles.signInButton}
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
          
          <div className={styles.loginOptions}>
            <Link to="/forgotpassword" className={styles.forgotPasswordLink}>
              Forgot password?
            </Link>
            
            <label className={styles.rememberMeContainer}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />
              <span className={styles.checkboxLabel}>Remember Me</span>
            </label>
          </div>
        </div>
        
        <div className={styles.footer}>
          <p>2025 ProctorHub. All rights reserved.</p>
          <Link to="/about" className={styles.aboutLink}>About Us</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
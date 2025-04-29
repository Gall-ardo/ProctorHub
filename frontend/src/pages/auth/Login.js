import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './Login.module.css';
import bilkentLogo from '../../assets/bilkent-logo.png'; // Ensure you have this logo in your assets folder

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    try {
      const res = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const { message } = await res.json();
        throw new Error(message || 'Login failed');
      }

      const { token, role } = await res.json();

      // Persist the JWT
      if (rememberMe) {
        localStorage.setItem('authToken', token);
      } else {
        sessionStorage.setItem('authToken', token);
      }

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
      setErrorMessage(err.message || 'E-mail or Password is Incorrect!');
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
          >
            Sign In
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
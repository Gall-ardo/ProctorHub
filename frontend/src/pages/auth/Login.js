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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simple validation
    if (!email || !password) {
      setErrorMessage('E-mail or Password is Incorrect!');
      return;
    }
    
    console.log('Login attempted with:', email, password, 'Remember me:', rememberMe);
    
    // Here you would typically make an API call to authenticate
    // For demo purposes, we'll just navigate
    if (email.includes('admin')) {
      navigate('/admin/adminmainpage');
    } else if (email.includes('instructor')) {
      navigate('/instructor/dashboard');
    } else if (email.includes('ta')) {
      navigate('/teaching_assistant/dashboard');
    } else {
      // Failed login attempt
      setErrorMessage('E-mail or Password is Incorrect!');
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
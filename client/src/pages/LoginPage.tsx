import React, { useState } from 'react';
import { loginUser } from '../services/authService';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous messages at the start of every attempt
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const data = await loginUser(email, password);
      localStorage.setItem('token', data.token); // Save JWT for later
      setSuccessMessage(`Welcome, ${data.user.firstName}!`);
      
      // Redirect logic (e.g., using useNavigate or window.location) would go here
    } catch (err: any) {
      // Set the error message caught from the backend/service
      setErrorMessage(err.message || "Incorrect email or password. Please try again.");
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card shadow p-4" style={{ maxWidth: '400px', width: '100%' }}>
        <h2 className="text-center mb-4">Login</h2>

        {/* Error Alert: Styled in red using alert-danger */}
        {errorMessage && (
          <div className="alert alert-danger" role="alert">
            {errorMessage}
          </div>
        )}

        {/* Success Alert: Styled in green using alert-success */}
        {successMessage && (
          <div className="alert alert-success" role="alert">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              className="form-control" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-control" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">Sign In</button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;

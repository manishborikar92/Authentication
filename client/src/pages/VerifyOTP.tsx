import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const VerifyOTP = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const pendingEmail = localStorage.getItem('pendingEmail') || '';

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.post('/auth/verify-otp', { email: pendingEmail, otp });
      setMessage(response.data.message);
      localStorage.removeItem('pendingEmail');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'OTP Verification failed.');
    }
  };

  return (
    <div className="container">
      <h2>Verify OTP</h2>
      <p>Please enter the OTP sent to {pendingEmail}</p>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleVerify}>
        <div>
          <label>OTP:</label>
          <input type="text" value={otp} onChange={e => setOtp(e.target.value)} required/>
        </div>
        <button type="submit">Verify</button>
      </form>
    </div>
  );
};

export default VerifyOTP;

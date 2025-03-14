import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/api';
import FormInput from '../components/FormInput';
import OTPInput from '../components/OTPInput';

const PasswordReset = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInitReset = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      await authService.forgotPassword({ email: formData.email });
      setStep(2);
    } catch (error) {
      setErrors({
        general: error.response?.data?.message || 'An error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      await authService.resetPassword({
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.newPassword
      });
      window.location.href = '/login?reset=success';
    } catch (error) {
      setErrors({
        general: error.response?.data?.message || 'An error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      await authService.resetInit({ email: formData.email });
    } catch (error) {
      setErrors({
        general: error.response?.data?.error || 'Failed to resend OTP'
      });
    }
  };

  const handleOtpChange = (otp) => {
    setFormData(prev => ({ ...prev, otp }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-gray-900">
            {step === 1 ? 'Password Recovery' : 'Set New Password'}
          </h2>
          <div className="flex justify-center items-center space-x-2">
            <div className={`h-2 w-8 rounded-full ${step === 1 ? 'bg-blue-600' : 'bg-gray-300'}`} />
            <div className={`h-2 w-8 rounded-full ${step === 2 ? 'bg-blue-600' : 'bg-gray-300'}`} />
          </div>
        </div>

        {errors.general && (
          <div className="bg-red-50 p-4 rounded-lg flex items-center gap-2 text-red-700">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">{errors.general}</span>
          </div>
        )}

        {step === 1 ? (
          <form className="space-y-4" onSubmit={handleInitReset}>
            <FormInput
              label="Email address"
              type="email"
              placeholder="john@example.com"
              required
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              error={errors.email}
              autoComplete="email"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 inline-flex justify-center items-center gap-2 rounded-lg border border-transparent font-semibold bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin inline-block w-4 h-4 border-[3px] border-current border-t-transparent rounded-full" />
                  Sending OTP...
                </>
              ) : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={handleResetPassword}>
            <OTPInput
              value={formData.otp}
              onChange={handleOtpChange}
              error={errors.otp}
              onResend={handleResendOTP}
              resendable={!isLoading}
            />
            <FormInput
              label="New Password"
              type="password"
              placeholder="••••••••"
              required
              value={formData.newPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
              error={errors.newPassword}
              autoComplete="new-password"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 inline-flex justify-center items-center gap-2 rounded-lg border border-transparent font-semibold bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin inline-block w-4 h-4 border-[3px] border-current border-t-transparent rounded-full" />
                  Updating...
                </>
              ) : 'Reset Password'}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-600">
          Remember your password?{' '}
          <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default PasswordReset;
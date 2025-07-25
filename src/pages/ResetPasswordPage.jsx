import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import { Helmet } from 'react-helmet-async';
import AuthService from '../services/auth.service';

const ResetPasswordPage = () => {
  // Get token from URL params
  const { token } = useParams();
  const navigate = useNavigate();
  
  // State for form fields and UI
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);

  // Validate token on component mount
  useEffect(() => {
    if (!token) {
      setIsValidToken(false);
      setFormError('Invalid or missing reset token');
      return;
    }
    
    // Optional: Verify token validity with backend
    const verifyToken = async () => {
      try {
        await AuthService.verifyResetToken(token);
      } catch (err) {
        console.error('Token verification error:', err);
        setIsValidToken(false);
        setFormError('This password reset link is invalid or has expired');
      }
    };
    
    verifyToken();
  }, [token]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    const { password, confirmPassword } = formData;
    
    // Validate passwords
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }
    
    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Call the reset password API
      await AuthService.resetPassword({
        token,
        password
      });
      
      // Show success message
      setIsSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error('Reset password error:', err);
      setFormError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Reset Password | Scenture Lagos</title>
      </Helmet>
      
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="border-slate-200 shadow-lg">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-heading">
                {isSuccess ? 'Password Reset Successful' : 'Reset Your Password'}
              </CardTitle>
              <CardDescription className="text-slate-500">
                {isSuccess 
                  ? 'Your password has been successfully reset'
                  : 'Create a new password for your account'}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {formError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-2">
                  <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}
              
              {isSuccess ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg flex items-start gap-3">
                  <CheckCircle2 size={20} className="mt-0.5 flex-shrink-0" />
                  <div className="space-y-2">
                    <p>Your password has been reset successfully.</p>
                    <p className="text-sm">You will be redirected to the login page in a few seconds...</p>
                  </div>
                </div>
              ) : isValidToken ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium text-slate-700">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <p className="text-xs text-slate-500">Password must be at least 6 characters</p>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Resetting...
                      </span>
                    ) : (
                      'Reset Password'
                    )}
                  </Button>
                </form>
              ) : (
                <div className="p-4 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg">
                  <p>This password reset link is invalid or has expired.</p>
                  <p className="mt-2 text-sm">Please request a new password reset link from the login page.</p>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex justify-center">
              <Link to="/login" className="flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                <ArrowLeft size={16} className="mr-1" />
                Back to Login
              </Link>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default ResetPasswordPage;
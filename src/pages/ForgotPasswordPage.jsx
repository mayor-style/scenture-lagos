import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import { Helmet } from 'react-helmet-async';
import AuthService from '../services/auth.service';

const ForgotPasswordPage = () => {
  // State for form fields and UI
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    // Validate email
    if (!email) {
      setFormError('Please enter your email address');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Call the forgot password API
      await AuthService.forgotPassword({ email });
      
      // Show success message
      setIsSuccess(true);
    } catch (err) {
      console.error('Forgot password error:', err);
      setFormError(err.response?.data?.message || 'Failed to process your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Forgot Password | Scenture Lagos</title>
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
                {isSuccess ? 'Check Your Email' : 'Forgot Password'}
              </CardTitle>
              <CardDescription className="text-slate-500">
                {isSuccess 
                  ? 'We have sent you instructions to reset your password'
                  : 'Enter your email and we\'ll send you a link to reset your password'}
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
                    <p>We've sent an email to <strong>{email}</strong> with instructions to reset your password.</p>
                    <p className="text-sm">If you don't see the email in your inbox, please check your spam folder.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-slate-700">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                        required
                      />
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
                        Sending...
                      </span>
                    ) : (
                      'Send Reset Link'
                    )}
                  </Button>
                </form>
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

export default ForgotPasswordPage;
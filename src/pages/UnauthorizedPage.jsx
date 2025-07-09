import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';

const UnauthorizedPage = () => {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary/5 px-4">
      <Helmet>
        <title>Unauthorized Access | Scenture Lagos</title>
      </Helmet>

      <div className="max-w-md w-full text-center p-8 bg-white rounded-lg shadow-md">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-red-100 rounded-full">
            <ShieldAlert size={48} className="text-red-500" />
          </div>
        </div>

        <h1 className="text-2xl font-heading font-medium mb-2">Access Denied</h1>
        
        <p className="text-secondary/80 mb-6">
          You don't have permission to access this page. Please contact an administrator if you believe this is an error.
        </p>

        <div className="space-y-3">
          {currentUser ? (
            // If user is logged in, show link to dashboard
            <Button asChild className="w-full">
              <Link to="/admin/dashboard">
                <ArrowLeft size={16} className="mr-2" />
                Return to Dashboard
              </Link>
            </Button>
          ) : (
            // If not logged in, show link to login
            <Button asChild className="w-full">
              <Link to="/admin/login">
                <ArrowLeft size={16} className="mr-2" />
                Return to Login
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
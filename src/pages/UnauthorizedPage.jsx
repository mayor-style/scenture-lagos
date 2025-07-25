import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';

// --- Decorative Background Component ---
const FloatingShape = ({ className, initial, animate }) => (
    <motion.div
        className={`absolute hidden lg:block border border-red-200/20 rounded-full ${className}`}
        initial={initial}
        animate={animate}
        transition={{
            duration: Math.random() * 8 + 20,
            repeat: Infinity,
            repeatType: 'mirror',
            ease: 'easeInOut'
        }}
    />
);

// --- Main Page Component ---
const UnauthorizedPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-red-50/20 relative overflow-hidden p-4">
      <Helmet>
        <title>Unauthorized Access | Scenture Lagos</title>
      </Helmet>

      {/* Background Shapes */}
      <FloatingShape className="w-32 h-32" initial={{ top: '15%', left: '10%' }} animate={{ y: [0, -20, 0] }} />
      <FloatingShape className="w-16 h-16 bg-red-100/30" initial={{ top: '25%', right: '15%' }} animate={{ y: [0, 25, 0] }} />
      <FloatingShape className="w-24 h-24" initial={{ bottom: '20%', left: '20%' }} animate={{ y: [0, 15, 0] }} />
      
      <div className="relative z-10 text-center max-w-xl mx-auto">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 150, damping: 15, delay: 0.1 }}
          className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-lg"
        >
          <ShieldAlert size={48} className="text-red-500" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.3 }}
          className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight"
        >
          Access Denied
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.4 }}
          className="mt-4 text-slate-600"
        >
          You do not have the necessary permissions to view this page. Please contact an administrator if you believe this is an error.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.5 }}
          className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
        >
            <Button asChild size="lg" className="rounded-full">
                <Link to={currentUser ? '/account' : '/'}>
                  <Home className="mr-2 h-5 w-5" />
                  <span>{currentUser ? 'Go to My Account' : 'Go to Homepage'}</span>
                </Link>
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="rounded-full"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              <span>Go Back</span>
            </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
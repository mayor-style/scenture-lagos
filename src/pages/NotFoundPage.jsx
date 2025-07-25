import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Home } from 'lucide-react';
import { Button } from '../components/ui/Button';

// --- Decorative Background Component ---
const FloatingShape = ({ className, initial, animate }) => (
    <motion.div
        className={`absolute hidden lg:block border border-slate-200/80 rounded-full ${className}`}
        initial={initial}
        animate={animate}
        transition={{
            duration: Math.random() * 5 + 15,
            repeat: Infinity,
            repeatType: 'mirror',
            ease: 'easeInOut'
        }}
    />
);

// --- Main Page Component ---
const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-slate-50 relative overflow-hidden p-4">
      {/* Background Shapes */}
      <FloatingShape className="w-32 h-32" initial={{ top: '15%', left: '10%' }} animate={{ y: [0, -20, 0], x: [0, 10, 0] }} />
      <FloatingShape className="w-16 h-16 bg-slate-100/50" initial={{ top: '25%', right: '15%' }} animate={{ y: [0, 25, 0], x: [0, -15, 0] }} />
      <FloatingShape className="w-24 h-24" initial={{ bottom: '20%', left: '20%' }} animate={{ y: [0, 15, 0], x: [0, 20, 0] }} />
      <FloatingShape className="w-40 h-40" initial={{ bottom: '15%', right: '10%' }} animate={{ y: [0, -10, 0], x: [0, -25, 0] }} />
      
      <div className="relative z-10 text-center max-w-xl mx-auto">
        <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 150, damping: 15, delay: 0.1 }}
        >
            <h2 className="font-mono text-8xl lg:text-9xl font-bold text-slate-800 tracking-tighter">404</h2>
        </motion.div>

        <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.3 }}
            className="mt-4 text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight"
        >
            Page Not Found
        </motion.h1>

        <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.4 }}
            className="mt-4 text-slate-600"
        >
            Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
        </motion.p>
        
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.5 }}
            className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button asChild size="lg" className="rounded-full">
            <Link to="/">
              <Home className="mr-2 h-5 w-5" />
              <span>Go to Homepage</span>
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

export default NotFoundPage;
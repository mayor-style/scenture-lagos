import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Home } from 'lucide-react';
import { Button } from '../components/ui/Button';

const NotFoundPage = () => {
  // Enhanced animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.8, 
        ease: [0.22, 1, 0.36, 1] 
      } 
    },
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1]
      } 
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-neutral-50 via-white to-neutral-100 overflow-hidden">
      <div className="container px-6 lg:px-12 relative z-10">
        {/* Subtle geometric elements */}
        <div className="absolute top-20 right-20 w-32 h-32 border border-neutral-200/40 rounded-full"></div>
        <div className="absolute bottom-40 left-40 w-16 h-16 bg-neutral-100/60 rounded-full"></div>
        <div className="absolute top-40 left-20 w-24 h-24 border border-neutral-200/40 rounded-full"></div>
        
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="max-w-2xl mx-auto text-center"
        >
          <motion.div 
            variants={fadeIn}
            className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-primary/20"
          >
            <span className="font-heading text-4xl text-primary-dark">404</span>
          </motion.div>
          
          <motion.h1 
            variants={fadeInUp}
            className="font-heading text-5xl md:text-6xl lg:text-7xl mb-8 leading-[1.1] tracking-tight"
          >
            <span className="block text-neutral-900">Page Not</span>
            <span className="block text-neutral-500 font-light">Found</span>
          </motion.h1>
          
          <motion.p 
            variants={fadeInUp}
            className="text-xl mb-12 text-neutral-600 font-light leading-relaxed"
          >
            The page you're looking for doesn't exist or has been moved. Let's get you back on track.
          </motion.p>
          
          <motion.div 
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button asChild size="lg" className="group bg-neutral-900 hover:bg-neutral-800 text-white px-8 py-4 rounded-full transition-all duration-300">
              <Link to="/" className="flex items-center">
                <Home className="mr-2 h-5 w-5" />
                <span>Back to Home</span>
              </Link>
            </Button>
            
            <Button asChild variant="outline" size="lg" className="px-8 py-4 rounded-full border-neutral-300 hover:bg-neutral-50">
              <Link to="/shop" className="flex items-center">
                <ArrowLeft className="mr-2 h-5 w-5" />
                <span>Browse Products</span>
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Background pattern */}
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-white to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white to-transparent"></div>
        <div className="grid grid-cols-10 h-full">
          {Array.from({ length: 100 }).map((_, i) => (
            <div 
              key={i} 
              className="border-[0.5px] border-neutral-200/50"
              style={{
                opacity: Math.random() * 0.3 + 0.1
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
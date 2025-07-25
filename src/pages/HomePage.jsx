// src/pages/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, AlertTriangle } from 'lucide-react';

import { Button } from '../components/ui/Button';
import ProductCard from '../components/product/ProductCard';
import ProductService from '../services/product.service';
import { testimonials } from '../lib/mockData';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.6, 0.01, 0.05, 0.95] } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const HomePage = () => {
  const { 
    data: featuredProducts, 
    isLoading, 
    isError,
    error 
  } = useQuery({
    queryKey: ['featuredProducts'], // A unique key to identify and cache this data
    queryFn: () => ProductService.getFeaturedProducts(4), // The function that fetches the data
    // --- Caching Configuration ---
    staleTime: 1000 * 60 * 5,   // Data is considered "fresh" for 5 minutes. No network request will be made for this key in that time.
    gcTime: 1000 * 60 * 30, // Data is kept in the cache for 30 minutes even if unused, then "garbage collected".
  });

  return (
    <div className="flex flex-col bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[95vh] flex items-center justify-start text-left overflow-hidden">
        <div className="absolute inset-0 z-0">
         <img
          src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1032&q=80"
          alt="Artistic display of luxury fragrance bottles"
          className="w-full h-full object-cover"
        />
          <div className="absolute inset-0 bg-black/40 bg-gradient-to-r from-black/60 to-transparent" />
        </div>
        
        <div className="container relative z-10 px-6 lg:px-12">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-2xl text-white"
          >
            <motion.div variants={fadeInUp}>
              <span className="inline-block px-4 py-2 text-sm bg-white/10 backdrop-blur-sm border border-white/20 rounded-full mb-6">
                ✨ Premium Fragrance Collection
              </span>
            </motion.div>
            <motion.h1
              variants={fadeInUp}
              className="font-heading text-5xl md:text-6xl lg:text-7xl mb-6 leading-tight tracking-tighter"
            >
              Scenture Lagos<span className="text-neutral-300">.</span>
            </motion.h1>
            <motion.p 
              variants={fadeInUp}
              className="text-xl md:text-2xl mb-10 text-neutral-200 font-light max-w-xl"
            >
              Elevate your senses and spaces with our premium fragrances. Crafted with passion, designed for distinction.
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="group">
                <Link to="/shop" className="flex items-center">
                  Explore Collections
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link to="/about">Our Story</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-24 lg:py-32">
        <div className="container px-6 lg:px-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="font-heading text-4xl md:text-5xl mb-4 text-neutral-900 tracking-tight">
              Discover Our Coveted Scents
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Each fragrance is meticulously crafted to transform your space into a sanctuary of luxury.
            </p>
          </motion.div>
          
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
          >
            {isLoading && [...Array(4)].map((_, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <div className="animate-pulse">
                  <div className="aspect-square bg-neutral-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
                </div>
              </motion.div>
            ))}
            {isError && (
              <div className="col-span-full flex flex-col items-center justify-center bg-red-50 text-red-700 p-8 rounded-lg border border-red-200">
                  <AlertTriangle className="w-10 h-10 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Something went wrong</h3>
                  <p>{error.message}</p>
              </div>
            )}
            {featuredProducts && featuredProducts.map((product) => (
              <motion.div key={product._id} variants={fadeInUp}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.8 }}
            variants={fadeInUp}
            className="text-center"
          >
            <Button asChild variant="outline" size="lg">
              <Link to="/shop">View All Products</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Brand Story Section */}
      <section className="py-24 lg:py-32 bg-neutral-50">
        <div className="container px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
              className="relative"
            >
              <div className="aspect-[4/5] overflow-hidden bg-neutral-200">
                <img
                  src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1032&q=80"
                  alt="Scenture Lagos Brand Story"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-white border border-neutral-200"></div>
            </motion.div>
            
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
              className="space-y-8"
            >
              <div className="inline-flex items-center px-4 py-2 bg-white border border-neutral-200 rounded-full text-sm text-neutral-600">
                Our Story
              </div>
              
              <h2 className="font-heading text-4xl md:text-5xl text-neutral-900 tracking-tight leading-[1.1]">
                Born from a passion for 
                <span className="block text-neutral-500 font-light">sensory excellence</span>
              </h2>
              
              <div className="space-y-6 text-lg text-neutral-600 leading-relaxed">
                <p>
                  Scenture Lagos was founded with a singular vision: to create fragrances that tell stories, 
                  evoke emotions, and transform spaces into sanctuaries of luxury.
                </p>
                <p>
                  Each product is meticulously crafted using the finest ingredients, blending traditional 
                  techniques with modern innovation. Our commitment to quality ensures that every creation 
                  delivers an experience of unparalleled distinction.
                </p>
              </div>
              
              <Button asChild variant="outline" className="rounded-full px-8 py-3 border-neutral-300 hover:bg-neutral-100">
                <Link to="/about">Learn More About Us</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="container px-6 lg:px-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-150px" }}
            variants={fadeInUp}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center px-4 py-2 bg-neutral-100 rounded-full text-sm text-neutral-600 mb-6">
              Customer Stories
            </div>
            <h2 className="font-heading text-4xl md:text-5xl text-neutral-900 mb-6 tracking-tight">
              What Our Customers
              <span className="block text-neutral-500 font-light">Are Saying</span>
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Discover why discerning customers choose Scenture Lagos for their olfactory journey.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10"
          >
            {testimonials.map((testimonial) => (
              <motion.div
                key={testimonial.id}
                variants={fadeInUp}
                className="bg-white p-8 lg:p-10 border border-neutral-200 hover:border-neutral-300 transition-all duration-300 group"
              >
                <div className="flex items-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${i < testimonial.rating ? 'text-amber-400' : 'text-neutral-200'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-neutral-700 text-lg leading-relaxed mb-6 italic">
                  "{testimonial.text}"
                </p>
                <p className="font-medium text-neutral-900">{testimonial.name}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
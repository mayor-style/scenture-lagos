import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import ProductCard from '../components/product/ProductCard';
import ProductService from '../services/product.service';
import { testimonials } from '../lib/mockData';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      setIsLoading(true);
      const products = await ProductService.getFeaturedProducts();
      setFeaturedProducts(products);
      console.log('products frm Homepage', products);
      setIsLoading(false);
    };

    fetchFeaturedProducts();
  }, []);

  // Animation variants
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

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1]
      }
    },
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[95vh] bg-gradient-to-br from-neutral-50 via-white to-neutral-100 flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/60 to-transparent z-10"></div>
          <img
            src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1032&q=80"
            alt="Luxury Fragrance"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        
        <div className="absolute top-20 right-20 w-32 h-32 border border-neutral-200/40 rounded-full"></div>
        <div className="absolute bottom-40 right-40 w-16 h-16 bg-neutral-100/60 rounded-full"></div>
        
        <div className="container relative z-20 px-6 lg:px-12">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="max-w-3xl"
          >
            <motion.div 
              variants={fadeIn}
              className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm border border-neutral-200/50 rounded-full text-sm text-neutral-600 mb-8"
            >
              ✨ Premium Fragrance Collection
            </motion.div>
            
            <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl mb-8 leading-[1.1] tracking-tight">
              <span className="block text-neutral-900">Scenture Lagos</span>
              <span className="block text-neutral-500 font-light">Where Luxury</span>
              <span className="block text-neutral-900">Meets Lifestyle</span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-12 text-neutral-600 font-light leading-relaxed max-w-2xl">
              Elevate your senses and spaces with our premium fragrances and diffusers. 
              Crafted with passion, designed for distinction.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="group bg-neutral-900 hover:bg-neutral-800 text-white px-8 py-4 rounded-full transition-all duration-300">
                <Link to="/shop" className="flex items-center">
                  <span>Explore Collections</span>
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              
              <Button asChild variant="outline" size="lg" className="px-8 py-4 rounded-full border-neutral-300 hover:bg-neutral-50">
                <Link to="/about">
                  Our Story
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Products Section */}
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
              Featured Collections
            </div>
            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl mb-6 text-neutral-900 tracking-tight">
              Discover Our Most
              <span className="block text-neutral-500 font-light">Coveted Scents</span>
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
              Each fragrance is meticulously crafted to transform your space into a sanctuary of luxury and distinction.
            </p>
          </motion.div>

          {isLoading ? (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 mb-16"
            >
              {[...Array(4)].map((_, index) => (
                <motion.div key={index} variants={scaleIn}>
                  <div className="animate-pulse">
                    <div className="aspect-square bg-neutral-200 rounded-lg mb-4"></div>
                    <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 mb-16"
            >
              {featuredProducts.map((product) => (
                <motion.div key={product._id} variants={scaleIn}>
                  <ProductCard
                    product={{
                      id: product._id,
                      name: product.name,
                      price: product.price,
                      images: product.images,
                      category: product.category?.name || 'Uncategorized',
                      slug:product.slug,
                    }}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
            className="text-center"
          >
            <Button asChild variant="outline" size="lg" className="px-8 py-4 rounded-full border-neutral-300 hover:bg-neutral-50">
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
              variants={scaleIn}
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
                variants={scaleIn}
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
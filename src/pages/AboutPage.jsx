import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';

const AboutPage = () => {
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
      <section className="relative min-h-[70vh] bg-gradient-to-br from-neutral-50 via-white to-neutral-100 flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/60 to-transparent z-10"></div>
          <img
            src="https://images.unsplash.com/photo-1599446794254-16ca8daa4c48?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
            alt="Scenture Lagos Workshop"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        
        {/* Subtle geometric elements */}
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
              Our Journey
            </motion.div>
            
            <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl mb-8 leading-[1.1] tracking-tight">
              <span className="block text-neutral-900">About</span>
              <span className="block text-neutral-500 font-light">Scenture Lagos</span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-12 text-neutral-600 font-light leading-relaxed max-w-2xl">
              Crafting premium fragrances that transform spaces and elevate experiences since 2018.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="container px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={scaleIn}
              className="relative order-2 lg:order-1"
            >
              <div className="aspect-[4/5] overflow-hidden bg-neutral-200">
                <img
                  src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1032&q=80"
                  alt="Scenture Lagos Founder"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Subtle accent element */}
              <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-primary border border-primary-light"></div>
            </motion.div>
            
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
              className="space-y-8 order-1 lg:order-2"
            >
              <div className="inline-flex items-center px-4 py-2 bg-neutral-100 rounded-full text-sm text-neutral-600">
                Our Story
              </div>
              
              <h2 className="font-heading text-4xl md:text-5xl text-neutral-900 tracking-tight leading-tight">
                From Passion <span className="block text-neutral-500 font-light">to Premium</span>
              </h2>
              
              <div className="space-y-6 text-neutral-600">
                <p className="leading-relaxed">
                  Scenture Lagos was born from a deep appreciation for how scents can transform spaces and evoke powerful emotions. Founded in 2018 by Adebola Adeyemi, our journey began in a small workshop in Victoria Island, where each fragrance was meticulously crafted by hand.
                </p>
                
                <p className="leading-relaxed">
                  What started as a passion project quickly blossomed into a premium fragrance brand, as our commitment to quality and authenticity resonated with discerning customers seeking to elevate their living spaces.
                </p>
                
                <p className="leading-relaxed">
                  Today, Scenture Lagos stands as a testament to Nigerian craftsmanship and luxury, offering a curated collection of fragrances, candles, and diffusers that celebrate both local inspiration and global excellence.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-24 lg:py-32 bg-neutral-50">
        <div className="container px-6 lg:px-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-150px" }}
            variants={fadeInUp}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center px-4 py-2 bg-white border border-neutral-200 rounded-full text-sm text-neutral-600 mb-6">
              Our Values
            </div>
            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl mb-6 text-neutral-900 tracking-tight">
              What Drives
              <span className="block text-neutral-500 font-light">Our Craft</span>
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
              Our core values guide every fragrance we create and every interaction we have.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12"
          >
            {/* Value 1 */}
            <motion.div 
              variants={scaleIn}
              className="bg-white p-8 lg:p-10 border border-neutral-200/60 hover:border-neutral-300 shadow-sm hover:shadow-lg hover:shadow-neutral-200/40 transition-all duration-500 group"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors duration-300">
                <div className="w-8 h-8 bg-primary rounded-full"></div>
              </div>
              <h3 className="font-heading text-2xl mb-4 text-neutral-900">Quality</h3>
              <p className="text-neutral-600 leading-relaxed">
                We source only the finest ingredients and materials, ensuring each product meets our exacting standards of excellence.
              </p>
            </motion.div>

            {/* Value 2 */}
            <motion.div 
              variants={scaleIn}
              className="bg-white p-8 lg:p-10 border border-neutral-200/60 hover:border-neutral-300 shadow-sm hover:shadow-lg hover:shadow-neutral-200/40 transition-all duration-500 group"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors duration-300">
                <div className="w-8 h-8 bg-primary rounded-full"></div>
              </div>
              <h3 className="font-heading text-2xl mb-4 text-neutral-900">Sustainability</h3>
              <p className="text-neutral-600 leading-relaxed">
                We're committed to environmentally conscious practices, from responsibly sourced ingredients to eco-friendly packaging.
              </p>
            </motion.div>

            {/* Value 3 */}
            <motion.div 
              variants={scaleIn}
              className="bg-white p-8 lg:p-10 border border-neutral-200/60 hover:border-neutral-300 shadow-sm hover:shadow-lg hover:shadow-neutral-200/40 transition-all duration-500 group"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors duration-300">
                <div className="w-8 h-8 bg-primary rounded-full"></div>
              </div>
              <h3 className="font-heading text-2xl mb-4 text-neutral-900">Innovation</h3>
              <p className="text-neutral-600 leading-relaxed">
                We continuously explore new scent profiles and techniques, pushing the boundaries of fragrance creation.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
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
              Our Team
            </div>
            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl mb-6 text-neutral-900 tracking-tight">
              The Faces Behind
              <span className="block text-neutral-500 font-light">Our Fragrances</span>
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
              Meet the passionate artisans and experts who bring Scenture Lagos to life.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10"
          >
            {/* Team Member 1 */}
            <motion.div variants={scaleIn} className="group">
              <div className="relative overflow-hidden bg-neutral-100 aspect-[3/4] mb-6">
                <img 
                  src="https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=761&q=80" 
                  alt="Adebola Adeyemi" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              <h3 className="font-heading text-xl text-neutral-900 mb-1">Adebola Adeyemi</h3>
              <p className="text-neutral-500 text-sm mb-3">Founder & Creative Director</p>
              <p className="text-neutral-600 text-sm leading-relaxed">
                With a background in perfumery and interior design, Adebola brings a unique vision to every Scenture creation.
              </p>
            </motion.div>

            {/* Team Member 2 */}
            <motion.div variants={scaleIn} className="group">
              <div className="relative overflow-hidden bg-neutral-100 aspect-[3/4] mb-6">
                <img 
                  src="https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80" 
                  alt="Chioma Okonkwo" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              <h3 className="font-heading text-xl text-neutral-900 mb-1">Chioma Okonkwo</h3>
              <p className="text-neutral-500 text-sm mb-3">Head Perfumer</p>
              <p className="text-neutral-600 text-sm leading-relaxed">
                Chioma's exceptional nose and technical expertise ensure our fragrances are both innovative and balanced.
              </p>
            </motion.div>

            {/* Team Member 3 */}
            <motion.div variants={scaleIn} className="group">
              <div className="relative overflow-hidden bg-neutral-100 aspect-[3/4] mb-6">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80" 
                  alt="Oluwaseun Adeyemi" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              <h3 className="font-heading text-xl text-neutral-900 mb-1">Oluwaseun Adeyemi</h3>
              <p className="text-neutral-500 text-sm mb-3">Operations Director</p>
              <p className="text-neutral-600 text-sm leading-relaxed">
                Oluwaseun oversees our production processes, ensuring quality and sustainability at every step.
              </p>
            </motion.div>

            {/* Team Member 4 */}
            <motion.div variants={scaleIn} className="group">
              <div className="relative overflow-hidden bg-neutral-100 aspect-[3/4] mb-6">
                <img 
                  src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80" 
                  alt="Amara Nwosu" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              <h3 className="font-heading text-xl text-neutral-900 mb-1">Amara Nwosu</h3>
              <p className="text-neutral-500 text-sm mb-3">Marketing Director</p>
              <p className="text-neutral-600 text-sm leading-relaxed">
                Amara's creative vision helps share our story and connect our products with fragrance enthusiasts worldwide.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32 bg-neutral-900 text-white">
        <div className="container px-6 lg:px-12">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
              className="space-y-8"
            >
              <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl mb-6 tracking-tight">
                Experience the
                <span className="block text-primary font-light">Scenture Difference</span>
              </h2>
              <p className="text-lg text-neutral-300 leading-relaxed max-w-2xl mx-auto">
                Discover our collection of premium fragrances and transform your space into a sanctuary of luxury and distinction.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button asChild size="lg" className="group bg-primary hover:bg-primary-dark text-secondary px-8 py-4 rounded-full transition-all duration-300">
                  <Link to="/shop" className="flex items-center">
                    <span>Shop Collection</span>
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                
                <Button asChild variant="outline" size="lg" className="px-8 py-4 rounded-full border-neutral-700 text-white hover:bg-white/10">
                  <Link to="/contact">
                    Contact Us
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
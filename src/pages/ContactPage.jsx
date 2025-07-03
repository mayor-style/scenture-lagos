import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Instagram, Facebook, Twitter } from 'lucide-react';
import { Button } from '../components/ui/Button';

const ContactPage = () => {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  
  const [formStatus, setFormStatus] = useState({
    submitted: false,
    success: false,
    message: '',
  });

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

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simulate form submission
    setFormStatus({
      submitted: true,
      success: true,
      message: 'Thank you for your message. We will get back to you shortly!',
    });
    
    // Reset form after successful submission
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: '',
    });
    
    // Reset form status after 5 seconds
    setTimeout(() => {
      setFormStatus({
        submitted: false,
        success: false,
        message: '',
      });
    }, 5000);
  };

  // Social media links
  const socialLinks = [
    { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
    { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[50vh] bg-gradient-to-br from-neutral-50 via-white to-neutral-100 flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/60 to-transparent z-10"></div>
          <img
            src="https://images.unsplash.com/photo-1596755389378-c31d21fd1273?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=688&q=80"
            alt="Scenture Lagos Contact"
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
              Get In Touch
            </motion.div>
            
            <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl mb-8 leading-[1.1] tracking-tight">
              <span className="block text-neutral-900">Contact</span>
              <span className="block text-neutral-500 font-light">Scenture Lagos</span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-12 text-neutral-600 font-light leading-relaxed max-w-2xl">
              We'd love to hear from you. Reach out with questions, feedback, or collaboration ideas.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Information & Form Section */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="container px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20">
            {/* Contact Information */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
              className="space-y-12"
            >
              <div className="space-y-6">
                <h2 className="font-heading text-3xl md:text-4xl text-neutral-900 tracking-tight">
                  Let's Start a <span className="text-neutral-500 font-light">Conversation</span>
                </h2>
                <p className="text-neutral-600 leading-relaxed">
                  Whether you have questions about our products, need assistance with an order, or want to explore partnership opportunities, our team is here to help.
                </p>
              </div>

              <motion.div 
                variants={staggerContainer}
                className="space-y-8"
              >
                {/* Visit Us */}
                <motion.div variants={fadeIn} className="flex items-start gap-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin size={20} className="text-primary-dark" />
                  </div>
                  <div>
                    <h3 className="font-heading text-xl mb-2 text-neutral-900">Visit Us</h3>
                    <p className="text-neutral-600">
                      Scenture Lagos Flagship Store<br />
                      42 Admiralty Way<br />
                      Lekki Phase 1, Lagos<br />
                      Nigeria
                    </p>
                  </div>
                </motion.div>

                {/* Call Us */}
                <motion.div variants={fadeIn} className="flex items-start gap-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone size={20} className="text-primary-dark" />
                  </div>
                  <div>
                    <h3 className="font-heading text-xl mb-2 text-neutral-900">Call Us</h3>
                    <p className="text-neutral-600">
                      +234 (0) 123 456 7890<br />
                      Monday - Friday: 9am - 6pm<br />
                      Saturday: 10am - 4pm<br />
                      Sunday: Closed
                    </p>
                  </div>
                </motion.div>

                {/* Email Us */}
                <motion.div variants={fadeIn} className="flex items-start gap-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail size={20} className="text-primary-dark" />
                  </div>
                  <div>
                    <h3 className="font-heading text-xl mb-2 text-neutral-900">Email Us</h3>
                    <p className="text-neutral-600">
                      General Inquiries: hello@scenturelagos.com<br />
                      Customer Support: support@scenturelagos.com<br />
                      Wholesale: wholesale@scenturelagos.com
                    </p>
                  </div>
                </motion.div>
              </motion.div>

              {/* Social Media */}
              <div className="space-y-4">
                <h3 className="font-heading text-xl text-neutral-900">Follow Us</h3>
                <div className="flex gap-3">
                  {socialLinks.map(({ icon: Icon, href, label }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="p-3 bg-white border border-neutral-200 rounded-xl text-neutral-600 hover:text-neutral-900 hover:border-neutral-300 hover:shadow-sm transition-all duration-200 group"
                    >
                      <Icon size={20} className="group-hover:scale-110 transition-transform duration-200" />
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
            >
              <div className="bg-neutral-50 border border-neutral-100 p-8 lg:p-12 rounded-2xl">
                <h3 className="font-heading text-2xl md:text-3xl text-neutral-900 mb-6">Send Us a Message</h3>
                
                {formStatus.submitted ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg mb-6 ${formStatus.success ? 'bg-green-50 text-green-800 border border-green-100' : 'bg-red-50 text-red-800 border border-red-100'}`}
                  >
                    {formStatus.message}
                  </motion.div>
                ) : null}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name Field */}
                    <div className="space-y-2">
                      <label htmlFor="name" className="block text-sm font-medium text-neutral-700">
                        Your Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                        placeholder="John Doe"
                      />
                    </div>

                    {/* Email Field */}
                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
                        Your Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  {/* Subject Field */}
                  <div className="space-y-2">
                    <label htmlFor="subject" className="block text-sm font-medium text-neutral-700">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                      placeholder="How can we help you?"
                    />
                  </div>

                  {/* Message Field */}
                  <div className="space-y-2">
                    <label htmlFor="message" className="block text-sm font-medium text-neutral-700">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows="5"
                      className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                      placeholder="Your message here..."
                    ></textarea>
                  </div>

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    className="w-full group bg-neutral-900 hover:bg-neutral-800 text-white px-8 py-4 rounded-full transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <span>Send Message</span>
                    <Send size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
                  </Button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-24 lg:py-32 bg-neutral-50">
        <div className="container px-6 lg:px-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-150px" }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center px-4 py-2 bg-white border border-neutral-200 rounded-full text-sm text-neutral-600 mb-6">
              Our Location
            </div>
            <h2 className="font-heading text-4xl md:text-5xl mb-6 text-neutral-900 tracking-tight">
              Visit Our <span className="text-neutral-500 font-light">Flagship Store</span>
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
              Experience our fragrances in person at our Victoria Island location.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
            className="relative aspect-[16/9] md:aspect-[21/9] overflow-hidden rounded-2xl border border-neutral-200 shadow-lg"
          >
            {/* Placeholder for an actual map - in a real implementation, this would be a Google Maps or similar embed */}
            <img 
              src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5ce?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1333&q=80" 
              alt="Scenture Lagos Store Location Map" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
            <div className="absolute bottom-8 left-8 right-8 bg-white/90 backdrop-blur-sm p-6 rounded-xl border border-white/50 shadow-lg">
              <h3 className="font-heading text-xl text-neutral-900 mb-2">Scenture Lagos Flagship Store</h3>
              <p className="text-neutral-600">
                42 Admiralty Way, Lekki Phase 1, Lagos, Nigeria
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Mail, MapPin, Phone, ArrowRight } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
    { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  ];

  const shopLinks = [
    { to: '/shop?category=fragrances', label: 'Fragrances' },
    { to: '/shop?category=candles', label: 'Candles' },
    { to: '/shop?category=diffusers', label: 'Diffusers' },
    { to: '/shop?category=gift-sets', label: 'Gift Sets' },
  ];

  const companyLinks = [
    { to: '/about', label: 'About Us' },
    { to: '/contact', label: 'Contact' },
    { to: '/faq', label: 'FAQ' },
    { to: '/blog', label: 'Blog' },
  ];

  const legalLinks = [
    { to: '/privacy-policy', label: 'Privacy Policy' },
    { to: '/terms-of-service', label: 'Terms of Service' },
    { to: '/shipping-policy', label: 'Shipping Policy' },
    { to: '/return-policy', label: 'Return Policy' },
  ];

  return (
    <footer className="bg-gray-50 border-t border-gray-100">
      {/* Newsletter Section */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h3 className="font-heading text-2xl lg:text-3xl font-medium">
              Stay in the Loop
            </h3>
            <p className="text-gray-300 text-sm lg:text-base leading-relaxed">
              Be the first to discover new fragrances, exclusive offers, and scent stories delivered straight to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <div className="flex-1 relative">
                <Mail size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all duration-200"
                />
              </div>
              <button className="px-6 py-3 bg-white text-gray-900 rounded-xl font-medium hover:bg-gray-100 transition-all duration-200 flex items-center justify-center gap-2 group">
                Subscribe
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-4">
              <Link to="/" className="inline-block">
                <h3 className="font-heading text-2xl font-semibold text-gray-900">
                  Scenture Lagos
                </h3>
              </Link>
              <p className="text-gray-600 text-sm leading-relaxed max-w-md">
                Where luxury meets lifestyle. Elevate your senses and spaces with our premium fragrances and diffusers, crafted to transform every moment into an extraordinary experience.
              </p>
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <MapPin size={16} className="text-gray-400 flex-shrink-0" />
                <span>Victoria Island, Lagos, Nigeria</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Phone size={16} className="text-gray-400 flex-shrink-0" />
                <span>+234 (0) 123 456 7890</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Mail size={16} className="text-gray-400 flex-shrink-0" />
                <span>hello@scenturelagos.com</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900">Follow Us</h4>
              <div className="flex gap-3">
                {socialLinks.map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:text-gray-900 hover:border-gray-300 hover:shadow-sm transition-all duration-200 group"
                  >
                    <Icon size={18} className="group-hover:scale-110 transition-transform duration-200" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Shop Column */}
          <div className="space-y-4">
            <h4 className="font-heading text-base font-semibold text-gray-900">Shop</h4>
            <ul className="space-y-3">
              {shopLinks.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span>{label}</span>
                    <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div className="space-y-4">
            <h4 className="font-heading text-base font-semibold text-gray-900">Company</h4>
            <ul className="space-y-3">
              {companyLinks.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span>{label}</span>
                    <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Column */}
          <div className="space-y-4">
            <h4 className="font-heading text-base font-semibold text-gray-900">Legal</h4>
            <ul className="space-y-3">
              {legalLinks.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span>{label}</span>
                    <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              © {currentYear} Scenture Lagos. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <span>Made with ❤️ in Lagos</span>
              <div className="flex items-center gap-4">
                <Link to="/sitemap" className="hover:text-gray-700 transition-colors duration-200">
                  Sitemap
                </Link>
                <Link to="/accessibility" className="hover:text-gray-700 transition-colors duration-200">
                  Accessibility
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
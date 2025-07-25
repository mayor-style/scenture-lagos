import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Mail, MapPin, Phone, ArrowRight } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
    { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  ];

  const linkColumns = [
    {
      title: 'Shop',
      links: [
        { to: '/shop?category=fragrances', label: 'Fragrances' },
        { to: '/shop?category=candles', label: 'Candles' },
        { to: '/shop?category=diffusers', label: 'Diffusers' },
        { to: '/shop?category=gift-sets', label: 'Gift Sets' },
      ],
    },
    {
      title: 'Company',
      links: [
        { to: '/about', label: 'About Us' },
        { to: '/contact', label: 'Contact' },
        { to: '/blog', label: 'Our Journal' },
        { to: '/faq', label: 'FAQs' },
      ],
    },
    {
      title: 'Support',
      links: [
        { to: '/privacy-policy', label: 'Privacy Policy' },
        { to: '/terms-of-service', label: 'Terms of Service' },
        { to: '/shipping-policy', label: 'Shipping' },
        { to: '/return-policy', label: 'Returns' },
      ],
    },
  ];

  return (
    <footer className="bg-neutral-50">
      {/* Newsletter Section */}
      <div className="bg-white border-t border-b border-neutral-200/80">
        <div className="container px-6 py-16">
          <div className="max-w-xl mx-auto text-center">
            <h3 className="font-heading text-2xl lg:text-3xl font-medium text-neutral-900">
              Join The Scenture Circle
            </h3>
            <p className="mt-4 text-neutral-600 leading-relaxed">
              Be the first to discover new arrivals, exclusive offers, and sensory stories from Lagos.
            </p>
            <form className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <div className="flex-1 relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="email"
                  placeholder="Your email address"
                  className="w-full pl-12 pr-4 py-3 bg-white border border-neutral-300 rounded-md text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-800 focus:border-transparent transition-colors"
                  aria-label="Email address for newsletter"
                />
              </div>
              <button type="submit" className="group flex items-center justify-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-md font-medium hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-800 transition-colors">
                <span>Subscribe</span>
                <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="font-heading text-2xl font-bold text-neutral-900">
              Scenture Lagos<span className="text-neutral-400">.</span>
            </Link>
            <p className="mt-4 text-neutral-600 text-sm leading-relaxed max-w-sm">
              Crafting olfactory journeys from the heart of Lagos. Where luxury meets lifestyle, and every scent tells a story.
            </p>
            <div className="mt-8 flex gap-3">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="p-2.5 bg-white border border-neutral-200 rounded-full text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 hover:border-neutral-300 transition-all">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>
          
          {/* Link Columns */}
          {linkColumns.map((column) => (
            <div key={column.title}>
              <h4 className="font-semibold text-sm tracking-wider uppercase text-neutral-800">{column.title}</h4>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="group flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
                      {link.label}
                      <ArrowRight size={12} className="opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-neutral-200/80">
        <div className="container px-6 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-neutral-500 text-center sm:text-left">
              © {currentYear} Scenture Lagos. All Rights Reserved.
            </p>
            <p className="text-sm text-neutral-500">
              Handcrafted with ❤️ in Lagos, Nigeria.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
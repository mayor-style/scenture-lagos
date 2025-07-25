import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Instagram, Facebook, Twitter } from 'lucide-react';
import { Button } from '../components/ui/Button';

// --- Custom Hook for Form Logic ---
const useContactForm = () => {
  const [formData, setFormData] = React.useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = React.useState({ submitting: false, success: false, message: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus({ submitting: true, success: false, message: '' });

    // Simulate API call
    setTimeout(() => {
      // Logic to determine success or failure would go here
      const isSuccess = true; 
      
      if (isSuccess) {
        setStatus({ submitting: false, success: true, message: 'Thank you! Your message has been sent.' });
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setStatus({ submitting: false, success: false, message: 'Something went wrong. Please try again.' });
      }

      // Clear status message after 5 seconds
      setTimeout(() => setStatus({ submitting: false, success: false, message: '' }), 5000);
    }, 1500);
  };

  return { formData, status, handleInputChange, handleSubmit };
};

// --- Reusable Input Field Component ---
const InputField = React.memo(({ id, name, type = "text", label, value, onChange, placeholder, required = true, as = "input" }) => {
  const commonProps = {
    id,
    name,
    value,
    onChange,
    required,
    placeholder,
    className: "w-full px-4 py-3 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 transition-shadow duration-200"
  };
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      {as === 'textarea' ? (
        <textarea {...commonProps} rows="5" />
      ) : (
        <input type={type} {...commonProps} />
      )}
    </div>
  );
});

// --- UI Components ---
const ContactInfoCard = React.memo(({ icon: Icon, title, children }) => (
  <motion.div
    variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
    className="flex items-start gap-5"
  >
    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
      <Icon size={22} className="text-slate-700" />
    </div>
    <div>
      <h3 className="font-bold text-lg text-slate-800 mb-1">{title}</h3>
      <div className="text-slate-600 leading-relaxed space-y-1">{children}</div>
    </div>
  </motion.div>
));

const ContactForm = () => {
    const { formData, status, handleInputChange, handleSubmit } = useContactForm();
    return (
        <div className="bg-slate-50 border border-slate-200/70 p-8 lg:p-10 rounded-2xl">
            <h3 className="font-bold text-3xl text-slate-800 mb-6">Send a Message</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <InputField id="name" name="name" label="Your Name" value={formData.name} onChange={handleInputChange} placeholder="John Doe" />
                    <InputField id="email" name="email" type="email" label="Your Email" value={formData.email} onChange={handleInputChange} placeholder="john@example.com" />
                </div>
                <InputField id="subject" name="subject" label="Subject" value={formData.subject} onChange={handleInputChange} placeholder="How can we help?" />
                <InputField id="message" name="message" as="textarea" label="Message" value={formData.message} onChange={handleInputChange} placeholder="Your message here..." />
                <div>
                  <AnimatePresence>
                    {status.message && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -10 }}
                        className={`text-sm p-3 rounded-lg text-center mb-4 ${status.success ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}
                      >
                        {status.message}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <Button type="submit" size="lg" className="w-full group" disabled={status.submitting}>
                    {status.submitting ? 'Sending...' : (
                      <>
                        <span>Send Message</span>
                        <Send size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </div>
            </form>
        </div>
    );
}

// --- Main Page Component ---
const ContactPage = () => {
  const socialLinks = [
    { icon: Instagram, href: 'https://instagram.com/scenturelagos', label: 'Instagram' },
    { icon: Facebook, href: 'https://facebook.com/scenturelagos', label: 'Facebook' },
    { icon: Twitter, href: 'https://twitter.com/scenturelagos', label: 'Twitter' },
  ];

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative py-24 sm:py-32 lg:py-40 bg-slate-50 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/path/to/your/subtle-pattern.svg')] opacity-20"></div>
        <div className="container mx-auto px-4 text-center">
            <motion.h1 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight"
            >
                Get In Touch
            </motion.h1>
            <motion.p 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
                className="mt-4 text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto"
            >
                We're here to help and answer any question you might have. We look forward to hearing from you.
            </motion.p>
        </div>
      </section>

      {/* Main Content */}
     <section className="py-16 lg:py-24">
  <div className="container mx-auto px-4">
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        transition={{ staggerChildren: 0.1 }}
        className="lg:col-span-2 space-y-10"
      >
        <ContactInfoCard icon={MapPin} title="Visit Our Store">
          <p>42 Admiralty Way<br/>Lekki Phase 1, Lagos, Nigeria</p>
        </ContactInfoCard>
        <ContactInfoCard icon={Mail} title="Contact Details">
          <p><strong>Email:</strong> hello@scenturelagos.com</p>
          <p><strong>Phone:</strong> +234 123 456 7890</p>
        </ContactInfoCard>
        <ContactInfoCard icon={Phone} title="Business Hours">
          <p>Mon - Fri: 9am - 6pm</p>
          <p>Saturday: 10am - 4pm</p>
        </ContactInfoCard>
        <div>
          <h3 className="font-bold text-lg text-slate-800 mb-3">Follow Us</h3>
          <div className="flex gap-3">
            {socialLinks.map(({ icon: Icon, href, label }) => (
              <a key={label} href={href} aria-label={label} target="_blank" rel="noopener noreferrer" className="p-3 bg-slate-100 rounded-lg text-slate-600 hover:bg-slate-900 hover:text-white transition-all">
                <Icon size={20} />
              </a>
            ))}
          </div>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="lg:col-span-3"
      >
        <ContactForm />
      </motion.div>
    </div>
  </div>
</section>
    </div>
  );
};

export default ContactPage;
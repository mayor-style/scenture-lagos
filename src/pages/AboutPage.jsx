import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Leaf, Gem, BrainCircuit } from 'lucide-react';
import { Button } from '../components/ui/Button';

// --- Data ---
const valuesData = [
  {
    icon: Gem,
    title: 'Uncompromising Quality',
    description: 'We source only the finest ingredients, ensuring each product meets our exacting standards of excellence and luxury.',
  },
  {
    icon: Leaf,
    title: 'Sustainable Craft',
    description: "We're committed to environmentally conscious practices, from responsibly sourced materials to eco-friendly packaging.",
  },
  {
    icon: BrainCircuit,
    title: 'Scent Innovation',
    description: 'We continuously explore new scent profiles and artisan techniques, pushing the boundaries of olfactory creation.',
  },
];

const teamData = [
  {
    name: 'Adebola Adeyemi',
    role: 'Founder & Creative Director',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=761&q=80',
  },
  {
    name: 'Chioma Okonkwo',
    role: 'Head Perfumer',
    image: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
  },
  {
    name: 'Oluwaseun Adeyemi',
    role: 'Operations Director',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
  },
   {
    name: 'Amara Nwosu',
    role: 'Marketing Director',
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
  },
];

// --- Reusable Components ---
const Section = ({ children, className = '' }) => (
  <section className={`py-16 lg:py-24 ${className}`}>
    <div className="container mx-auto px-4">{children}</div>
  </section>
);

const SectionHeader = React.memo(({ title, subtitle, pretitle }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.5 }}
    transition={{ duration: 0.7, ease: "easeOut" }}
    className="max-w-3xl mx-auto text-center mb-12 lg:mb-16"
  >
    {pretitle && <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-2">{pretitle}</p>}
    <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">{title}</h2>
    {subtitle && <p className="mt-4 text-lg text-slate-600">{subtitle}</p>}
  </motion.div>
));

const ValueCard = React.memo(({ icon: Icon, title, description }) => (
  <motion.div
    variants={{
        hidden: { opacity: 0, scale: 0.9 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" }}
    }}
    className="bg-white p-8 rounded-2xl border border-slate-200/70 shadow-sm hover:shadow-lg hover:border-slate-300 transition-all duration-300"
  >
    <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-5">
      <Icon className="text-primary" size={28} />
    </div>
    <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
    <p className="text-slate-600 leading-relaxed">{description}</p>
  </motion.div>
));

const TeamMemberCard = React.memo(({ name, role, image }) => (
  <motion.div 
    variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" }}
    }}
    className="group"
  >
    <div className="relative overflow-hidden bg-slate-100 aspect-[4/5] rounded-2xl mb-4">
      <img src={image} alt={name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
    </div>
    <h3 className="text-lg font-bold text-slate-800">{name}</h3>
    <p className="text-primary font-medium">{role}</p>
  </motion.div>
));


// --- Main Page Component ---
const AboutPage = () => {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative py-24 sm:py-32 lg:py-40 bg-slate-50 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1599446794254-16ca8daa4c48?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80')] bg-cover bg-center opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-50/80 to-slate-50/20"></div>
        <div className="container mx-auto px-4 relative">
            <motion.div 
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}
                className="max-w-3xl text-center mx-auto"
            >
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight">Crafting Memories, One Scent at a Time</h1>
                <p className="mt-6 text-lg lg:text-xl text-slate-600">Scenture Lagos is a celebration of Nigerian heritage and contemporary luxury, born from a passion for the evocative power of fragrance.</p>
            </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-lg">
                <img src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1032&q=80" alt="Scenture Lagos Founder" className="w-full h-full object-cover"/>
            </div>
             <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary/10 rounded-2xl -z-10"></div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.7, ease: "easeOut" }}
            className="space-y-4"
          >
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-800 tracking-tight">Our Story</h2>
            <p className="text-slate-600 leading-relaxed">Founded in 2018 by Adebola Adeyemi in a small workshop in Victoria Island, Scenture Lagos began as a personal quest to capture the essence of our vibrant culture through fragrance. This passion for scent storytelling and commitment to quality quickly resonated with those seeking to elevate their everyday spaces.</p>
            <p className="text-slate-600 leading-relaxed">Today, Scenture Lagos is a proud testament to Nigerian craftsmanship, offering curated scent experiences that blend local inspiration with global excellence.</p>
          </motion.div>
        </div>
      </Section>
      
      {/* Values Section */}
      <Section className="bg-slate-50">
        <SectionHeader pretitle="Our Philosophy" title="The Values That Guide Us" subtitle="Our principles are the heart of our craft, ensuring every product is a true reflection of our commitment to excellence." />
        <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
            transition={{ staggerChildren: 0.15 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {valuesData.map(value => <ValueCard key={value.title} {...value} />)}
        </motion.div>
      </Section>
      
      {/* Team Section */}
      <Section>
        <SectionHeader pretitle="Our Artisans" title="The Faces Behind the Fragrance" subtitle="Meet the passionate team dedicated to bringing the Scenture Lagos vision to life." />
         <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
            transition={{ staggerChildren: 0.15 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {teamData.map(member => <TeamMemberCard key={member.name} {...member} />)}
        </motion.div>
      </Section>

      {/* CTA Section */}
      <Section className="bg-slate-900">
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.8 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">Experience the Scenture Difference</h2>
          <p className="mt-4 text-slate-300 leading-relaxed">Transform your space into a sanctuary of luxury and distinction. Discover a fragrance that tells your story.</p>
          <Button asChild size="lg" className="mt-8 group">
            <Link to="/shop" className="flex justify-center items-center">
              Shop The Collection
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>
      </Section>
    </div>
  );
};

export default AboutPage;
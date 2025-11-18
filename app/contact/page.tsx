'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate submission (in production, this would send to an API)
    setTimeout(() => {
      toast.success('Thank you! We will get back to you soon.');
      setFormData({ name: '', email: '', message: '' });
      setIsSubmitting(false);
    }, 1000);
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'Phone',
      value: '+1 (234) 567-890',
      href: 'tel:+1234567890',
    },
    {
      icon: Mail,
      title: 'Email',
      value: 'support@paperink.com',
      href: 'mailto:support@paperink.com',
    },
    {
      icon: MapPin,
      title: 'Location',
      value: 'Based Online • Serving Globally',
      href: '#',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Get in Touch
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Have questions or feedback? We&apos;d love to hear from you. Reach out anytime!
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <motion.a
                  key={index}
                  href={info.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-8 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 hover:border-blue-500/50 transition-all duration-300 text-center group cursor-pointer"
                >
                  <div className="inline-flex p-4 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{info.title}</h3>
                  <p className="text-slate-300 hover:text-blue-400 transition-colors">{info.value}</p>
                </motion.a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="relative py-20 sm:py-28">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800 border border-slate-700 rounded-2xl p-8 sm:p-12"
          >
            <h2 className="text-3xl font-bold text-white mb-2">Send us a Message</h2>
            <p className="text-slate-400 mb-8">We typically respond within 24 hours.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Your Name"
                type="text"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />

              <Input
                label="Email Address"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  placeholder="Your message here..."
                  rows={6}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg bg-slate-700 text-white placeholder-slate-400 border border-slate-600 focus:ring-2 focus:ring-blue-500 transition-all duration-200 resize-none"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0"
                isLoading={isSubmitting}
              >
                Send Message
              </Button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* FAQ or Additional Info */}
      <section className="relative py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            <div className="text-left">
              <h4 className="text-lg font-semibold text-white mb-2">How long are delivery times?</h4>
              <p className="text-slate-400">Delivery is coming soon! For now, we are in catalog mode.</p>
            </div>
            <div className="text-left">
              <h4 className="text-lg font-semibold text-white mb-2">Do you ship internationally?</h4>
              <p className="text-slate-400">Contact us to inquire about international shipping options.</p>
            </div>
            <div className="text-left">
              <h4 className="text-lg font-semibold text-white mb-2">What is your return policy?</h4>
              <p className="text-slate-400">Returns and exchanges are handled on a case-by-case basis. Contact us for details.</p>
            </div>
            <div className="text-left">
              <h4 className="text-lg font-semibold text-white mb-2">Are the products eco-friendly?</h4>
              <p className="text-slate-400">We prioritize sustainable and responsibly sourced products. Check individual product pages for details.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const SHOP_NAME = "Nisha Stationery";
const SHOP_PHONE = "9892911665";
const SHOP_WHATSAPP = "919892911665"; // with country code for wa.me
const SHOP_EMAIL = "nishastationery@gmail.com";
const SHOP_ADDRESS = "Nisha Stationery, Kurla, Mumbai, Maharashtra 400070";

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fffdf8] via-[#fef3eb] to-[#f7ebe0] text-[#1c1a17]">
      {/* Hero + Map + Info */}
      <section className="py-10 sm:py-16">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-0 space-y-8 sm:space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-start">
            {/* Copy + shop details + actions */}
            <div className="space-y-5 sm:space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#d9cfc2] bg-white/70 text-xs uppercase tracking-[0.4em] text-[#5f4b3f]">
                <span>Visit us</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold leading-tight text-[#1c1a17]">
                Stationery, in real life.
              </h1>
              <p className="text-[#5f4b3f] max-w-xl">
                Drop by our cozy Nisha Stationery store to browse pens, notebooks and art supplies in person, or
                reach us directly on WhatsApp, phone or email.
              </p>

              <div className="rounded-3xl border border-[#d9cfc2] bg-white/80 p-5 space-y-4 shadow-[0_16px_32px_rgba(28,26,23,0.06)]">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-[#b7472f] mb-1">Store</p>
                  <p className="text-lg font-semibold text-[#1c1a17]">{SHOP_NAME}</p>
                </div>

                <div className="space-y-2 text-sm text-[#5f4b3f]">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 text-[#b7472f]" />
                    <p>{SHOP_ADDRESS}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#b7472f]" />
                    <a href={`tel:${SHOP_PHONE}`} className="hover:text-[#b7472f] underline underline-offset-2">
                      {SHOP_PHONE}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#b7472f]" />
                    <a
                      href={`mailto:${SHOP_EMAIL}`}
                      className="hover:text-[#b7472f] underline underline-offset-2"
                    >
                      {SHOP_EMAIL}
                    </a>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#f1e3d5] flex flex-wrap gap-3">
                  <a
                    href={`https://wa.me/${SHOP_WHATSAPP}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-[#25D366] hover:bg-[#1ebe5a] text-white shadow-sm transition-transform duration-150 hover:-translate-y-0.5"
                  >
                    WhatsApp us
                  </a>
                  <a
                    href={`tel:${SHOP_PHONE}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border border-[#d9cfc2] bg-white hover:bg-[#f4ebe3] text-[#5f4b3f] shadow-sm transition-transform duration-150 hover:-translate-y-0.5"
                  >
                    Call store
                  </a>
                  <a
                    href={`mailto:${SHOP_EMAIL}`}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium text-[#5f4b3f] hover:bg-[#f4ebe3] transition-transform duration-150 hover:-translate-y-0.5"
                  >
                    Email us
                  </a>
                </div>
              </div>

              <div className="rounded-2xl border border-[#f1e3d5] bg-white/70 p-4 text-xs text-[#5f4b3f] space-y-1">
                <p className="font-semibold text-[#1c1a17] tracking-[0.2em] uppercase text-[11px]">
                  Store hours
                </p>
                <p>Monday – Saturday: 10:00 AM – 9:00 PM</p>
                <p>Sunday: 11:00 AM – 8:00 PM</p>
              </div>
            </div>

            {/* Map embed */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-3xl overflow-hidden border border-[#d9cfc2] shadow-[0_20px_40px_rgba(28,26,23,0.08)] bg-white"
            >
              <div className="aspect-[4/3] w-full">
                <iframe
                  title="Nisha Stationery location"
                  src="https://www.google.com/maps?q=19.0656282,72.8759043&z=18&output=embed"
                  className="w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Bottom padding */}
      <section className="pb-16" />
    </div>
  );
}

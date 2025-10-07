'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubscribed(true);
      setIsLoading(false);
      setEmail('');
    }, 1000);
  };

  if (isSubscribed) {
    return (
      <section className="py-16 bg-gradient-to-r from-brand-600 to-brand-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-8"
          >
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">✓</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Thank You for Subscribing!
            </h3>
            <p className="text-brand-100">
              You'll receive the best travel deals and exclusive offers in your inbox.
            </p>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-r from-brand-600 to-brand-700">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center text-white"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Stay Updated with Best Travel Deals
          </h2>
          <p className="text-xl text-brand-100 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter and be the first to know about exclusive offers, 
            new packages, and travel tips.
          </p>

          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white/50 focus:outline-none"
                required
              />
              <Button
                type="submit"
                variant="secondary"
                size="lg"
                loading={isLoading}
                className="bg-white text-brand-600 hover:bg-gray-100 font-semibold"
              >
                Subscribe
              </Button>
            </div>
          </form>

          <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm text-brand-100">
            <div className="flex items-center gap-2">
              <span>✓</span>
              <span>Exclusive Deals</span>
            </div>
            <div className="flex items-center gap-2">
              <span>✓</span>
              <span>Travel Tips</span>
            </div>
            <div className="flex items-center gap-2">
              <span>✓</span>
              <span>No Spam</span>
            </div>
            <div className="flex items-center gap-2">
              <span>✓</span>
              <span>Unsubscribe Anytime</span>
            </div>
          </div>
        </motion.div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {[
            {
              icon: '💰',
              title: 'Exclusive Discounts',
              description: 'Get up to 30% off on selected packages'
            },
            {
              icon: '⚡',
              title: 'Flash Sales',
              description: 'Be first to know about limited-time offers'
            },
            {
              icon: '🎯',
              title: 'Personalized Offers',
              description: 'Receive deals tailored to your preferences'
            }
          ].map((benefit, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl mb-3">{benefit.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {benefit.title}
              </h3>
              <p className="text-brand-100 text-sm">
                {benefit.description}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Newsletter;

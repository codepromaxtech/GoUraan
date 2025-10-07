'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface Testimonial {
  id: string;
  name: string;
  location: string;
  avatar: string;
  rating: number;
  comment: string;
  packageType: string;
}

const Testimonials: React.FC = () => {
  const testimonials: Testimonial[] = [
    {
      id: '1',
      name: 'Ahmed Rahman',
      location: 'Dhaka, Bangladesh',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      rating: 5,
      comment: 'GoUraan made my Hajj journey absolutely perfect. The accommodation near Haram was excellent and the guides were very knowledgeable. Highly recommended!',
      packageType: 'Hajj Package'
    },
    {
      id: '2',
      name: 'Fatima Khatun',
      location: 'Chittagong, Bangladesh',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      rating: 5,
      comment: 'The Umrah package was beyond my expectations. Every detail was taken care of, from visa to accommodation. The spiritual experience was enhanced by their excellent service.',
      packageType: 'Umrah Package'
    },
    {
      id: '3',
      name: 'Mohammad Ali',
      location: 'Sylhet, Bangladesh',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      rating: 5,
      comment: 'Dubai trip with family was amazing! The itinerary was well-planned and the customer service was outstanding. Will definitely book again with GoUraan.',
      packageType: 'Dubai Package'
    },
    {
      id: '4',
      name: 'Rashida Begum',
      location: 'Rajshahi, Bangladesh',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      rating: 5,
      comment: 'Turkey tour was incredible! The historical sites, food, and culture - everything was perfectly organized. GoUraan team made it a memorable experience.',
      packageType: 'Turkey Package'
    },
    {
      id: '5',
      name: 'Karim Uddin',
      location: 'Khulna, Bangladesh',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      rating: 5,
      comment: 'Professional service from start to finish. The flight booking was smooth and hotel recommendations were spot on. Great value for money!',
      packageType: 'Flight Booking'
    },
    {
      id: '6',
      name: 'Nasreen Akter',
      location: 'Barisal, Bangladesh',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      rating: 5,
      comment: 'The customer support team was available 24/7 during our trip. They helped us with every query promptly. Truly a reliable travel partner.',
      packageType: 'Malaysia Package'
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Read testimonials from thousands of satisfied travelers who chose GoUraan for their journeys
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300"
            >
              {/* Rating */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-yellow-500 text-lg">★</span>
                ))}
              </div>

              {/* Comment */}
              <p className="text-gray-700 mb-6 leading-relaxed">
                "{testimonial.comment}"
              </p>

              {/* Customer Info */}
              <div className="flex items-center gap-4">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.location}</p>
                  <p className="text-xs text-brand-600 font-medium">{testimonial.packageType}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-xl">✓</span>
              </div>
              <div>
                <div className="font-semibold text-gray-900">Licensed Agency</div>
                <div className="text-sm text-gray-600">Govt. Approved</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-xl">🛡️</span>
              </div>
              <div>
                <div className="font-semibold text-gray-900">Secure Payments</div>
                <div className="text-sm text-gray-600">SSL Protected</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-xl">⭐</span>
              </div>
              <div>
                <div className="font-semibold text-gray-900">4.9/5 Rating</div>
                <div className="text-sm text-gray-600">5000+ Reviews</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;

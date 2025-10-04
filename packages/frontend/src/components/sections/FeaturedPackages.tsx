'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface Package {
  id: string;
  title: string;
  description: string;
  image: string;
  price: number;
  originalPrice?: number;
  duration: string;
  destinations: string[];
  rating: number;
  reviews: number;
  features: string[];
  badge?: string;
}

const FeaturedPackages: React.FC = () => {
  const packages: Package[] = [
    {
      id: '1',
      title: 'Premium Hajj Package 2024',
      description: 'Complete Hajj experience with 5-star accommodations near Haram',
      image: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      price: 4500,
      originalPrice: 5200,
      duration: '21 Days',
      destinations: ['Makkah', 'Madinah', 'Mina', 'Arafat'],
      rating: 4.9,
      reviews: 234,
      features: ['5-Star Hotel', 'Guided Tours', 'Visa Included', '24/7 Support'],
      badge: 'Most Popular'
    },
    {
      id: '2',
      title: 'Luxury Umrah Package',
      description: 'Spiritual journey with premium services and comfort',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      price: 1800,
      originalPrice: 2100,
      duration: '10 Days',
      destinations: ['Makkah', 'Madinah'],
      rating: 4.8,
      reviews: 189,
      features: ['4-Star Hotel', 'Private Transport', 'Religious Guide', 'Group Tours'],
      badge: 'Best Value'
    },
    {
      id: '3',
      title: 'Dubai & UAE Explorer',
      description: 'Modern marvels and traditional culture in one amazing trip',
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      price: 1200,
      duration: '7 Days',
      destinations: ['Dubai', 'Abu Dhabi', 'Sharjah'],
      rating: 4.7,
      reviews: 156,
      features: ['Desert Safari', 'Burj Khalifa', 'City Tours', 'Shopping Tours']
    },
    {
      id: '4',
      title: 'Turkey Heritage Tour',
      description: 'Discover the rich history and culture of Turkey',
      image: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      price: 950,
      duration: '8 Days',
      destinations: ['Istanbul', 'Cappadocia', 'Pamukkale'],
      rating: 4.6,
      reviews: 203,
      features: ['Historic Sites', 'Hot Air Balloon', 'Traditional Cuisine', 'Cultural Tours']
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
            Featured Travel Packages
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our handpicked travel packages designed for unforgettable experiences
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {packages.map((pkg, index) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 group"
            >
              {/* Image */}
              <div className="relative overflow-hidden">
                <img
                  src={pkg.image}
                  alt={pkg.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {pkg.badge && (
                  <div className="absolute top-4 left-4 bg-brand-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {pkg.badge}
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500">★</span>
                    <span className="text-sm font-medium">{pkg.rating}</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-brand-600 transition-colors">
                  {pkg.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {pkg.description}
                </p>

                {/* Destinations */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {pkg.destinations.slice(0, 3).map((destination, idx) => (
                    <span
                      key={idx}
                      className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs"
                    >
                      {destination}
                    </span>
                  ))}
                  {pkg.destinations.length > 3 && (
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs">
                      +{pkg.destinations.length - 3} more
                    </span>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-1 mb-4">
                  {pkg.features.slice(0, 2).map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-green-500">✓</span>
                      {feature}
                    </div>
                  ))}
                </div>

                {/* Price and Duration */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-brand-600">
                        ${pkg.price}
                      </span>
                      {pkg.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          ${pkg.originalPrice}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">per person</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{pkg.duration}</div>
                    <div className="text-xs text-gray-500">{pkg.reviews} reviews</div>
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  variant="brand"
                  className="w-full group-hover:bg-brand-700 transition-colors"
                >
                  View Details
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button variant="outline" size="lg" className="px-8">
            View All Packages
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedPackages;

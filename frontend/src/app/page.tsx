import { Metadata } from 'next';
import Hero from '@/components/sections/Hero';
import SearchSection from '@/components/sections/SearchSection';
import FeaturedPackages from '@/components/sections/FeaturedPackages';
import WhyChooseUs from '@/components/sections/WhyChooseUs';
import Testimonials from '@/components/sections/Testimonials';
import Newsletter from '@/components/sections/Newsletter';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Home',
  description: 'Discover amazing travel deals, book flights, hotels, and exclusive Hajj & Umrah packages with GoUraan.',
};

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <SearchSection />
        <FeaturedPackages />
        <WhyChooseUs />
        <Testimonials />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}

import React from 'react';
import { EcommerceHeroBanner } from '@/components/home/EcommerceHeroBanner';
import { CategoryIconGrid } from '@/components/home/CategoryIconGrid';
import { FeaturedCollection } from '@/components/home/FeaturedCollection';
import { HighQualityProductsSpotlight } from '@/components/home/HighQualityProductsSpotlight';
import { WhatYouGetAtZaira } from '@/components/home/WhatYouGetAtZaira';
import { BrandStorySection } from '@/components/home/BrandStorySection';
import { FaqSection } from '@/components/home/FaqSection';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { ContactVisitSection } from '@/components/home/ContactVisitSection';
import {
  getDynamicCmsSection,
  getDynamicProducts,
} from '@/lib/db/catalog';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  const [
    featuredProducts,
    showroomCms,
    aboutCms,
  ] = await Promise.all([
    getDynamicProducts({ featured: true }),
    getDynamicCmsSection('home_showroom_contact'),
    getDynamicCmsSection('home_about'),
  ]);

  return (
    <div className="flex flex-col w-full bg-[#F8F9FA]">
      {/* 1. Hero Section: Full-Width Promotional Hero Banner Slider */}
      <EcommerceHeroBanner />

      {/* 2. Category: Top Categories of This Month */}
      <CategoryIconGrid />

      {/* 3. Show Top Trending Products: Carousel of Most Popular Products */}
      <FeaturedCollection
        products={featuredProducts}
        title="Top Trending Products"
        subtitle="Discover Hyderabad's most sought-after bespoke curtains, motorized blinds, and luxury upholstery."
      />

      {/* 4. 2,3 High Quality Products: Atelier Masterpieces & Signature Selection */}
      <HighQualityProductsSpotlight />

      {/* 5. Process: Our 5-Step Process & Experience (Quality, Advisory, Measuring, Installation, Assistance) */}
      <WhatYouGetAtZaira />

      {/* 6. About: About Zaira Furnishing & Brand Heritage */}
      <BrandStorySection cmsContent={aboutCms} />

      {/* 7. FAQ: Frequently Asked Questions */}
      <FaqSection />

      {/* 8. Review: Verified Customer Reviews & Homeowner Transformations */}
      <TestimonialsSection />

      {/* 9. Contact / Location: Flagship Showroom Experience & In-Home Consultation Booking */}
      <ContactVisitSection cmsContent={showroomCms} />
    </div>
  );
}

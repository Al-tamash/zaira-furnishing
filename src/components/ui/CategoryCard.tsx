'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Category } from '@/lib/data/types';
import { getCategoryHref, getCategoryActionText } from '@/lib/data/categories';

interface CategoryCardProps {
  category: Category;
  aspectRatio?: '4/3' | '16/10' | '1/1' | '4/5';
  className?: string;
  priority?: boolean;
}

export function CategoryCard({
  category,
  aspectRatio = '4/3',
  className = '',
  priority = false,
}: CategoryCardProps) {
  const href = getCategoryHref(category.slug);
  const actionText = getCategoryActionText(category.slug);

  const aspectClass =
    aspectRatio === '1/1'
      ? 'aspect-square'
      : aspectRatio === '16/10'
      ? 'aspect-[16/10]'
      : aspectRatio === '4/5'
      ? 'aspect-[4/5]'
      : 'aspect-[4/3]';

  return (
    <Link
      href={href}
      className={`group flex flex-col bg-white rounded-xl sm:rounded-2xl border border-[#EAE4D8] hover:border-[#1C1917] transition-all duration-300 overflow-hidden shadow-2xs hover:shadow-lg hover:-translate-y-1 block text-left ${className}`}
    >
      {/* ─── 1. Large Realistic Category Image ─── */}
      <div className={`relative ${aspectClass} w-full overflow-hidden bg-[#F2EDE2]`}>
        <Image
          src={category.image}
          alt={`${category.name} collection`}
          fill
          priority={priority}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Subtle Discipline Pill */}
        {category.itemCountText && (
          <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-10">
            <span className="px-2.5 py-1 rounded-full bg-black/45 backdrop-blur-xs border border-white/20 text-[#FAF7F2] text-[9.5px] sm:text-[10px] uppercase tracking-wider font-medium">
              {category.itemCountText}
            </span>
          </div>
        )}
      </div>

      {/* ─── 2. Clean E-Commerce Card Body ─── */}
      <div className="p-3.5 sm:p-4 md:p-5 flex flex-col flex-1 justify-between bg-white border-t border-[#F2ECE1]">
        <div>
          <h3 className="font-serif text-[15px] sm:text-[17px] md:text-[18px] font-medium text-[#1C1917] group-hover:text-[#9A7B56] transition-colors leading-snug line-clamp-1">
            {category.name}
          </h3>
          <p className="text-[12px] sm:text-[12.5px] text-[#78716C] line-clamp-1 mt-1 font-light">
            {category.tagline}
          </p>
        </div>

        {/* Action Link CTA */}
        <div className="mt-3 pt-2.5 border-t border-[#F4EFE6] flex items-center justify-between text-[11px] sm:text-[11.5px] uppercase tracking-wider font-semibold text-[#1C1917] group-hover:text-[#9A7B56] transition-colors">
          <span>{actionText}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
        </div>
      </div>
    </Link>
  );
}

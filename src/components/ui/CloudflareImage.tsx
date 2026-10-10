'use client';

import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { getMediaUrl, CloudflareImageOptions } from '@/lib/images/cloudflare';

interface CloudflareImageProps extends Omit<ImageProps, 'src'> {
  src: string;
  alt: string;
  cloudflareOptions?: CloudflareImageOptions;
  fallbackSrc?: string;
}

/**
 * Reusable image component for Zaira Furnishing.
 *
 * Prepared for Cloudflare R2 media storage:
 * - Resolves keys to Cloudflare R2 endpoints when deployed.
 * - Gracefully falls back to demo photography during early development.
 * - Handles loading blur transition and error fallbacks.
 */
export function CloudflareImage({
  src,
  alt,
  cloudflareOptions,
  fallbackSrc = 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
  className = '',
  fill,
  sizes,
  ...rest
}: CloudflareImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const resolvedSrc = hasError && fallbackSrc ? fallbackSrc : getMediaUrl(src, cloudflareOptions);

  return (
    <div
      className={`relative overflow-hidden bg-[#FAF7F2] ${
        fill ? 'h-full w-full' : 'inline-block'
      }`}
    >
      <Image
        {...rest}
        unoptimized={Boolean(resolvedSrc.startsWith('data:') || resolvedSrc.startsWith('blob:')) || rest.unoptimized}
        src={resolvedSrc}
        alt={alt}
        fill={fill}
        sizes={sizes || (fill ? '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw' : undefined)}
        className={`transition-all duration-700 ease-out ${
          isLoading ? 'scale-105 blur-sm opacity-70' : 'scale-100 blur-0 opacity-100'
        } ${className}`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          if (!hasError && fallbackSrc) {
            setHasError(true);
          }
        }}
      />
    </div>
  );
}

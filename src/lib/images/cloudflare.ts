/**
 * Cloudflare R2 & Media Delivery Architecture
 *
 * Designed specifically for Zaira Furnishing:
 * In production, media assets are served from Cloudflare R2 storage bucket
 * (or Cloudflare Images / Custom CDN Domain) via NEXT_PUBLIC_CLOUDFLARE_R2_URL.
 *
 * During development, fallback demo URLs (high-resolution furnishing photography)
 * are served seamlessly so components are never tied to local static files.
 */

export interface CloudflareImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'auto' | 'webp' | 'avif';
  fit?: 'cover' | 'contain' | 'crop' | 'scale-down';
}

/**
 * Resolves an image key or URL to a Cloudflare R2 URL or dev fallback URL.
 *
 * @param pathOrUrl - A key like 'products/curtains/belgian-linen-01.webp' or a full URL
 * @param options - Optional Cloudflare transformation parameters
 */
export function getMediaUrl(pathOrUrl: string, options?: CloudflareImageOptions): string {
  if (!pathOrUrl) return '';

  // 1. If it's already an absolute URL (e.g. Unsplash, external CDN)
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl;
  }

  // 2. Static catalog photography in public/images/ is bundled with the site.
  // Keeping them local ensures 100% deterministic SSR/Client hydration and zero reliance on external developer buckets.
  if (pathOrUrl.startsWith('/images/') || pathOrUrl.startsWith('images/')) {
    return pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  }

  // 3. For uploaded media keys, use client-accessible NEXT_PUBLIC_ variables
  const r2Base =
    process.env.NEXT_PUBLIC_CLOUDFLARE_R2_URL ||
    process.env.NEXT_PUBLIC_R2_URL ||
    '';

  // If Cloudflare R2 base URL is configured
  if (r2Base) {
    const cleanBase = r2Base.replace(/\/+$/, '');
    const cleanPath = pathOrUrl.replace(/^\/+/, '');

    // If using Cloudflare Images / zone transformations (e.g. /cdn-cgi/image/...)
    if (options && (options.width || options.quality || options.format)) {
      const transformParams = [
        options.width ? `width=${options.width}` : '',
        options.height ? `height=${options.height}` : '',
        options.quality ? `quality=${options.quality}` : 'quality=85',
        options.format ? `format=${options.format}` : 'format=auto',
        options.fit ? `fit=${options.fit}` : 'fit=cover',
      ].filter(Boolean).join(',');

      return `${cleanBase}/cdn-cgi/image/${transformParams}/${cleanPath}`;
    }

    return `${cleanBase}/${cleanPath}`;
  }

  // Fallback if no R2 base is defined and path is relative
  return pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
}

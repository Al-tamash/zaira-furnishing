'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Check,
  ShoppingBag,
  MessageCircle,
  Ruler,
  Share2,
  Minus,
  Plus,
  ArrowRight,
  FileText,
  Calendar,
  MapPin,
  User,
  Phone,
  Mail,
  X,
  Send,
  AlertCircle,
  Maximize2,
  Star,
  Sparkles,
  ShieldCheck,
  Scissors,
  Building2,
  Navigation,
} from 'lucide-react';
import { Product } from '@/lib/data/types';
import { useStore } from '@/lib/context/StoreContext';
import { ProductCard } from '@/components/ui/ProductCard';
import { ProductCustomerReviews, CustomerReviewItem } from './ProductCustomerReviews';
import {
  ZAIRA_WHATSAPP_NUMBER,
  buildQuoteWhatsAppUrl,
  buildMeasurementWhatsAppUrl,
  buildProductOrderWhatsAppUrl,
} from '@/lib/whatsapp';

interface ProductDetailViewProps {
  product: Product;
  relatedProducts: Product[];
  initialReviews?: CustomerReviewItem[];
  initialReviewSummary?: {
    total: number;
    averageRating: string | null;
  };
}

const COLOR_NAME_HEX_MAP: Record<string, string> = {
  'midnight navy': '#1B263B',
  'navy': '#1B263B',
  'navy blue': '#1B263B',
  'warm beige': '#C8BEB2',
  'beige': '#C8BEB2',
  'dove grey': '#9E9D99',
  'dove gray': '#9E9D99',
  'grey': '#9E9D99',
  'gray': '#8D99AE',
  'oatmeal slub': '#D2C6B5',
  'oatmeal': '#D2C6B5',
  'forest green': '#2C221E',
  'emerald green': '#154734',
  'emerald': '#154734',
  'olive': '#556B2F',
  'olive green': '#556B2F',
  'sage': '#9CAF88',
  'sage green': '#9CAF88',
  'ivory': '#FDFBF7',
  'cream': '#F5F5DC',
  'linen': '#E9DCC9',
  'charcoal': '#333333',
  'black': '#1A1A1A',
  'white': '#FFFFFF',
  'pure white': '#FFFFFF',
  'terracotta': '#C86D51',
  'rust': '#B7410E',
  'mustard': '#E1A95F',
  'gold': '#D4AF37',
  'taupe': '#B38B6D',
  'blush': '#DE5D83',
  'rose': '#C08081',
};

function resolveColorHex(variant: { name: string; colorHex?: string }): string {
  if (variant.colorHex) return variant.colorHex;
  const normalized = variant.name.toLowerCase().trim();
  if (COLOR_NAME_HEX_MAP[normalized]) return COLOR_NAME_HEX_MAP[normalized];
  for (const [key, hex] of Object.entries(COLOR_NAME_HEX_MAP)) {
    if (normalized.includes(key)) return hex;
  }
  return '#C8BEB2';
}

export function ProductDetailView({
  product,
  relatedProducts,
  initialReviews,
  initialReviewSummary,
}: ProductDetailViewProps) {
  const router = useRouter();
  const {
    addToCart,
    isWishlisted,
    toggleWishlist,
    customer,
    setIsCartOpen,
    openBookingModal,
    openStoreModal,
  } = useStore();

  const [reviewSummary, setReviewSummary] = useState(
    initialReviewSummary || { total: 0, averageRating: null }
  );

  // ─── DATA-DRIVEN PRODUCT PROPERTIES ───
  const isCustom = product.productType === 'custom_made';
  const isCurtain = product.categorySlug === 'curtains-drapes';
  const isBlind = product.categorySlug === 'window-blinds-shades';
  const isWallpaper = product.categorySlug === 'wallpapers-wall-coverings';
  const isCarpet = product.categorySlug === 'carpets-rugs';
  const isSofaFabric = product.categorySlug === 'sofa-fabrics-upholstery';
  const isMattress = product.categorySlug === 'mattresses-sleep-systems';
  // Only window treatments (curtains & blinds) require in-home laser measurement
  const isCustomAtelier = isCurtain || isBlind;

  // ─── CONFIRMED HEADING/PLEAT STYLES (FROM PRODUCT DATA ONLY) ───
  const confirmedHeadingStyles = useMemo(() => {
    if (!isCurtain || !product.specifications) return [];
    const headingSpec = product.specifications.find(
      (s) =>
        s.label.toLowerCase().includes('heading') ||
        s.label.toLowerCase().includes('pleat') ||
        s.label.toLowerCase().includes('stitch')
    );
    if (!headingSpec?.value) return [];
    return headingSpec.value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }, [isCurtain, product.specifications]);

  // ─── DYNAMIC VARIANT LABEL (FROM PRODUCT VARIANT DATA ONLY) ───
  const variantLabel = useMemo(() => {
    const vars = product.variations;
    if (!vars || vars.length <= 1) return '';

    const hasSize =
      isMattress ||
      vars.some(
        (v) =>
          v.name.toLowerCase().includes('king') ||
          v.name.toLowerCase().includes('queen') ||
          v.name.toLowerCase().includes('single') ||
          v.name.toLowerCase().includes('double') ||
          v.name.toLowerCase().includes(' inch') ||
          v.attributes?.Size
      );
    if (hasSize) return 'Select Size';

    const hasColor = vars.some((v) => v.type === 'color' || v.colorHex);
    if (hasColor) return 'Select Colour';

    const firstType = vars[0]?.type;
    if (firstType === 'pattern') return 'Select Pattern';
    if (firstType === 'design') return 'Select Design';
    if (firstType === 'material') return 'Select Material';

    return 'Select Option';
  }, [product, isMattress]);

  // ─── VARIANT & IMAGE STATE ───
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const currentVariant = product.variations?.[selectedVariantIdx] || product.variations?.[0];

  // Active image: primary product image
  const [activeImage, setActiveImage] = useState<string>(
    product.image || product.mainImage || currentVariant?.image || ''
  );
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Sync activeImage whenever product changes (keep main product view as primary)
  useEffect(() => {
    setSelectedVariantIdx(0);
    const initialImg =
      product.image ||
      product.mainImage ||
      product.variations?.[0]?.image ||
      '';
    setActiveImage(initialImg);
  }, [product.id, product.image, product.mainImage, product.variations]);

  // Gallery: exactly 2–3 images representing the SAME product (main view, room angle, fabric detail)
  const galleryImages = useMemo(() => {
    const primaryImg = product.image || product.mainImage;
    const list: string[] = [];
    if (primaryImg) list.push(primaryImg);

    if (product.additionalImages && product.additionalImages.length > 0) {
      product.additionalImages.forEach((img) => {
        if (img && !list.includes(img) && list.length < 3) {
          list.push(img);
        }
      });
    } else if (product.galleryImages && product.galleryImages.length > 0) {
      product.galleryImages.forEach((img) => {
        if (img && !list.includes(img) && list.length < 3) {
          list.push(img);
        }
      });
    }

    return list.length > 0 ? list : [primaryImg];
  }, [product]);

  // Helper to resolve alt text for any image according to: image.alt_text || product.name
  const getImageAlt = useCallback(
    (imgUrl: string, fallbackSuffix?: string) => {
      const match = product.images?.find((img) => img.url === imgUrl);
      if (match?.altText && match.altText.trim()) {
        return match.altText.trim();
      }
      const fallbackBase = product.displayName || product.name;
      return fallbackSuffix ? `${fallbackBase} ${fallbackSuffix}` : fallbackBase;
    },
    [product]
  );

  const currentImgIdx = useMemo(() => {
    const idx = galleryImages.indexOf(activeImage);
    return idx >= 0 ? idx : 0;
  }, [galleryImages, activeImage]);

  const handlePrevImage = () => {
    const prevIdx = (currentImgIdx - 1 + galleryImages.length) % galleryImages.length;
    setActiveImage(galleryImages[prevIdx]);
  };

  const handleNextImage = () => {
    const nextIdx = (currentImgIdx + 1) % galleryImages.length;
    setActiveImage(galleryImages[nextIdx]);
  };

  const handleThumbnailClick = (img: string) => {
    setActiveImage(img);
  };

  const handleSelectVariant = (idx: number) => {
    setSelectedVariantIdx(idx);
    const v = product.variations?.[idx];
    if (v?.image) {
      setActiveImage(v.image);
    } else if (v?.thumbnailImage) {
      setActiveImage(v.thumbnailImage);
    } else if (v?.images?.[0]) {
      setActiveImage(v.images[0]);
    }
  };

  // ─── REAL CUSTOMIZATION OPTIONS (CURTAINS / BLINDS) ───
  const [sizeType, setSizeType] = useState<'standard' | 'door' | 'long-door' | 'custom'>('standard');
  const [customWidth, setCustomWidth] = useState('60');
  const [customHeight, setCustomHeight] = useState('84');
  const activeHeadingStyle = confirmedHeadingStyles[0] || 'French Pinch Pleat';

  // ─── QUANTITY & ACTION STATE ───
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ─── MODAL FLOWS STATE (QUOTE & MEASUREMENT) ───
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [quoteName, setQuoteName] = useState(customer?.name || '');
  const [quotePhone, setQuotePhone] = useState(customer?.phone || '');
  const [quoteEmail, setQuoteEmail] = useState(customer?.email || '');
  const [quoteMessage, setQuoteMessage] = useState('');
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);
  const [quoteRequestNumber, setQuoteRequestNumber] = useState<string | null>(null);
  const [quoteWhatsAppUrl, setQuoteWhatsAppUrl] = useState('');
  const [quoteWhatsAppBlocked, setQuoteWhatsAppBlocked] = useState(false);
  const [isQuoteSubmitting, setIsQuoteSubmitting] = useState(false);

  const [isMeasurementModalOpen, setIsMeasurementModalOpen] = useState(false);
  const [measName, setMeasName] = useState(customer?.name || '');
  const [measPhone, setMeasPhone] = useState(customer?.phone || '');
  const [measEmail, setMeasEmail] = useState(customer?.email || '');
  const [measAddress, setMeasAddress] = useState('');
  const [measDate, setMeasDate] = useState('');
  const [measTimeSlot, setMeasTimeSlot] = useState('Morning (10:00 AM – 1:00 PM)');
  const [measNotes, setMeasNotes] = useState('');
  const [measError, setMeasError] = useState<string | null>(null);
  const [measSubmitted, setMeasSubmitted] = useState(false);
  const [measRequestNumber, setMeasRequestNumber] = useState<string | null>(null);
  const [measWhatsAppUrl, setMeasWhatsAppUrl] = useState('');
  const [measWhatsAppBlocked, setMeasWhatsAppBlocked] = useState(false);
  const [isMeasSubmitting, setIsMeasSubmitting] = useState(false);

  // Subcategory metadata resolution for breadcrumbs directly from dynamic product
  const subcategoryUrl = useMemo(() => {
    const slug = product.subcategorySlug || product.curtainType || product.blindType || product.sofaFabricType || product.wallpaperType || product.carpetType;
    if (!slug) return null;
    if (isCurtain) return `/categories/curtains/${slug}`;
    if (isBlind) return `/categories/blinds/${slug}`;
    if (isSofaFabric) return `/categories/sofa-fabrics/${slug}`;
    if (isWallpaper) return `/categories/wallpapers/${slug}`;
    if (isCarpet) return `/categories/carpets/${slug}`;
    return null;
  }, [isCurtain, isBlind, isSofaFabric, isWallpaper, isCarpet, product]);

  const subcategoryName = useMemo(() => {
    return product.subcategoryName || null;
  }, [product.subcategoryName]);

  // Sizing label helper
  const getResolvedSizeLabel = useCallback(() => {
    if (isCurtain || isBlind) {
      if (sizeType === 'custom') {
        return `Custom (${customWidth}″W × ${customHeight}″H)${activeHeadingStyle ? ` • ${activeHeadingStyle}` : ''}`;
      }
      return `Standard Size${activeHeadingStyle ? ` • ${activeHeadingStyle}` : ''}`;
    }
    if (isSofaFabric) {
      return `${quantity} Metre${quantity > 1 ? 's' : ''}`;
    }
    if (currentVariant?.attributes?.Size) {
      return currentVariant.attributes.Size;
    }
    return 'Standard Size';
  }, [
    isCurtain,
    isBlind,
    sizeType,
    customWidth,
    customHeight,
    activeHeadingStyle,
    isSofaFabric,
    quantity,
    currentVariant,
  ]);

  const getResolvedDimensions = useCallback((): string | undefined => {
    if ((isCurtain || isBlind) && sizeType === 'custom') {
      return `${customWidth}″ Width × ${customHeight}″ Height`;
    }
    return undefined;
  }, [isCurtain, isBlind, sizeType, customWidth, customHeight]);

  // Quantity unit label
  const quantityUnit = useMemo(() => {
    if (isSofaFabric) return quantity === 1 ? 'metre' : 'metres';
    if (isCurtain) return quantity === 1 ? 'panel' : 'panels';
    if (isWallpaper) return quantity === 1 ? 'roll' : 'rolls';
    if (isBlind) return quantity === 1 ? 'unit' : 'units';
    if (isCarpet) return quantity === 1 ? 'rug' : 'rugs';
    if (isMattress) return quantity === 1 ? 'mattress' : 'mattresses';
    if (product.categorySlug === 'bed-linen-bath') return quantity === 1 ? 'set' : 'sets';
    if (product.categorySlug === 'cushions-pillows') return quantity === 1 ? 'cover' : 'covers';
    return quantity === 1 ? 'unit' : 'units';
  }, [isSofaFabric, isCurtain, isWallpaper, isBlind, isCarpet, isMattress, product.categorySlug, quantity]);

  // Real unit price directly from product data
  const effectivePrice = currentVariant?.price || product.price;

  // Pricing unit helper
  const pricingUnit = useMemo(() => {
    if (isSofaFabric) return '/ metre';
    if (isCurtain && product.startingPrice) return '/ panel';
    if (isWallpaper && product.startingPrice) return '/ roll';
    if (product.startingPrice) return 'onwards';
    return '';
  }, [isSofaFabric, isCurtain, isWallpaper, product.startingPrice]);

  // Add to cart handler
  const handleAddToCart = async () => {
    const sizeLabel = getResolvedSizeLabel();
    const customDimensions = getResolvedDimensions();

    await addToCart({
      productId: product.id,
      variantId: currentVariant?.id,
      name: product.displayName || product.name,
      slug: product.slug,
      image: activeImage,
      variantName: currentVariant?.name,
      sku: currentVariant?.sku || product.id,
      sizeLabel,
      headingStyle: isCurtain && confirmedHeadingStyles.length > 0 ? activeHeadingStyle : undefined,
      customDimensions,
      quantity,
      unitPrice: effectivePrice,
      productType: product.productType,
    });

    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2600);
  };

  // Buy now handler — dedicated single-product checkout flow
  const handleBuyNow = () => {
    if (isBuyingNow) return;
    setIsBuyingNow(true);

    try {
      const sizeLabel = getResolvedSizeLabel();
      const customDimensions = getResolvedDimensions();

      const buyNowItem = {
        id: `bn-${Date.now()}`,
        productId: product.id,
        variantId: currentVariant?.id || undefined,
        name: product.displayName || product.name,
        slug: product.slug,
        image: activeImage,
        variantName: currentVariant?.name,
        sku: currentVariant?.sku || product.id,
        sizeLabel,
        headingStyle: isCurtain && confirmedHeadingStyles.length > 0 ? activeHeadingStyle : undefined,
        customDimensions,
        quantity,
        unitPrice: effectivePrice,
        totalPrice: effectivePrice * quantity,
        productType: product.productType,
        customizationData: {
          sizeLabel,
          headingStyle: isCurtain && confirmedHeadingStyles.length > 0 ? activeHeadingStyle : undefined,
          customDimensions,
          color: currentVariant?.name,
          productType: product.productType,
        },
      };

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('zaira_buy_now_item', JSON.stringify(buyNowItem));
      }

      setIsCartOpen(false);
      router.push('/checkout?buyNow=1');
    } catch (err) {
      console.error('Buy Now navigation failed:', err);
    } finally {
      setIsBuyingNow(false);
    }
  };

  // Standardized WhatsApp URL
  const whatsappUrl = useMemo(() => {
    const phone = ZAIRA_WHATSAPP_NUMBER;
    const productName = product.displayName || product.name;
    const currentUrl =
      isMounted && typeof window !== 'undefined'
        ? window.location.href
        : `https://zairafurnishing.com/products/${product.slug}`;
    const sizeLabel = getResolvedSizeLabel();

    const messageLines = [
      'ZAIRA FURNISHING — ORDER REQUEST',
      '',
      `Product: ${productName}`,
      `Category: ${product.categoryName}`,
    ];

    if (currentVariant?.name && product.variations && product.variations.length > 1) {
      messageLines.push(`Variant: ${currentVariant.name}`);
    }

    if (sizeLabel) {
      messageLines.push(`Size: ${sizeLabel}`);
    }

    if (isCurtain && confirmedHeadingStyles.length > 0 && activeHeadingStyle) {
      messageLines.push(`Heading Style: ${activeHeadingStyle}`);
    }

    messageLines.push(`Quantity: ${quantity} ${quantityUnit}`);
    messageLines.push(
      `Price: ${product.currency}${effectivePrice.toLocaleString('en-IN')}${pricingUnit ? ` ${pricingUnit}` : ''}`
    );
    if (quantity > 1) {
      messageLines.push(`Estimated Subtotal: ₹${(effectivePrice * quantity).toLocaleString('en-IN')}`);
    }
    messageLines.push(`Product Link: ${currentUrl}`);
    messageLines.push('');
    messageLines.push('Please confirm my order.');

    return `https://wa.me/${phone}?text=${encodeURIComponent(messageLines.join('\n'))}`;
  }, [
    product,
    currentVariant,
    isCurtain,
    confirmedHeadingStyles,
    activeHeadingStyle,
    quantity,
    quantityUnit,
    pricingUnit,
    effectivePrice,
    getResolvedSizeLabel,
    isMounted,
  ]);

  // Submit quote request — Database First, then WhatsApp
  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuoteError(null);
    setQuoteWhatsAppBlocked(false);

    const cleanPhone = quotePhone.replace(/\D/g, '');
    if (!quoteName.trim()) {
      setQuoteError('Please enter your name.');
      return;
    }
    if (cleanPhone.length < 10) {
      setQuoteError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsQuoteSubmitting(true);

    try {
      const sizeLabel = getResolvedSizeLabel();
      const idempotencyKey = `quote_${product.id}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const fullNotes = quoteMessage.trim();

      const res = await fetch('/api/quote-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          variantId: currentVariant?.id,
          customerName: quoteName.trim(),
          phone: cleanPhone,
          email: quoteEmail.trim() || undefined,
          customerNotes: fullNotes || undefined,
          message: fullNotes || undefined,
          dimensions: sizeLabel,
          quantity,
          idempotencyKey,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setQuoteError(data.error || 'Failed to submit quote request. Please try again.');
        setIsQuoteSubmitting(false);
        return;
      }

      const generatedNum = data.quoteRequest?.request_number || data.requestNumber || '';
      setQuoteRequestNumber(generatedNum);

      // Build WhatsApp URL with the actual submitted data and DB reference number
      const waUrl = buildQuoteWhatsAppUrl({
        productName: product.displayName || product.name,
        categoryName: product.categoryName,
        variantName:
          currentVariant?.name && product.variations && product.variations.length > 1
            ? currentVariant.name
            : undefined,
        sizeLabel,
        quantity: `${quantity} ${quantityUnit}`,
        customerName: quoteName.trim(),
        customerPhone: cleanPhone,
        customerEmail: quoteEmail.trim() || undefined,
        requirements: fullNotes || undefined,
        requestReference: generatedNum,
        productUrl: typeof window !== 'undefined' ? window.location.href : undefined,
      });

      setQuoteWhatsAppUrl(waUrl);
      setQuoteSubmitted(true);

      // Attempt to automatically open WhatsApp
      try {
        const win = window.open(waUrl, '_blank', 'noopener,noreferrer');
        if (!win) {
          setQuoteWhatsAppBlocked(true);
        }
      } catch {
        setQuoteWhatsAppBlocked(true);
      }
    } catch (err: any) {
      console.error('Quote request submission error:', err);
      setQuoteError('Network error occurred while submitting your request. Please try again.');
    } finally {
      setIsQuoteSubmitting(false);
    }
  };

  // Submit measurement request — Database First, then WhatsApp
  const handleSubmitMeasurement = async (e: React.FormEvent) => {
    e.preventDefault();
    setMeasError(null);
    setMeasWhatsAppBlocked(false);

    const cleanPhone = measPhone.replace(/\D/g, '');
    if (!measName.trim()) {
      setMeasError('Please enter your name.');
      return;
    }
    if (cleanPhone.length < 10) {
      setMeasError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!measAddress.trim()) {
      setMeasError('Please enter your address or location.');
      return;
    }

    setIsMeasSubmitting(true);

    try {
      const sizeLabel = getResolvedSizeLabel();
      const idempotencyKey = `meas_${product.id}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const dimensionsText = sizeLabel || `Approx ${quantity} ${quantityUnit}`;
      const fullNotes = measNotes.trim();

      const res = await fetch('/api/measurement-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          variantId: currentVariant?.id,
          customerName: measName.trim(),
          phone: cleanPhone,
          email: measEmail.trim() || undefined,
          address: measAddress.trim(),
          preferredDate: measDate,
          preferredTimeSlot: measTimeSlot,
          dimensions: dimensionsText,
          customerNotes: fullNotes || undefined,
          notes: fullNotes || undefined,
          idempotencyKey,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMeasError(data.error || 'Failed to submit measurement request. Please try again.');
        setIsMeasSubmitting(false);
        return;
      }

      const generatedNum = data.measurementRequest?.request_number || data.requestNumber || '';
      setMeasRequestNumber(generatedNum);

      // Build WhatsApp URL with the actual submitted data and DB reference number
      const waUrl = buildMeasurementWhatsAppUrl({
        productName: product.displayName || product.name,
        categoryName: product.categoryName,
        customerName: measName.trim(),
        customerPhone: cleanPhone,
        customerEmail: measEmail.trim() || undefined,
        address: measAddress.trim(),
        preferredDate: measDate || undefined,
        preferredTime: measTimeSlot || undefined,
        requirements: fullNotes || undefined,
        requestReference: generatedNum,
        productUrl: typeof window !== 'undefined' ? window.location.href : undefined,
      });

      setMeasWhatsAppUrl(waUrl);
      setMeasSubmitted(true);

      // Attempt to automatically open WhatsApp
      try {
        const win = window.open(waUrl, '_blank', 'noopener,noreferrer');
        if (!win) {
          setMeasWhatsAppBlocked(true);
        }
      } catch {
        setMeasWhatsAppBlocked(true);
      }
    } catch (err: any) {
      console.error('Measurement request submission error:', err);
      setMeasError('Network error occurred while submitting your request. Please try again.');
    } finally {
      setIsMeasSubmitting(false);
    }
  };

  // Share link handler
  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2400);
    }
  };

  const isFav = isWishlisted(product.id);

  // Specifications strictly from product data
  const careSpec = product.specifications?.find(
    (s) =>
      s.label.toLowerCase().includes('care') ||
      s.label.toLowerCase().includes('maintenance') ||
      s.label.toLowerCase().includes('cleaning')
  );

  const technicalSpecs = useMemo(() => {
    if (!product.specifications) return [];
    return careSpec ? product.specifications.filter((s) => s !== careSpec) : product.specifications;
  }, [product.specifications, careSpec]);

  return (
    <div className="bg-[#FAF7F2] min-h-screen text-[#1C1917] selection:bg-[#9A7B56] selection:text-white pb-24 lg:pb-20">

      {/* ──────────────────────────────────────────────────────────
          1. BREADCRUMB NAVIGATION
         ────────────────────────────────────────────────────────── */}
      <nav aria-label="Breadcrumb" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-3">
        <ol className="flex items-center gap-1.5 text-[11.5px] sm:text-[12px] text-[#8C827A] flex-wrap list-none p-0 m-0 font-normal">
          <li>
            <Link href="/" className="hover:text-[#1C1714] transition-colors">
              Home
            </Link>
          </li>
          <li aria-hidden="true" className="text-[#C4B9A1]">/</li>
          <li>
            <Link href={`/categories/${product.categorySlug}`} className="hover:text-[#1C1714] transition-colors">
              {product.categoryName}
            </Link>
          </li>
          {subcategoryName && subcategoryName.toLowerCase() !== (product.displayName || product.name).toLowerCase() && (
            <>
              <li aria-hidden="true" className="text-[#C4B9A1]">/</li>
              <li>
                {subcategoryUrl ? (
                  <Link href={subcategoryUrl} className="hover:text-[#1C1714] transition-colors">
                    {subcategoryName}
                  </Link>
                ) : (
                  <span>{subcategoryName}</span>
                )}
              </li>
            </>
          )}
          <li aria-hidden="true" className="text-[#C4B9A1]">/</li>
          <li aria-current="page" className="text-[#1C1714] font-medium truncate max-w-[220px] sm:max-w-none">
            {product.displayName || product.name}
          </li>
        </ol>
      </nav>

      {/* ──────────────────────────────────────────────────────────
          2. MAIN PRODUCT HERO SHOWROOM (55% GALLERY / 45% SHOPPING PANEL)
         ────────────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-14 items-start">

          {/* ─── LEFT: DOMINANT SHOWROOM PRODUCT GALLERY (55%) ─── */}
          <div className="lg:col-span-7 lg:sticky lg:top-24">
            <div className="flex flex-col lg:flex-row gap-3.5 sm:gap-4 items-start">

              {/* Thumbnails: Desktop (Vertical Column on Left), Mobile (Horizontal Row Below Main Image) */}
              {galleryImages.length > 1 && (
                <div className="order-2 lg:order-1 flex flex-row lg:flex-col gap-2.5 sm:gap-3 shrink-0 overflow-x-auto lg:overflow-visible w-full lg:w-auto scrollbar-none pb-1 lg:pb-0">
                  {galleryImages.map((img, idx) => {
                    const isSelected = activeImage === img;
                    const labels = ['Main product view', 'Room view perspective', 'Fabric & detail texture'];
                    const ariaLabel = labels[idx] || `View product image ${idx + 1}`;
                    return (
                      <button
                        key={img + idx}
                        type="button"
                        onClick={() => handleThumbnailClick(img)}
                        aria-label={ariaLabel}
                        className={`relative w-[70px] h-[70px] sm:w-[76px] sm:h-[76px] lg:w-[82px] lg:h-[82px] rounded-lg overflow-hidden shrink-0 cursor-pointer transition-all duration-200 bg-[#F4EFE6] ${isSelected
                            ? 'border-2 border-[#2C221E] ring-2 ring-[#2C221E]/20 opacity-100 shadow-2xs'
                            : 'border border-[#E5DEC9] opacity-75 hover:opacity-100 hover:border-[#8C7A6B]'
                          }`}
                      >
                        <Image
                          src={img}
                          alt={getImageAlt(img, `thumbnail ${idx + 1}`)}
                          fill
                          unoptimized={Boolean(img?.startsWith('data:') || img?.startsWith('blob:'))}
                          sizes="(max-width: 640px) 70px, (max-width: 1024px) 76px, 82px"
                          className="object-cover object-center"
                        />
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Main Showroom Image Area (Guaranteed Height, High Aspect Ratio) */}
              <div
                onClick={() => setIsLightboxOpen(true)}
                style={{
                  minHeight: '340px',
                  height: 'clamp(340px, 48vw, 640px)',
                  width: '100%',
                }}
                className="order-1 lg:order-2 relative flex-1 min-w-0 w-full rounded-2xl overflow-hidden bg-[#F4EFE6] border border-[#E8E1D3] cursor-zoom-in group select-none shadow-[0_4px_20px_rgba(28,25,23,0.04)]"
              >
                <Image
                  key={activeImage}
                  src={activeImage}
                  alt={getImageAlt(activeImage)}
                  fill
                  priority
                  unoptimized={Boolean(activeImage?.startsWith('data:') || activeImage?.startsWith('blob:'))}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center transition-transform duration-700 ease-out animate-gallery-fade group-hover:scale-105"
                />

                {/* Showroom Badge in Top-Left (Real Data Only) */}
                <div className="absolute top-3.5 left-3.5 z-10 flex flex-col gap-1.5 pointer-events-none">
                  {product.customMeasurementAvailable ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#2C221E]/90 backdrop-blur-md text-[#FAF7F2] text-[10.5px] uppercase tracking-wider font-semibold shadow-xs border border-white/10">
                      <Ruler className="w-3.5 h-3.5 text-[#E6C687]" />
                      <span>Free Measurement</span>
                    </div>
                  ) : isCustom ? (
                    <div className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-[#FAF7F2] text-[10.5px] uppercase tracking-wider font-medium border border-white/10 w-fit">
                      <span>Custom Made</span>
                    </div>
                  ) : null}
                </div>

                {/* Floating Top-Right Actions */}
                <div className="absolute top-3.5 right-3.5 z-10 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsLightboxOpen(true);
                    }}
                    aria-label="View fullscreen image"
                    className="w-9 h-9 rounded-full bg-white/90 hover:bg-white text-[#57534E] hover:text-[#1C1714] flex items-center justify-center transition-all shadow-xs backdrop-blur-xs border border-white/80 cursor-pointer hover:scale-105 active:scale-95"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(product.id);
                    }}
                    aria-label={isFav ? 'Remove from wishlist' : 'Add to wishlist'}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-xs backdrop-blur-xs cursor-pointer hover:scale-105 active:scale-95 border ${isFav
                      ? 'bg-white text-[#B43D3D] border-rose-200'
                      : 'bg-white/90 hover:bg-white text-[#57534E] hover:text-[#B43D3D] border-white/80'
                      }`}
                  >
                    <Heart
                      className={`w-3.5 h-3.5 transition-colors ${isFav ? 'fill-[#B43D3D] text-[#B43D3D]' : 'text-[#57534E]'
                        }`}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShare();
                    }}
                    aria-label="Share product link"
                    className="w-9 h-9 rounded-full bg-white/90 hover:bg-white text-[#57534E] hover:text-[#1C1714] flex items-center justify-center transition-all shadow-xs backdrop-blur-xs border border-white/80 cursor-pointer hover:scale-105 active:scale-95"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Left / Right Arrow Navigation */}
                {galleryImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrevImage();
                      }}
                      aria-label="Previous image"
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-[#1C1714] shadow-sm flex items-center justify-center transition-opacity opacity-0 group-hover:opacity-100 cursor-pointer backdrop-blur-xs"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNextImage();
                      }}
                      aria-label="Next image"
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-[#1C1714] shadow-sm flex items-center justify-center transition-opacity opacity-0 group-hover:opacity-100 cursor-pointer backdrop-blur-xs"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}

                {/* Image Counter Badge */}
                {galleryImages.length > 1 && (
                  <div className="absolute bottom-3.5 right-3.5 z-10 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-medium tracking-wider pointer-events-none">
                    {currentImgIdx + 1} / {galleryImages.length}
                  </div>
                )}

                {/* Share Toast */}
                {copiedLink && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 px-3.5 py-1.5 rounded-full bg-[#2C221E] text-white text-[11px] font-medium shadow-md">
                    Link copied to clipboard
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ─── RIGHT: PRODUCT INFORMATION & ORDERING PANEL (45%) ─── */}
          <div className="lg:col-span-5 flex flex-col">

            {/* 1. Category Eyebrow */}
            <div className="mb-2">
              <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#9A7B56]">
                {subcategoryName || product.categoryName}
              </span>
            </div>

            {/* 2. Product Name */}
            <h1 className="font-serif text-[28px] sm:text-[32px] lg:text-[36px] font-normal text-[#1C1714] tracking-tight leading-[1.15] mb-2.5">
              {product.displayName || product.name}
            </h1>

            {/* 3. Rating & Review Link */}
            <div className="flex items-center gap-2 mb-3">
              <a
                href="#reviews"
                className="group inline-flex items-center gap-1.5 text-[12.5px] text-[#78716C] hover:text-[#1C1714] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#9A7B56] rounded-xs"
                aria-label={
                  reviewSummary.total > 0
                    ? `Rated ${reviewSummary.averageRating} out of 5 stars based on ${reviewSummary.total} ${reviewSummary.total === 1 ? 'review' : 'reviews'}. Click to jump to customer reviews.`
                    : 'No reviews yet. Click to write the first review.'
                }
              >
                <div className="flex items-center gap-0.5" aria-hidden="true">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const avgNum = reviewSummary.averageRating
                      ? parseFloat(reviewSummary.averageRating)
                      : 0;
                    const isFilled = reviewSummary.total > 0 && star <= Math.round(avgNum);
                    return (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 transition-colors ${isFilled
                            ? 'fill-[#9A7B56] text-[#9A7B56]'
                            : 'text-[#D8D2C4] group-hover:text-[#C4B9A1]'
                          }`}
                      />
                    );
                  })}
                </div>
                {reviewSummary.total > 0 ? (
                  <span className="font-medium text-[#1C1714] group-hover:underline">
                    {reviewSummary.averageRating}{' '}
                    <span className="font-normal text-[#78716C]">
                      ({reviewSummary.total} {reviewSummary.total === 1 ? 'review' : 'reviews'})
                    </span>
                  </span>
                ) : (
                  <span className="text-[#8C827A] group-hover:underline text-[12px]">
                    No reviews yet &bull; Be the first to review
                  </span>
                )}
              </a>
            </div>

            {/* 4. Short Description */}
            {product.shortDescription && (
              <p className="text-[14px] sm:text-[14.5px] text-[#57534E] leading-relaxed mb-4 font-normal">
                {product.shortDescription}
              </p>
            )}

            {/* 5. Real Price Display */}
            <div className="pb-4 mb-5 border-b border-[#EAE4D8]">
              <div className="flex items-baseline gap-2 flex-wrap">
                {product.startingPrice ? (
                  <span className="text-[11.5px] uppercase tracking-wider font-semibold text-[#8C827A]">
                    From
                  </span>
                ) : null}
                <span className="font-serif text-[28px] sm:text-[32px] font-semibold text-[#1C1714] tracking-tight leading-none">
                  {product.currency}{effectivePrice.toLocaleString('en-IN')}
                </span>
                {pricingUnit && (
                  <span className="text-[13.5px] text-[#78716C] font-normal">
                    {pricingUnit}
                  </span>
                )}
                <span className="text-[11.5px] text-[#8C827A] ml-auto">
                  Inclusive of all taxes
                </span>
              </div>

              {quantity > 1 && (
                <div className="mt-2 text-[12px] text-[#78716C]">
                  Estimated Subtotal: <strong className="font-semibold text-[#1C1714] text-[13px]">₹{(effectivePrice * quantity).toLocaleString('en-IN')}</strong> for {quantity} {quantityUnit}
                </div>
              )}
            </div>

            {/* 6. Dynamic Variant Selector */}
            {product.variations && product.variations.length > 1 && (
              <div className="mb-6 pb-5 border-b border-[#EAE4D8]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-[#1C1917]">
                    {variantLabel || 'Select Option'}: <span className="font-normal text-[#57534E]">{currentVariant?.name}</span>
                  </span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {product.variations.map((v, idx) => {
                    const isSelected = selectedVariantIdx === idx;
                    return (
                      <button
                        key={v.id || idx}
                        type="button"
                        onClick={() => handleSelectVariant(idx)}
                        className={`group px-3.5 py-2 rounded-lg text-[13px] font-medium border transition-all flex items-center gap-2 cursor-pointer ${
                          isSelected
                            ? 'border-[#1C1714] bg-[#1C1714] text-white shadow-xs'
                            : 'border-[#D5CCBA] bg-white text-[#44403C] hover:border-[#8C827A] hover:bg-[#FAF7F2]'
                        }`}
                      >
                        {v.colorHex && (
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0 inline-block"
                            style={{ backgroundColor: v.colorHex }}
                          />
                        )}
                        <span>{v.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="flex items-center justify-between mb-6 pb-5 border-b border-[#EAE4D8]">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-[#1C1917]">
                Quantity
              </span>

              <div className="inline-flex items-center border border-[#D5CCBA] rounded-lg bg-white overflow-hidden shadow-2xs">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                  className="w-9 h-9 flex items-center justify-center text-[#57534E] hover:text-[#1C1714] hover:bg-[#FAF7F2] transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-3.5 min-w-[44px] text-center text-[13px] font-semibold text-[#1C1714] select-none">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Increase quantity"
                  className="w-9 h-9 flex items-center justify-center text-[#57534E] hover:text-[#1C1714] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 7. Action Area: Exactly 2 Action Buttons (Production Best Practice) */}
            <div className="space-y-3 mb-6">
              {isCustomAtelier ? (
                <>
                  {/* PRIMARY CTA: BOOK FREE HOME VISIT & MEASUREMENT */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsMeasurementModalOpen(true);
                      setMeasSubmitted(false);
                      setMeasError(null);
                    }}
                    id="cta-book-free-home-visit"
                    className="w-full h-12 rounded-xl font-bold text-[13px] uppercase tracking-wider bg-[#D4AF37] hover:bg-[#E5C378] text-[#1C1714] transition-all duration-200 flex items-center justify-center gap-2.5 shadow-md active:scale-[0.99] cursor-pointer"
                  >
                    <Ruler className="w-4.5 h-4.5 text-[#1C1714]" />
                    <span>Book Free Home Visit &amp; Measurement</span>
                  </button>

                  {/* SECONDARY CTA: INQUIRE / CUSTOMIZE ON WHATSAPP */}
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    id="cta-order-on-whatsapp"
                    className="w-full h-11 rounded-xl font-semibold text-[12px] uppercase tracking-wider bg-[#1C1714] hover:bg-[#2C221E] text-white transition-all duration-200 flex items-center justify-center gap-2.5 shadow-sm active:scale-[0.99] cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 text-[#25D366] fill-[#25D366]" />
                    <span>Inquire / Customize on WhatsApp</span>
                  </a>

                  {/* Helper Shortlist Action */}
                  <div className="text-center pt-0.5">
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      className="text-[11.5px] uppercase tracking-wider font-semibold text-[#823423] hover:text-[#1C1714] hover:underline cursor-pointer transition-colors inline-flex items-center gap-1.5"
                    >
                      {addedNotice ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#15803D]" />
                          <span className="text-[#15803D]">Added to Shortlist</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>+ Shortlist in Bag</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* PRIMARY CTA: DIRECT ORDER ON WHATSAPP */}
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    id="cta-order-on-whatsapp"
                    className="w-full h-12 rounded-xl font-bold text-[13px] uppercase tracking-wider bg-[#1C1714] hover:bg-[#2C221E] text-white transition-all duration-200 flex items-center justify-center gap-2.5 shadow-md active:scale-[0.99] cursor-pointer"
                  >
                    <MessageCircle className="w-4.5 h-4.5 text-[#25D366] fill-[#25D366]" />
                    <span>Order via WhatsApp</span>
                  </a>

                  {/* SECONDARY CTA: ADD TO BAG */}
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    id="cta-add-to-cart"
                    className={`w-full h-11 rounded-xl font-semibold text-[12px] uppercase tracking-wider border transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs ${
                      addedNotice
                        ? 'border-[#15803D] bg-[#15803D]/10 text-[#15803D]'
                        : 'border-[#D5CCBA] text-[#1C1714] bg-white hover:bg-[#FAF7F2]'
                    }`}
                  >
                    {addedNotice ? (
                      <>
                        <Check className="w-4 h-4 stroke-[2.5]" />
                        <span>Added to Bag</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>Add to Bag</span>
                      </>
                    )}
                  </button>
                </>
              )}

              {/* Showroom Experience Trust Line (Replaces bulky button) */}
              <div className="flex items-center justify-between pt-2.5 px-1 text-[12px] text-[#78716C] border-t border-[#EDE8DE]">
                <div className="flex items-center gap-1.5 min-w-0">
                  <MapPin className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
                  <span className="truncate">Experience in person at our Puppalguda Atelier (Alkapur Twp)</span>
                </div>
                <button
                  type="button"
                  onClick={openStoreModal}
                  className="text-[#823423] hover:text-[#1C1714] font-semibold underline underline-offset-2 shrink-0 transition-colors cursor-pointer ml-2"
                >
                  Timings &amp; Directions →
                </button>
              </div>
            </div>

            {/* SHORT SIDEBAR: WHY SHOP FROM ZAIRA */}
            <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#EDE8DE] shadow-2xs space-y-3 mb-6">
              <h3 className="text-[12px] font-bold uppercase tracking-wider text-[#1C1714] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                Why Shop From Zaira?
              </h3>
              <div className="space-y-3 text-[12px]">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#FAF4E7] border border-[#E8D5A0] text-[#9E4733] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <ShieldCheck className="w-4 h-4 text-[#9E4733] stroke-[2]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#1C1917] leading-tight text-[12.5px]">100% Premium Quality</p>
                    <p className="text-[11.5px] text-[#78716C] leading-snug mt-0.5">Handpicked luxury fabrics &amp; high-density weaves.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#FAF4E7] border border-[#E8D5A0] text-[#9E4733] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Ruler className="w-4 h-4 text-[#9E4733] stroke-[2]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#1C1917] leading-tight text-[12.5px]">Free Home Visit &amp; Measurement</p>
                    <p className="text-[11.5px] text-[#78716C] leading-snug mt-0.5">Stylist brings 500+ swatches &amp; takes laser dimensions.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#FAF4E7] border border-[#E8D5A0] text-[#9E4733] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Scissors className="w-4 h-4 text-[#9E4733] stroke-[2]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#1C1917] leading-tight text-[12.5px]">Expert Tailoring &amp; Free Installation</p>
                    <p className="text-[11.5px] text-[#78716C] leading-snug mt-0.5">Precision custom stitching with 5-year warranty.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 8. Product Details & Specifications */}
            <div className="mt-4 pt-6 border-t border-[#EAE4D8] space-y-6">
              {technicalSpecs.length > 0 && (
                <div>
                  <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#1C1917] mb-3">
                    Product Details
                  </h2>
                  <div className="divide-y divide-[#EAE4D8] border-y border-[#EAE4D8]">
                    {technicalSpecs.map((s) => (
                      <div key={s.label} className="py-2.5 flex justify-between items-baseline gap-4">
                        <span className="text-[12px] text-[#78716C] font-normal shrink-0">{s.label}</span>
                        <span className="text-[12.5px] text-[#1C1714] font-medium text-right">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {product.description && (
                <div>
                  <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#1C1917] mb-2">
                    About this Product
                  </h2>
                  <p className="text-[13px] text-[#57534E] leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {careSpec && (
                <div className="pt-1">
                  <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#1C1917] mb-1">
                    Care &amp; Maintenance
                  </h2>
                  <p className="text-[12.5px] text-[#57534E] leading-relaxed">
                    {careSpec.value}
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ──────────────────────────────────────────────────────────
            9C. CUSTOMER REVIEWS
           ────────────────────────────────────────────────────────── */}
        <ProductCustomerReviews
          key={product.id || product.slug}
          productId={product.id}
          productSlug={product.slug}
          productName={product.displayName || product.name}
          initialReviews={initialReviews}
          initialSummary={initialReviewSummary}
          onSummaryChange={setReviewSummary}
        />

        {/* ──────────────────────────────────────────────────────────
            10. RELATED PRODUCTS ("COMPLETE THE LOOK")
           ────────────────────────────────────────────────────────── */}
        {relatedProducts.length > 0 && (
          <section className="mt-14 sm:mt-18 pt-8 border-t border-[#EAE4D8]">
            <div className="flex items-baseline justify-between mb-6">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#9A7B56] font-semibold block mb-1">
                  Curated Collection
                </span>
                <h2 className="font-serif text-[22px] sm:text-[26px] text-[#1C1714] font-medium">
                  Complete the Look
                </h2>
              </div>
              {subcategoryUrl && (
                <Link
                  href={subcategoryUrl}
                  className="text-[11.5px] uppercase tracking-wider font-semibold text-[#1C1714] hover:text-[#9A7B56] transition-colors inline-flex items-center gap-1"
                >
                  <span>View All {subcategoryName}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.slice(0, 4).map((item) => (
                <div key={item.id} className="h-full">
                  <ProductCard product={item} />
                </div>
              ))}
            </div>
          </section>
        )}

      </main>

      {/* ──────────────────────────────────────────────────────────
          11. MOBILE STICKY PURCHASE BAR (WHATSAPP-FIRST)
         ────────────────────────────────────────────────────────── */}
      <div
        style={{ paddingBottom: 'max(0.6rem, env(safe-area-inset-bottom, 0px))' }}
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#FAF8F5]/95 backdrop-blur-xl border-t border-[#EAE4D8] px-4 py-2.5 shadow-[0_-6px_24px_rgba(28,23,20,0.08)] flex items-center justify-between gap-3"
      >
        <div className="min-w-0 flex-1">
          <span className="block text-[10px] text-[#8C827A] uppercase tracking-wider font-semibold truncate">
            {product.displayName || product.name}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="font-serif text-[18px] font-bold text-[#1C1714]">
              {product.currency}{effectivePrice.toLocaleString('en-IN')}
            </span>
            {pricingUnit && (
              <span className="text-[11px] text-[#78716C] font-medium">{pricingUnit}</span>
            )}
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          {isCustomAtelier ? (
            <>
              <button
                type="button"
                onClick={() => openBookingModal(`Free Measurement — ${product.displayName || product.name}`)}
                className="h-10 px-3.5 rounded-xl font-bold text-[11px] uppercase tracking-wider bg-[#D4AF37] text-[#1C1714] hover:bg-[#E5C378] shadow-sm flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
              >
                <Ruler className="w-3.5 h-3.5 text-[#1C1714]" />
                <span>Book Visit</span>
              </button>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-xl bg-[#25D366] text-white hover:bg-[#20BA5C] shadow-sm flex items-center justify-center active:scale-95 transition-all shrink-0"
                title="Chat on WhatsApp"
                aria-label="Order on WhatsApp"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
              </a>
            </>
          ) : (
            <>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 px-3.5 rounded-xl font-bold text-[11px] uppercase tracking-wider bg-[#1C1714] text-white hover:bg-[#2C221E] shadow-sm flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-[#25D366] text-[#25D366]" />
                <span>Order</span>
              </a>
              <button
                type="button"
                onClick={handleAddToCart}
                aria-label="Add to Bag"
                className={`h-10 w-10 rounded-xl border flex items-center justify-center active:scale-95 transition-all cursor-pointer ${
                  addedNotice
                    ? 'border-[#15803D] bg-[#15803D]/10 text-[#15803D]'
                    : 'border-[#D5CCBA] bg-white text-[#1C1714]'
                }`}
              >
                {addedNotice ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
              </button>
            </>
          )}
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          12. FULLSCREEN IMAGE LIGHTBOX MODAL
         ────────────────────────────────────────────────────────── */}
      {isLightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image Lightbox"
          className="fixed inset-0 z-50 bg-black/92 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div
            className="relative max-w-4xl max-h-[85vh] w-full h-full flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              aria-label="Close fullscreen view"
              className="absolute top-2 right-2 z-10 p-2.5 text-white/80 hover:text-white bg-black/40 hover:bg-black/60 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            {galleryImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  aria-label="Previous image"
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  aria-label="Next image"
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            <div className="relative w-full h-[75vh] flex items-center justify-center">
              <Image
                src={activeImage}
                alt={getImageAlt(activeImage)}
                fill
                sizes="90vw"
                className="object-contain"
              />
            </div>

            {galleryImages.length > 1 && (
              <div className="mt-3 text-white/70 text-[12px] font-medium tracking-wider">
                {currentImgIdx + 1} / {galleryImages.length}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          13. REQUEST A QUOTE MODAL (CUSTOM PRODUCTS)
         ────────────────────────────────────────────────────────── */}
      {isQuoteModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Request a Customized Quote"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-lg bg-[#FAF7F2] rounded-2xl border border-[#EDE8DE] shadow-2xl p-5 sm:p-7 overflow-y-auto max-h-[92vh] text-[#1C1917]">
            <button
              type="button"
              onClick={() => {
                setIsQuoteModalOpen(false);
                setQuoteSubmitted(false);
                setQuoteError(null);
              }}
              className="absolute top-4 right-4 p-2 text-[#78716C] hover:text-[#1C1917] rounded-full hover:bg-black/5 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {!quoteSubmitted ? (
              <>
                <div className="mb-5 pr-6">
                  <h3 className="font-serif text-[21px] font-medium text-[#1C1714]">
                    Request a Quote
                  </h3>
                  <p className="text-[12.5px] text-[#78716C] mt-1 leading-relaxed">
                    Provide your contact details below and our team will prepare a quotation for you.
                  </p>
                </div>

                {/* Summary Card */}
                <div className="p-3 rounded-xl bg-white border border-[#EAE3D5] mb-5 flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-[#F4EFE6]">
                    <Image
                      src={activeImage}
                      alt={getImageAlt(activeImage)}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <span className="block font-medium text-[13px] text-[#1C1714] truncate">
                      {product.displayName || product.name}
                    </span>
                    <span className="block text-[11px] text-[#78716C]">
                      Qty: {quantity} {quantityUnit} • {getResolvedSizeLabel()}
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSubmitQuote} className="space-y-3.5">
                  {quoteError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[12px] flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{quoteError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-medium text-[#44403C] uppercase tracking-wider mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C827A]" />
                      <input
                        type="text"
                        required
                        value={quoteName}
                        onChange={(e) => setQuoteName(e.target.value)}
                        placeholder="Your full name"
                        className="w-full h-10 pl-9 pr-3 rounded-xl border border-[#D5CCBA] focus:border-[#9A7B56] bg-white text-[12.5px] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-[#44403C] uppercase tracking-wider mb-1">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C827A]" />
                        <input
                          type="tel"
                          required
                          value={quotePhone}
                          onChange={(e) => setQuotePhone(e.target.value)}
                          placeholder="10-digit phone number"
                          className="w-full h-10 pl-9 pr-3 rounded-xl border border-[#D5CCBA] focus:border-[#9A7B56] bg-white text-[12.5px] outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-[#44403C] uppercase tracking-wider mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C827A]" />
                        <input
                          type="email"
                          value={quoteEmail}
                          onChange={(e) => setQuoteEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="w-full h-10 pl-9 pr-3 rounded-xl border border-[#D5CCBA] focus:border-[#9A7B56] bg-white text-[12.5px] outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#44403C] uppercase tracking-wider mb-1">
                      Notes / Requirements
                    </label>
                    <textarea
                      rows={3}
                      value={quoteMessage}
                      onChange={(e) => setQuoteMessage(e.target.value)}
                      placeholder="Specify dimensions, room type, or specific requirements..."
                      className="w-full p-3 rounded-xl border border-[#D5CCBA] focus:border-[#9A7B56] bg-white text-[12.5px] outline-none resize-none"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isQuoteSubmitting}
                      className="w-full h-11 rounded-xl bg-[#1C1714] hover:bg-[#2C221E] text-white text-[12px] uppercase tracking-wider font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                    >
                      {isQuoteSubmitting ? (
                        <span>Submitting Request...</span>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5 text-[#E6C687]" />
                          <span>Submit Quote Request</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="text-center py-6 animate-in fade-in duration-200">
                <div className="w-12 h-12 rounded-full bg-[#FAF2DD] text-[#9A7B56] border border-[#E8D5A0] flex items-center justify-center mx-auto mb-3">
                  <Check className="w-6 h-6 stroke-[2.5]" />
                </div>
                <h3 className="font-serif text-[22px] font-medium text-[#1C1714] mb-1">
                  Quote Request Received
                </h3>
                <p className="text-[13px] text-[#57534E] mb-1.5 font-medium">
                  Your request has been submitted successfully.
                </p>
                {quoteRequestNumber && (
                  <p className="text-[12px] text-[#8C827A] mb-2">
                    Request Reference: <strong className="font-mono text-[#1C1714]">{quoteRequestNumber}</strong>
                  </p>
                )}
                <p className="text-[12px] text-[#78716C] mb-5">
                  {quoteWhatsAppBlocked
                    ? 'Your request was saved. Please click below to open WhatsApp.'
                    : 'Opening WhatsApp to confirm your requirement...'}
                </p>

                <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
                  <a
                    href={quoteWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-10 px-5 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-white text-[11.5px] font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Continue on WhatsApp</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setIsQuoteModalOpen(false);
                      setQuoteSubmitted(false);
                    }}
                    className="h-10 px-5 rounded-xl border border-[#D5CCBA] text-[#1C1714] hover:bg-[#FAF7F2] text-[11.5px] font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          14. BOOK FREE MEASUREMENT MODAL (ONLY IF AVAILABLE)
         ────────────────────────────────────────────────────────── */}
      {isMeasurementModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Book Free Measurement Visit"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-lg bg-[#FAF7F2] rounded-2xl border border-[#EDE8DE] shadow-2xl p-5 sm:p-7 overflow-y-auto max-h-[92vh] text-[#1C1917]">
            <button
              type="button"
              onClick={() => {
                setIsMeasurementModalOpen(false);
                setMeasSubmitted(false);
                setMeasError(null);
              }}
              className="absolute top-4 right-4 p-2 text-[#78716C] hover:text-[#1C1917] rounded-full hover:bg-black/5 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {!measSubmitted ? (
              <>
                <div className="mb-5 pr-6">
                  <h3 className="font-serif text-[21px] font-medium text-[#1C1714]">
                    Book Free Measurement
                  </h3>
                  <p className="text-[12.5px] text-[#78716C] mt-1 leading-relaxed">
                    Schedule an in-home visit from our measurement specialist.
                  </p>
                </div>

                <form onSubmit={handleSubmitMeasurement} className="space-y-3.5">
                  {measError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[12px] flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{measError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-medium text-[#44403C] uppercase tracking-wider mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C827A]" />
                      <input
                        type="text"
                        required
                        value={measName}
                        onChange={(e) => setMeasName(e.target.value)}
                        placeholder="Your full name"
                        className="w-full h-10 pl-9 pr-3 rounded-xl border border-[#D5CCBA] focus:border-[#9A7B56] bg-white text-[12.5px] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-[#44403C] uppercase tracking-wider mb-1">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C827A]" />
                        <input
                          type="tel"
                          required
                          value={measPhone}
                          onChange={(e) => setMeasPhone(e.target.value)}
                          placeholder="10-digit phone number"
                          className="w-full h-10 pl-9 pr-3 rounded-xl border border-[#D5CCBA] focus:border-[#9A7B56] bg-white text-[12.5px] outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-[#44403C] uppercase tracking-wider mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C827A]" />
                        <input
                          type="email"
                          value={measEmail}
                          onChange={(e) => setMeasEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="w-full h-10 pl-9 pr-3 rounded-xl border border-[#D5CCBA] focus:border-[#9A7B56] bg-white text-[12.5px] outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#44403C] uppercase tracking-wider mb-1">
                      Address / Location *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-[#8C827A]" />
                      <textarea
                        required
                        rows={2}
                        value={measAddress}
                        onChange={(e) => setMeasAddress(e.target.value)}
                        placeholder="Your residential address or locality"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#D5CCBA] focus:border-[#9A7B56] bg-white text-[12.5px] outline-none resize-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-[#44403C] uppercase tracking-wider mb-1">
                        Preferred Date
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C827A]" />
                        <input
                          type="date"
                          value={measDate}
                          onChange={(e) => setMeasDate(e.target.value)}
                          className="w-full h-10 pl-9 pr-3 rounded-xl border border-[#D5CCBA] focus:border-[#9A7B56] bg-white text-[12.5px] outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-[#44403C] uppercase tracking-wider mb-1">
                        Preferred Time
                      </label>
                      <select
                        value={measTimeSlot}
                        onChange={(e) => setMeasTimeSlot(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl border border-[#D5CCBA] focus:border-[#9A7B56] bg-white text-[12.5px] outline-none cursor-pointer"
                      >
                        <option value="Morning (10:00 AM – 1:00 PM)">Morning (10:00 AM – 1:00 PM)</option>
                        <option value="Afternoon (1:00 PM – 4:00 PM)">Afternoon (1:00 PM – 4:00 PM)</option>
                        <option value="Evening (4:00 PM – 7:00 PM)">Evening (4:00 PM – 7:00 PM)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#44403C] uppercase tracking-wider mb-1">
                      Notes
                    </label>
                    <textarea
                      rows={2}
                      value={measNotes}
                      onChange={(e) => setMeasNotes(e.target.value)}
                      placeholder="Any specific instructions for our specialist..."
                      className="w-full p-3 rounded-xl border border-[#D5CCBA] focus:border-[#9A7B56] bg-white text-[12.5px] outline-none resize-none"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isMeasSubmitting}
                      className="w-full h-11 rounded-xl bg-[#1C1714] hover:bg-[#2C221E] text-white text-[12px] uppercase tracking-wider font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                    >
                      {isMeasSubmitting ? (
                        <span>Submitting Request...</span>
                      ) : (
                        <>
                          <Ruler className="w-3.5 h-3.5 text-[#E6C687]" />
                          <span>Confirm Measurement Visit</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="text-center py-6 animate-in fade-in duration-200">
                <div className="w-12 h-12 rounded-full bg-[#FAF2DD] text-[#9A7B56] border border-[#E8D5A0] flex items-center justify-center mx-auto mb-3">
                  <Check className="w-6 h-6 stroke-[2.5]" />
                </div>
                <h3 className="font-serif text-[22px] font-medium text-[#1C1714] mb-1">
                  Measurement Visit Scheduled
                </h3>
                <p className="text-[13px] text-[#57534E] mb-1.5 font-medium">
                  Your request has been submitted successfully.
                </p>
                {measRequestNumber && (
                  <p className="text-[12px] text-[#8C827A] mb-2">
                    Appointment Reference: <strong className="font-mono text-[#1C1714]">{measRequestNumber}</strong>
                  </p>
                )}
                <p className="text-[12px] text-[#78716C] mb-5">
                  {measWhatsAppBlocked
                    ? 'Your appointment is recorded. Please click below to open WhatsApp.'
                    : 'Opening WhatsApp to confirm your appointment visit...'}
                </p>

                <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
                  <a
                    href={measWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-10 px-5 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-white text-[11.5px] font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Continue on WhatsApp</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMeasurementModalOpen(false);
                      setMeasSubmitted(false);
                    }}
                    className="h-10 px-5 rounded-xl border border-[#D5CCBA] text-[#2C221E] hover:bg-[#FAF7F2] text-[11.5px] font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

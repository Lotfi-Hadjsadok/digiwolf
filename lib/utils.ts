import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extracts phone/device model from user agent string
 */
export function getPhoneModel(userAgent: string | null | undefined): string | null {
  if (!userAgent) return null;

  const ua = userAgent.toLowerCase();

  // iPhone models
  if (ua.includes('iphone')) {
    // Try to extract iPhone model (e.g., iPhone 14 Pro, iPhone 15)
    const iphoneMatch = userAgent.match(/iPhone(?:\s+OS\s+[\d_]+)?/i);
    if (iphoneMatch) {
      // Check for specific iPhone models in user agent
      if (ua.includes('iphone15')) return 'iPhone 15';
      if (ua.includes('iphone14')) return 'iPhone 14';
      if (ua.includes('iphone13')) return 'iPhone 13';
      if (ua.includes('iphone12')) return 'iPhone 12';
      if (ua.includes('iphone11')) return 'iPhone 11';
      return 'iPhone';
    }
  }

  // iPad models
  if (ua.includes('ipad')) {
    const ipadMatch = userAgent.match(/iPad/i);
    if (ipadMatch) {
      if (ua.includes('ipad pro')) return 'iPad Pro';
      if (ua.includes('ipad air')) return 'iPad Air';
      if (ua.includes('ipad mini')) return 'iPad Mini';
      return 'iPad';
    }
  }

  // Android devices - extract model from user agent
  if (ua.includes('android')) {
    // Common pattern: "Android ...; ... Build/..." followed by device model
    // Try to extract device model (e.g., SM-G991B for Samsung Galaxy S21)
    const androidModelMatch = userAgent.match(/Android\s+[\d.]+;\s*([^)]+)\)/i);
    if (androidModelMatch && androidModelMatch[1]) {
      const deviceInfo = androidModelMatch[1];
      
      // Try to extract brand and model
      const brandModelMatch = deviceInfo.match(/([A-Za-z]+)\s+([A-Z0-9-]+)/);
      if (brandModelMatch) {
        const brand = brandModelMatch[1];
        const model = brandModelMatch[2];
        
        // Common brands
        if (brand.toLowerCase().includes('samsung')) {
          return `Samsung ${model}`;
        }
        if (brand.toLowerCase().includes('xiaomi')) {
          return `Xiaomi ${model}`;
        }
        if (brand.toLowerCase().includes('huawei')) {
          return `Huawei ${model}`;
        }
        if (brand.toLowerCase().includes('oneplus')) {
          return `OnePlus ${model}`;
        }
        if (brand.toLowerCase().includes('google')) {
          return `Google ${model}`;
        }
        
        return `${brand} ${model}`;
      }
      
      // If no brand found, return the device info as is
      return deviceInfo.split(';')[0].trim();
    }
    
    // Fallback for Android
    return 'Android Device';
  }

  // Desktop browsers - return null as they're not phones
  if (ua.includes('windows') || ua.includes('macintosh') || ua.includes('linux')) {
    return null;
  }

  return null;
}


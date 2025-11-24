'use client';

import * as React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Locale, locales } from '@/lib/i18n';
import { useRouter, usePathname } from 'next/navigation';

const languageFlags: Record<Locale, string> = {
  en: '🇺🇸',
  fr: '🇫🇷',
  ar: '🇩🇿',
};

const languageNames: Record<Locale, string> = {
  en: 'English',
  fr: 'Français',
  ar: 'العربية',
};

export function LanguageSwitcher({ currentLocale }: { currentLocale: Locale }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (locale: Locale) => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length > 0 && locales.includes(segments[0] as Locale)) {
      segments[0] = locale;
    } else {
      segments.unshift(locale);
    }
    const newPath = '/' + segments.join('/');
    router.push(newPath);
  };

  return (
    <Select   value={currentLocale} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-auto px-2">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className='min-w-fit'>
        {locales.map((locale) => (
          <SelectItem key={locale} value={locale} className="focus:bg-muted/50 hover:bg-muted/50">
            <span className="text-xl">{languageFlags[locale]}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}


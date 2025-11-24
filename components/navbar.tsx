'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from './language-switcher';
import { ContactForm } from './contact-form';
import { Locale, getTranslations } from '@/lib/i18n';
import { Menu, X } from 'lucide-react';

export function Navbar({ locale }: { locale: Locale }) {
  const t = getTranslations(locale);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-accent/20 relative">
      {/* Subtle gradient accent at bottom border */}
      <div className="absolute bottom-0 left-0 right-0 h-px gradient-accent opacity-30" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <a 
              href={`/${locale}#home`} 
              className="flex items-center gap-2 group transition-opacity duration-300 hover:opacity-80"
            >
              <h1 className="text-2xl font-bold bg-gradient-to-r from-accent via-[#e89d3d] to-accent bg-clip-text text-transparent animate-gradient-shift inline-block">
                Digiwolf
              </h1>
            </a>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <a
              href={`/${locale}#home`}
              className="text-foreground hover:text-accent hover:bg-accent/10 transition-all duration-300 px-3 py-2 rounded-md relative group"
            >
              {t.nav.home}
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </a>
            <a
              href={`/${locale}#services`}
              className="text-foreground hover:text-accent hover:bg-accent/10 transition-all duration-300 px-3 py-2 rounded-md relative group"
            >
              {t.nav.services}
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </a>
            <a
              href={`/${locale}#about`}
              className="text-foreground hover:text-accent hover:bg-accent/10 transition-all duration-300 px-3 py-2 rounded-md relative group"
            >
              {t.nav.about}
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </a>
            <ContactForm
              locale={locale}
              trigger={
                <button className="text-foreground hover:text-accent hover:bg-accent/10 transition-all duration-300 px-3 py-2 rounded-md relative group">
              {t.nav.contact}
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                </button>
              }
            />
            <LanguageSwitcher currentLocale={locale} />
          </div>

          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            <a
              href={`/${locale}#home`}
              className="block text-foreground hover:text-accent hover:bg-accent/10 transition-all duration-300 px-3 py-2 rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t.nav.home}
            </a>
            <a
              href={`/${locale}#services`}
              className="block text-foreground hover:text-accent hover:bg-accent/10 transition-all duration-300 px-3 py-2 rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t.nav.services}
            </a>
            <a
              href={`/${locale}#about`}
              className="block text-foreground hover:text-accent hover:bg-accent/10 transition-all duration-300 px-3 py-2 rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t.nav.about}
            </a>
            <div onClick={() => setMobileMenuOpen(false)}>
              <ContactForm
                locale={locale}
                trigger={
                  <button className="block w-full text-left text-foreground hover:text-accent hover:bg-accent/10 transition-all duration-300 px-3 py-2 rounded-md">
              {t.nav.contact}
                  </button>
                }
              />
            </div>
            <div className="pt-4">
              <LanguageSwitcher currentLocale={locale} />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}


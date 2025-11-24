'use client';

import * as React from 'react';
import { Locale, getTranslations } from '@/lib/i18n';
import { Mail, Phone, MapPin, Facebook, Instagram, Sparkles } from 'lucide-react';

export function Footer({ locale }: { locale: Locale }) {
  const t = getTranslations(locale);
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { Icon: Facebook, href: 'https://www.facebook.com/share/1Mtev5n2Yh/?mibextid=wwXIfr', label: 'Facebook' },
    { Icon: Instagram, href: 'https://www.instagram.com/digiwolfdz?igsh=b3JlN2Y3c2J6dDl4&utm_source=qr', label: 'Instagram' },
  ];

  const contactInfo = [
    { Icon: Mail, text: 'digiwolfdz@gmail.com', href: 'mailto:digiwolfdz@gmail.com' },
    { Icon: Phone, text: '+213553397543', href: 'https://wa.me/213553397543' },
    { Icon: MapPin, text: 'Algiers / Bab ezzouar' },
  ];

  return (
    <footer className="bg-secondary py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Gradient border at top */}
      <div className="absolute top-0 left-0 right-0 h-[1px] gradient-accent" />
      <div className="absolute inset-0 gradient-accent-radial opacity-10" />

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand Section */}
          <div>
            <div className="mb-4">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-accent via-[#e89d3d] to-accent bg-clip-text text-transparent animate-gradient-shift inline-block">
                Digiwolf
              </h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Transforming businesses through innovative digital solutions.
            </p>
            {/* Social Links */}
            <div className="flex gap-4">
              {socialLinks.map(({ Icon, href, label }, index) => (
                <a
                  key={index}
                  href={href}
                  aria-label={label}
                  className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-muted-foreground hover:text-accent hover:bg-accent/20 transition-all duration-300 hover-lift icon-glow"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-4">Quick Links</h4>
            <div className="flex flex-col gap-3 text-sm">
              <a
                href={`/${locale}#services`}
                className="text-muted-foreground hover:text-accent transition-colors flex items-center gap-2 group"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-accent/0 group-hover:bg-accent transition-colors duration-300" />
                {t.nav.services}
              </a>
              <a
                href={`/${locale}#about`}
                className="text-muted-foreground hover:text-accent transition-colors flex items-center gap-2 group"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-accent/0 group-hover:bg-accent transition-colors duration-300" />
                {t.nav.about}
              </a>
              <a
                href={`/${locale}#contact`}
                className="text-muted-foreground hover:text-accent transition-colors flex items-center gap-2 group"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-accent/0 group-hover:bg-accent transition-colors duration-300" />
                {t.nav.contact}
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-4">Contact</h4>
            <div className="flex flex-col gap-3 text-sm">
              {contactInfo.map(({ Icon, text, href }, index) => {
                const content = (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-accent" />
                    </div>
                    <span>{text}</span>
                  </div>
                );

                return href ? (
                  <a
                    key={index}
                    href={href}
                    target={href.startsWith('http') ? '_blank' : undefined}
                    rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="hover:text-accent transition-colors"
                  >
                    {content}
                  </a>
                ) : (
                  <div key={index}>{content}</div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} DigiWolf. {t.footer.rights}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Made with</span>
            <Sparkles className="w-4 h-4 text-accent icon-glow animate-pulse-glow" />
            <span>by DigiWolf</span>
          </div>
        </div>
      </div>
    </footer>
  );
}


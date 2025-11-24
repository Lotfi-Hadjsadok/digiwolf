'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { ContactForm } from './contact-form';
import { Locale, getTranslations } from '@/lib/i18n';
import { gsap } from 'gsap';
import { useEffect, useRef } from 'react';
import { useInView } from '@/hooks/use-in-view';
import { Mail, ArrowRight, Sparkles } from 'lucide-react';

export function CTASection({ locale }: { locale: Locale }) {
  const t = getTranslations(locale);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, rootMargin: '-100px' });

  useEffect(() => {
    if (!isInView || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(sectionRef.current?.querySelector('h2') || null, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power3.out',
      });

      gsap.from(sectionRef.current?.querySelector('p') || null, {
        opacity: 0,
        y: 20,
        duration: 0.8,
        delay: 0.2,
        ease: 'power3.out',
      });

      gsap.from(sectionRef.current?.querySelector('button') || null, {
        opacity: 0,
        scale: 0.9,
        duration: 0.8,
        delay: 0.4,
        ease: 'back.out(1.7)',
      });

      // Animate floating icons
      const icons = sectionRef.current?.querySelectorAll('.floating-icon') || [];
      gsap.from(icons, {
        opacity: 0,
        scale: 0,
        duration: 1,
        delay: 0.6,
        stagger: 0.1,
        ease: 'back.out(1.7)',
      });

      Array.from(icons).forEach((icon, index) => {
        gsap.to(icon, {
          y: `+=${15 + index * 3}`,
          rotation: `+=${5 + index * 2}`,
          duration: 2.5 + index * 0.3,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: index * 0.15,
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [isInView]);

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden gradient-accent text-primary-foreground"
    >
      {/* Animated gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
      
      {/* Floating decorative icons */}
      <Mail className="floating-icon absolute top-20 left-10 w-8 h-8 text-white/20 icon-glow hidden md:block" />
      <Sparkles className="floating-icon absolute top-40 right-20 w-10 h-10 text-white/20 icon-glow hidden md:block" />
      <Mail className="floating-icon absolute bottom-20 right-10 w-8 h-8 text-white/20 icon-glow hidden md:block" />

      <div className="container mx-auto max-w-4xl text-center px-4 relative z-10">
        <div className="inline-flex items-center justify-center mb-4">
          <Mail className="w-10 h-10 text-white icon-glow animate-pulse-glow" />
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
          {t.cta.title}
        </h2>
        <p className="text-base sm:text-lg md:text-xl mb-8 opacity-90">
          {t.cta.subtitle}
        </p>
        <ContactForm
          locale={locale}
          trigger={
            <Button 
              size="lg" 
              variant="secondary" 
              className="text-base px-8 py-6 hover-lift group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                {t.cta.button}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
              <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </Button>
          }
        />
      </div>
    </section>
  );
}


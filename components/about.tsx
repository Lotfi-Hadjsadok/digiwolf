'use client';

import * as React from 'react';
import { Locale, getTranslations } from '@/lib/i18n';
import { gsap } from 'gsap';
import { useEffect, useRef } from 'react';
import { useInView } from '@/hooks/use-in-view';
import { Target, Users, TrendingUp } from 'lucide-react';

export function About({ locale }: { locale: Locale }) {
  const t = getTranslations(locale);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, rootMargin: '-100px' });

  useEffect(() => {
    if (!isInView || !sectionRef.current) return;

    const cards = sectionRef.current.querySelectorAll('.about-card');
    gsap.from(cards, {
      opacity: 0,
      x: -30,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power3.out',
    });
  }, [isInView]);

  const values = [
    {
      icon: Target,
      title: 'Focused Results',
      description: 'We deliver measurable outcomes that drive your business forward.',
    },
    {
      icon: Users,
      title: 'Expert Team',
      description: 'Our experienced professionals bring years of industry expertise.',
    },
    {
      icon: TrendingUp,
      title: 'Growth Driven',
      description: 'We help businesses scale and achieve sustainable growth.',
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="about"
      className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary relative overflow-hidden"
    >
      {/* Gradient background effects */}
      <div className="absolute top-0 left-0 w-full h-1/2 gradient-accent-subtle opacity-30" />
      <div className="absolute inset-0 gradient-mesh opacity-20" />

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="text-center mb-16 px-4">
          <div className="inline-flex items-center justify-center mb-4">
            <Target className="w-8 h-8 text-accent icon-glow animate-pulse-glow" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-foreground">
            {t.nav.about}
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            DigiWolf is a leading digital agency specializing in transforming businesses through innovative digital solutions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <div
                key={index}
                className="about-card p-8 rounded-lg border border-accent/20 bg-card/80 backdrop-blur-sm text-center hover-lift relative overflow-hidden group"
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 gradient-accent-subtle opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:bg-accent/20 transition-all duration-300 relative">
                    <div className="absolute inset-0 bg-accent/30 rounded-full blur-lg opacity-0 group-hover:opacity-100 animate-pulse-glow transition-opacity duration-300" />
                    <Icon className="w-8 h-8 text-accent icon-glow relative z-10 group-hover:rotate-12 transition-transform duration-300" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-card-foreground group-hover:text-accent transition-colors duration-300">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {value.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}


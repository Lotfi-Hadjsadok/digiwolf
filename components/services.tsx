'use client';

import * as React from 'react';
import { Locale, getTranslations } from '@/lib/i18n';
import { useEffect, useRef, useState } from 'react';
import { useInView } from '@/hooks/use-in-view';
import { Megaphone, Code, Sparkles } from 'lucide-react';

export function Services({ locale }: { locale: Locale }) {
  const t = getTranslations(locale);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, rootMargin: '-50px' });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isInView) {
      setIsVisible(true);
    }
  }, [isInView]);

  const services = [
    {
      icon: Megaphone,
      title: t.services.mediaBuying.title,
      description: t.services.mediaBuying.description,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      icon: Code,
      title: t.services.webDevelopment.title,
      description: t.services.webDevelopment.description,
      features: [
        t.services.webDevelopment.ecommerce,
        t.services.webDevelopment.aiAutomations,
        t.services.webDevelopment.customSolutions,
      ],
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      icon: Sparkles,
      title: t.services.marketing.title,
      description: t.services.marketing.description,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="services"
      className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden gradient-accent-subtle"
    >
      {/* Background gradient effects */}
      <div className="absolute top-0 right-0 w-1/2 h-full gradient-accent-radial opacity-50" />
      <div className="absolute bottom-0 left-0 w-1/2 h-full gradient-accent-radial opacity-50" />

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="text-center mb-16 px-4">
          <div className="inline-flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-accent icon-glow animate-pulse-glow" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-foreground">
            {t.services.title}
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            {t.services.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={`service-${service.title}-${index}`}
                className={`service-card p-8 rounded-lg border border-accent/20 bg-card/80 backdrop-blur-sm hover-lift relative overflow-hidden group w-full max-w-md md:max-w-none ${
                  isVisible 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-8'
                }`}
                style={{
                  transitionDelay: isVisible ? `${index * 100}ms` : '0ms',
                }}
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 gradient-accent-subtle opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Animated border gradient */}
                <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-accent/0 via-accent/50 to-accent/0 animate-shimmer" />
                </div>

                <div className="relative z-10">
                  <div className={`${service.bgColor} w-16 h-16 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 relative`}>
                    <div className="absolute inset-0 bg-accent/20 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <Icon className={`${service.color} w-8 h-8 icon-glow relative z-10`} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-card-foreground group-hover:text-accent transition-colors duration-300">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {service.description}
                  </p>
                  {service.features && (
                    <ul className="space-y-2">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-center group/item">
                          <span className="w-2 h-2 rounded-full bg-accent rtl:ml-2 ltr:mr-2 group-hover/item:scale-150 transition-transform duration-300" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}


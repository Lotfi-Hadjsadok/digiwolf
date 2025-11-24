'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { ContactForm } from './contact-form';
import { Locale, getTranslations } from '@/lib/i18n';
import { gsap } from 'gsap';
import { useEffect, useRef } from 'react';
import { Sparkles, Rocket, Zap, Star, TrendingUp, Target } from 'lucide-react';

export function Hero({ locale }: { locale: Locale }) {
  const t = getTranslations(locale);
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const iconsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!heroRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(titleRef.current, {
        opacity: 0,
        y: 50,
        duration: 1,
        ease: 'power3.out',
      });

      gsap.from(subtitleRef.current, {
        opacity: 0,
        y: 30,
        duration: 1,
        delay: 0.2,
        ease: 'power3.out',
      });

      // Animate buttons directly, not wrapper elements
      const buttons = buttonsRef.current?.querySelectorAll('button') || [];
      gsap.from(buttons, {
        opacity: 0,
        y: 20,
        duration: 0.8,
        delay: 0.4,
        stagger: 0.1,
        ease: 'power3.out',
      });

      // Animate floating icons
      const icons = iconsRef.current?.children || [];
      gsap.from(icons, {
        opacity: 0,
        scale: 0,
        duration: 1,
        delay: 0.6,
        stagger: 0.1,
        ease: 'back.out(1.7)',
      });

      // Mouse magnetic attraction effect for icons
      let mouseX = 0;
      let mouseY = 0;
      let targetMouseX = 0;
      let targetMouseY = 0;
      let isMouseActive = false;
      
      const handleMouseMove = (e: MouseEvent) => {
        if (!heroRef.current) return;
        
        const rect = heroRef.current.getBoundingClientRect();
        targetMouseX = e.clientX - rect.left; // Actual pixel position
        targetMouseY = e.clientY - rect.top; // Actual pixel position
        isMouseActive = true;
      };

      const handleMouseLeave = () => {
        isMouseActive = false;
        targetMouseX = 0;
        targetMouseY = 0;
      };

      heroRef.current.addEventListener('mousemove', handleMouseMove);
      heroRef.current.addEventListener('mouseleave', handleMouseLeave);

      // Smooth mouse position interpolation
      gsap.ticker.add(() => {
        mouseX += (targetMouseX - mouseX) * 0.1;
        mouseY += (targetMouseY - mouseY) * 0.1;
      });

      // Continuous floating animation for icons with magnetic attraction
      const parallaxTimers: (() => void)[] = [];
      
      Array.from(icons).forEach((iconWrapper, index) => {
        const maxDistance = 250; // Maximum distance for magnetic effect
        const attractionStrength = 12 + index * 3; // Subtle attraction strength in pixels
        const iconInner = iconWrapper.querySelector('.icon-inner') as HTMLElement;
        
        if (!iconInner) return;
        
        let currentX = 0;
        let currentY = 0;
        
        // Floating animation on inner element (using relative y)
        // Smaller movement on mobile
        const isMobile = window.innerWidth < 768;
        const floatDistance = isMobile ? 12 + index * 3 : 20 + index * 5;
        const rotationAmount = isMobile ? 6 + index * 3 : 10 + index * 5;
        
        gsap.to(iconInner, {
          y: `+=${floatDistance}`,
          rotation: `+=${rotationAmount}`,
          duration: 3 + index * 0.5,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: index * 0.2,
        });

        // Magnetic attraction effect - icons move towards mouse
        const updateMagnetic = () => {
          if (!heroRef.current) return;
          
          const rect = heroRef.current.getBoundingClientRect();
          const wrapperRect = iconWrapper.getBoundingClientRect();
          const iconCenterX = wrapperRect.left + wrapperRect.width / 2 - rect.left;
          const iconCenterY = wrapperRect.top + wrapperRect.height / 2 - rect.top;
          
          if (!isMouseActive) {
            // Smoothly return to base position when mouse leaves
            currentX *= 0.9;
            currentY *= 0.9;
            gsap.set(iconWrapper, {
              x: currentX,
              y: currentY,
            });
            return;
          }
          
          // Calculate distance and direction to mouse
          const dx = mouseX - iconCenterX;
          const dy = mouseY - iconCenterY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Only apply attraction if within range
          if (distance < maxDistance && distance > 5) {
            // Calculate attraction force (stronger when closer, inverse square for smooth effect)
            const normalizedDistance = distance / maxDistance;
            const force = (1 - normalizedDistance) * (attractionStrength / distance);
            const moveX = dx * force;
            const moveY = dy * force;
            
            // Smoothly interpolate to new position
            currentX += (moveX - currentX) * 0.15;
            currentY += (moveY - currentY) * 0.15;
            
            gsap.set(iconWrapper, {
              x: currentX,
              y: currentY,
            });
          } else {
            // Smoothly return to base position when too far
            currentX *= 0.95;
            currentY *= 0.95;
            gsap.set(iconWrapper, {
              x: currentX,
              y: currentY,
            });
          }
        };

        const tickerId = gsap.ticker.add(updateMagnetic);
        parallaxTimers.push(() => gsap.ticker.remove(tickerId));
      });

      return () => {
        heroRef.current?.removeEventListener('mousemove', handleMouseMove);
        heroRef.current?.removeEventListener('mouseleave', handleMouseLeave);
        parallaxTimers.forEach(cleanup => cleanup());
      };
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const floatingIcons = [
    { Icon: Sparkles, position: 'top-12 left-4 md:top-20 md:left-10', delay: '0s' },
    { Icon: Rocket, position: 'top-28 right-4 md:top-40 md:right-20', delay: '0.5s' },
    { Icon: Zap, position: 'bottom-28 left-4 md:bottom-40 md:left-20', delay: '1s' },
    { Icon: Star, position: 'bottom-12 right-4 md:bottom-20 md:right-10', delay: '1.5s' },
    { Icon: TrendingUp, position: 'top-1/2 left-1/4 hidden sm:block', delay: '2s' },
    { Icon: Target, position: 'bottom-2/3 right-1/4 hidden sm:block', delay: '2.5s' },
  ];

  return (
    <section
      ref={heroRef}
      id="home"
      className="min-h-screen flex items-center justify-center pt-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden gradient-mesh"
    >
      {/* Floating animated icons */}
      <div ref={iconsRef} className="absolute inset-0 pointer-events-none">
        {floatingIcons.map(({ Icon, position, delay }, index) => (
          <div
            key={index}
            className={`absolute ${position} icon-wrapper`}
            style={{ animationDelay: delay }}
            data-icon-index={index}
          >
            <div className="relative icon-inner">
              <div className="absolute inset-0 bg-accent/15 blur-lg md:bg-accent/20 md:blur-xl rounded-full animate-pulse-glow" />
              <Icon className="w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 text-accent icon-glow animate-float relative z-10" />
            </div>
          </div>
        ))}
      </div>

      {/* Gradient orb effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />

      <div className="container mx-auto text-center max-w-4xl px-4 relative z-10">
        <h1
          ref={titleRef}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-foreground leading-tight"
        >
          {t.hero.title}
        </h1>
        <p
          ref={subtitleRef}
          className="text-base sm:text-lg md:text-xl lg:text-2xl mb-8 text-muted-foreground max-w-2xl mx-auto"
        >
          {t.hero.subtitle}
        </p>
        <div ref={buttonsRef} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <div className="contents">
            <ContactForm
              locale={locale}
              trigger={
                <Button size="lg" className="text-base px-8 py-6 w-full sm:w-auto bg-accent hover:bg-accent/90 hover-lift">
                  {t.hero.cta}
                </Button>
              }
            />
          </div>
          <Button size="lg" variant="outline" className="text-base px-8 py-6 w-full sm:w-auto border-accent/50 hover:bg-accent/10 hover-lift">
            {t.hero.ctaSecondary}
          </Button>
        </div>
      </div>
    </section>
  );
}


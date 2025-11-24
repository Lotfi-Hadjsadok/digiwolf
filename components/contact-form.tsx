'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Locale, getTranslations } from '@/lib/i18n';
import { createLead, createAbandonedLead } from '@/app/actions/leads';
import type { BusinessCategory } from '@/lib/types';
import { getPhoneModel } from '@/lib/utils';
import { trackFacebookLead } from '@/components/facebook-pixel';
import { 
  User, 
  Phone, 
  Mail, 
  Briefcase, 
  FileText, 
  CheckCircle2, 
  Loader2,
  Sparkles,
  Clock,
  Shield,
  Home,
  Zap,
  ShoppingCart,
  Sofa,
  Laptop,
  UtensilsCrossed,
  Dumbbell,
  MoreHorizontal,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

interface ContactFormProps {
  trigger?: React.ReactNode;
  locale?: Locale;
}

interface CategoryOption {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
  email?: string;
  category?: string;
  businessDescription?: string;
  submit?: string;
}

export function ContactForm({ trigger, locale = 'en' }: ContactFormProps) {
  const t = getTranslations(locale);
  const [open, setOpen] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState(1);
  const [category, setCategory] = React.useState<BusinessCategory | ''>('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [formData, setFormData] = React.useState<{
    name: string;
    phone: string;
    email: string;
    category: BusinessCategory | '';
    businessDescription: string;
  }>({
    name: '',
    phone: '',
    email: '',
    category: '',
    businessDescription: '',
  });
  const [hasSubmitted, setHasSubmitted] = React.useState(false);
  const [abandonedLeadSaved, setAbandonedLeadSaved] = React.useState(false);
  const saveAbandonedLeadTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const hasAttemptedSaveRef = React.useRef(false);
  const facebookEventTrackedRef = React.useRef(false);

  // Build categories from translations
  const businessCategories: CategoryOption[] = [
    {
      value: 'real-estate',
      label: t.contactForm.categories['real-estate'].label,
      icon: Home,
      description: t.contactForm.categories['real-estate'].description,
    },
    {
      value: 'electromenager',
      label: t.contactForm.categories.electromenager.label,
      icon: Zap,
      description: t.contactForm.categories.electromenager.description,
    },
    {
      value: 'sales',
      label: t.contactForm.categories.sales.label,
      icon: ShoppingCart,
      description: t.contactForm.categories.sales.description,
    },
    {
      value: 'meubles',
      label: t.contactForm.categories.meubles.label,
      icon: Sofa,
      description: t.contactForm.categories.meubles.description,
    },
    {
      value: 'electronics',
      label: t.contactForm.categories.electronics.label,
      icon: Laptop,
      description: t.contactForm.categories.electronics.description,
    },
    {
      value: 'alimentation',
      label: t.contactForm.categories.alimentation.label,
      icon: UtensilsCrossed,
      description: t.contactForm.categories.alimentation.description,
    },
    {
      value: 'sports',
      label: t.contactForm.categories.sports.label,
      icon: Dumbbell,
      description: t.contactForm.categories.sports.description,
    },
    {
      value: 'other',
      label: t.contactForm.categories.other.label,
      icon: MoreHorizontal,
      description: t.contactForm.categories.other.description,
    },
  ];

  const validateStep1 = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t.contactForm.errors.nameRequired;
    } else if (formData.name.trim().length < 2) {
      newErrors.name = t.contactForm.errors.nameMinLength;
    }

    if (!formData.phone.trim()) {
      newErrors.phone = t.contactForm.errors.phoneRequired;
    } else if (!/^[\d\s\-\+\(\)]+$/.test(formData.phone.trim())) {
      newErrors.phone = t.contactForm.errors.phoneInvalid;
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t.contactForm.errors.emailInvalid;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.category) {
      newErrors.category = t.contactForm.errors.categoryRequired;
    }

    if (formData.category === 'other' && !formData.businessDescription.trim()) {
      newErrors.businessDescription = t.contactForm.errors.businessDescriptionRequired;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = (): boolean => {
    return validateStep1() && validateStep2();
  };

  const handleNext = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
    // Clear step 2 errors when going back
    setErrors((prev) => ({
      ...prev,
      category: undefined,
      businessDescription: undefined,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate step 2 before submitting
    if (!validateStep2()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Capture browser information
      const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : '';
      const browser = typeof window !== 'undefined' ? window.navigator.userAgent || 'Unknown' : 'Unknown';
      const phoneModel = getPhoneModel(userAgent) || undefined;
      
      // Submit form data using server action
      const result = await createLead({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        category: formData.category as BusinessCategory,
        businessDescription: formData.businessDescription,
        browser,
        userAgent,
        phoneModel,
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to submit form');
      }

      // Track Facebook Pixel Lead event (client-side) - only once per submission
      // Use the same event ID as server-side for proper deduplication
      if (!facebookEventTrackedRef.current && result.id) {
        trackFacebookLead({
          eventID: result.id, // Use lead ID for deduplication with server-side event
          content_name: formData.category,
          content_category: formData.category,
          value: 0, // You can set a value if you have lead values
          currency: 'USD', // Adjust currency as needed
        });
        facebookEventTrackedRef.current = true;
      }

      // Success
      setIsSubmitting(false);
      setIsSuccess(true);
      setHasSubmitted(true); // Mark as submitted so we don't save as abandoned
      
      // Reset form data (but keep success message visible)
      setFormData({
        name: '',
        phone: '',
        email: '',
        category: '',
        businessDescription: '',
      });
      setCategory('');
      setErrors({});
      setCurrentStep(1);
    } catch (error) {
      console.error('Error submitting form:', error);
      setIsSubmitting(false);
      // Show error to user (you can enhance this with a toast notification)
      setErrors({
        ...errors,
        submit: error instanceof Error ? error.message : 'Failed to submit form. Please try again.',
      });
    }
  };

  // Function to save abandoned lead silently in the background
  const saveAbandonedLead = React.useCallback(async () => {
    // Don't save if form was already submitted successfully or already saved
    if (hasSubmitted || abandonedLeadSaved || hasAttemptedSaveRef.current) {
      return;
    }

    // Only save if phone number is filled (required for abandoned leads)
    if (!formData.phone.trim()) {
      return;
    }

    // Mark as attempted to prevent duplicate saves
    hasAttemptedSaveRef.current = true;

    try {
      // Capture browser information
      const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : '';
      const browser = typeof window !== 'undefined' ? window.navigator.userAgent || 'Unknown' : 'Unknown';
      const phoneModel = getPhoneModel(userAgent) || undefined;
      
      // Save abandoned lead silently
      await createAbandonedLead({
        name: formData.name.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        email: formData.email.trim() || undefined,
        category: formData.category || undefined,
        businessDescription: formData.businessDescription.trim() || undefined,
        browser,
        userAgent,
        phoneModel,
      });
      
      setAbandonedLeadSaved(true);
    } catch (error) {
      // Silently fail - don't show errors to user for abandoned leads
      console.error('Error saving abandoned lead:', error);
      // Reset the ref on error so we can retry if needed
      hasAttemptedSaveRef.current = false;
    }
  }, [formData, hasSubmitted, abandonedLeadSaved]);

  // Debounced function to save abandoned lead after user stops typing
  const debouncedSaveAbandonedLead = React.useCallback(() => {
    // Clear existing timeout
    if (saveAbandonedLeadTimeoutRef.current) {
      clearTimeout(saveAbandonedLeadTimeoutRef.current);
    }

    // Set new timeout (2 seconds after user stops typing)
    saveAbandonedLeadTimeoutRef.current = setTimeout(() => {
      saveAbandonedLead();
    }, 2000);
  }, [saveAbandonedLead]);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      // Clear timeout
      if (saveAbandonedLeadTimeoutRef.current) {
        clearTimeout(saveAbandonedLeadTimeoutRef.current);
      }
    };
  }, []);

  // Handle visibility change (tab switching, minimizing window, etc.)
  React.useEffect(() => {
    if (!open) return; // Only track when dialog is open

    const handleVisibilityChange = () => {
      // If tab becomes hidden and phone is filled, save as abandoned
      if (document.hidden && formData.phone.trim() && !hasSubmitted) {
        saveAbandonedLead();
      }
    };

    const handleBeforeUnload = () => {
      // If page is being closed and phone is filled, save as abandoned
      if (formData.phone.trim() && !hasSubmitted) {
        // Attempt to save abandoned lead (may not complete if page closes quickly)
        saveAbandonedLead();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [open, formData, hasSubmitted, saveAbandonedLead]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === 'category') {
      setCategory(value as BusinessCategory | "");
    }
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }

    // Auto-save abandoned lead when phone is entered (phone is required for abandoned leads)
    if (field === 'phone') {
      debouncedSaveAbandonedLead();
    }
  };

  const defaultTrigger = (
    <Button variant="default" className="relative overflow-hidden group">
      <span className="relative z-10 flex items-center gap-2">
        <Sparkles className="w-4 h-4" />
        {t.contactForm.contactUs}
      </span>
      <span className="absolute inset-0 bg-gradient-to-r from-accent/80 to-accent animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity" />
    </Button>
  );

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Save abandoned lead if form wasn't submitted and phone number is filled
      if (!hasSubmitted && formData.phone.trim()) {
        saveAbandonedLead();
      }

      // Reset form when dialog closes
      setFormData({
        name: '',
        phone: '',
        email: '',
        category: '',
        businessDescription: '',
      });
      setCategory('');
      setErrors({});
      setIsSuccess(false);
      setIsSubmitting(false);
      setCurrentStep(1);
      setHasSubmitted(false);
      setAbandonedLeadSaved(false);
      hasAttemptedSaveRef.current = false;
      facebookEventTrackedRef.current = false;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="w-full max-w-[calc(100vw-2rem)] sm:max-w-[640px] max-h-[90vh] overflow-y-auto p-0 gap-0 my-0 rounded-2xl sm:rounded-3xl border border-border/40 shadow-2xl bg-background left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        {/* Header with gradient background */}
        <div className="relative gradient-accent-subtle p-5 pb-3 sm:p-8 sm:pb-6 border-b border-accent/20">
          <div className="absolute inset-0 gradient-mesh opacity-50" />
          <DialogHeader className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-accent/20 backdrop-blur-sm">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
              </div>
              <DialogTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                {t.contactForm.title}
              </DialogTitle>
            </div>
            <DialogDescription className="text-sm sm:text-lg text-foreground/80 mt-2">
              {t.contactForm.description}
            </DialogDescription>
            
            {/* Trust indicators */}
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-6 mt-4 pt-4 border-t border-accent/20 w-full">
              <div className="flex items-center gap-2 text-sm text-foreground/70">
                <Clock className="w-4 h-4 text-accent" />
                <span>{t.contactForm.trustIndicators.response24h}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-foreground/70">
                <Shield className="w-4 h-4 text-accent" />
                <span>{t.contactForm.trustIndicators.secure}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-foreground/70">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                <span>{t.contactForm.trustIndicators.freeConsultation}</span>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Form content */}
        <div className="p-5 sm:p-8">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center animate-in fade-in-0 zoom-in-95 duration-300">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-accent/20 rounded-full blur-xl animate-pulse" />
                <div className="relative p-4 rounded-full bg-accent/10">
                  <CheckCircle2 className="w-16 h-16 sm:w-20 sm:h-20 text-accent" />
                </div>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold mb-3">{t.contactForm.successTitle}</h3>
              <p className="text-muted-foreground text-base sm:text-lg max-w-md">
                {t.contactForm.successMessage}
              </p>
            </div>
          ) : (
            <>
              {/* Step indicators */}
              <div className="flex flex-col items-center justify-center gap-3 text-center mb-6 sm:mb-8 sm:flex-row">
                <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                  {/* Step 1 */}
                  <div className="flex items-center gap-2">
                    <div className={`
                      w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center
                      font-semibold text-sm sm:text-base transition-all
                      ${currentStep === 1 
                        ? 'bg-accent text-accent-foreground scale-110' 
                        : currentStep > 1
                        ? 'bg-accent/20 text-accent'
                        : 'bg-muted text-muted-foreground'
                      }
                    `}>
                      {currentStep > 1 ? <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" /> : '1'}
                    </div>
                    <span className={`
                      hidden sm:block text-xs sm:text-sm font-medium transition-colors
                      ${currentStep === 1 ? 'text-foreground' : 'text-muted-foreground'}
                    `}>
                      {t.contactForm.stepLabels.contactInfo}
                    </span>
                  </div>
                  
                  {/* Connector */}
                  <div className={`
                    w-8 sm:w-16 h-0.5 transition-colors
                    ${currentStep > 1 ? 'bg-accent' : 'bg-border'}
                  `} />
                  
                  {/* Step 2 */}
                  <div className="flex items-center gap-2">
                    <div className={`
                      w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center
                      font-semibold text-sm sm:text-base transition-all
                      ${currentStep === 2 
                        ? 'bg-accent text-accent-foreground scale-110' 
                        : currentStep > 2
                        ? 'bg-accent/20 text-accent'
                        : 'bg-muted text-muted-foreground'
                      }
                    `}>
                      {currentStep > 2 ? <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" /> : '2'}
                    </div>
                    <span className={`
                      hidden sm:block text-xs sm:text-sm font-medium transition-colors
                      ${currentStep === 2 ? 'text-foreground' : 'text-muted-foreground'}
                    `}>
                      {t.contactForm.stepLabels.businessCategory}
                    </span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6 pb-2">
                {/* Step 1: Contact Information */}
                {currentStep === 1 && (
                  <div className="space-y-4 sm:space-y-6 animate-in slide-in-from-right-4 fade-in-0 duration-300">
                    {/* Name field */}
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                        <User className="w-4 h-4 text-accent" />
                        {t.contactForm.fields.name} <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => handleChange('name', e.target.value)}
                          placeholder={t.contactForm.placeholders.name}
                          className={`pl-10 h-12 text-base transition-all ${
                            errors.name ? 'border-destructive focus-visible:ring-destructive' : ''
                          }`}
                        />
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      </div>
                      {errors.name && (
                        <p className="text-sm text-destructive flex items-center gap-1 animate-in slide-in-from-top-1">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    {/* Phone field */}
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                        <Phone className="w-4 h-4 text-accent" />
                        {t.contactForm.fields.phone} <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="phone"
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => handleChange('phone', e.target.value)}
                          placeholder={t.contactForm.placeholders.phone}
                          className={`pl-10 h-12 text-base transition-all ${
                            errors.phone ? 'border-destructive focus-visible:ring-destructive' : ''
                          }`}
                        />
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      </div>
                      {errors.phone && (
                        <p className="text-sm text-destructive flex items-center gap-1 animate-in slide-in-from-top-1">
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    {/* Email field */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                        <Mail className="w-4 h-4 text-accent" />
                        {t.contactForm.fields.email}
                        <span className="text-xs text-muted-foreground font-normal ml-1">{t.contactForm.fields.emailOptional}</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                          placeholder={t.contactForm.placeholders.email}
                          className={`pl-10 h-12 text-base transition-all ${
                            errors.email ? 'border-destructive focus-visible:ring-destructive' : ''
                          }`}
                        />
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      </div>
                      {errors.email && (
                        <p className="text-sm text-destructive flex items-center gap-1 animate-in slide-in-from-top-1">
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 2: Business Category */}
                {currentStep === 2 && (
                  <div className="space-y-5 sm:space-y-6 animate-in slide-in-from-right-4 fade-in-0 duration-300">
                    {/* Category field - Visual Selection */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-accent" />
                        {t.contactForm.fields.category} <span className="text-destructive">*</span>
                      </Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        {businessCategories.map((cat) => {
                          const Icon = cat.icon;
                          const isSelected = category === cat.value;
                          return (
                            <button
                              key={cat.value}
                              type="button"
                              onClick={() => handleChange('category', cat.value)}
                              className={`
                                relative group p-4 rounded-lg border-2 transition-all duration-200
                                text-left hover:scale-105 active:scale-95
                                ${isSelected 
                                  ? 'border-accent bg-accent/10 shadow-lg shadow-accent/20' 
                                  : 'border-border bg-background hover:border-accent/50 hover:bg-accent/5'
                                }
                                ${errors.category ? 'border-destructive' : ''}
                              `}
                            >
                              {/* Selected indicator */}
                              {isSelected && (
                                <div className="absolute top-2 right-2">
                                  <div className="p-1 rounded-full bg-accent">
                                    <CheckCircle2 className="w-3 h-3 text-accent-foreground" />
                                  </div>
                                </div>
                              )}
                              
                              {/* Icon */}
                              <div className={`
                                mb-2 p-2 rounded-lg w-fit transition-colors
                                ${isSelected 
                                  ? 'bg-accent text-accent-foreground' 
                                  : 'bg-accent/10 text-accent group-hover:bg-accent/20'
                                }
                              `}>
                                <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                              </div>
                              
                              {/* Label */}
                              <div className="font-medium text-sm sm:text-base text-foreground mb-1">
                                {cat.label}
                              </div>
                              
                              {/* Description */}
                              {cat.description && (
                                <div className="text-xs text-muted-foreground line-clamp-2">
                                  {cat.description}
                                </div>
                              )}
                              
                              {/* Hover glow effect */}
                              <div className={`
                                absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 
                                transition-opacity duration-200 pointer-events-none
                                ${isSelected ? 'bg-accent/5' : 'bg-accent/10'}
                              `} />
                            </button>
                          );
                        })}
                      </div>
                      {errors.category && (
                        <p className="text-sm text-destructive flex items-center gap-1 animate-in slide-in-from-top-1">
                          {errors.category}
                        </p>
                      )}
                    </div>

                    {/* Business description (conditional) */}
                    {category === 'other' && (
                      <div className="space-y-2 animate-in slide-in-from-top-2 fade-in-0 duration-300">
                        <Label htmlFor="businessDescription" className="text-sm font-medium flex items-center gap-2">
                          <FileText className="w-4 h-4 text-accent" />
                          {t.contactForm.fields.businessDescription} <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                          id="businessDescription"
                          value={formData.businessDescription}
                          onChange={(e) => handleChange('businessDescription', e.target.value)}
                          placeholder={t.contactForm.placeholders.businessDescription}
                          rows={4}
                          className={`text-base min-h-[100px] transition-all ${
                            errors.businessDescription ? 'border-destructive focus-visible:ring-destructive' : ''
                          }`}
                        />
                        {errors.businessDescription && (
                          <p className="text-sm text-destructive flex items-center gap-1 animate-in slide-in-from-top-1">
                            {errors.businessDescription}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Submit error message */}
                {errors.submit && (
                  <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 animate-in slide-in-from-top-1">
                    <p className="text-sm text-destructive flex items-center gap-2">
                      <span className="font-semibold">Error:</span>
                      {errors.submit}
                    </p>
                  </div>
                )}

                {/* Navigation buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 sm:pt-6 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 sticky bottom-0 left-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                    className="h-12 text-base order-3 sm:order-1"
                    disabled={isSubmitting}
                  >
                    {t.contactForm.cancel}
                  </Button>
                  
                  {currentStep === 1 ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="h-12 text-base flex-1 order-1 sm:order-2 relative overflow-hidden group bg-accent hover:bg-accent/90"
                      disabled={isSubmitting}
                    >
                      <span className="relative z-10 flex items-center gap-2 justify-center">
                        Next
                        <ArrowRight className="w-4 h-4" />
                      </span>
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    </Button>
                  ) : (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleBack}
                        className="h-12 text-base order-2 sm:order-1"
                        disabled={isSubmitting}
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                      </Button>
                      <Button 
                        type="submit" 
                        className="h-12 text-base flex-1 order-1 sm:order-2 relative overflow-hidden group bg-accent hover:bg-accent/90"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            {t.contactForm.submitting}
                          </>
                        ) : (
                          <>
                            <span className="relative z-10 flex items-center gap-2">
                              <Sparkles className="w-4 h-4" />
                              {t.contactForm.submitRequest}
                            </span>
                            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </form>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}


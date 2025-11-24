export type Locale = 'en' | 'fr' | 'ar';

export const locales: Locale[] = ['en', 'fr', 'ar'];

export const defaultLocale: Locale = 'en';

/**
 * Detects the user's preferred locale from Accept-Language header
 * Falls back to defaultLocale if no match is found
 */
export function detectLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) {
    return defaultLocale;
  }

  // Parse Accept-Language header (e.g., "en-US,en;q=0.9,fr;q=0.8,ar;q=0.7")
  const languages = acceptLanguage
    .split(',')
    .map((lang) => {
      const [code, q = 'q=1'] = lang.trim().split(';');
      const quality = parseFloat(q.replace('q=', '')) || 1;
      return { code: code.toLowerCase().split('-')[0], quality };
    })
    .sort((a, b) => b.quality - a.quality);

  // Find the first matching locale
  for (const { code } of languages) {
    if (code === 'ar' && locales.includes('ar')) {
      return 'ar';
    }
    if (code === 'fr' && locales.includes('fr')) {
      return 'fr';
    }
    if (code === 'en' && locales.includes('en')) {
      return 'en';
    }
  }

  return defaultLocale;
}

export const translations = {
  en: {
    nav: {
      home: 'Home',
      services: 'Services',
      about: 'About',
      contact: 'Contact',
    },
    hero: {
      title: 'Transform Your Digital Presence',
      subtitle: 'We help businesses grow with cutting-edge digital solutions',
      cta: 'Get Started',
      ctaSecondary: 'Learn More',
    },
    services: {
      title: 'Our Services',
      subtitle: 'Comprehensive digital solutions for your business',
      mediaBuying: {
        title: 'Media Buying',
        description: 'Expert Meta ads management to maximize your ROI and reach your target audience effectively.',
      },
      webDevelopment: {
        title: 'Web Development',
        description: 'Custom websites tailored to your needs: Ecommerce, AI automations, and custom solutions.',
        ecommerce: 'Ecommerce',
        aiAutomations: 'AI Automations',
        customSolutions: 'Custom Solutions',
      },
      marketing: {
        title: 'Marketing & Creative',
        description: 'Compelling ad copies and creative designs that convert visitors into customers.',
      },
    },
    cta: {
      title: 'Ready to Grow Your Business?',
      subtitle: 'Let\'s discuss how we can help you achieve your goals',
      button: 'Contact Us',
    },
    footer: {
      rights: 'All rights reserved.',
    },
    contactForm: {
      title: 'Get Started Today',
      description: 'Fill out the form below and we\'ll get back to you within 24 hours.',
      contactUs: 'Contact Us',
      submitRequest: 'Submit Request',
      cancel: 'Cancel',
      submitting: 'Submitting...',
      successTitle: 'Thank You!',
      successMessage: 'We\'ve received your message and will get back to you within 24 hours.',
      trustIndicators: {
        response24h: '24h Response',
        secure: 'Secure & Private',
        freeConsultation: 'Free Consultation',
      },
      stepLabels: {
        contactInfo: 'Contact Info',
        businessCategory: 'Business Category',
      },
      fields: {
        name: 'Full Name',
        phone: 'Phone Number',
        email: 'Email Address',
        emailOptional: '(optional)',
        category: 'Business Category',
        businessDescription: 'Describe Your Business',
      },
      placeholders: {
        name: 'John Doe',
        phone: '+213553397543',
        email: 'john@example.com',
        businessDescription: 'Tell us about your business, products, or services...',
      },
      errors: {
        nameRequired: 'Name is required',
        nameMinLength: 'Name must be at least 2 characters',
        phoneRequired: 'Phone number is required',
        phoneInvalid: 'Please enter a valid phone number',
        emailInvalid: 'Please enter a valid email address',
        categoryRequired: 'Please select a category',
        businessDescriptionRequired: 'Please describe your business',
      },
      categories: {
        'real-estate': {
          label: 'Real Estate',
          description: 'Property & Real Estate',
        },
        electromenager: {
          label: 'Electromenager',
          description: 'Home Appliances',
        },
        sales: {
          label: 'Sales & Retail',
          description: 'Retail & E-commerce',
        },
        meubles: {
          label: 'Furniture',
          description: 'Furniture & Décor',
        },
        electronics: {
          label: 'Electronics',
          description: 'Tech & Electronics',
        },
        alimentation: {
          label: 'Food & Beverage',
          description: 'Restaurant & Food',
        },
        sports: {
          label: 'Sports & Fitness',
          description: 'Sports & Wellness',
        },
        other: {
          label: 'Other',
          description: 'Other Business Type',
        },
      },
    },
  },
  fr: {
    nav: {
      home: 'Accueil',
      services: 'Services',
      about: 'À propos',
      contact: 'Contact',
    },
    hero: {
      title: 'Transformez Votre Présence Numérique',
      subtitle: 'Nous aidons les entreprises à croître avec des solutions numériques de pointe',
      cta: 'Commencer',
      ctaSecondary: 'En savoir plus',
    },
    services: {
      title: 'Nos Services',
      subtitle: 'Solutions numériques complètes pour votre entreprise',
      mediaBuying: {
        title: 'Achat Média',
        description: 'Gestion experte des publicités Meta pour maximiser votre ROI et atteindre efficacement votre public cible.',
      },
      webDevelopment: {
        title: 'Développement Web',
        description: 'Sites web personnalisés adaptés à vos besoins: Ecommerce, automatisations IA et solutions personnalisées.',
        ecommerce: 'Ecommerce',
        aiAutomations: 'Automatisations IA',
        customSolutions: 'Solutions Personnalisées',
      },
      marketing: {
        title: 'Marketing & Créatif',
        description: 'Copies publicitaires convaincantes et designs créatifs qui transforment les visiteurs en clients.',
      },
    },
    cta: {
      title: 'Prêt à Faire Croître Votre Entreprise?',
      subtitle: 'Discutons de la façon dont nous pouvons vous aider à atteindre vos objectifs',
      button: 'Nous Contacter',
    },
    footer: {
      rights: 'Tous droits réservés.',
    },
    contactForm: {
      title: 'Commencez Aujourd\'hui',
      description: 'Remplissez le formulaire ci-dessous et nous vous répondrons dans les 24 heures.',
      contactUs: 'Nous Contacter',
      submitRequest: 'Envoyer la Demande',
      cancel: 'Annuler',
      submitting: 'Envoi en cours...',
      successTitle: 'Merci !',
      successMessage: 'Nous avons reçu votre message et vous répondrons dans les 24 heures.',
      trustIndicators: {
        response24h: 'Réponse en 24h',
        secure: 'Sécurisé et Privé',
        freeConsultation: 'Consultation Gratuite',
      },
      stepLabels: {
        contactInfo: 'Informations de Contact',
        businessCategory: 'Catégorie d\'Entreprise',
      },
      fields: {
        name: 'Nom Complet',
        phone: 'Numéro de Téléphone',
        email: 'Adresse E-mail',
        emailOptional: '(optionnel)',
        category: 'Catégorie d\'Entreprise',
        businessDescription: 'Décrivez Votre Entreprise',
      },
      placeholders: {
        name: 'Jean Dupont',
        phone: '+33 6 12 34 56 78',
        email: 'jean@exemple.fr',
        businessDescription: 'Parlez-nous de votre entreprise, produits ou services...',
      },
      errors: {
        nameRequired: 'Le nom est requis',
        nameMinLength: 'Le nom doit contenir au moins 2 caractères',
        phoneRequired: 'Le numéro de téléphone est requis',
        phoneInvalid: 'Veuillez entrer un numéro de téléphone valide',
        emailInvalid: 'Veuillez entrer une adresse e-mail valide',
        categoryRequired: 'Veuillez sélectionner une catégorie',
        businessDescriptionRequired: 'Veuillez décrire votre entreprise',
      },
      categories: {
        'real-estate': {
          label: 'Immobilier',
          description: 'Propriété & Immobilier',
        },
        electromenager: {
          label: 'Électroménager',
          description: 'Appareils Ménagers',
        },
        sales: {
          label: 'Vente & Commerce',
          description: 'Commerce de Détail & E-commerce',
        },
        meubles: {
          label: 'Mobilier',
          description: 'Mobilier & Décoration',
        },
        electronics: {
          label: 'Électronique',
          description: 'Technologie & Électronique',
        },
        alimentation: {
          label: 'Alimentation & Boissons',
          description: 'Restaurant & Alimentation',
        },
        sports: {
          label: 'Sport & Fitness',
          description: 'Sport & Bien-être',
        },
        other: {
          label: 'Autre',
          description: 'Autre Type d\'Entreprise',
        },
      },
    },
  },
  ar: {
    nav: {
      home: 'الرئيسية',
      services: 'الخدمات',
      about: 'من نحن',
      contact: 'اتصل بنا',
    },
    hero: {
      title: 'حوّل وجودك الرقمي',
      subtitle: 'نساعد الشركات على النمو من خلال حلول رقمية متطورة',
      cta: 'ابدأ الآن',
      ctaSecondary: 'اعرف المزيد',
    },
    services: {
      title: 'خدماتنا',
      subtitle: 'حلول رقمية شاملة لعملك',
      mediaBuying: {
        title: 'شراء الإعلانات',
        description: 'إدارة احترافية لإعلانات Meta لتعظيم عائد الاستثمار والوصول إلى جمهورك المستهدف بفعالية.',
      },
      webDevelopment: {
        title: 'تطوير المواقع',
        description: 'مواقع مخصصة حسب احتياجاتك: التجارة الإلكترونية، أتمتة الذكاء الاصطناعي، والحلول المخصصة.',
        ecommerce: 'التجارة الإلكترونية',
        aiAutomations: 'أتمتة الذكاء الاصطناعي',
        customSolutions: 'حلول مخصصة',
      },
      marketing: {
        title: 'التسويق والإبداع',
        description: 'نصوص إعلانية مقنعة وتصاميم إبداعية تحول الزوار إلى عملاء.',
      },
    },
    cta: {
      title: 'هل أنت مستعد لنمو عملك؟',
      subtitle: 'دعنا نناقش كيف يمكننا مساعدتك في تحقيق أهدافك',
      button: 'اتصل بنا',
    },
    footer: {
      rights: 'جميع الحقوق محفوظة.',
    },
    contactForm: {
      title: 'ابدأ اليوم',
      description: 'املأ النموذج أدناه وسنعود إليك خلال 24 ساعة.',
      contactUs: 'اتصل بنا',
      submitRequest: 'إرسال الطلب',
      cancel: 'إلغاء',
      submitting: 'جاري الإرسال...',
      successTitle: 'شكراً لك!',
      successMessage: 'لقد تلقينا رسالتك وسنعود إليك خلال 24 ساعة.',
      trustIndicators: {
        response24h: 'رد خلال 24 ساعة',
        secure: 'آمن وخاص',
        freeConsultation: 'استشارة مجانية',
      },
      stepLabels: {
        contactInfo: 'معلومات الاتصال',
        businessCategory: 'فئة الأعمال',
      },
      fields: {
        name: 'الاسم الكامل',
        phone: 'رقم الهاتف',
        email: 'عنوان البريد الإلكتروني',
        emailOptional: '(اختياري)',
        category: 'فئة الأعمال',
        businessDescription: 'اوصف عملك',
      },
      placeholders: {
        name: 'أحمد محمد',
        phone: '+213 555 123 456',
        email: 'ahmed@example.com',
        businessDescription: 'أخبرنا عن عملك أو منتجاتك أو خدماتك...',
      },
      errors: {
        nameRequired: 'الاسم مطلوب',
        nameMinLength: 'يجب أن يحتوي الاسم على حرفين على الأقل',
        phoneRequired: 'رقم الهاتف مطلوب',
        phoneInvalid: 'يرجى إدخال رقم هاتف صحيح',
        emailInvalid: 'يرجى إدخال عنوان بريد إلكتروني صحيح',
        categoryRequired: 'يرجى اختيار فئة',
        businessDescriptionRequired: 'يرجى وصف عملك',
      },
      categories: {
        'real-estate': {
          label: 'العقارات',
          description: 'الممتلكات والعقارات',
        },
        electromenager: {
          label: 'الأجهزة المنزلية',
          description: 'الأجهزة المنزلية',
        },
        sales: {
          label: 'المبيعات والتجزئة',
          description: 'التجزئة والتجارة الإلكترونية',
        },
        meubles: {
          label: 'الأثاث',
          description: 'الأثاث والديكور',
        },
        electronics: {
          label: 'الإلكترونيات',
          description: 'التكنولوجيا والإلكترونيات',
        },
        alimentation: {
          label: 'الطعام والمشروبات',
          description: 'المطاعم والطعام',
        },
        sports: {
          label: 'الرياضة واللياقة',
          description: 'الرياضة والعافية',
        },
        other: {
          label: 'أخرى',
          description: 'نوع عمل آخر',
        },
      },
    },
  },
} as const;

export function getTranslations(locale: Locale) {
  return translations[locale];
}


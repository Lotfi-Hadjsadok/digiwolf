export type BusinessCategory =
  | 'real-estate'
  | 'electromenager'
  | 'sales'
  | 'meubles'
  | 'electronics'
  | 'alimentation'
  | 'sports'
  | 'other';

export const BUSINESS_CATEGORIES: BusinessCategory[] = [
  'real-estate',
  'electromenager',
  'sales',
  'meubles',
  'electronics',
  'alimentation',
  'sports',
  'other',
] as const;

export const BUSINESS_CATEGORY_LABELS: Record<BusinessCategory, string> = {
  'real-estate': 'Real Estate',
  electromenager: 'Electromenager',
  sales: 'Sales & Retail',
  meubles: 'Furniture',
  electronics: 'Electronics',
  alimentation: 'Food & Beverage',
  sports: 'Sports & Fitness',
  other: 'Other',
} as const;


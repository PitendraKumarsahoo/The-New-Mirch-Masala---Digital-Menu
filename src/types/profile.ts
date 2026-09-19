import { MenuItem, Customer, Visit, LoyaltyStatus } from '../types';

export type SpicePreferenceLevel = 'mild' | 'medium' | 'spicy' | 'extra-spicy';
export type DietaryPreference = 'all' | 'veg' | 'non-veg' | 'jain' | 'eggetarian';

export interface CustomerPreferences {
  spiceLevel: SpicePreferenceLevel;
  dietaryPreference: DietaryPreference;
  specialInstructions: string;
  favoriteDishIds: string[];
  favoriteQuantities?: Record<string, number>;
  lastUpdated: string;
}

export interface CustomerProfileData {
  customer?: Customer | null;
  preferences: CustomerPreferences;
  favoriteItems: MenuItem[];
  pastVisits: Visit[];
  loyalty?: LoyaltyStatus | null;
}

export interface SpiceLevelInfo {
  level: SpicePreferenceLevel;
  label: string;
  peppers: string;
  spiceValue: number; // 1 to 4
  description: string;
  badgeColor: string;
}

export const SPICE_LEVEL_CONFIG: Record<SpicePreferenceLevel, SpiceLevelInfo> = {
  mild: {
    level: 'mild',
    label: 'Mild & Creamy',
    peppers: '🌶️',
    spiceValue: 1,
    description: 'Subtle aromatic spices, creamy gravy, elder & kid friendly',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  medium: {
    level: 'medium',
    label: 'Balanced Desi Spiced',
    peppers: '🌶️🌶️',
    spiceValue: 2,
    description: 'Authentic Mughlai & North Indian balance (Recommended)',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  spicy: {
    level: 'spicy',
    label: 'Hot & Zesty Masala',
    peppers: '🌶️🌶️🌶️',
    spiceValue: 3,
    description: 'Bold green chillies, rich ginger-garlic & roasted masala punch',
    badgeColor: 'bg-orange-50 text-orange-700 border-orange-200',
  },
  'extra-spicy': {
    level: 'extra-spicy',
    label: 'Desi Extra Fiery Hot',
    peppers: '🌶️🌶️🌶️🌶️',
    spiceValue: 4,
    description: 'Kolhapuri / Andhra style intense chilli heat for true spice lovers',
    badgeColor: 'bg-red-50 text-red-700 border-red-200',
  },
};

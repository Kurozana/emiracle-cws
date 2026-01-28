/**
 * Build data for Emiracle CWS
 * This file contains all the structured data for the build guide
 * Populate this with content from Emiracles' Google Docs
 */

export interface GearItem {
  name: string;
  slot: string;
  rarity: 'normal' | 'magic' | 'rare' | 'unique';
  required: boolean;
  priority: number;
  description: string;
  alternatives?: string[];
  imageUrl?: string;
}

export interface GemSetup {
  name: string;
  gems: string[];
  location: string; // e.g., "6-link body armour"
  notes?: string;
}

export interface LevelingStep {
  level: string;
  acts: string;
  skills: string[];
  gear: string[];
  tips: string[];
}

export interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

// Placeholder data - replace with actual content
export const gearItems: GearItem[] = [
  // Add gear items here
];

export const gemSetups: GemSetup[] = [
  // Add gem setups here
];

export const levelingSteps: LevelingStep[] = [
  // Add leveling steps here
];

export const faqItems: FAQItem[] = [
  // Add FAQ items here
];

export const buildInfo = {
  name: 'Cast When Stunned',
  creator: 'Emiracles',
  version: '3.XX', // Update with current PoE version
  lastUpdated: new Date().toISOString(),
  pobLink: '', // Add Path of Building link
  difficulty: 'Intermediate',
  playstyle: 'Tanky / Automated',
  budgetTier: 'Medium',
};


export type SectionType = 'HERO_SLIDER' | 'FEATURE_BLOCK' | 'PRICE_TABLE' | 'FAQ_SECTION';

export interface PageSection {
  id: string;
  type: SectionType;
  content: any; // Data specific to each block type
}

export interface SliderItem {
  id: string;
  text: string;
  bgColor: string;
  imageUrl?: string;
}

export interface PriceTableContent {
  title: string;
  headers: string[];
  rows: string[][];
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface CustomPage {
  id: string;
  title: string;
  slug: string;
  sections: PageSection[];
}

export interface SiteContent {
  brandName: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  pages: CustomPage[];
}

export interface User {
  username: string;
  isAuthenticated: boolean;
}

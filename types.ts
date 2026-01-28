
export interface PriceRow {
  model: string;
  battery: string;
  screen: string;
  lens: string;
  motherboard: string;
  backGlass: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface SliderItem {
  id: string;
  text: string;
  bgColor: string;
  imageUrl?: string;
}

export interface SiteContent {
  brandName: string;
  sliderItems: SliderItem[];
  primaryColor: string;
  accentColor: string;
  repairTitle: string;
  repairDesc: string;
  repairImage: string;
  priceRows: PriceRow[];
  faqs: FAQItem[];
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
}

export interface User {
  username: string;
  isAuthenticated: boolean;
}

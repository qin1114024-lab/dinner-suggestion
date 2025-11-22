export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface Review {
  author: string;
  rating: number;
  text: string;
  relativeTime?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  reviewCount: number;
  address: string;
  description: string;
  priceLevel: string; // e.g., "$", "$$"
  isOpenNow?: boolean;
  reviews: Review[];
  reservationLink?: string;
  googleMapsUrl?: string;
  websiteUrl?: string;
  imageUrl?: string; // Placeholder logic usually
}

export type LoadingState = 'idle' | 'locating' | 'searching' | 'success' | 'error';

export enum CuisineType {
  RECOMMENDED = "精選推薦",
  JAPANESE = "日式料理",
  ITALIAN = "義式料理",
  CHINESE = "中式料理",
  CAFE = "咖啡廳",
  BBQ = "燒烤",
  VEGAN = "素食",
  BAR = "酒吧/餐酒館"
}
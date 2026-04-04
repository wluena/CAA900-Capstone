export const APP_CONFIG = {
  NAME: 'ElectroTech',
  SUFFIX: ' Store',
  YEAR: 2026,
  DEVELOPER: 'WJL', 
  
  // Pull from .env if available, otherwise use your current values as fallback
  API_URL: import.meta.env.VITE_API_URL || 'https://rphbveh8mb.execute-api.us-east-1.amazonaws.com/prod',
  CDN_URL: import.meta.env.VITE_CDN_URL || 'https://d398wqhg4qwscj.cloudfront.net', 
};

export const CATEGORIES = [
  'All',
  'Laptops',
  'Mobile Phones',
  'Accessories',
];

export const UI_STRINGS = {
  HERO_TITLE: 'Best Deals',
  HERO_SUBTITLE: 'High-performance electronics',
  FOOTER_TEXT: 'Developed by WJL',
  SECURE_PAYMENT: 'Secure Checkout via Stripe',
  EMPTY_CART: 'Your cart is empty. Start shopping!',
};

export const COLORS = {
  PRIMARY: "#e11d48",
  PRIMARY_HOVER: "#be123c",
};
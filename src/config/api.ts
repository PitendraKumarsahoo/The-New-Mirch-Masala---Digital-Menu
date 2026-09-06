/**
 * Centralized API Configuration for Google Apps Script Web App
 * The New Mirch Masala — Digital Menu & Loyalty Platform
 */

// Verified active Google Apps Script deployment connected to live Google Sheets
export const DEFAULT_API_BASE_URL =
  'https://script.google.com/macros/s/AKfycbz8xOrKbh6SmCNhssRw93Beib27-h0HYJjYZOXOfe1iO8RwC3_zlmqSjjY9Juu6AfLV/exec';

// Prioritize VITE_API_URL if explicitly provided by environment
const getApiBaseUrl = (): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    if (import.meta.env.VITE_API_URL) {
      return import.meta.env.VITE_API_URL;
    }
    if (import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL) {
      return import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL;
    }
  }
  return DEFAULT_API_BASE_URL;
};

export const API_BASE_URL = getApiBaseUrl();


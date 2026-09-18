/**
 * Centralized Validation Rules & Error Code Constants
 * Provides shared validation boundaries, constraints, and standard error definitions.
 */

// String Length Boundaries
export const MIN_NAME_LENGTH = 2;
export const MAX_NAME_LENGTH = 100;

export const MIN_DESC_LENGTH = 0;
export const MAX_DESC_LENGTH = 500;

export const MIN_PHONE_LENGTH = 10;
export const MAX_PHONE_LENGTH = 15;

export const MIN_PASSWORD_LENGTH = 6;
export const MAX_PASSWORD_LENGTH = 100;

export const MAX_CATEGORY_LENGTH = 60;
export const MAX_SUBCATEGORY_LENGTH = 60;
export const MAX_TAGLINE_LENGTH = 150;
export const MAX_LOCATION_LENGTH = 200;
export const MAX_URL_LENGTH = 1000;
export const MAX_FEEDBACK_LENGTH = 1000;
export const MAX_TOPICS_COUNT = 10;

// Numeric Boundaries
export const MIN_PRICE = 0;
export const MAX_PRICE = 100000;

export const MIN_REQUIRED_VISITS = 1;
export const MAX_REQUIRED_VISITS = 100;

export const MIN_RATING = 1;
export const MAX_RATING = 5;

// Standard Error Codes
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  DUPLICATE_RESOURCE: 'DUPLICATE_RESOURCE',
  DUPLICATE_VISIT: 'DUPLICATE_VISIT',
  LOCK_TIMEOUT: 'LOCK_TIMEOUT',
  SERVER_ERROR: 'SERVER_ERROR',
  METHOD_NOT_ALLOWED: 'METHOD_NOT_ALLOWED',
  SCHEMA_DRIFT: 'SCHEMA_DRIFT',
} as const;

export type StandardErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

// Common Validation Result Interface
export interface ValidationResult<T = unknown> {
  valid: boolean;
  value?: T;
  error?: string;
  field?: string;
}

// Validation Error Detail
export interface ValidationErrorDetail {
  field?: string;
  message: string;
  code?: string;
}

// Standard Structured Error API Response
export interface StandardApiErrorResponse {
  success: false;
  error: string;
  errorCode: StandardErrorCode | string;
  timestamp: string;
  details?: ValidationErrorDetail[];
}

// Field Schema Specification for Multi-field Validators
export interface FieldSchema {
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required?: boolean;
  min?: number;
  max?: number;
  regex?: RegExp;
  custom?: (val: unknown) => boolean | string;
}

export type ObjectSchema = Record<string, FieldSchema>;

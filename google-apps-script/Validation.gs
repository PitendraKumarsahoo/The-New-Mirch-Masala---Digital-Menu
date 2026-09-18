/**
 * ============================================================================
 * VALIDATION HELPER MODULE (Google Apps Script)
 * Reusable backend validators, field schema verifiers, and LockService helpers.
 * ============================================================================
 */

// Error Code Constants for Apps Script
var APP_ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  DUPLICATE_RESOURCE: 'DUPLICATE_RESOURCE',
  DUPLICATE_VISIT: 'DUPLICATE_VISIT',
  LOCK_TIMEOUT: 'LOCK_TIMEOUT',
  SERVER_ERROR: 'SERVER_ERROR',
  METHOD_NOT_ALLOWED: 'METHOD_NOT_ALLOWED',
  SCHEMA_DRIFT: 'SCHEMA_DRIFT'
};

// Standard Constraints
var VALIDATION_LIMITS = {
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 100,
  MIN_DESC_LENGTH: 0,
  MAX_DESC_LENGTH: 500,
  MIN_PHONE_LENGTH: 10,
  MAX_PHONE_LENGTH: 15,
  MIN_PRICE: 0,
  MAX_PRICE: 100000,
  MIN_REQUIRED_VISITS: 1,
  MAX_REQUIRED_VISITS: 100,
  MIN_RATING: 1,
  MAX_RATING: 5
};

/**
 * Validates required fields in incoming request payloads.
 * Supports either an array of field names or a schema specification object.
 *
 * @param {Object} data - The payload object to check.
 * @param {Array<string>|Object} schema - Array of required keys or schema object.
 * @return {{ valid: boolean, error?: string, missingFields?: Array<string>, field?: string }}
 */
function validateRequiredFields(data, schema) {
  if (!data || typeof data !== 'object') {
    return {
      valid: false,
      error: 'Invalid request data payload provided.',
      field: '_root'
    };
  }

  // 1. If schema is an array of field names: ['name', 'price', 'restaurantId']
  if (Array.isArray(schema)) {
    var missing = [];
    for (var i = 0; i < schema.length; i++) {
      var fieldName = schema[i];
      var val = data[fieldName];
      if (val === undefined || val === null || (typeof val === 'string' && val.trim() === '')) {
        missing.push(fieldName);
      }
    }
    if (missing.length > 0) {
      return {
        valid: false,
        error: 'Missing required field' + (missing.length > 1 ? 's: ' : ': ') + missing.join(', '),
        missingFields: missing,
        field: missing[0]
      };
    }
    return { valid: true };
  }

  // 2. If schema is an object defining rules per field:
  // e.g. { name: { type: 'string', required: true, min: 2, max: 100 }, price: { type: 'number', required: true, min: 0 } }
  if (typeof schema === 'object') {
    var keys = Object.keys(schema);
    for (var k = 0; k < keys.length; k++) {
      var key = keys[k];
      var rule = schema[key] || {};
      var value = data[key];

      // Check required
      if (rule.required) {
        if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
          return {
            valid: false,
            error: (rule.label || key) + ' is required.',
            field: key
          };
        }
      }

      // If optional and not provided, continue
      if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
        continue;
      }

      // Type checks
      if (rule.type === 'string') {
        var str = String(value).trim();
        if (rule.min !== undefined && str.length < rule.min) {
          return {
            valid: false,
            error: (rule.label || key) + ' must be at least ' + rule.min + ' characters.',
            field: key
          };
        }
        if (rule.max !== undefined && str.length > rule.max) {
          return {
            valid: false,
            error: (rule.label || key) + ' cannot exceed ' + rule.max + ' characters.',
            field: key
          };
        }
      } else if (rule.type === 'number') {
        var num = Number(value);
        if (isNaN(num)) {
          return {
            valid: false,
            error: (rule.label || key) + ' must be a valid number.',
            field: key
          };
        }
        if (rule.min !== undefined && num < rule.min) {
          return {
            valid: false,
            error: (rule.label || key) + ' must be at least ' + rule.min + '.',
            field: key
          };
        }
        if (rule.max !== undefined && num > rule.max) {
          return {
            valid: false,
            error: (rule.label || key) + ' cannot exceed ' + rule.max + '.',
            field: key
          };
        }
      }
    }
    return { valid: true };
  }

  return { valid: true };
}

/**
 * Validates a numeric item or add-on price.
 * Ensures price is numeric, non-negative, and under maximum threshold.
 *
 * @param {number|string} price - Price value to validate.
 * @param {string} [fieldName='Price'] - Optional display name.
 * @return {{ valid: boolean, value: number, error?: string }}
 */
function validatePrice(price, fieldName) {
  fieldName = fieldName || 'Price';

  if (price === undefined || price === null || String(price).trim() === '') {
    return {
      valid: false,
      value: 0,
      error: fieldName + ' is required.'
    };
  }

  var num = Number(price);
  if (isNaN(num)) {
    return {
      valid: false,
      value: 0,
      error: fieldName + ' must be a valid number.'
    };
  }

  if (num < VALIDATION_LIMITS.MIN_PRICE) {
    return {
      valid: false,
      value: 0,
      error: fieldName + ' cannot be negative.'
    };
  }

  if (num > VALIDATION_LIMITS.MAX_PRICE) {
    return {
      valid: false,
      value: 0,
      error: fieldName + ' cannot exceed ₹' + VALIDATION_LIMITS.MAX_PRICE + '.'
    };
  }

  // Round to 2 decimal places
  var rounded = Math.round(num * 100) / 100;
  return {
    valid: true,
    value: rounded
  };
}

/**
 * Validates tenant restaurant access and isolation.
 * Checks restaurantId against active user session or expected restaurant ID.
 *
 * @param {string} restaurantId - The restaurantId from parameters.
 * @param {Object|string} [sessionOrExpected] - User session object or expected restaurant ID string.
 * @return {{ valid: boolean, restaurantId: string, error?: string, errorCode?: string }}
 */
function validateRestaurantAccess(restaurantId, sessionOrExpected) {
  var cleanId = String(restaurantId || '').trim();

  if (!cleanId) {
    return {
      valid: false,
      restaurantId: '',
      error: 'restaurantId is required.',
      errorCode: APP_ERROR_CODES.VALIDATION_ERROR
    };
  }

  // Prevent path traversal or control characters in restaurant ID
  if (!/^[a-zA-Z0-9_\-\.]+$/.test(cleanId)) {
    return {
      valid: false,
      restaurantId: cleanId,
      error: 'restaurantId contains invalid characters.',
      errorCode: APP_ERROR_CODES.VALIDATION_ERROR
    };
  }

  // If a session or expected restaurant ID is supplied, enforce match
  if (sessionOrExpected) {
    var expectedId = '';
    if (typeof sessionOrExpected === 'string') {
      expectedId = sessionOrExpected.trim();
    } else if (typeof sessionOrExpected === 'object') {
      if (sessionOrExpected.session && sessionOrExpected.session.restaurantId) {
        expectedId = sessionOrExpected.session.restaurantId;
      } else if (sessionOrExpected.restaurantId) {
        expectedId = sessionOrExpected.restaurantId;
      } else if (sessionOrExpected.user && sessionOrExpected.user.restaurantId) {
        expectedId = sessionOrExpected.user.restaurantId;
      }
    }

    if (expectedId && cleanId.toLowerCase() !== expectedId.toLowerCase()) {
      return {
        valid: false,
        restaurantId: cleanId,
        error: 'Access denied. You do not have permission to access or modify records for this restaurant.',
        errorCode: APP_ERROR_CODES.FORBIDDEN
      };
    }
  }

  return {
    valid: true,
    restaurantId: cleanId
  };
}

/**
 * Validates item, customer, or staff names.
 *
 * @param {string} name - The name string.
 * @param {number} [minLen=2] - Minimum length.
 * @param {number} [maxLen=100] - Maximum length.
 * @param {string} [fieldName='Name'] - Field display name.
 * @return {{ valid: boolean, value: string, error?: string }}
 */
function validateName(name, minLen, maxLen, fieldName) {
  minLen = minLen !== undefined ? minLen : VALIDATION_LIMITS.MIN_NAME_LENGTH;
  maxLen = maxLen !== undefined ? maxLen : VALIDATION_LIMITS.MAX_NAME_LENGTH;
  fieldName = fieldName || 'Name';

  var clean = String(name || '').trim();
  if (!clean) {
    return { valid: false, value: '', error: fieldName + ' is required.' };
  }
  if (clean.length < minLen) {
    return { valid: false, value: clean, error: fieldName + ' must be at least ' + minLen + ' characters.' };
  }
  if (clean.length > maxLen) {
    return { valid: false, value: clean, error: fieldName + ' cannot exceed ' + maxLen + ' characters.' };
  }
  return { valid: true, value: clean };
}

/**
 * Validates a 10-digit Indian mobile number.
 *
 * @param {string} phone - Phone string to validate.
 * @return {{ valid: boolean, value: string, error?: string }}
 */
function validatePhone(phone) {
  var raw = String(phone || '').trim().replace(/[\s\-\(\)\.]/g, '');
  // Strip leading +91 or 91 or 0 if present
  if (raw.startsWith('+91')) raw = raw.slice(3);
  else if (raw.startsWith('91') && raw.length === 12) raw = raw.slice(2);
  else if (raw.startsWith('0') && raw.length === 11) raw = raw.slice(1);

  if (!/^\d{10}$/.test(raw)) {
    return {
      valid: false,
      value: raw,
      error: 'Please enter a valid 10-digit Indian mobile number.'
    };
  }
  return { valid: true, value: raw };
}

/**
 * LockService Wrapper for sensitive write operations.
 * Safely acquires the script lock, executes the callback, and guarantees lock release.
 *
 * @param {number} timeoutMs - Max time in milliseconds to wait for the lock (e.g. 10000).
 * @param {Function} actionFn - The write operation function to execute under lock.
 * @param {string} [operationName='Write operation'] - Optional operation description for errors.
 * @return {Object} The JSON response object returned by actionFn or structured lock error.
 */
function withScriptLock(timeoutMs, actionFn, operationName) {
  timeoutMs = timeoutMs || 10000;
  operationName = operationName || 'Operation';

  var lock = LockService.getScriptLock();
  var hasLock = false;

  try {
    hasLock = lock.tryLock(timeoutMs);
    if (!hasLock) {
      return {
        success: false,
        error: operationName + ' could not be processed because the server is busy with another concurrent request. Please retry in a moment.',
        errorCode: APP_ERROR_CODES.LOCK_TIMEOUT,
        timestamp: new Date().toISOString()
      };
    }

    return actionFn();
  } catch (err) {
    return {
      success: false,
      error: (err && err.message) ? err.message : 'An unexpected error occurred during execution.',
      errorCode: APP_ERROR_CODES.SERVER_ERROR,
      timestamp: new Date().toISOString()
    };
  } finally {
    if (hasLock) {
      try {
        lock.releaseLock();
      } catch (e) {}
    }
  }
}

/**
 * Helper to construct standardized error response objects.
 */
function createStandardError(errorCode, message, details) {
  var resp = {
    success: false,
    error: message || 'An error occurred.',
    errorCode: errorCode || APP_ERROR_CODES.SERVER_ERROR,
    timestamp: new Date().toISOString()
  };
  if (details) {
    resp.details = details;
  }
  return resp;
}

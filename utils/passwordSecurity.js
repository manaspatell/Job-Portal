// Password Security Utilities

/**
 * Validate password strength
 * Requirements:
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - At least 1 special character (!@#$%^&*)
 */
function validatePasswordStrength(password) {
  const errors = [];
  
  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*)');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

/**
 * Generate password strength score (0-100)
 */
function getPasswordStrengthScore(password) {
  let score = 0;
  
  if (!password) return 0;
  
  // Length score (0-30)
  if (password.length >= 8) score += 10;
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;
  
  // Uppercase letters (0-15)
  if (/[A-Z]/.test(password)) score += 15;
  
  // Lowercase letters (0-15)
  if (/[a-z]/.test(password)) score += 15;
  
  // Numbers (0-15)
  if (/[0-9]/.test(password)) score += 15;
  
  // Special characters (0-10)
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 10;
  
  // Variety check (0-10)
  const uniqueChars = new Set(password).size;
  if (uniqueChars >= 6) score += 10;
  
  return Math.min(score, 100);
}

/**
 * Get password strength label
 */
function getPasswordStrengthLabel(score) {
  if (score < 30) return 'Weak';
  if (score < 60) return 'Fair';
  if (score < 80) return 'Good';
  return 'Strong';
}

module.exports = {
  validatePasswordStrength,
  getPasswordStrengthScore,
  getPasswordStrengthLabel
};

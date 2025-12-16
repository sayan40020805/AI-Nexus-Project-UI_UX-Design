/**
 * Parameter validation utilities
 * Provides comprehensive validation for various parameter types
 */

// Email validation regex
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password validation regex (at least one uppercase, one lowercase, one number)
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {Object} - { isValid: boolean, error: string }
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email is required' };
  }

  const trimmedEmail = email.trim().toLowerCase();
  
  if (trimmedEmail.length === 0) {
    return { isValid: false, error: 'Email is required' };
  }

  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  if (trimmedEmail.length > 254) {
    return { isValid: false, error: 'Email address is too long' };
  }

  return { isValid: true, email: trimmedEmail };
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @param {number} minLength - Minimum password length (default: 6)
 * @returns {Object} - { isValid: boolean, error: string }
 */
export const validatePassword = (password, minLength = 6) => {
  if (!password || typeof password !== 'string') {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < minLength) {
    return { isValid: false, error: `Password must be at least ${minLength} characters long` };
  }

  if (!PASSWORD_REGEX.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' };
  }

  return { isValid: true };
};

/**
 * Validate username
 * @param {string} username - Username to validate
 * @returns {Object} - { isValid: boolean, error: string }
 */
export const validateUsername = (username) => {
  if (!username || typeof username !== 'string') {
    return { isValid: false, error: 'Username is required' };
  }

  const trimmedUsername = username.trim();

  if (trimmedUsername.length === 0) {
    return { isValid: false, error: 'Username is required' };
  }

  if (trimmedUsername.length < 3) {
    return { isValid: false, error: 'Username must be at least 3 characters long' };
  }

  if (trimmedUsername.length > 30) {
    return { isValid: false, error: 'Username must be less than 30 characters' };
  }

  // Check for valid characters (letters, numbers, underscores, hyphens)
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmedUsername)) {
    return { isValid: false, error: 'Username can only contain letters, numbers, underscores, and hyphens' };
  }

  return { isValid: true, username: trimmedUsername };
};

/**
 * Validate company name
 * @param {string} companyName - Company name to validate
 * @returns {Object} - { isValid: boolean, error: string }
 */
export const validateCompanyName = (companyName) => {
  if (!companyName || typeof companyName !== 'string') {
    return { isValid: false, error: 'Company name is required' };
  }

  const trimmedName = companyName.trim();

  if (trimmedName.length === 0) {
    return { isValid: false, error: 'Company name is required' };
  }

  if (trimmedName.length < 2) {
    return { isValid: false, error: 'Company name must be at least 2 characters long' };
  }

  if (trimmedName.length > 100) {
    return { isValid: false, error: 'Company name must be less than 100 characters' };
  }

  return { isValid: true, companyName: trimmedName };
};

/**
 * Validate company description
 * @param {string} description - Company description to validate
 * @returns {Object} - { isValid: boolean, error: string }
 */
export const validateCompanyDescription = (description) => {
  if (!description || typeof description !== 'string') {
    return { isValid: true, description: '' }; // Optional field
  }

  const trimmedDescription = description.trim();

  if (trimmedDescription.length > 500) {
    return { isValid: false, error: 'Company description must be less than 500 characters' };
  }

  return { isValid: true, description: trimmedDescription };
};

/**
 * Validate file upload
 * @param {File} file - File to validate
 * @param {Object} options - Validation options
 * @returns {Object} - { isValid: boolean, error: string }
 */
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
    required = false
  } = options;

  if (!file) {
    return required 
      ? { isValid: false, error: 'File is required' }
      : { isValid: true };
  }

  if (!(file instanceof File)) {
    return { isValid: false, error: 'Invalid file provided' };
  }

  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    return { isValid: false, error: `File size must be less than ${maxSizeMB}MB` };
  }

  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Invalid file type. Only JPEG, PNG, and GIF files are allowed' };
  }

  return { isValid: true, file };
};

/**
 * Validate role parameter
 * @param {string} role - Role to validate
 * @returns {Object} - { isValid: boolean, error: string }
 */
export const validateRole = (role) => {
  const validRoles = ['user', 'company'];

  if (!role || typeof role !== 'string') {
    return { isValid: false, error: 'Role is required' };
  }

  if (!validRoles.includes(role)) {
    return { isValid: false, error: 'Invalid role specified' };
  }

  return { isValid: true, role };
};

/**
 * Validate form data for user registration
 * @param {Object} formData - Form data to validate
 * @returns {Object} - { isValid: boolean, errors: Object }
 */
export const validateUserRegistration = (formData) => {
  const errors = {};
  let isValid = true;

  // Validate username
  const usernameValidation = validateUsername(formData.username);
  if (!usernameValidation.isValid) {
    errors.username = usernameValidation.error;
    isValid = false;
  }

  // Validate email
  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error;
    isValid = false;
  } else {
    formData.email = emailValidation.email;
  }

  // Validate password
  const passwordValidation = validatePassword(formData.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.error;
    isValid = false;
  }

  // Validate profile picture (optional)
  if (formData.profilePic) {
    const fileValidation = validateFile(formData.profilePic, { required: false });
    if (!fileValidation.isValid) {
      errors.profilePic = fileValidation.error;
      isValid = false;
    }
  }

  return { isValid, errors, cleanedData: formData };
};

/**
 * Validate form data for company registration
 * @param {Object} formData - Form data to validate
 * @returns {Object} - { isValid: boolean, errors: Object }
 */
export const validateCompanyRegistration = (formData) => {
  const errors = {};
  let isValid = true;

  // Validate company name
  const companyNameValidation = validateCompanyName(formData.companyName);
  if (!companyNameValidation.isValid) {
    errors.companyName = companyNameValidation.error;
    isValid = false;
  }

  // Validate email
  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error;
    isValid = false;
  } else {
    formData.email = emailValidation.email;
  }

  // Validate password
  const passwordValidation = validatePassword(formData.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.error;
    isValid = false;
  }

  // Validate company description (optional)
  if (formData.companyDescription) {
    const descriptionValidation = validateCompanyDescription(formData.companyDescription);
    if (!descriptionValidation.isValid) {
      errors.companyDescription = descriptionValidation.error;
      isValid = false;
    } else {
      formData.companyDescription = descriptionValidation.description;
    }
  }

  // Validate company logo (optional)
  if (formData.companyLogo) {
    const fileValidation = validateFile(formData.companyLogo, { required: false });
    if (!fileValidation.isValid) {
      errors.companyLogo = fileValidation.error;
      isValid = false;
    }
  }

  return { isValid, errors, cleanedData: formData };
};

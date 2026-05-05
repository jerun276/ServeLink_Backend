export const isRequired = value => String(value ?? '').trim().length > 0;

export const isEmail = value => /\S+@\S+\.\S+/.test(String(value || '').trim());

export const minLength = (value, length) => String(value || '').trim().length >= length;

export const validateLogin = ({ email, password }) => {
  if (!isEmail(email)) return 'Enter a valid email address.';
  if (!isRequired(password)) return 'Password is required.';
  return '';
};

export const validateRegister = ({ name, email, phone, password }) => {
  if (!isRequired(name)) return 'Full name is required.';
  if (!isEmail(email)) return 'Enter a valid email address.';
  if (!isRequired(phone)) return 'Phone number is required.';
  
  // Phone validation: only digits, min 10
  const cleanPhone = String(phone).replace(/\D/g, '');
  if (cleanPhone.length < 10) return 'Phone number must be at least 10 digits.';
  
  if (!minLength(password, 8)) return 'Password must be at least 8 characters.';
  if (!/[A-Z]/.test(password)) return 'Password needs at least one uppercase letter.';
  if (!/[0-9]/.test(password)) return 'Password needs at least one number.';
  
  return '';
};

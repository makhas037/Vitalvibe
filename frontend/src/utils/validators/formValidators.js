// utils/validators/formValidators.js
export const formValidators = {
  isEmail: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  
  isPassword: (password) => password.length >= 8,
  
  isPhoneNumber: (phone) => /^\+?[\d\s()-]{10,}$/.test(phone),
  
  isUrl: (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  isEmpty: (value) => !value || value.trim().length === 0,
  
  isNumber: (value) => !isNaN(parseFloat(value)) && isFinite(value),
  
  validateForm: (values, schema) => {
    const errors = {};
    for (const [field, rules] of Object.entries(schema)) {
      for (const rule of rules) {
        const error = rule(values[field]);
        if (error) {
          errors[field] = error;
          break;
        }
      }
    }
    return errors;
  }
};

export default formValidators;

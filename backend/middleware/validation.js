// FILE: E:\CLOUD PROJECT\vitalvibe\backend\middleware\validation.js
// PURPOSE: Data validation middleware

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }))
      });
    }

    req.validatedData = value;
    next();
  };
};

module.exports = { validateRequest };

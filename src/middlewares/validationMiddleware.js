function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(err => ({
        field: err.path[0],
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors
      });
    }
    
    req.validatedData = value;
    next();
  };
}

module.exports = validate;
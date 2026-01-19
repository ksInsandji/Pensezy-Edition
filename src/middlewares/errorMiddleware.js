function errorHandler(err, req, res, next) {
  let { statusCode, message } = err;
  
  if (!statusCode) {
    statusCode = 500;
    message = 'Erreur serveur interne';
  }
  
  console.error('ERROR:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

module.exports = errorHandler;
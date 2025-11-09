// FILE: E:\CLOUD PROJECT\vitalvibe\backend\middleware\requestLogger.js
// PURPOSE: Request logging middleware

const logger = (req, res, next) => {
  const startTime = Date.now();

  // Log incoming request
  console.log(`📨 ${req.method} ${req.path}`);

  // Override res.json to log response
  const originalJson = res.json;
  res.json = function(data) {
    const duration = Date.now() - startTime;
    console.log(`✅ ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
    return originalJson.call(this, data);
  };

  next();
};

module.exports = logger;

export const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API Route Not Found - [${req.method}] ${req.originalUrl}`,
    error: 'RESOURCE_NOT_FOUND'
  });
};

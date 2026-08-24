export const errorHandler = (err, req, res, next) => {
  console.error(`Error: ${err.message}`, err.stack)
  
  const status = err.statusCode || 500
  const message = process.env.NODE_ENV === 'production' 
    ? 'Something went wrong.' 
    : err.message

  return res.status(status).json({
    success: false,
    message
  })
}

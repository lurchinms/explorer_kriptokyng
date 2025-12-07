export const getFetchOptions = (revalidateSeconds = 10) => {
  // In production, we want to prevent caching for real-time data
  if (process.env.NODE_ENV === 'production') {
    return {
      cache: 'no-store' as RequestCache,
      next: { revalidate: 0 }
    };
  }
  
  // In development, we can use normal revalidation
  return {
    next: { revalidate: revalidateSeconds }
  };
};
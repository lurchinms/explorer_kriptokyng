// RapidAPI configuration
const BASE_NEWS_URL = "cryptocurrency-news2.p.rapidapi.com";
const NEWS_API_KEY = process.env.RAPIDAPI_NEWS_KEY || "33dc3c52d1mshd38a20fa96c65bfp1b095fjsnb82095118346";

const BASE_CRYPTO_URL = "coinranking1.p.rapidapi.com";
const CRYPTO_API_KEY = process.env.RAPIDAPI_CRYPTO_KEY || "45badc4c36msh735f055aee8d769p1fcbedjsn6cd5305f3770";

export const rapidAPIConfig = {
  BASE_NEWS_URL,
  BASE_CRYPTO_URL,
  NEWS_API_KEY,
  CRYPTO_API_KEY,
};

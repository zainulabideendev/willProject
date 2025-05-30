import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Validate Supabase URL format
try {
  new URL(supabaseUrl);
} catch (e) {
  throw new Error(`Invalid Supabase URL format: ${supabaseUrl}`);
}

// Simplified retry configuration for better reliability
const MAX_RETRIES = 3;
const BASE_DELAY = 1000;
const FETCH_TIMEOUT = 15000;

// Enhanced fetch with better error handling and retry logic
async function fetchWithRetry(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  let lastError: Error | null = null;
  
  // Validate URL before attempting fetch
  const url = input.toString();
  try {
    new URL(url);
  } catch (e) {
    throw new Error(`Invalid URL: ${url}`);
  }

  // Initialize headers with the required Supabase headers
  const headers = new Headers(init?.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (!headers.has('apikey') && !headers.has('Authorization')) {
    headers.set('apikey', supabaseAnonKey);
  }

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort('Request timeout');
      }, FETCH_TIMEOUT);

      try {
        const response = await fetch(input, {
          ...init,
          headers,
          signal: controller.signal,
          credentials: 'include',
          mode: 'cors' // Explicitly set CORS mode
        });

        if (!response.ok) {
          const status = response.status;
          
          // Don't retry client errors (except 429 - too many requests)
          if (status >= 400 && status < 500 && status !== 429) {
            throw new Error(`HTTP error! status: ${status}`);
          }
          
          // For 429, use the Retry-After header if available
          if (status === 429) {
            const retryAfter = response.headers.get('Retry-After');
            if (retryAfter) {
              const delay = parseInt(retryAfter, 10) * 1000;
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            }
          }
        }

        return response;
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      console.warn(`Fetch attempt ${attempt} failed:`, error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          lastError = new Error('Request timed out. Please check your internet connection.');
        } else if (!navigator.onLine) {
          lastError = new Error('No internet connection. Please check your network settings.');
        } else if (error.message.includes('Failed to fetch')) {
          lastError = new Error(`Unable to connect to Supabase. Please verify your project configuration and try again.`);
        } else {
          lastError = error;
        }
      } else {
        lastError = new Error('An unknown error occurred while connecting to Supabase.');
      }

      // Don't retry on final attempt or specific errors
      if (
        attempt === MAX_RETRIES ||
        (error instanceof Error && error.message.includes('HTTP error!')) ||
        !navigator.onLine
      ) {
        throw lastError;
      }

      // Simple exponential backoff
      const delay = BASE_DELAY * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError || new Error('Failed to connect to Supabase after multiple attempts.');
}

// Create Supabase client with enhanced configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'willup-auth'
  },
  global: {
    fetch: fetchWithRetry,
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseAnonKey
    }
  }
});
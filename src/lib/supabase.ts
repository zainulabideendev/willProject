import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Validate Supabase URL format
try {
  new URL(supabaseUrl);
} catch (e) {
  throw new Error(`Invalid Supabase URL format: ${supabaseUrl}`);
}

// Enhanced retry configuration
const MAX_RETRIES = 3;
const BASE_DELAY = 1000;
const MAX_DELAY = 5000;
const FETCH_TIMEOUT = 30000;

// Check if URL is accessible
async function isUrlAccessible(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(`${url}/rest/v1/`, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'apikey': supabaseAnonKey,
          'Content-Type': 'application/json'
        }
      });
      return response.ok;
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    console.warn('URL accessibility check failed:', error);
    return false;
  }
}

// Enhanced fetch with exponential backoff, jitter, and timeout
async function fetchWithRetry(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  let lastError: Error | null = null;
  
  // Validate URL before attempting fetch
  const url = input.toString();
  try {
    new URL(url);
  } catch (e) {
    throw new Error(`Invalid URL: ${url}`);
  }

  // Basic online check
  if (!navigator.onLine) {
    throw new Error('No internet connection available');
  }

  // Check if Supabase URL is accessible before proceeding
  const isAccessible = await isUrlAccessible(supabaseUrl);
  if (!isAccessible) {
    throw new Error(`Unable to connect to Supabase at ${supabaseUrl}. Please check your configuration and try again.`);
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
          // Add credentials mode for CORS
          credentials: 'include'
        });

        // Check for specific HTTP status codes that warrant retries
        if (!response.ok) {
          const status = response.status;
          
          // Don't retry client errors (except 429 - too many requests)
          if (status >= 400 && status < 500 && status !== 429) {
            throw new Error(`Client error: ${status}`);
          }
          
          // For 429 (rate limit), use the Retry-After header if available
          if (status === 429) {
            const retryAfter = response.headers.get('Retry-After');
            if (retryAfter) {
              const delay = parseInt(retryAfter, 10) * 1000;
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            }
          }
          
          throw new Error(`HTTP error! status: ${status}`);
        }

        return response;
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      console.warn(`Fetch attempt ${attempt} failed:`, error);
      
      // Enhanced error handling
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          lastError = new Error('Request timeout - server took too long to respond');
        } else if (error.name === 'TypeError') {
          if (error.message.includes('Failed to fetch')) {
            lastError = new Error(`Network error - Unable to connect to Supabase at ${supabaseUrl}. Please check your configuration and try again.`);
          } else {
            lastError = error;
          }
        } else if (error.message.includes('NetworkError')) {
          lastError = new Error('Network error - check your connection and try again');
        } else if (!navigator.onLine) {
          lastError = new Error('No internet connection');
        } else {
          lastError = error;
        }
      } else {
        lastError = new Error('Unknown error occurred');
      }

      // Don't retry if:
      // 1. It's the last attempt
      // 2. It's a client error (except rate limiting)
      // 3. It's a validation error
      // 4. There's no internet connection
      if (
        attempt === MAX_RETRIES ||
        (error instanceof Error && error.message.startsWith('Client error') && !error.message.includes('429')) ||
        error instanceof Error && error.message.startsWith('Invalid URL') ||
        !navigator.onLine
      ) {
        throw lastError;
      }

      // Calculate delay with exponential backoff and jitter
      const delay = Math.min(
        BASE_DELAY * Math.pow(2, attempt - 1) + Math.random() * BASE_DELAY,
        MAX_DELAY
      );
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

// Create Supabase client with enhanced configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'willup-auth'
  },
  headers: {
    'X-Client-Info': 'willup-web'
  },
  global: {
    fetch: fetchWithRetry,
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseAnonKey
    }
  }
});
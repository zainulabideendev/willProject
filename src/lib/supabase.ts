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

// Enhanced retry configuration with more reasonable values
const MAX_RETRIES = 5;
const BASE_DELAY = 500; // Reduced from 1000ms to 500ms
const MAX_DELAY = 3000; // Reduced from 5000ms to 3000ms
const FETCH_TIMEOUT = 10000; // Reduced from 30000ms to 10000ms

// Enhanced URL accessibility check with better error handling
async function isUrlAccessible(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // Reduced timeout

    try {
      const response = await fetch(`${url}/rest/v1/`, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'apikey': supabaseAnonKey,
          'Content-Type': 'application/json'
        },
        // Add cache control to prevent stale responses
        cache: 'no-cache',
        // Add credentials mode for CORS
        credentials: 'include'
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

  // Enhanced online check with connection quality assessment
  if (!navigator.onLine) {
    throw new Error('No internet connection available');
  }

  // Initialize headers with the required Supabase headers
  const headers = new Headers(init?.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (!headers.has('apikey') && !headers.has('Authorization')) {
    headers.set('apikey', supabaseAnonKey);
  }

  // Add cache control headers
  headers.set('Cache-Control', 'no-cache');
  headers.set('Pragma', 'no-cache');

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
          cache: 'no-cache'
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
      
      // Enhanced error handling with more specific messages
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          lastError = new Error(`Request timeout after ${FETCH_TIMEOUT}ms - server took too long to respond`);
        } else if (error.name === 'TypeError') {
          if (error.message.includes('Failed to fetch')) {
            lastError = new Error(`Network error - Unable to connect to Supabase at ${supabaseUrl}. Please check your internet connection and try again.`);
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
    'X-Client-Info': 'willup-web',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  },
  global: {
    fetch: fetchWithRetry,
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseAnonKey,
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    }
  }
});
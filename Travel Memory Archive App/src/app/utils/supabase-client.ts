import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../../config/supabase-info';

console.log('🔑 projectId:', projectId);
console.log('🔑 publicAnonKey:', publicAnonKey ? 'loaded' : 'missing');

if (!projectId || !publicAnonKey) {
  throw new Error('Missing Supabase credentials');
}

const supabaseUrl = `https://${projectId}.supabase.co`;

console.log('🌐 supabaseUrl:', supabaseUrl);

export { publicAnonKey };

export const supabase = createClient(
  supabaseUrl,
  publicAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: window.localStorage,
    }
  }
);

export const API_BASE_URL = `${supabaseUrl}/functions/v1/make-server-64034c42`;

console.log('✅ Supabase client created');
console.log('✅ API URL:', API_BASE_URL);

// ============================================
// SIMPLE FETCH - NO AUTH REQUIRED!
// ============================================
export async function authenticatedFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  console.log('🌐 Fetching:', endpoint);
  
  // Simple headers - NO AUTH!
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  const fullUrl = `${API_BASE_URL}${endpoint}`;
  console.log('📡 URL:', fullUrl);
  
  // Make request
  const response = await fetch(fullUrl, {
    ...options,
    headers,
  });
  
  console.log('📥 Response:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Error response:', errorText);
    throw new Error(`Request failed: ${response.status}`);
  }
  
  return response;
}

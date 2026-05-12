import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { authenticatedFetch } from '../utils/supabase-client';
import { cache } from '../utils/cache';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

// ============================================
// TYPES
// ============================================

export interface Visit {
  id: string;
  title: string;
  countryName: string;
  cityName?: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  rating: number;
  color?: string; // Trip color
  startDate?: string;
  endDate?: string;
  photos?: string[];
  notes?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface VisitsContextType {
  visits: Visit[];
  loading: boolean;
  error: string | null;
  isStale: boolean;
  lastFetch: number | null;
  
  // Actions
  fetchVisits: (force?: boolean) => Promise<void>;
  addVisit: (visit: Omit<Visit, 'id'>) => Promise<Visit | null>;
  updateVisit: (id: string, updates: Partial<Visit>) => Promise<Visit | null>;
  deleteVisit: (id: string) => Promise<boolean>;
  refreshVisits: () => Promise<void>;
  
  // Computed stats
  stats: {
    totalVisits: number;
    totalCountries: number;
    totalCities: number;
  };
}

// ============================================
// CONTEXT
// ============================================

export const VisitsContext = createContext<VisitsContextType | undefined>(undefined);

const CACHE_KEY = 'visits';
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes
const APP_VERSION = '1.0';

// ============================================
// PROVIDER
// ============================================

export function VisitsProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number | null>(null);
  const [isStale, setIsStale] = useState(false);
  
  const isFetchingRef = useRef(false);
  const mountedRef = useRef(true);

  // ============================================
  // FETCH VISITS
  // ============================================
  
  const fetchVisits = useCallback(async (force: boolean = false) => {
    // Prevent concurrent fetches
    if (isFetchingRef.current && !force) {
      console.log('🔒 Fetch already in progress, skipping...');
      return;
    }

    // Don't fetch if not authenticated
    if (!isAuthenticated) {
      console.log('⏸️ Skipping fetchVisits - user not authenticated');
      setLoading(false);
      return;
    }

    console.log('📍 fetchVisits called', { force, lastFetch });

    // Check cache first (unless forced)
    if (!force) {
      const cachedVisits = cache.get<Visit[]>(CACHE_KEY, CACHE_TTL);
      if (cachedVisits) {
        console.log('✅ Using cached visits:', cachedVisits.length);
        setVisits(cachedVisits);
        setLoading(false);
        setIsStale(false);
        
        const meta = cache.getMeta(CACHE_KEY);
        if (meta) {
          setLastFetch(meta.timestamp);
        }
        
        // Still fetch in background to update
        setTimeout(() => fetchVisits(true), 100);
        return;
      }
    }

    isFetchingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      console.log('🌐 Fetching visits from server...');
      const response = await authenticatedFetch('/visits');

      if (!response.ok) {
        if (response.status === 401) {
          // Try to use stale cache if available
          const staleVisits = cache.getStale<Visit[]>(CACHE_KEY);
          if (staleVisits) {
            console.log('⚠️ Using stale cache due to auth error');
            setVisits(staleVisits);
            setIsStale(true);
            toast.error('Session expired. Please login again.');
            return;
          }
          throw new Error('Unauthorized');
        }
        throw new Error(`Failed to fetch visits: ${response.status}`);
      }

      const data = await response.json();
      const fetchedVisits = data.visits || [];

      console.log('✅ Visits fetched successfully:', fetchedVisits.length);

      if (mountedRef.current) {
        setVisits(fetchedVisits);
        setLastFetch(Date.now());
        setIsStale(false);
        
        // Cache the data
        cache.set(CACHE_KEY, fetchedVisits, APP_VERSION);
      }
    } catch (err) {
      console.error('❌ Error fetching visits:', err);
      
      if (mountedRef.current) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load visits';
        setError(errorMessage);
        
        // Try to use stale cache
        const staleVisits = cache.getStale<Visit[]>(CACHE_KEY);
        if (staleVisits) {
          console.log('⚠️ Using stale cache due to fetch error');
          setVisits(staleVisits);
          setIsStale(true);
        }
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
      isFetchingRef.current = false;
    }
  }, [lastFetch, isAuthenticated]);

  // ============================================
  // ADD VISIT (Optimistic Update)
  // ============================================
  
  const addVisit = useCallback(async (visitData: Omit<Visit, 'id'>): Promise<Visit | null> => {
    console.log('➕ Adding visit:', visitData.title);
    console.log('📊 Full visit data:', visitData);
    
    // Check authentication
    if (!isAuthenticated) {
      console.error('❌ Cannot add visit - user not authenticated');
      toast.error('Please login to add visits');
      return null;
    }

    // Optimistic ID
    const optimisticId = `temp_${Date.now()}`;
    const optimisticVisit: Visit = {
      id: optimisticId,
      ...visitData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Optimistic update
    const previousVisits = [...visits];
    setVisits((prev) => [...prev, optimisticVisit]);

    try {
      console.log('🌐 Sending POST request to /visits');
      console.log('📦 Request body:', JSON.stringify(visitData, null, 2));
      
      const response = await authenticatedFetch('/visits', {
        method: 'POST',
        body: JSON.stringify(visitData),
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Backend returned error:');
        console.error('Status:', response.status);
        console.error('Response text:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || 'Unknown error' };
        }
        
        console.error('Error data:', errorData);
        throw new Error(errorData.error || 'Failed to add visit');
      }

      const data = await response.json();
      const newVisit = data.visit;

      console.log('✅ Visit added successfully:', newVisit.id);
      console.log('✅ Full visit data:', newVisit);

      // Replace optimistic with real data
      setVisits((prev) =>
        prev.map((v) => (v.id === optimisticId ? newVisit : v))
      );

      // Update cache
      const updatedVisits = visits.map((v) => (v.id === optimisticId ? newVisit : v));
      cache.set(CACHE_KEY, updatedVisits, APP_VERSION);

      toast.success('Visit added successfully!');
      return newVisit;
    } catch (err) {
      console.error('❌ Error adding visit:', err);
      console.error('❌ Error type:', typeof err);
      console.error('❌ Error message:', err instanceof Error ? err.message : String(err));
      console.error('❌ Error stack:', err instanceof Error ? err.stack : 'No stack');
      
      // Rollback optimistic update
      setVisits(previousVisits);
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to add visit';
      toast.error(`Failed to add visit: ${errorMessage}`);
      return null;
    }
  }, [visits, isAuthenticated]);

  // ============================================
  // UPDATE VISIT (Optimistic Update)
  // ============================================
  
  const updateVisit = useCallback(async (id: string, updates: Partial<Visit>): Promise<Visit | null> => {
    console.log('✏️ Updating visit:', id);

    // Optimistic update
    const previousVisits = [...visits];
    setVisits((prev) =>
      prev.map((v) =>
        v.id === id
          ? { ...v, ...updates, updatedAt: new Date().toISOString() }
          : v
      )
    );

    try {
      const response = await authenticatedFetch(`/visits/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update visit');
      }

      const data = await response.json();
      const updatedVisit = data.visit;

      console.log('✅ Visit updated successfully:', updatedVisit.id);

      // Update with real data
      setVisits((prev) =>
        prev.map((v) => (v.id === id ? updatedVisit : v))
      );

      // Update cache
      const updatedVisits = visits.map((v) => (v.id === id ? updatedVisit : v));
      cache.set(CACHE_KEY, updatedVisits, APP_VERSION);

      toast.success('Visit updated successfully!');
      return updatedVisit;
    } catch (err) {
      console.error('❌ Error updating visit:', err);
      
      // Rollback optimistic update
      setVisits(previousVisits);
      toast.error('Failed to update visit');
      return null;
    }
  }, [visits]);

  // ============================================
  // DELETE VISIT (Optimistic Update)
  // ============================================
  
  const deleteVisit = useCallback(async (id: string): Promise<boolean> => {
    console.log('🗑️ Deleting visit:', id);

    // Optimistic update
    const previousVisits = [...visits];
    setVisits((prev) => prev.filter((v) => v.id !== id));

    try {
      const response = await authenticatedFetch(`/visits/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete visit');
      }

      console.log('✅ Visit deleted successfully:', id);

      // Update cache
      const updatedVisits = visits.filter((v) => v.id !== id);
      cache.set(CACHE_KEY, updatedVisits, APP_VERSION);

      toast.success('Visit deleted successfully!');
      return true;
    } catch (err) {
      console.error('❌ Error deleting visit:', err);
      
      // Rollback optimistic update
      setVisits(previousVisits);
      toast.error('Failed to delete visit');
      return false;
    }
  }, [visits]);

  // ============================================
  // REFRESH VISITS
  // ============================================
  
  const refreshVisits = useCallback(async () => {
    console.log('🔄 Refreshing visits...');
    await fetchVisits(true);
  }, [fetchVisits]);

  // ============================================
  // COMPUTED STATS
  // ============================================
  
  const stats = React.useMemo(() => {
    const totalVisits = visits.length;
    const uniqueCountries = new Set(visits.map((v) => v.countryCode));
    const uniqueCities = new Set(
      visits.filter((v) => v.cityName).map((v) => v.cityName)
    );

    return {
      totalVisits,
      totalCountries: uniqueCountries.size,
      totalCities: uniqueCities.size,
    };
  }, [visits]);

  // ============================================
  // INITIAL LOAD
  // ============================================
  
  useEffect(() => {
    mountedRef.current = true;
    
    // Only fetch if authenticated
    if (!isAuthenticated) {
      console.log('⏸️ Skipping fetchVisits - user not authenticated');
      setLoading(false);
      return;
    }
    
    // Small delay to ensure auth is ready
    const timer = setTimeout(() => {
      fetchVisits();
    }, 200);

    return () => {
      mountedRef.current = false;
      clearTimeout(timer);
    };
  }, [isAuthenticated]);

  // ============================================
  // CONTEXT VALUE
  // ============================================

  const value: VisitsContextType = {
    visits,
    loading,
    error,
    isStale,
    lastFetch,
    fetchVisits,
    addVisit,
    updateVisit,
    deleteVisit,
    refreshVisits,
    stats,
  };

  return (
    <VisitsContext.Provider value={value}>
      {children}
    </VisitsContext.Provider>
  );
}
import { useContext } from 'react';
import { VisitsContext, VisitsContextType } from '../contexts/VisitsContext';

// ============================================
// USE VISITS HOOK
// ============================================
// Easy access to visits context with type safety

export function useVisits(): VisitsContextType {
  const context = useContext(VisitsContext);
  
  if (!context) {
    throw new Error('useVisits must be used within VisitsProvider');
  }
  
  return context;
}

// ============================================
// COMPUTED HOOKS
// ============================================

/**
 * Get visits by country code
 */
export function useVisitsByCountry(countryCode: string) {
  const { visits } = useVisits();
  return visits.filter((v) => v.countryCode === countryCode);
}

/**
 * Get visited countries
 */
export function useVisitedCountries() {
  const { visits } = useVisits();
  
  const countriesMap = new Map<string, { 
    code: string; 
    name: string; 
    visitCount: number;
    lastVisit: string;
  }>();

  visits.forEach((visit) => {
    const existing = countriesMap.get(visit.countryCode);
    
    if (existing) {
      existing.visitCount++;
      if (visit.startDate && visit.startDate > existing.lastVisit) {
        existing.lastVisit = visit.startDate;
      }
    } else {
      countriesMap.set(visit.countryCode, {
        code: visit.countryCode,
        name: visit.countryName,
        visitCount: 1,
        lastVisit: visit.startDate || new Date().toISOString(),
      });
    }
  });

  return Array.from(countriesMap.values()).sort((a, b) => b.visitCount - a.visitCount);
}

/**
 * Get top rated visits
 */
export function useTopRatedVisits(limit: number = 5) {
  const { visits } = useVisits();
  
  return [...visits]
    .filter((v) => v.rating > 0)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
}

/**
 * Get recent visits
 */
export function useRecentVisits(limit: number = 5) {
  const { visits } = useVisits();
  
  return [...visits]
    .sort((a, b) => {
      const dateA = a.startDate || a.createdAt || '';
      const dateB = b.startDate || b.createdAt || '';
      return dateB.localeCompare(dateA);
    })
    .slice(0, limit);
}

/**
 * Get all tags with counts
 */
export function useVisitTags() {
  const { visits } = useVisits();
  
  const tagCounts = new Map<string, number>();

  visits.forEach((visit) => {
    (visit.tags || []).forEach((tag) => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  });

  return Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Search visits
 */
export function useSearchVisits(query: string) {
  const { visits } = useVisits();
  
  if (!query.trim()) {
    return visits;
  }

  const lowerQuery = query.toLowerCase();

  return visits.filter((visit) => {
    return (
      visit.title.toLowerCase().includes(lowerQuery) ||
      visit.countryName.toLowerCase().includes(lowerQuery) ||
      visit.cityName?.toLowerCase().includes(lowerQuery) ||
      visit.notes?.toLowerCase().includes(lowerQuery) ||
      visit.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  });
}

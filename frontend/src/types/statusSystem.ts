// Frontend Status System Types
// Re-export backend types and add frontend-specific types

export * from '../../../backend/src/types/statusSystem';

// Frontend-specific extensions
export interface StatusFilterState {
  selectedStatuses: string[];
  loading: boolean;
  error: string | null;
}

export interface StatusSystemContextProps {
  contentType: 'news' | 'ads';
  context: 'management' | 'approval' | 'public';
  userRole?: 'admin' | 'user';
}

export interface UseStatusSystemOptions {
  initialStatuses?: string[];
  autoFetch?: boolean;
  persistSelection?: boolean;
  storageKey?: string;
}

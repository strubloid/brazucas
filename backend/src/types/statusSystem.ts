// Status Management System Types
// Comprehensive type definitions for the new database-driven status system

export interface ContentType {
  id: number;
  name: string; // 'news' | 'ads'
  displayName: string;
  createdAt: string;
}

export interface StatusContext {
  id: number;
  name: string; // 'management' | 'approval' | 'public'
  displayName: string;
  description?: string;
  createdAt: string;
}

export interface StatusDefinition {
  id: number;
  code: string; // 'draft', 'pending', 'approved', etc.
  displayName: string;
  description?: string;
  colorBackground?: string;
  colorBorder?: string;
  colorText?: string;
  colorHeaderBg?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface StatusContextMapping {
  id: number;
  contentTypeId: number;
  contextId: number;
  statusId: number;
  isDefault: boolean;
  isVisible: boolean;
  createdAt: string;
  // Joined data
  contentType?: ContentType;
  context?: StatusContext;
  status?: StatusDefinition;
}

export interface ContentStatusHistory {
  id: number;
  contentType: string;
  contentId: number;
  statusCode: string;
  changedBy?: number;
  changedAt: string;
  reason?: string;
  metadata?: Record<string, any>;
}

// Context-aware status system
export interface StatusSystemContext {
  contentType: 'news' | 'ads';
  context: 'management' | 'approval' | 'public';
  userId?: number;
  userRole?: 'admin' | 'user';
}

export interface AvailableStatus {
  code: string;
  displayName: string;
  description?: string;
  colors: {
    background: string;
    border: string;
    text: string;
    headerBg: string;
  };
  isDefault: boolean;
  sortOrder: number;
}

export interface StatusFilterConfig {
  context: StatusSystemContext;
  availableStatuses: AvailableStatus[];
  selectedStatuses: string[];
  onStatusToggle: (statusCode: string) => void;
  allowSelectAll?: boolean;
  allowClearAll?: boolean;
}

// API Response types
export interface StatusSystemResponse {
  contentTypes: ContentType[];
  contexts: StatusContext[];
  statuses: StatusDefinition[];
  mappings: StatusContextMapping[];
}

export interface ContextualStatusResponse {
  context: StatusSystemContext;
  availableStatuses: AvailableStatus[];
  defaultStatus: string;
}

// Status change request
export interface StatusChangeRequest {
  contentType: string;
  contentId: number;
  newStatusCode: string;
  reason?: string;
  metadata?: Record<string, any>;
}

// Legacy compatibility types (for gradual migration)
export type NewsStatus = 'draft' | 'pending_approval' | 'published' | 'rejected';
export type AdStatus = 'draft' | 'pending_approval' | 'approved' | 'published' | 'rejected' | 'expired';
export type BaseStatus = NewsStatus | AdStatus;

// Status color utilities
export interface StatusColors {
  background: string;
  border: string;
  text: string;
  headerBg: string;
}

export interface StatusDisplayConfig {
  code: string;
  displayName: string;
  colors: StatusColors;
  sortOrder: number;
}

// Content with status
export interface ContentWithStatus {
  id: number;
  title: string;
  currentStatus: string;
  statusDisplay: StatusDisplayConfig;
  statusHistory?: ContentStatusHistory[];
  canChangeStatus?: boolean;
  availableTransitions?: AvailableStatus[];
}

// Filter and search options
export interface StatusFilterOptions {
  includeInactive?: boolean;
  sortBy?: 'sortOrder' | 'displayName' | 'code';
  sortDirection?: 'asc' | 'desc';
}

export interface StatusSearchParams {
  context: StatusSystemContext;
  statusCodes?: string[];
  options?: StatusFilterOptions;
}

// Status management hooks and utilities
export interface UseStatusSystemResult {
  loading: boolean;
  error: string | null;
  availableStatuses: AvailableStatus[];
  selectedStatuses: string[];
  setSelectedStatuses: (statuses: string[]) => void;
  toggleStatus: (statusCode: string) => void;
  clearAll: () => void;
  selectAll: () => void;
  context: StatusSystemContext;
}

export interface StatusChangeResult {
  success: boolean;
  error?: string;
  newStatus?: string;
  historyEntry?: ContentStatusHistory;
}

// Admin-specific types
export interface AdminApprovalContext extends StatusSystemContext {
  context: 'approval';
  userRole: 'admin';
  approvalQueue?: {
    pendingCount: number;
    oldestPendingDate?: string;
  };
}

export interface ApprovalAction {
  contentType: string;
  contentId: number;
  action: 'approve' | 'reject';
  reason?: string;
  metadata?: Record<string, any>;
}

export interface BulkStatusChangeRequest {
  items: Array<{
    contentType: string;
    contentId: number;
  }>;
  newStatusCode: string;
  reason?: string;
  metadata?: Record<string, any>;
}

export interface StatusTransitionRule {
  fromStatus: string;
  toStatus: string;
  requiredRole?: 'admin' | 'user' | 'owner';
  conditions?: Record<string, any>;
}

export interface StatusSystemConfig {
  transitions: StatusTransitionRule[];
  defaultStatuses: Record<string, string>; // contentType -> defaultStatusCode
  autoTransitions?: Array<{
    triggerStatus: string;
    delayMinutes: number;
    targetStatus: string;
    conditions?: Record<string, any>;
  }>;
}

// Export convenience types
export type StatusContextName = 'management' | 'approval' | 'public';
export type ContentTypeName = 'news' | 'ads';
export type StatusCode = string; // flexible for database-driven codes

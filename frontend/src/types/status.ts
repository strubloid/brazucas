// Base Status System
export enum BaseStatus {
  DRAFT = 'draft',
  PENDING = 'pending_approval', 
  PUBLISHED = 'published',
  REJECTED = 'rejected'
}

// News-specific statuses
export enum NewsStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  PUBLISHED = 'published', 
  REJECTED = 'rejected'
}

// Advertisement-specific statuses  
export enum AdStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  PUBLISHED = 'published',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}

// Status color mapping
export interface StatusColor {
  background: string;
  border: string;
  text: string;
  headerBackground: string;
}

export const STATUS_COLORS: Record<string, StatusColor> = {
  // Published/Approved - Green theme
  published: {
    background: 'rgba(34, 197, 94, 0.15)',
    border: '#22c55e',
    text: '#166534', 
    headerBackground: 'rgba(34, 197, 94, 0.1)'
  },
  approved: {
    background: 'rgba(34, 197, 94, 0.15)',
    border: '#22c55e', 
    text: '#166534',
    headerBackground: 'rgba(34, 197, 94, 0.1)'
  },
  
  // Draft - Gray theme
  draft: {
    background: 'rgba(107, 114, 128, 0.15)',
    border: '#6b7280',
    text: '#787893',
    headerBackground: 'rgba(107, 114, 128, 0.1)'
  },
  
  // Pending - Orange/Yellow theme
  pending: {
    background: 'rgba(245, 158, 11, 0.15)',
    border: '#f59e0b',
    text: '#92400e',
    headerBackground: 'rgba(245, 158, 11, 0.1)'
  },
  
  // Rejected - Red theme
  rejected: {
    background: 'rgba(239, 68, 68, 0.15)',
    border: '#ef4444',
    text: '#991b1b',
    headerBackground: 'rgba(239, 68, 68, 0.1)'
  },
  
  // Expired - Purple theme (for ads)
  expired: {
    background: 'rgba(168, 85, 247, 0.15)',
    border: '#a855f7',
    text: '#6b21a8',
    headerBackground: 'rgba(168, 85, 247, 0.1)'
  }
};

// Status display names
export const STATUS_LABELS: Record<string, string> = {
  draft: 'Rascunho',
  pending_approval: 'Aguardando Aprovação',
  published: 'Publicado',
  approved: 'Aprovado',
  rejected: 'Rejeitado', 
  expired: 'Expirado'
};

// Status utility class
export class StatusManager {
  // Convert legacy status to new system
  static getNewsStatus(post: { published?: boolean; approved?: boolean | null; archived?: boolean }): NewsStatus {
    if (!post || typeof post !== 'object') return NewsStatus.DRAFT;
    // Archived posts are now treated as rejected
    if (post.archived === true) return NewsStatus.REJECTED;
    if (post.approved === false) return NewsStatus.REJECTED;
    if (post.approved === null || post.approved === undefined) {
      // If explicitly marked as draft, keep as draft
      if (post.published === false) return NewsStatus.DRAFT;
      // Otherwise, consider it pending approval
      return NewsStatus.PENDING_APPROVAL;
    }
    if (post.published && post.approved === true) return NewsStatus.PUBLISHED;
    return NewsStatus.DRAFT;
  }
  
  static getAdStatus(ad: { published?: boolean; approved?: boolean | null; archived?: boolean; expired?: boolean }): AdStatus {
    if (!ad || typeof ad !== 'object') return AdStatus.DRAFT;
    // Archived posts are now treated as rejected
    if (ad.archived === true) return AdStatus.REJECTED;
    if (ad.expired === true) return AdStatus.EXPIRED;
    if (ad.approved === false) return AdStatus.REJECTED;
    if (ad.approved === null || ad.approved === undefined) {
      // If explicitly marked as draft, keep as draft
      if (ad.published === false) return AdStatus.DRAFT;
      // Otherwise, consider it pending approval
      return AdStatus.PENDING_APPROVAL;
    }
    if (ad.approved === true && ad.published) return AdStatus.PUBLISHED;
    if (ad.approved === true && !ad.published) return AdStatus.APPROVED;
    return AdStatus.DRAFT;
  }
  
  // Get status colors
  static getStatusColors(status: string): StatusColor {
    return STATUS_COLORS[status] || STATUS_COLORS.draft;
  }
  
  // Get status label
  static getStatusLabel(status: string): string {
    return STATUS_LABELS[status] || status.toUpperCase();
  }
  
  // Get all available statuses for a section
  static getNewsStatuses(): NewsStatus[] {
    return Object.values(NewsStatus);
  }
  
  static getAdStatuses(): AdStatus[] {
    return Object.values(AdStatus);
  }
  
  // Check if status allows editing
  static canEdit(status: string): boolean {
    return [BaseStatus.DRAFT, BaseStatus.REJECTED].includes(status as BaseStatus);
  }
  
  // Check if status allows publishing
  static canPublish(status: string): boolean {
    return [BaseStatus.DRAFT, BaseStatus.REJECTED].includes(status as BaseStatus);
  }
}

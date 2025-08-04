# Status Management System - Implementation Guide

## Overview

The new comprehensive status management system provides context-aware status filtering and management for different content types (notícias/news and anúncios/ads) across different operational contexts (management, approval, public viewing).

## Key Features

### ✅ Database-Driven Status System
- **Multiple content types**: News and Ads
- **Context-aware statuses**: Different status sets for management vs approval workflows
- **Flexible status definitions**: Colors, display names, descriptions stored in database
- **Audit trail**: Complete history of status changes with user tracking

### ✅ Frontend Components
- **EnhancedStatusFilter**: Context-aware filter component that adapts to current screen/workflow
- **useStatusSystem Hook**: React hook for managing status state with persistence
- **useStatusChange Hook**: Optimistic updates for status changes
- **Type-safe**: Full TypeScript support with comprehensive type definitions

### ✅ Context-Aware Filtering
- **Management Context**: For content creators managing their own content
- **Approval Context**: For admins reviewing and approving content
- **Public Context**: For public-facing content display

## Database Schema

### Core Tables

1. **content_types**: Defines content types (news, ads)
2. **status_contexts**: Defines operational contexts (management, approval, public)
3. **status_definitions**: All possible status states with styling
4. **status_context_mappings**: Which statuses are available in which contexts
5. **content_status_history**: Complete audit trail of status changes

### Sample Status Flows

#### News Article Workflow
```
Draft → Pending Approval → Approved → Published
                      ↘ Rejected ↗
```

#### Advertisement Workflow  
```
Draft → Pending Approval → Approved → Published → Expired
                      ↘ Rejected ↗              ↘ Archived
```

## Frontend Integration

### Enhanced Dashboard Integration

The Dashboard now uses context-aware status filtering:

```tsx
// News Management (for content creators)
<EnhancedStatusFilter
  context={{
    contentType: 'news',
    context: 'management',
    userId: user?.id,
    userRole: user?.role
  }}
  onSelectionChange={setSelectedNewsStatuses}
  options={{
    persistSelection: true,
    storageKey: 'dashboard-news-status-filter'
  }}
/>

// News Approval (for admins)
<EnhancedStatusFilter
  context={{
    contentType: 'news',
    context: 'approval',
    userId: user?.id,
    userRole: 'admin'
  }}
  compact={true}
  options={{
    persistSelection: true,
    storageKey: 'dashboard-approval-news-filter'
  }}
/>
```

### Available Status Contexts

#### Management Context
- **Purpose**: Content creators managing their own content
- **Available Statuses**: Draft, Pending Approval, Published, Rejected, Archived
- **Default**: Draft

#### Approval Context  
- **Purpose**: Admins reviewing content for approval
- **Available Statuses**: Pending Approval, Approved, Rejected
- **Default**: Pending Approval (shows items waiting for review)

#### Public Context
- **Purpose**: Public-facing content display
- **Available Statuses**: Published only
- **Default**: Published

## Backend API Endpoints

### Status System Endpoints

```typescript
GET /api/status-system
// Returns complete status system configuration

GET /api/status-system/contextual?contentType=news&context=management
// Returns statuses available for specific context

POST /api/status-system/change
// Change status of single content item

POST /api/status-system/bulk-change  
// Change status of multiple content items

POST /api/status-system/approval
// Process approval action (admin only)
```

### Example API Usage

```typescript
// Get available statuses for news management
const response = await statusSystemService.getContextualStatuses({
  contentType: 'news',
  context: 'management',
  userId: 123,
  userRole: 'user'
});

// Change article status
await statusSystemService.changeContentStatus({
  contentType: 'news',
  contentId: 456,
  newStatusCode: 'pending_approval',
  reason: 'Ready for review'
});

// Batch approve multiple items
await statusSystemService.batchApprove([
  { contentType: 'news', contentId: 123 },
  { contentType: 'news', contentId: 124 }
], 'Batch approval of quality content');
```

## Status Definitions

### News Statuses
- **draft**: Rascunho (gray) - Content being worked on
- **pending_approval**: Pendente Aprovação (orange) - Submitted for review
- **approved**: Aprovado (green) - Approved but not yet published
- **published**: Publicado (green) - Live and public
- **rejected**: Rejeitado (red) - Rejected by admin
- **archived**: Arquivado (gray) - No longer active

### Advertisement Statuses
- **draft**: Rascunho (gray) - Content being created
- **pending_approval**: Pendente Aprovação (orange) - Submitted for review
- **approved**: Aprovado (green) - Approved but not yet live
- **published**: Publicado (green) - Live and running
- **rejected**: Rejeitado (red) - Rejected by admin
- **expired**: Expirado (gray) - Ad campaign ended
- **archived**: Arquivado (gray) - No longer relevant

## Migration Path

### Phase 1: ✅ Database Setup
- Created migration scripts for all status tables
- Populated initial data for content types, contexts, and statuses
- Set up status context mappings

### Phase 2: ✅ Backend Services
- Implemented StatusSystemService with full CRUD operations
- Created Express routes for all status operations
- Added type-safe API endpoints

### Phase 3: ✅ Frontend Components
- Built EnhancedStatusFilter component with context awareness
- Created React hooks for status management
- Integrated with existing Dashboard component

### Phase 4: 🔄 Testing & Refinement
- Test all status transitions
- Validate approval workflows
- Ensure proper admin-only access controls

## Benefits of New System

### For Developers
- **Type Safety**: Full TypeScript support prevents status-related bugs
- **Maintainability**: Database-driven approach allows easy status additions
- **Consistency**: Single source of truth for all status logic

### For Content Creators
- **Clear Workflow**: Status progression is logical and transparent
- **Context Awareness**: See only relevant statuses for current task
- **Persistent Filters**: Remembered filter preferences across sessions

### For Administrators
- **Efficient Approval**: Dedicated approval context with relevant statuses only
- **Audit Trail**: Complete history of who changed what when
- **Bulk Operations**: Approve/reject multiple items at once

### For Users
- **Better Experience**: Only see published, relevant content
- **Faster Loading**: Efficient filtering reduces unnecessary data transfer

## Future Enhancements

### Planned Features
- **Status Transition Rules**: Enforce valid status changes based on user role
- **Automated Transitions**: Auto-archive expired content, auto-publish scheduled items
- **Advanced Analytics**: Status change metrics and approval bottleneck detection
- **Notification System**: Alert admins of pending approvals, notify creators of status changes

### Performance Optimizations
- **Caching**: Redis cache for frequently accessed status configurations
- **Indexing**: Database indexes on status fields for faster queries
- **Pagination**: Efficient pagination for large content sets with status filtering

The new status management system provides a solid foundation for scalable, maintainable content management with clear separation of concerns between different user roles and operational contexts.

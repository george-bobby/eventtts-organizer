# Event-Based Role Management System Implementation

## Overview

This document outlines the comprehensive implementation of an event-based role management system through the stakeholder management feature. The system supports four distinct roles with specific permissions and provides role-based access control throughout the application.

## Core Features Implemented

### 1. Role System
- **Four distinct roles**: Organizer, Volunteer, Speaker, Participant
- **Event-specific roles**: Users can have different roles across different events
- **Permission hierarchy**: organizer (4) > volunteer (3) > speaker (2) > participant (1)
- **Automatic role assignment**: When stakeholder email matches existing user, role is automatically assigned

### 2. Permission Matrix

| Permission | Organizer | Volunteer | Speaker | Participant |
|------------|-----------|-----------|---------|-------------|
| canManageEvent | ✅ | ❌ | ❌ | ❌ |
| canVerifyTickets | ✅ | ✅ | ❌ | ❌ |
| canViewAttendees | ✅ | ✅ | ✅ | ❌ |
| canViewAnalytics | ✅ | ❌ | ❌ | ❌ |
| canSendUpdates | ✅ | ✅ | ❌ | ❌ |
| canManageGallery | ✅ | ✅ | ✅ | ❌ |
| canManageCertificates | ✅ | ✅ | ❌ | ❌ |
| canManageStakeholders | ✅ | ❌ | ❌ | ❌ |

## Files Created

### 1. Core Models and Actions
- `lib/models/userrole.model.ts` - UserRole data model with permissions
- `lib/actions/userrole.action.ts` - Server actions for role management
- `lib/utils/auth.ts` - Authentication and authorization utilities
- `lib/middleware/auth.ts` - API route middleware for role-based authorization

### 2. UI Components
- `components/shared/RoleBasedEventSections.tsx` - Dashboard role-based event display
- `components/shared/RoleBadge.tsx` - Reusable role badge component
- `components/shared/RoleAssignmentDialog.tsx` - Role assignment interface

### 3. API Endpoints
- `app/api/user-roles/route.ts` - User role management API

## Files Modified

### 1. Core Functionality
- `lib/actions/stakeholder.action.ts` - Added automatic role assignment when stakeholder created
- `lib/actions/event.action.ts` - Added role-based event retrieval functions
- `app/(root)/dashboard/page.tsx` - Updated to use role-based event display
- `components/shared/EventCards.tsx` - Added role badge support
- `components/shared/EventCard.tsx` - Added role badge display

### 2. Event Management
- `app/(root)/event/[id]/manage/page.tsx` - Role-based management options
- `app/(root)/event/[id]/page.tsx` - Role-based action buttons and navigation

### 3. API Security
- `app/api/stakeholders/route.ts` - Added role-based access control
- `app/api/tickets/verify/route.ts` - Added ticket verification permissions
- `app/api/attendees/export/route.ts` - Added attendee export permissions

## Key Technical Implementation Details

### 1. UserRole Model
```typescript
export interface IUserRole extends Document {
  user: Schema.Types.ObjectId;
  event: Schema.Types.ObjectId;
  role: UserRoleType;
  permissions?: {
    canManageEvent?: boolean;
    canVerifyTickets?: boolean;
    canViewAttendees?: boolean;
    canViewAnalytics?: boolean;
    canSendUpdates?: boolean;
    canManageGallery?: boolean;
    canManageCertificates?: boolean;
    canManageStakeholders?: boolean;
  };
  assignedBy: Schema.Types.ObjectId;
  assignedAt: Date;
  isActive: boolean;
}
```

### 2. Automatic Role Assignment
When a stakeholder is created, the system:
1. Checks if the email matches an existing user
2. Maps stakeholder role to user role (organizer→organizer, attendee→participant, etc.)
3. Creates or updates UserRole assignment
4. Applies role hierarchy (higher roles override lower ones)

### 3. Permission Checking
```typescript
export async function hasEventPermission(
  userId: string,
  eventId: string,
  permission: keyof IUserRole['permissions']
): Promise<boolean>
```

### 4. Role-Based UI Rendering
- Dashboard shows events grouped by user roles
- Event management page filters options based on permissions
- Event page shows role-appropriate action buttons
- Role badges display user's role for each event

## Database Changes

### New Collections
- `userroles` - Stores user role assignments per event

### Indexes Added
- `{ user: 1, event: 1, role: 1 }` - Compound index for efficient role queries
- `{ event: 1, role: 1 }` - Index for event-based role filtering
- `{ user: 1, isActive: 1 }` - Index for user's active roles

## Security Implementation

### API Route Protection
All sensitive API endpoints now check:
1. User authentication (Clerk)
2. Event-specific permissions
3. Role-based access control

### Middleware Pattern
```typescript
export async function withEventPermission(
  permission: keyof IUserRole['permissions'],
  handler: (req: AuthenticatedRequest, eventId: string) => Promise<NextResponse>
)
```

## Testing Scenarios

### 1. Role Assignment Flow
- ✅ Create stakeholder with email matching existing user
- ✅ Verify UserRole is created automatically
- ✅ Test role hierarchy (organizer overrides volunteer)
- ✅ Test multiple roles for same user across different events

### 2. Permission Verification
- ✅ Organizer has all permissions
- ✅ Volunteer can verify tickets but not manage event
- ✅ Speaker can view attendees but not verify tickets
- ✅ Participant has minimal permissions

### 3. UI Role Display
- ✅ Dashboard shows events grouped by roles
- ✅ Event cards display role badges
- ✅ Management page filters options by permissions
- ✅ Event page shows role-appropriate buttons

## Future Enhancements

1. **Role Expiration**: Add time-based role expiration
2. **Custom Permissions**: Allow fine-grained permission customization
3. **Role Templates**: Create reusable role templates
4. **Audit Logging**: Track role assignment and permission changes
5. **Bulk Role Management**: UI for managing multiple user roles

## Conclusion

The event-based role management system has been successfully implemented with:
- ✅ Complete role hierarchy and permission system
- ✅ Automatic role assignment from stakeholder management
- ✅ Role-based UI rendering and access control
- ✅ Secure API endpoints with permission checking
- ✅ Comprehensive dashboard and event management integration
- ✅ Multi-role support across different events

All requirements have been fulfilled with no TODOs or placeholders remaining.

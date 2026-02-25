# Design Document

## Overview

The ShareApp is a map-first mobile application built with Ionic Vue 3 that enables users to discover and share sustainable resources in their community. The application follows a modern design philosophy with blur backgrounds, rounded corners, and smooth micro-animations to create an engaging user experience focused on sustainability and community sharing.

## Development Workflow

### Code Change Approval Process
**IMPORTANT**: Before making any code changes, the following process must be followed:

1. **Create Step-by-Step Plan**: Always create a detailed, step-by-step plan for any code modifications
2. **Present Plan for Approval**: Present the plan to the user and wait for explicit approval
3. **No Changes Without Approval**: Never make code changes without user approval of the plan
4. **Document Reasoning**: Include reasoning for each step in the plan
5. **Consider Impact**: Assess potential impact on existing functionality

This process ensures:
- Transparency in development decisions
- User control over code modifications  
- Prevention of unwanted changes
- Better collaboration and understanding

## Architecture

### Frontend Architecture
- **Framework**: Ionic Vue 3 with TypeScript
- **State Management**: Pinia stores for reactive state management
- **Styling**: Tailwind CSS 4 with custom design system
- **Maps**: Mapbox GL JS for interactive mapping with custom markers
- **Animations**: VueUse/GSAP for micro-animations and scroll triggers
- **Offline**: IndexedDB for caching resources and user data
- **Build**: Vite for fast development and optimized builds

### Backend Architecture
- **CMS**: Payload CMS 3.46.0 as headless content management
- **Framework**: Next.js 15 for API routes and server-side functionality
- **Database**: MongoDB with Mongoose for resource and user data
- **File Storage**: Sharp for image processing and optimization
- **Authentication**: Payload's built-in auth system

### Monorepo Structure
- **apps/frontend**: Ionic Vue mobile application
- **apps/backend**: Payload CMS with Next.js API
- **packages/shared**: Common types and utilities
- **Build System**: Turborepo for efficient builds and caching

## Components and Interfaces

### Core Components

#### MapView Component
```typescript
interface MapViewProps {
  resources: Resource[]
  selectedCategory?: string
  userLocation?: Coordinates
  onResourceSelect: (resource: Resource) => void
  onAddResource: () => void
}
```
- Interactive Mapbox map with clustering
- Custom marker icons based on resource type
- Zoom-level dependent marker detail
- Floating action button for adding resources

#### ResourceMarker Component
```typescript
interface ResourceMarkerProps {
  resource: Resource
  isSelected: boolean
  zoomLevel: number
  onClick: () => void
}
```
- Color-coded markers by resource type
- Tooltip on hover/tap with basic info
- Clustering behavior for performance

#### ResourceDetailModal Component
```typescript
interface ResourceDetailModalProps {
  resource: Resource
  isOpen: boolean
  onClose: () => void
  onFavorite: (resourceId: string) => void
  onReport: (resourceId: string) => void
}
```
- Bottom sheet/modal presentation
- Image gallery with swipe navigation
- Usage rules and guidelines display
- Action buttons (favorite, share, report, navigate)

#### CategoryGrid Component
```typescript
interface CategoryGridProps {
  categories: Category[]
  onCategorySelect: (category: Category) => void
  nearbyResources?: Resource[]
}
```
- Grid layout with icons and descriptions
- "Beliebte in deiner Nähe" section
- Smooth transitions with micro-animations

#### AddResourceFlow Component
```typescript
interface AddResourceFlowProps {
  onComplete: (resource: NewResource) => void
  onCancel: () => void
  initialLocation?: Coordinates
}
```
- Step-by-step wizard interface
- Map picker for location selection
- Category selection with icons
- Image upload with preview
- Success animation on completion

### Navigation Structure

#### Bottom Navigation
- **Karte** (Map): Primary map interface
- **Kategorien** (Categories): Resource category overview
- **Favoriten** (Favorites): User's saved resources
- **Profil** (Profile): User profile and settings

#### Modal/Sheet Interfaces
- Resource detail bottom sheet
- Add resource flow modal
- Search/filter drawer
- Settings modal
- Onboarding overlay

## Data Models

### Resource Model
```typescript
interface Resource {
  id: string
  title: string
  description: string
  category: Category
  location: {
    coordinates: [number, number] // [lng, lat]
    address: string
    city: string
    postalCode: string
  }
  images: string[]
  openingHours?: OpeningHours
  usageRules: string[]
  tags: ResourceTag[]
  status: 'active' | 'inactive' | 'reported'
  createdBy: string
  createdAt: Date
  updatedAt: Date
  ratings: Rating[]
  averageRating: number
  reportCount: number
}
```

### Category Model
```typescript
interface Category {
  id: string
  name: string
  icon: string
  color: string
  description: string
  examples: string[]
  isActive: boolean
}
```

### User Model
```typescript
interface User {
  id: string
  email: string
  username: string
  avatar?: string
  favorites: string[] // Resource IDs
  contributedResources: string[] // Resource IDs
  badges: Badge[]
  reputation: number
  createdAt: Date
  preferences: UserPreferences
}
```

### Rating Model
```typescript
interface Rating {
  id: string
  resourceId: string
  userId: string
  rating: number // 1-5 stars
  comment?: string
  createdAt: Date
  isModerated: boolean
}
```

## Error Handling

### Frontend Error Handling
- **Network Errors**: Offline mode with cached data
- **Location Errors**: Graceful fallback without user location
- **Map Loading**: Loading states and retry mechanisms
- **Image Upload**: Progress indicators and error messages
- **Form Validation**: Real-time validation with clear error messages

### Backend Error Handling
- **API Rate Limiting**: 100 requests per minute per user
- **Input Validation**: Comprehensive validation for all endpoints
- **Database Errors**: Proper error logging and user-friendly messages
- **File Upload**: Size limits and format validation
- **Authentication**: Secure token handling and refresh logic

### Error Recovery Strategies
- **Retry Logic**: Automatic retry for transient failures
- **Offline Queue**: Queue actions when offline, sync when online
- **Graceful Degradation**: Core functionality works without optional features
- **User Feedback**: Clear error messages with suggested actions

## Testing Strategy

### Frontend Testing
- **Unit Tests**: Vue components with Vue Test Utils and Vitest
- **Integration Tests**: Pinia store interactions and API calls
- **E2E Tests**: Critical user flows with Playwright
- **Visual Tests**: Component screenshots for design consistency
- **Accessibility Tests**: Screen reader and keyboard navigation

### Backend Testing
- **Unit Tests**: Individual functions and utilities
- **Integration Tests**: API endpoints and database operations
- **E2E Tests**: Complete user workflows
- **Performance Tests**: Load testing for map data endpoints
- **Security Tests**: Authentication and authorization flows

### Testing Priorities
1. **Critical Path**: Map loading, resource display, add resource flow
2. **User Authentication**: Login, registration, profile management
3. **Data Integrity**: Resource creation, updates, and validation
4. **Performance**: Map rendering with large datasets
5. **Offline Functionality**: Cached data access and sync

## Design System

### Color Palette
```css
:root {
  /* Primary Colors - Sustainability Theme */
  --color-primary: #22c55e; /* Green 500 */
  --color-primary-dark: #16a34a; /* Green 600 */
  --color-primary-light: #86efac; /* Green 300 */
  
  /* Secondary Colors */
  --color-secondary: #3b82f6; /* Blue 500 */
  --color-accent: #f59e0b; /* Amber 500 */
  
  /* Resource Category Colors */
  --color-food: #ef4444; /* Red 500 */
  --color-clothing: #8b5cf6; /* Violet 500 */
  --color-water: #06b6d4; /* Cyan 500 */
  --color-other: #6b7280; /* Gray 500 */
  
  /* UI Colors */
  --color-background: #f8fafc; /* Slate 50 */
  --color-surface: rgba(255, 255, 255, 0.8); /* Blur background */
  --color-text: #1e293b; /* Slate 800 */
  --color-text-muted: #64748b; /* Slate 500 */
}
```

### Typography
- **Primary Font**: System font stack for optimal performance
- **Headings**: Bold weights with proper hierarchy
- **Body Text**: Regular weight, optimized line height
- **UI Text**: Medium weight for buttons and labels

### Spacing & Layout
- **Base Unit**: 4px (0.25rem)
- **Component Spacing**: 16px (1rem) standard
- **Section Spacing**: 24px (1.5rem)
- **Page Margins**: 20px (1.25rem)

### Border Radius
- **Small**: 8px (0.5rem) for buttons and cards
- **Medium**: 12px (0.75rem) for modals
- **Large**: 16px (1rem) for major containers
- **Full**: 50% for circular elements

### Animations
- **Duration**: 200ms for micro-interactions, 300ms for transitions
- **Easing**: ease-out for natural movement
- **Hover States**: Subtle scale and color changes
- **Loading States**: Skeleton screens and progress indicators

## Performance Considerations

### Map Performance
- **Marker Clustering**: Reduce DOM elements at high zoom levels
- **Lazy Loading**: Load resources only in viewport
- **Tile Caching**: Cache map tiles for offline use
- **Debounced Search**: Prevent excessive API calls during typing

### Image Optimization
- **WebP Format**: Modern format with fallbacks
- **Responsive Images**: Multiple sizes for different screens
- **Lazy Loading**: Load images as they enter viewport
- **Compression**: Optimize file sizes without quality loss

### Bundle Optimization
- **Code Splitting**: Lazy load non-critical components
- **Tree Shaking**: Remove unused code
- **Asset Optimization**: Minimize CSS and JavaScript
- **Service Worker**: Cache static assets and API responses

### Database Performance
- **Indexing**: Geospatial indexes for location queries
- **Pagination**: Limit results to prevent large payloads
- **Caching**: Redis for frequently accessed data
- **Query Optimization**: Efficient database queries

## Security Considerations

### Authentication & Authorization
- **JWT Tokens**: Secure token-based authentication
- **Role-Based Access**: Different permissions for users and admins
- **Session Management**: Secure session handling
- **Password Security**: Hashing and validation

### Data Protection
- **Input Sanitization**: Prevent XSS and injection attacks
- **CORS Configuration**: Proper cross-origin resource sharing
- **Rate Limiting**: Prevent abuse and DoS attacks
- **Data Encryption**: Encrypt sensitive data at rest

### Privacy
- **Location Data**: Minimal location data storage
- **User Consent**: Clear privacy policy and consent flows
- **Data Retention**: Automatic cleanup of old data
- **GDPR Compliance**: Right to deletion and data export

## Accessibility

### WCAG Compliance
- **Level AA**: Target WCAG 2.1 AA compliance
- **Color Contrast**: Minimum 4.5:1 ratio for text
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Readers**: Proper ARIA labels and descriptions

### Mobile Accessibility
- **Touch Targets**: Minimum 44px touch targets
- **Voice Control**: Support for voice navigation
- **Reduced Motion**: Respect user motion preferences
- **High Contrast**: Support for high contrast mode

### Inclusive Design
- **Multiple Languages**: i18n support starting with German
- **Offline Access**: Core functionality works offline
- **Low Bandwidth**: Optimized for slow connections
- **Diverse Users**: Consider different technical skill levels

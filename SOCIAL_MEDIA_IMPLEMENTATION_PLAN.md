# AI Nexus Social Media Implementation Plan

## Current State Analysis
✅ **EXISTING (DO NOT CHANGE):**
- UI Components (Header, Sidebar, all pages)
- Authentication system (login/register/logout)
- Basic project structure
- User/Company registration

❌ **MISSING (NEEDS IMPLEMENTATION):**
- Post creation and management system
- Database models for posts, follows, comments, likes
- Search functionality for users/companies
- Follow/unfollow system
- Home feed with proper filtering
- Real-time messaging system
- Live streaming with WebRTC
- Like/comment/share functionality
- Post type routing system

## Implementation Strategy

### Phase 1: Database Models & Core APIs
**Files to Create:**
- `backend/models/Post.js` - Post schema with type detection
- `backend/models/Follow.js` - Follow relationships
- `backend/models/Comment.js` - Comment system
- `backend/models/Like.js` - Like system
- `backend/models/Message.js` - Messaging system
- `backend/models/LiveSession.js` - Live streaming sessions

**Backend Routes to Create:**
- `backend/routes/posts.js` - Post CRUD operations
- `backend/routes/search.js` - Global search API
- `backend/routes/follow.js` - Follow/unfollow system
- `backend/routes/feed.js` - Home feed aggregation
- `backend/routes/messages.js` - Real-time messaging
- `backend/routes/live.js` - Live streaming management

### Phase 2: Search System
**Frontend Implementation:**
- Update `ModernSidebar.jsx` search input with debounced search
- Create search dropdown component
- Implement navigation to profile pages on search selection
- Add search results state management

**Backend Implementation:**
- Indexed MongoDB search for users and companies
- Partial, case-insensitive search by name
- Search API endpoint with pagination

### Phase 3: Post Creation & Type Routing
**Post Type Mapping:**
- Normal Image/Text Post → Home page
- Shorts Video Post → AI Shorts page
- News Post → AI News page
- Model Post → Models page
- Career/Job Post → Career page
- Event Post → Events page
- Showcase Post → Showcase page

**Implementation:**
- Modify `PostForm.jsx` to connect to backend API
- Add postType detection logic
- Update each page component to fetch only relevant postTypes
- Implement role-based restrictions (only companies can post Jobs/News/Live)

### Phase 4: Follow System & Home Feed
**Follow System:**
- Users can follow other users and companies
- Companies can follow users if allowed
- Follow data stored in MongoDB with proper indexing

**Home Feed:**
- Show ONLY posts from followed users/companies
- Exclude unrelated posts
- Sort by latest first
- Optimized aggregated query for performance

### Phase 5: Real-time Features
**Live Streaming:**
- WebRTC implementation for media streaming
- Socket.IO for signaling and room management
- Company-only live stream initiation
- User viewer permissions

**Real-time Messaging:**
- Floating message button at bottom-right
- Socket.IO for real-time chat
- Online/offline indicators
- Message history persistence

**Social Interactions:**
- Like/unlike with real-time count updates
- Comment system with real-time sync
- Share/repost functionality

### Phase 6: Security & Role Management
**Role-based Access Control:**
- JWT middleware for all API endpoints
- Company-only restrictions for Jobs, News, Live
- Input validation and sanitization
- File upload security

## Technical Specifications

### Database Indexes
```javascript
// Posts collection
db.posts.createIndex({ "postType": 1, "createdAt": -1 })
db.posts.createIndex({ "author": 1, "createdAt": -1 })

// Follows collection
db.follows.createIndex({ "follower": 1, "following": 1 }, { unique: true })

// Users collection
db.users.createIndex({ "username": "text", "companyName": "text" })
```

### Socket.IO Events
- `join-room` - Join live stream room
- `leave-room` - Leave live stream room
- `stream-offer` - WebRTC signaling
- `stream-answer` - WebRTC signaling
- `new-message` - Real-time messaging
- `like-update` - Real-time like counts
- `comment-added` - Real-time comments

### API Endpoints Structure
```
/api/posts
  GET / - Get posts (with filtering by type)
/api/posts/:id - Get specific post
POST / - Create new post
PUT /:id - Update post
DELETE /:id - Delete post

/api/search
GET /?q=query&type=user|company - Global search

/api/follow
POST / - Follow user/company
DELETE /:id - Unfollow
GET /followers/:id - Get followers
GET /following/:id - Get following

/api/feed
GET / - Get personalized home feed

/api/messages
GET /:userId - Get conversation
POST / - Send message

/api/live
GET / - Get active live sessions
POST / - Start live session (companies only)
DELETE /:sessionId - End session
```

## Frontend Integration Points

### Files to Modify (Logic Only):
1. `ModernSidebar.jsx` - Add search functionality
2. `PostForm.jsx` - Connect to backend APIs
3. `Hero.jsx` - Update home feed logic
4. `NewsFeed.jsx` - Filter by postType
5. `AIShowcase.jsx` - Filter by postType
6. `ModelDirectory.jsx` - Filter by postType
7. `JobBoard.jsx` - Filter by postType
8. `Events.jsx` - Filter by postType
9. `Live.jsx` - Integrate WebRTC streaming
10. Create new messaging component

### New Components to Create:
- `SearchDropdown.jsx` - Search results dropdown
- `MessageButton.jsx` - Floating message button
- `MessageModal.jsx` - Messaging interface
- `LiveStream.jsx` - Live streaming component
- `FollowButton.jsx` - Follow/unfollow functionality

## Implementation Order

1. **Database Models** - Create all schemas and indexes
2. **Core APIs** - Implement basic CRUD operations
3. **Search System** - Frontend and backend search
4. **Post Creation** - Connect forms to backend
5. **Follow System** - Implement follow/unfollow
6. **Home Feed** - Create filtered feed system
7. **Real-time Features** - Socket.IO integration
8. **Live Streaming** - WebRTC implementation
9. **Messaging** - Real-time chat system
10. **Testing** - End-to-end functionality testing

## Success Criteria

✅ **Search works for users and companies**
✅ **Post creation saves with correct postType**
✅ **Each page shows only relevant postTypes**
✅ **Home feed shows only followed users/companies posts**
✅ **Follow system controls feed content**
✅ **Real-time messaging works**
✅ **Live streaming functional for companies**
✅ **Like/comment/share working with real-time updates**
✅ **Role-based restrictions enforced**
✅ **All existing UI remains unchanged**

## Estimated Implementation Time
- **Backend APIs**: 2-3 hours
- **Database setup**: 30 minutes
- **Frontend integration**: 2-3 hours
- **Real-time features**: 2-3 hours
- **Testing & debugging**: 1-2 hours

**Total: ~8-11 hours of focused development**

## Next Steps
1. **User approval** of this plan
2. **Begin implementation** starting with database models
3. **Incremental testing** after each major feature
4. **Final integration testing** of all social media features

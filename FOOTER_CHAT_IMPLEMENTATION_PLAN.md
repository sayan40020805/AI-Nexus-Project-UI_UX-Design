# Footer Message Search & Socket.IO Chat Implementation Plan

## Project Overview
Implement a comprehensive real-time messaging system with search functionality in the footer of the AI Nexus Platform.

## Current State Analysis
- ✅ Existing footer message component structure
- ✅ User/company search functionality already implemented
- ✅ JWT authentication system in place
- ✅ MongoDB database with User model
- ✅ Socket.IO integration capabilities available

## Implementation Plan

### Phase 1: Database Models & Backend APIs
1. **Message Model**
   - senderId, receiverId, content, createdAt
   - read status, message type
   - conversation ID reference

2. **Conversation Model**
   - participants array
   - last message, updated timestamp
   - unique constraint to prevent duplicates

3. **Chat Search API**
   - GET /api/chat/search?q=
   - Similar to existing search but optimized for messaging

4. **Message APIs**
   - GET /api/chat/:conversationId (history)
   - POST /api/chat/send (store message)
   - PUT /api/chat/read/:conversationId (mark as read)

### Phase 2: Socket.IO Implementation
1. **Socket Server Setup**
   - JWT authentication middleware
   - User room management
   - Message broadcasting

2. **Socket Events**
   - joinRoom, sendMessage, receiveMessage
   - messageRead, userOnline, userOffline
   - typing indicators

### Phase 3: Frontend Architecture
1. **Chat Service Layer**
   - Socket.IO client integration
   - API service for chat operations
   - Message queue management

2. **Chat Context**
   - Global chat state management
   - Active conversations tracking
   - Online users status

3. **UI Components**
   - FooterChat (main container)
   - ChatSearch (search input & results)
   - ChatWindow (message interface)
   - MessageBubble (individual messages)

### Phase 4: Features & Polish
1. **Real-time Features**
   - Instant message delivery
   - Online/offline status
   - Typing indicators
   - Message status tracking

2. **UX Enhancements**
   - Message timestamps
   - Read receipts
   - Message search
   - Chat notifications

## File Structure

```
backend/
├── models/
│   ├── Message.js (new)
│   └── Conversation.js (new)
├── routes/
│   └── chat.js (new)
├── services/
│   ├── socketService.js (new)
│   └── chatService.js (new)
└── server.js (enhanced with Socket.IO)

frontend/
├── components/
│   ├── Chat/
│   │   ├── FooterChat.jsx (new)
│   │   ├── ChatSearch.jsx (new)
│   │   ├── ChatWindow.jsx (new)
│   │   ├── MessageBubble.jsx (new)
│   │   ├── ChatList.jsx (new)
│   │   └── index.js (new)
│   └── Footer.jsx (enhanced)
├── context/
│   └── ChatContext.jsx (new)
├── services/
│   ├── chatService.js (new)
│   └── socketService.js (new)
└── styles/
    └── Chat.css (new)
```

## Key Features to Implement

### 1. Search Integration
- Reuse existing search functionality
- Filter results for messaging
- Show account type badges
- Profile image display

### 2. Real-time Messaging
- Socket.IO connection with JWT auth
- Instant message delivery
- Room-based chat for each conversation
- Message status tracking

### 3. Chat Management
- Conversation creation/loading
- Message history pagination
- Read status tracking
- Online/offline user detection

### 4. User Experience
- Modern chat interface
- Message timestamps
- Typing indicators
- Sound notifications
- Mobile-responsive design

## Success Criteria
- ✅ Search users/companies from footer
- ✅ Real-time messaging with Socket.IO
- ✅ Message history persistence
- ✅ Online/offline status tracking
- ✅ Message status (Sent/Delivered/Read)
- ✅ Authentication for all chat operations
- ✅ Prevent duplicate conversations
- ✅ Mobile-responsive chat interface
- ✅ Clean, modular, scalable code

## Next Steps
Ready to proceed with implementation following this comprehensive plan.

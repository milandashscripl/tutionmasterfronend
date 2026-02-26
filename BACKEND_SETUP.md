# Backend Setup Guide - Chat, Courses & Settings

## Overview
This document outlines the complete backend infrastructure for the TuitionMaster authentication app, including real-time chat with Socket.io, course management, and user settings.

## New Features Implemented

### 1. Real-Time Chat System (Socket.io)
**Files Created/Modified:**
- `models/Chat.js` - Chat conversation model
- `models/Message.js` - Message model with sender, content, timestamp
- `routes/chatRoutes.js` - REST API endpoints for chat operations
- `server.js` - Socket.io server setup with connection handling

**Key Endpoints:**
- `GET /api/chats` - Get all chats for current user
- `GET /api/chats/:chatId` - Get specific chat details
- `GET /api/chats/:chatId/messages` - Get message history
- `POST /api/chats/:chatId/messages` - Send new message
- `POST /api/chats/user/:userId` - Create/get chat with specific user
- `PUT /api/chats/:chatId/mark-read` - Mark messages as read

**Socket.io Events:**
- `user:register` - Register user with socket ID
- `chat:join` - Join a chat room
- `chat:message` - Send message (broadcasted to room)
- `chat:message:new` - Receive new message in real-time
- `chat:typing` - Send typing indicator
- `chat:user:typing` - Receive typing indicator

**Real-Time Features:**
- Real-time message delivery to all participants
- Typing indicators for active conversations
- Automatic socket cleanup on disconnect
- User presence tracking

### 2. Course Management System
**Files Created/Modified:**
- `models/Course.js` - Course model with instructor, students, metadata
- `routes/courseRoutes.js` - Complete course CRUD operations

**Key Endpoints:**
- `GET /api/courses` - Get all available courses
- `GET /api/courses/enrolled` - Get user's enrolled courses
- `GET /api/courses/:courseId` - Get course details
- `POST /api/courses` - Create course (instructor only)
- `POST /api/courses/:courseId/enroll` - Enroll in course
- `PUT /api/courses/:courseId` - Update course (instructor only)
- `DELETE /api/courses/:courseId` - Delete course (instructor only)

**Features:**
- Course metadata: name, description, instructor, level, thumbnail, price, hours
- Student enrollment tracking
- Instructor role-based access control
- Course catalog with filtering by level

### 3. User Settings & Preferences
**Files Modified:**
- `models/User.js` - Added settings subdocument
- `controllers/userController.js` - New updateSettings function
- `routes/userRoutes.js` - Added PUT /settings endpoint

**Settings Fields:**
- `theme` - Color theme selection (light, blue, green, purple)
- `darkMode` - Dark mode toggle
- `notifications` - Notification preferences

**Key Endpoint:**
- `PUT /api/user/settings` - Update user settings

## Database Schema

### Chat Model
```javascript
{
  participants: [UserID],           // Array of participating users
  chatName: String,                 // Chat display name
  messages: [MessageID],            // Array of message references
  timestamps: true                  // createdAt, updatedAt
}
```

### Message Model
```javascript
{
  chatId: ChatID,                   // Reference to parent chat
  sender: UserID,                   // Message author
  content: String,                  // Message text
  timestamp: Date,                  // Created timestamp
  read: Boolean,                    // Read status
  timestamps: true                  // createdAt, updatedAt
}
```

### Course Model
```javascript
{
  name: String,                     // Course title
  description: String,              // Course description
  instructor: UserID,               // Course creator
  level: String,                    // Beginner|Intermediate|Advanced
  thumbnail: String,                // Course image URL
  enrolledStudents: [UserID],       // Array of enrolled users
  hours: Number,                    // Course duration
  price: Number,                    // Course cost
  timestamps: true                  // createdAt, updatedAt
}
```

### User Settings (subdocument)
```javascript
{
  settings: {
    theme: String,                  // light|blue|green|purple
    darkMode: Boolean,              // true|false
    notifications: Boolean          // true|false
  }
}
```

## Frontend Integration

### Dependencies Added
- `socket.io-client@4.5.1` - Real-time communication library

### Pages Updated
1. **Chats.jsx** - Real-time messaging interface with Socket.io
2. **Courses.jsx** - Course browsing and enrollment
3. **Settings.jsx** - User preferences and theme customization
4. **Profile.jsx** - User profile management

### Socket.io Client Setup
```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  auth: {
    token: localStorage.getItem("token")
  }
});

// Register user
socket.emit("user:register", userId);

// Join chat
socket.emit("chat:join", chatId);

// Listen for new messages
socket.on("chat:message:new", (message) => {
  // Update UI
});
```

## API Response Examples

### Get Chats Response
```json
[
  {
    "_id": "chat_id",
    "participants": [
      { "_id": "user_id", "name": "John", "email": "john@example.com", "profileImage": "url" }
    ],
    "chatName": "John Doe",
    "messages": [],
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
]
```

### Get Messages Response
```json
[
  {
    "_id": "message_id",
    "chatId": "chat_id",
    "sender": {
      "_id": "user_id",
      "name": "Jane",
      "profileImage": "url",
      "email": "jane@example.com"
    },
    "content": "Hello!",
    "timestamp": "2024-01-15T10:35:00Z",
    "read": true,
    "createdAt": "2024-01-15T10:35:00Z",
    "updatedAt": "2024-01-15T10:35:00Z"
  }
]
```

### Get All Courses Response
```json
[
  {
    "_id": "course_id",
    "name": "React Basics",
    "description": "Learn React fundamentals",
    "instructor": {
      "_id": "user_id",
      "name": "Instructor Name",
      "email": "instructor@example.com",
      "profileImage": "url"
    },
    "level": "Beginner",
    "thumbnail": "image_url",
    "enrolledStudents": ["user_id_1", "user_id_2"],
    "hours": 40,
    "price": 4999,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
]
```

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Variables (.env)
Ensure your `.env` file includes:
```
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

### 3. Start Backend Server
```bash
npm start
# Server runs on http://localhost:5000
```

### 4. Setup Frontend Socket.io
Update `SOCKET_URL` in `auth-ui/src/pages/Chats.jsx`:
```javascript
const SOCKET_URL = "http://localhost:5000"; // or your production URL
```

## Access Control

### Chat Routes
- ✅ `GET /api/chats` - Authenticated users only
- ✅ `POST /api/chats/user/:userId` - Authenticated users only
- ✅ `GET /api/chats/:chatId` - Only chat participants
- ✅ `GET /api/chats/:chatId/messages` - Only chat participants
- ✅ `POST /api/chats/:chatId/messages` - Only chat participants
- ✅ `PUT /api/chats/:chatId/mark-read` - Only chat participants

### Course Routes
- ✅ `GET /api/courses` - Public (all users)
- ✅ `GET /api/courses/enrolled` - Authenticated users only
- ✅ `POST /api/courses` - Authenticated instructors/admins only
- ✅ `PUT /api/courses/:courseId` - Course instructor/admin only
- ✅ `DELETE /api/courses/:courseId` - Course instructor/admin only

### Settings Routes
- ✅ `PUT /api/user/settings` - Authenticated users only

## Error Handling

All endpoints return standardized error responses:

```json
{
  "message": "Error description"
}
```

Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `403` - Forbidden/Unauthorized
- `404` - Not Found
- `500` - Server Error

## Socket.io Troubleshooting

### Connection Issues
- Verify CORS settings in server.js match frontend URL
- Check that socket.io port matches (default: 5000)
- Ensure auth token is valid

### Message Not Updating in Real-Time
- Verify socket is connected: `socket.connected === true`
- Check that user has joined the chat room: `socket.emit("chat:join", chatId)`
- Verify browser console for socket.io errors

### User Disconnect Issues
- Socket automatically cleans up on disconnect
- Check server logs for "User disconnected" message

## Future Enhancements

1. **Message Replies** - Quote and reply to specific messages
2. **Message Search** - Full-text search across messages
3. **Group Chats** - Support for group conversations
4. **File Sharing** - Upload files in chat
5. **Voice/Video Calls** - WebRTC integration
6. **Course Content** - Lessons, assignments, quizzes
7. **Progress Tracking** - Student course completion
8. **Ratings & Reviews** - Course feedback system

## Testing Recommendations

### Chat Testing
1. Open two browser windows
2. Login with different users
3. Navigate to Chats page
4. Create chat between users
5. Send messages and verify real-time delivery

### Course Testing
1. Create courses as instructor
2. Enroll students in courses
3. Verify enrolled courses show in student's Courses page

### Settings Testing
1. Change theme and verify CSS variables update
2. Toggle dark mode and refresh page
3. Verify settings persist after page reload


# Quick API Reference

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require JWT token in header:
```
Authorization: Bearer <token>
```

---

## CHAT ENDPOINTS

### Get All Chats
```
GET /chats
Headers: Authorization required
Response: Array of Chat objects
```

### Get or Create Chat with User
```
POST /chats/user/:userId
Headers: Authorization required
Body: {}
Response: Chat object
```

### Get Chat Details
```
GET /chats/:chatId
Headers: Authorization required
Response: Chat object with participants
```

### Get Messages in Chat
```
GET /chats/:chatId/messages
Headers: Authorization required
Response: Array of Message objects
```

### Send Message
```
POST /chats/:chatId/messages
Headers: Authorization required
Body: { "content": "message text" }
Response: Message object
```

### Mark Messages as Read
```
PUT /chats/:chatId/mark-read
Headers: Authorization required
Response: { "message": "Messages marked as read" }
```

---

## COURSE ENDPOINTS

### Get All Courses
```
GET /courses
Response: Array of Course objects
```

### Get User's Enrolled Courses
```
GET /courses/enrolled
Headers: Authorization required
Response: Array of enrolled Course objects
```

### Get Course Details
```
GET /courses/:courseId
Response: Course object with instructor details
```

### Create Course (Instructor Only)
```
POST /courses
Headers: Authorization required
Body: {
  "name": "Course Name",
  "description": "Description",
  "level": "Beginner|Intermediate|Advanced",
  "thumbnail": "image_url",
  "hours": 40,
  "price": 4999
}
Response: Created Course object
```

### Enroll in Course
```
POST /courses/:courseId/enroll
Headers: Authorization required
Body: {}
Response: { "message": "Successfully enrolled", "course": Course object }
```

### Update Course (Instructor Only)
```
PUT /courses/:courseId
Headers: Authorization required
Body: {
  "name": "Updated Name",
  "description": "Updated description",
  "level": "Advanced",
  "thumbnail": "new_url",
  "hours": 50,
  "price": 5999
}
Response: Updated Course object
```

### Delete Course (Instructor Only)
```
DELETE /courses/:courseId
Headers: Authorization required
Response: { "message": "Course deleted successfully" }
```

---

## USER SETTINGS ENDPOINTS

### Update User Settings
```
PUT /user/settings
Headers: Authorization required
Body: {
  "theme": "light|blue|green|purple",
  "darkMode": true|false,
  "notifications": true|false
}
Response: Updated User object with settings
```

### Get User Profile
```
GET /user/me
Headers: Authorization required
Response: User object (includes settings)
```

---

## SOCKET.IO EVENTS

### Client Events (Send)
```javascript
// Register user with socket
socket.emit("user:register", userId);

// Join a chat room
socket.emit("chat:join", chatId);

// Send message with real-time broadcast
socket.emit("chat:message", {
  chatId: "chat_id",
  message: messageObject
});

// Send typing indicator
socket.emit("chat:typing", {
  chatId: "chat_id",
  userId: "user_id",
  isTyping: true|false
});
```

### Server Events (Listen)
```javascript
// New message received
socket.on("chat:message:new", (message) => {
  // Handle incoming message
});

// User typing
socket.on("chat:user:typing", ({ userId, isTyping }) => {
  // Handle typing indicator
});

// Connection events
socket.on("connect", () => {
  console.log("Connected");
});

socket.on("disconnect", () => {
  console.log("Disconnected");
});
```

---

## RESPONSE FORMATS

### Chat Object
```json
{
  "_id": "ObjectId",
  "participants": [
    {
      "_id": "ObjectId",
      "name": "User Name",
      "email": "user@example.com",
      "profileImage": "image_url"
    }
  ],
  "chatName": "Display Name",
  "messages": ["MessageId1", "MessageId2"],
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:35:00Z"
}
```

### Message Object
```json
{
  "_id": "ObjectId",
  "chatId": "ChatId",
  "sender": {
    "_id": "ObjectId",
    "name": "User Name",
    "profileImage": "image_url",
    "email": "user@example.com"
  },
  "content": "Message text",
  "timestamp": "2024-01-15T10:35:00Z",
  "read": false,
  "createdAt": "2024-01-15T10:35:00Z",
  "updatedAt": "2024-01-15T10:35:00Z"
}
```

### Course Object
```json
{
  "_id": "ObjectId",
  "name": "Course Name",
  "description": "Course description",
  "instructor": {
    "_id": "ObjectId",
    "name": "Instructor Name",
    "email": "instructor@example.com",
    "profileImage": "image_url"
  },
  "level": "Beginner",
  "thumbnail": "image_url",
  "enrolledStudents": ["UserId1", "UserId2"],
  "hours": 40,
  "price": 4999,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### User Settings
```json
{
  "_id": "ObjectId",
  "fullName": "User Name",
  "email": "user@example.com",
  "settings": {
    "theme": "light",
    "darkMode": false,
    "notifications": true
  },
  ...otherUserFields
}
```

---

## ERROR RESPONSES

### 400 Bad Request
```json
{ "message": "Message content is required" }
```

### 403 Forbidden
```json
{ "message": "Unauthorized" }
```

### 404 Not Found
```json
{ "message": "Chat not found" }
```

### 500 Server Error
```json
{ "message": "Error description" }
```

---

## COMMON WORKFLOWS

### Start Chatting
1. `GET /chats` - Get existing chats
2. `POST /chats/user/:userId` - Create new chat if not exists
3. `GET /chats/:chatId/messages` - Load message history
4. Connect to Socket.io and emit `user:register`
5. Emit `chat:join` for the chat room
6. Listen for `chat:message:new` events
7. `POST /chats/:chatId/messages` - Send message
8. `PUT /chats/:chatId/mark-read` - Mark as read

### Browse and Enroll Courses
1. `GET /courses` - Get all available courses
2. `POST /courses/:courseId/enroll` - Enroll in course
3. `GET /courses/enrolled` - Get your enrolled courses

### Customize Settings
1. `GET /user/me` - Get current settings
2. `PUT /user/settings` - Update theme/darkMode/notifications
3. Frontend loads from localStorage and CSS applies theme


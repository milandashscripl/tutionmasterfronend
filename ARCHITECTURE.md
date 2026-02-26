# Architecture & Flow Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      User Browser                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         React Frontend (Vite Dev Server)               │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │ Pages:                                           │  │ │
│  │  │ • Dashboard       • Chats (Socket.io)            │  │ │
│  │  │ • Profile         • Courses (REST API)           │  │ │
│  │  │ • Settings (REST API & localStorage)             │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
         │                                    │
         │ HTTP/REST                         │ Socket.io (WebSocket)
         │ (CORS)                           │
         ▼                                    ▼
┌──────────────────────────────────────────────────────────────┐
│              Backend Express Server (Node.js)               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Routes:                                                │ │
│  │ • /api/auth         (Login, Register, Logout)          │ │
│  │ • /api/user         (Profile, Settings)                │ │
│  │ • /api/chats        (Chat CRUD)                        │ │
│  │ • /api/courses      (Course CRUD)                      │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │ Socket.io Server:                                      │ │
│  │ • user:register     (Connect user)                      │ │
│  │ • chat:join         (Join room)                         │ │
│  │ • chat:message      (Broadcast)                         │ │
│  │ • chat:typing       (Typing indicator)                  │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
         │
         │ Database Connection
         ▼
┌──────────────────────────────────────────────────────────────┐
│           MongoDB (Data Persistence)                         │
│  Collections:                                                │
│  • users          (with settings subdocument)               │
│  • chats          (conversations)                           │
│  • messages       (chat messages)                           │
│  • courses        (course catalog)                          │
└──────────────────────────────────────────────────────────────┘
```

---

## Chat Message Flow

```
User A                    Browser A              Socket.io           Backend           Browser B              User B
  │                           │                    Server              Server             │                     │
  │ Type message               │                      │                   │               │                     │
  │──────────────────────────►│                      │                   │               │                     │
  │                           │                      │                   │               │                     │
  │                           │ Send (REST POST)     │                   │               │                     │
  │                           │─────────────────────────────────────────►│               │                     │
  │                           │                      │                   │               │                     │
  │                           │                      │  Save to MongoDB  │               │                     │
  │                           │                      │◄──────────────────│               │                     │
  │                           │            Emit chat:message:new         │               │                     │
  │                           │◄───────────────────────────────────────────────────────►│                     │
  │                           │                      │                   │               │                     │
  │                           │                      │                   │               │ Display message    │
  │                           │                      │                   │               ├───────────────────►│
  │                    Message persisted           │                   │               │                     │
  │                    and delivered instantly      │                   │               │                     │
```

---

## Real-Time Chat Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Chats Page (Frontend)                        │
│  ┌──────────────────┐  ┌──────────────────────────────────────┐ │
│  │  Chat List       │  │  Messages Display                    │ │
│  │  • User A        │  │  ┌─────────────────────────────────┐ │ │
│  │  • User B        │  │  │ Message 1: Hello               │ │ │
│  │  • User C        │  │  │ Message 2: Hi there!            │ │ │
│  │                  │  │  │ [Input] Send                    │ │ │
│  │  [Click to open] │  │  └─────────────────────────────────┘ │ │
│  └──────────────────┘  └──────────────────────────────────────┘ │
│         │                           ▲                            │
│         │                           │                            │
│ Socket.io │                         │ Socket.io on("chat:message:new")
│ connection│─────────────────────────┤                            │
│  registry │                         │                            │
└──────────┼───────────────────────────┼────────────────────────────┘
           │                           │
           ▼                           ▼
    Socket Room: chat:chatId1
    (One room per chat)
    Members: User A, User B
```

---

## Data Models Relationships

```
┌──────────────────┐
│      User        │
├──────────────────┤
│ _id (PK)         │
│ email            │
│ fullName         │◄────────────┐
│ settings {       │             │
│   theme          │             │
│   darkMode       │    One-to-Many
│   notifications  │             │
│ }                │             │
└──────────────────┘             │
        ▲              ┌─────────┴──────────────┐
        │              │                        │
   (Participants)      ▼                        ▼
        │       ┌──────────────┐        ┌──────────────┐
        │       │     Chat     │        │    Course    │
        └───────┤──────────────┤        ├──────────────┤
                │ _id (PK)     │        │ _id (PK)     │
                │ participants │        │ instructor   │◄─── References User
                │ messages ────┼──┐     │ name         │
                │ chatName     │  │     │ level        │
                └──────────────┘  │     │ students ────┼──┐
                        ▲          │     └──────────────┘  │
                        │          │            ▲          │
                        │ Ref      └───────┐    │          │
                        │                  ▼    │          │
                        │          ┌──────────────────┐    │
                        └──────────┤    Message       │    │
                                   ├──────────────────┤    │
                        References │ _id (PK)         │    │
                                   │ chatId           │    │
                                   │ sender ──────────┼────┘
                                   │ content          │    References User
                                   │ timestamp        │
                                   │ read             │
                                   └──────────────────┘
```

---

## Authentication & Authorization Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Login/Register                           │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend Auth Controller                        │
│  • Hash password                                            │
│  • Create/Find user                                         │
│  • Generate JWT token                                       │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│         Frontend: Store Token in localStorage               │
│  localStorage.setItem("token", jwtToken)                   │
└─────────────────────────────────────────────────────────────┘
         │
         ├─ All API Requests ◄────────────────┐
         │   Authorization: Bearer <token>    │
         │                                    │
         ├─ Socket.io Connection             │
         │   auth: { token: <token> }        │
         │                                    │
         └──────► Protected Routes ★          │
              (Require authMiddleware)        │
              • /api/chats                    │
              • /api/courses/enrolled         │
              • /api/user/settings            │
              All verify token & user         │
              └────────────────────────────────┘

        ★ Role-Based Access
          • Course Creation → Instructor/Admin only
          • Course Management → Instructor/Admin only
          • Chat Access → Participants only
```

---

## Request/Response Cycle

### Chat Message Send
```
1. User types message
2. onClick → handleSendMessage()
3. POST /api/chats/{chatId}/messages
   └─ Headers: Authorization: Bearer JWT_TOKEN
   └─ Body: { content: "Hello" }
4. Backend:
   ├─ Verify JWT token
   ├─ Check user is chat participant
   ├─ Save to MongoDB
   ├─ Return populated message
   └─ Emit via Socket.io to room
5. Frontend receives:
   ├─ Via REST: Add to state
   ├─ Via Socket: Also receives broadcast
   ├─ Update UI with message
6. Message visible immediately

Total time: < 200ms (typical)
```

### Course Enrollment
```
1. User clicks "Enroll" button
2. POST /api/courses/{courseId}/enroll
   └─ Headers: Authorization: Bearer JWT_TOKEN
3. Backend:
   ├─ Verify JWT token
   ├─ Check if already enrolled
   ├─ Add user to enrolledStudents
   ├─ Save course
   └─ Return success response
4. Frontend:
   ├─ Show success message
   ├─ Add course to user's list
   ├─ Hide enrollment button
5. Course appears in "My Courses"

Total time: < 300ms (typical)
```

### Settings Update
```
1. User selects new theme
2. Frontend:
   ├─ Update CSS variables immediately (UI feedback)
   ├─ Save to localStorage (fallback)
   └─ Send to backend
3. PUT /api/user/settings
   └─ Body: { theme: "blue", darkMode: false }
4. Backend:
   ├─ Verify JWT token
   ├─ Update user.settings in MongoDB
   └─ Return updated user object
5. Frontend:
   ├─ Show success message
   ├─ Settings persisted server-side
   ├─ Survives browser restart
6. Next login loads saved theme

Total time: < 200ms (typical)
```

---

## Socket.io Event Sequence

### Initial Connection
```
User Opens Chats Page
         │
         ▼
useEffect runs
         │
  ┌──────┴───────────────────────────────────┐
  │                                          │
  ▼                                          ▼
User state ready          Socket.io connects
         │                        │
         └────────────────────────┴─────────┐
                                  │
                          socket.emit("user:register", userId)
                                  │
                          Backend Socket Handler
                                  │
                          userSockets.set(userId, socketId)
                                  │
                          Ready for chat operations
```

### Joining Chat Room
```
User Clicks on Chat
         │
         ▼
API Call: GET /chats/{chatId}/messages
         │
         ├─ Load message history from MongoDB
         │
         └─ Success Handler
              │
              ▼
         socket.emit("chat:join", chatId)
              │
              ▼
         Backend Socket Handler
              │
              ├─ socket.join(`chat:${chatId}`)
              │
              └─ Now receives all events for this room
```

### Sending Message
```
User Clicks Send
         │
         ├─ API: POST /api/chats/{chatId}/messages
         │  └─ Save to MongoDB
         │  └─ Return populated message
         │
         ├─ Add to local state (optimistic UI)
         │
         └─ socket.emit("chat:message", {chatId, message})
              │
              ▼
         Backend broadcasts to room
              │
              ▼
         io.to(`chat:${chatId}`).emit("chat:message:new", message)
              │
              ├─ All connected users in room (except sender)
              │
              └─ Receive event
                 │
                 ▼
              setMessages([...messages, newMessage])
                 │
                 ▼
              UI Updates in Real-Time
```

---

## Theme Application Flow

```
User Selects Theme
         │
         ▼
handleThemeChange(theme)
         │
         ├─ setTheme(theme)
         │  └─ React state update
         │
         ├─ localStorage.setItem("appTheme", theme)
         │  └─ Persist to browser storage
         │
         └─ updateCSSTheme(theme)
              │
              ▼
         Get theme colors from object
              │
              ├─ light: { --bg: "#faf9f7", ... }
              ├─ blue: { --bg: "#f0f4f8", ... }
              ├─ green: { --bg: "#f0f8f4", ... }
              └─ purple: { --bg: "#f5f3f8", ... }
              │
              ▼
         document.documentElement.style.setProperty(key, value)
              │
              ▼
         CSS Variables Update (instant)
              │
              ├─ All elements using --accent-1 update
              ├─ All elements using --bg update
              ├─ All elements using --muted update
              └─ All elements using --text update
              │
              ▼
         UI Changes in Real-Time
         │
         ▼
Send to Backend: PUT /api/user/settings
         │
         ├─ Save to MongoDB
         │
         └─ Persisted for next login
```

---

## File Upload & Image Display Flow

### Profile Image Upload
```
User Selects File
         │
         ▼
handleFileChange(event)
         │
         ├─ Get file from input
         ├─ Create preview URL
         └─ updateProfile(file)
              │
              ▼
         FormData append file
              │
              ▼
         PUT /api/user/me (multipart/form-data)
              │
              ▼
         Backend:
         ├─ Extract file buffer
         ├─ Upload to Cloudinary
         ├─ Get secure_url
         ├─ Save to MongoDB: user.profilePic
         └─ Return updated user
              │
              ▼
         Frontend:
         ├─ Update user state
         ├─ Update img src
         └─ Show success message
         
Header displays profile image immediately
```

---

## Performance Optimization

```
Frontend Load
         │
         ├─ Vite builds app
         ├─ Code splitting by route
         ├─ Lazy load components
         └─ Minify & compress
              │
              ▼
         Browser loads index.html
              │
              ├─ Cache static assets (CSS, JS)
              └─ Service Worker (optional)
              │
              ▼
         React renders
              │
              ├─ Virtual DOM diffing
              ├─ Only necessary updates
              └─ Fast re-renders
              │
              ▼
         User sees app in < 2s

Backend Response Time
         │
         ├─ Request routing (< 5ms)
         ├─ Database query (< 50ms with indexes)
         ├─ Serialization (< 10ms)
         └─ Network (varies)
              │
              ▼
         Total API response: < 200ms (typical)
         Socket.io latency: < 100ms (typical)
```

---

## Error Handling Flow

```
User Action (e.g., Send Message)
         │
         ▼
Try Block
         │
         ├─ Validate input
         ├─ Make API call
         ├─ Process response
         └─ Update UI
         │
         └─ Any error?
              │
              ├─ YES → Catch Block
              │         │
              │         ├─ err.response?.data?.message → User error
              │         ├─ Network error → "Connection failed"
              │         ├─ Timeout → "Request timed out"
              │         │
              │         └─ Show error toast/alert
              │
              └─ NO → Success
                     │
                     └─ Show success message
                        Reset form
                        Update UI
```

---

## Session Management

```
User Logs In
         │
         ▼
Backend generates JWT token
         │
         ▼
Frontend stores in localStorage
         │
         ├─ Survives page refresh
         ├─ Survives browser restart
         └─ Sent with every API request
              │
              ▼
On Every Request
         │
         ├─ Get token from localStorage
         ├─ Add to Authorization header
         ├─ Send to backend
         │
         └─ Backend verifies token
              │
              ├─ Valid? Continue
              ├─ Expired? Return 401
              └─ Invalid? Return 401
                 │
                 ▼
              Frontend on 401
              ├─ Clear localStorage
              ├─ Redirect to login
              └─ User logs in again

User Logs Out
         │
         ├─ Clear localStorage
         ├─ Disconnect Socket.io
         └─ Redirect to login
```

---

This architecture ensures:
- ✅ Real-time data synchronization
- ✅ Reliable message delivery
- ✅ Scalable design
- ✅ Good performance
- ✅ Security & authentication
- ✅ Error resilience


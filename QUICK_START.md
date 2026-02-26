# ⚡ Quick Start Card

## 🚀 Get Running in 5 Minutes

### Step 1: Backend Setup (Terminal 1)
```bash
cd backend
npm install
npm start
```
✅ Server runs on `http://localhost:5000`

### Step 2: Frontend Setup (Terminal 2)
```bash
cd auth-ui
npm install
npm run dev
```
✅ Frontend runs on `http://localhost:5173`

### Step 3: Test
1. Open [http://localhost:5173](http://localhost:5173)
2. Login with existing user
3. Go to **Chats** → Send message (real-time!)
4. Go to **Courses** → Browse courses
5. Go to **Settings** → Change theme (instant!)

---

## 📚 Essential Files to Know

### Backend
```
backend/
├── server.js          ← Main server (Socket.io setup)
├── models/
│   ├── Chat.js        ← Chat model
│   ├── Message.js     ← Message model
│   └── Course.js      ← Course model
├── routes/
│   ├── chatRoutes.js  ← Chat API (6 endpoints)
│   └── courseRoutes.js ← Course API (7 endpoints)
└── package.json       ← Dependencies
```

### Frontend
```
auth-ui/src/
├── pages/
│   ├── Chats.jsx      ← Real-time chat (Socket.io)
│   ├── Courses.jsx    ← Course browsing
│   └── Settings.jsx   ← Theme customization
├── App.jsx            ← Routes
└── index.css          ← Styles & animations
```

---

## 🔗 API Quick Reference

### Chat (6 Endpoints)
```
GET    /api/chats
POST   /api/chats/user/:userId
GET    /api/chats/:chatId/messages
POST   /api/chats/:chatId/messages
```

### Courses (7 Endpoints)
```
GET    /api/courses
POST   /api/courses/:courseId/enroll
```

### Settings (1 Endpoint)
```
PUT    /api/user/settings
```

👉 Full API docs: [API_REFERENCE.md](API_REFERENCE.md)

---

## 🎮 Feature Testing

### Chat (Real-Time)
1. Open two browsers with different users
2. Go to **Chats**
3. Send message from User A
4. See instant delivery in User B ✨

### Courses
1. Go to **Courses**
2. Click **Enroll** on a course
3. Course appears in your list

### Settings
1. Go to **Settings**
2. Select different theme
3. UI updates instantly 🎨

---

## 🆘 Troubleshooting

### Backend won't start?
```bash
# Check if port 5000 is in use
lsof -i :5000  # Mac/Linux
netstat -ano | findstr :5000  # Windows
```

### Socket.io won't connect?
- Check backend is running on 5000
- Check browser console (F12) for errors
- Verify CORS in server.js

### Messages not showing?
- Refresh page
- Clear browser cache
- Check Network tab in DevTools

---

## 📖 Documentation

| Need | File |
|------|------|
| Setup help | [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) |
| API usage | [API_REFERENCE.md](API_REFERENCE.md) |
| How it works | [ARCHITECTURE.md](ARCHITECTURE.md) |
| Feature overview | [DELIVERY_SUMMARY.md](DELIVERY_SUMMARY.md) |
| All documentation | [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) |

---

## ✅ Checklist

- [ ] Backend running on localhost:5000
- [ ] Frontend running on localhost:5173
- [ ] Can login successfully
- [ ] Chat page loads
- [ ] Can send message (real-time!)
- [ ] Courses page loads
- [ ] Settings page loads with theme selector

---

## 🚀 Next Steps

1. **Explore Code** - Check out the implementations
2. **Read Docs** - Understand the architecture
3. **Deploy** - Follow DEPLOYMENT_GUIDE.md
4. **Extend** - Add more features!

---

## 💡 Remember

- **Backend**: Express.js + MongoDB + Socket.io
- **Frontend**: React + Vite + Socket.io-client
- **Real-Time**: WebSocket (Socket.io)
- **Themes**: 4 color schemes + dark mode
- **Courses**: Browse & enroll
- **Chat**: Real-time messaging

---

## 📞 Help

- Backend issues? → [BACKEND_SETUP.md](BACKEND_SETUP.md)
- API questions? → [API_REFERENCE.md](API_REFERENCE.md)
- Architecture? → [ARCHITECTURE.md](ARCHITECTURE.md)
- Stuck? → [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md#troubleshooting)

---

**You're ready!** 🎉

Start with:
```bash
cd backend && npm start
```

Then in another terminal:
```bash
cd auth-ui && npm run dev
```

And visit [http://localhost:5173](http://localhost:5173)


# Deployment & Setup Guide

## Local Development Setup

### Prerequisites
- Node.js v16+ and npm installed
- MongoDB running locally or connection string ready
- Git (optional)

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create .env file**
   ```
   MONGO_URI=mongodb://localhost:27017/tutionmaster
   JWT_SECRET=your_super_secret_jwt_key_change_this
   PORT=5000
   NODE_ENV=development
   
   # Cloudinary (optional, for profile images)
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   
   # Email (if using Resend)
   RESEND_API_KEY=your_resend_key
   EMAIL_USER=noreply@yourdomain.com
   ```

4. **Start backend server**
   ```bash
   npm start
   ```
   Server will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd auth-ui
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure backend URL**
   - Edit `src/pages/Chats.jsx`
   - Update `SOCKET_URL` to match your backend URL
   - Default: `http://localhost:5000`

4. **Start development server**
   ```bash
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

### Verify Setup

- [ ] Backend logs show "🔥 Server running on port 5000"
- [ ] Frontend shows "VITE v..." with dev server address
- [ ] Open `http://localhost:5173` in browser
- [ ] Login page displays correctly
- [ ] No console errors in DevTools

---

## Testing the Features

### Test Chat System
1. Open two browser windows (or use incognito)
2. Login with different user accounts
3. Go to Chats section
4. Create a new conversation
5. Send messages and verify real-time delivery
6. Refresh page and verify message history persists

### Test Course System
1. Login as instructor user
2. Go to Courses section
3. View available courses
4. Enroll in a course
5. Filter by level and verify display

### Test Settings
1. Go to Settings section
2. Change color theme - verify UI updates immediately
3. Toggle dark mode - verify colors invert
4. Refresh page - verify theme persists
5. Toggle notifications

---

## Production Deployment

### Deploy Backend (Render.com example)

1. **Prepare repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Create Render account** at render.com

3. **New Web Service**
   - Connect GitHub repository
   - Set root directory to `backend`
   - Build command: `npm install`
   - Start command: `npm start`

4. **Environment Variables**
   ```
   MONGO_URI=<MongoDB Atlas connection string>
   JWT_SECRET=<strong random string>
   PORT=5000
   NODE_ENV=production
   CLOUDINARY_CLOUD_NAME=<your value>
   CLOUDINARY_API_KEY=<your value>
   CLOUDINARY_API_SECRET=<your value>
   ```

5. **Deploy** and copy backend URL

### Deploy Frontend (Netlify example)

1. **Build frontend**
   ```bash
   cd auth-ui
   npm run build
   ```

2. **Connect to Netlify**
   - New site from Git
   - Select repository
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Update frontend files**
   - Edit `src/pages/Chats.jsx`
   - Change `SOCKET_URL` to production backend URL
   - Rebuild: `npm run build`

4. **Environment Variables** (if needed)
   - Add in Netlify dashboard
   - Or hardcode in production build

5. **Deploy**

### Setup MongoDB Atlas

1. Go to mongodb.com/cloud/atlas
2. Create account and cluster
3. Get connection string
4. Add to backend .env as `MONGO_URI`
5. Whitelist IP addresses

### CORS Configuration for Production

In `backend/server.js`, update CORS origins:
```javascript
origin: [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://your-frontend-domain.com",
  "https://your-backend-domain.com"
],
```

---

## Troubleshooting

### Backend Issues

**Port 5000 already in use**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

**MongoDB connection fails**
- Verify MongoDB is running
- Check connection string in .env
- Ensure IP is whitelisted (MongoDB Atlas)

**Socket.io connection fails**
- Check backend console for errors
- Verify CORS settings
- Check browser network tab
- Ensure auth token is valid

### Frontend Issues

**Blank page or errors**
- Check browser console (F12)
- Verify backend is running
- Clear browser cache and reload
- Check network requests are successful

**Socket.io errors**
- Backend URL incorrect in Chats.jsx
- Backend not running
- CORS not allowing frontend origin

**Theme not changing**
- Clear localStorage: `localStorage.clear()`
- Hard refresh: Ctrl+Shift+R
- Check CSS variables applied: DevTools > Elements

---

## Performance Optimization

### Backend
```javascript
// Add compression
import compression from 'compression';
app.use(compression());

// Add connection pooling
// Already in Mongoose connection

// Add caching headers
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'public, max-age=300');
  next();
});
```

### Frontend
- Tree shaking enabled in Vite
- Code splitting for route components
- Lazy loading for images
- Minification in production build

### Database
```javascript
// Create indexes in MongoDB
db.chats.createIndex({ "participants": 1 })
db.messages.createIndex({ "chatId": 1, "timestamp": -1 })
db.courses.createIndex({ "instructor": 1 })
```

---

## Monitoring

### Backend Monitoring
- Setup error logging (e.g., Sentry)
- Monitor Socket.io connections
- Track API response times
- Monitor database query performance

### Frontend Monitoring
- Setup error tracking (e.g., Sentry)
- Monitor Core Web Vitals
- Track user interactions
- Monitor API calls

---

## Scaling Considerations

### Redis for Sessions
```bash
npm install redis
# Add Redis connection for session management
```

### Database Optimization
- Add indexes on frequently queried fields
- Archive old messages
- Use pagination for large datasets

### Load Balancing
- Deploy multiple backend instances
- Use Socket.io adapter for multi-server
- Add reverse proxy (nginx)

### CDN
- Serve frontend from CDN
- Compress static assets
- Cache images and assets

---

## Security Checklist

- [x] JWT secrets strong and random
- [x] MongoDB credentials secure
- [x] CORS origins restricted
- [x] Input validation implemented
- [x] Rate limiting considered
- [x] HTTPS enforced in production
- [x] Sensitive data not in logs
- [x] Dependencies kept updated
- [x] Environment variables not in code
- [x] SQL/NoSQL injection prevented
- [x] XSS protection implemented
- [x] CSRF protection considered

---

## Backup Strategy

### MongoDB Backups
```bash
# Local backup
mongodump --uri="mongodb://localhost:27017/tutionmaster"

# MongoDB Atlas - automatic backups included

# Restore
mongorestore --shell backup/
```

### Code Backups
- Use Git with regular commits
- Push to GitHub/GitLab regularly
- Tag releases

---

## Update & Maintenance

### Weekly Tasks
- Monitor error logs
- Check Socket.io connection status
- Review API response times

### Monthly Tasks
- Update npm dependencies (npm update)
- Review and optimize database queries
- Check for security vulnerabilities (npm audit)
- Backup database

### Quarterly Tasks
- Major dependency updates
- Database optimization
- Performance benchmarking
- Security audit

---

## Rollback Procedure

If deployment has issues:

1. **Identify the problem**
   - Check error logs
   - Monitor user reports
   - Review recent changes

2. **Rollback backend**
   ```bash
   git revert <commit-hash>
   git push
   # Render will auto-deploy
   ```

3. **Rollback frontend**
   ```bash
   npm run build
   Deploy previous version
   ```

4. **Database rollback**
   ```bash
   mongorestore from backup
   ```

---

## Support & Documentation

- Keep README.md updated
- Document API changes
- Maintain changelog
- Create runbooks for common tasks
- Setup team wiki/confluence

---

## Quick Command Reference

```bash
# Backend
cd backend && npm install && npm start

# Frontend
cd auth-ui && npm install && npm run dev

# Build for production
cd auth-ui && npm run build

# Lint code
npm run lint

# Run tests (if available)
npm test

# Format code
npm run format

# Check for security vulnerabilities
npm audit

# Update dependencies
npm update

# Clean node_modules
rm -rf node_modules && npm install
```

---

## Useful Links

- [Node.js docs](https://nodejs.org/docs/)
- [Express.js guide](https://expressjs.com/)
- [MongoDB docs](https://docs.mongodb.com/)
- [Socket.io guide](https://socket.io/docs/)
- [React docs](https://react.dev/)
- [Vite docs](https://vitejs.dev/)
- [Render docs](https://render.com/docs)
- [Netlify docs](https://docs.netlify.com/)
- [MongoDB Atlas](https://docs.atlas.mongodb.com/)

---

**Deployment Guide Complete** ✅  
Last Updated: January 2024


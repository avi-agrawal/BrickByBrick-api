# 🚀 BrickByBrick Quick Start Guide

## Prerequisites
- Node.js (v16 or higher)
- npm or yarn

## 🏃‍♂️ Quick Setup (5 minutes)

### 1. Start Backend Server
```bash
cd BrickByBrick-api
npm install
npm start
```
✅ Backend running on http://localhost:7007

### 2. Start Frontend Server (New Terminal)
```bash
cd BrickByBrick-UI
npm install
npm run dev
```
✅ Frontend running on http://localhost:3000

### 3. Test Integration
```bash
cd BrickByBrick-api
./test-integration.sh
```
✅ All tests should pass

## 🧪 Test with Postman

1. Import `BrickByBrick_API_Collection.postman_collection.json`
2. Set environment variable: `baseUrl = http://localhost:7007`
3. Run "Register User" request
4. Use the returned token for authenticated requests

## 🌐 Access URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:7007
- **Health Check**: http://localhost:7007/health
- **API Docs**: Check INTEGRATION_REPORT.md

## 🔧 Environment Setup

### Backend (.env file)
```env
JWT_SECRET=your-super-secret-jwt-key-here
SESSION_SECRET=your-super-secret-session-key-here
PORT=7007
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env file)
```env
VITE_API_URL=http://localhost:7007
```

## 🎯 Key Features Working

✅ User Registration & Login  
✅ JWT Authentication  
✅ Problem Tracking  
✅ Learning Item Management  
✅ Roadmap Creation  
✅ Analytics & Statistics  
✅ OAuth (Google/GitHub) - Optional  
✅ Spaced Repetition System  

## 🐛 Troubleshooting

**Backend not starting?**
- Check if port 7007 is available
- Run `npm install` to install dependencies

**Frontend not loading?**
- Check if port 3000 is available
- Run `npm install` to install dependencies

**API calls failing?**
- Check both servers are running
- Verify CORS configuration
- Check browser console for errors

**Database issues?**
- Database is automatically created
- Run `curl -X POST http://localhost:7007/admin/reset-db` to reset

## 📚 Full Documentation

- **Integration Report**: INTEGRATION_REPORT.md
- **API Collection**: BrickByBrick_API_Collection.postman_collection.json
- **Project Explanation**: PROJECT_EXPLANATION.md

---

**Ready to code! 🎉**

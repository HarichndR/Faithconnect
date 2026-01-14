# FaithConnect - Quick Start Guide

## 🚀 Running the Application

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies (if not already done):**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

   The backend will start on `http://localhost:5050`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies (if not already done):**
   ```bash
   npm install
   ```

3. **Configure your local IP (for physical devices):**
   
   Create or edit `.env` file:
   ```bash
   EXPO_PUBLIC_LOCAL_IP=YOUR_LOCAL_IP
   ```
   
   Find your local IP:
   ```bash
   ifconfig | grep "inet 192"
   ```

4. **Start the Expo development server:**
   ```bash
   npm start
   ```

5. **Run on your device:**
   - **iOS Simulator:** Press `i`
   - **Android Emulator:** Press `a`
   - **Physical Device:** Scan QR code with Expo Go app

## 🔧 Configuration

### Backend (.env)
```env
PORT=5050
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

### Frontend (.env)
```env
EXPO_PUBLIC_LOCAL_IP=192.168.x.x
```

## 📱 Features Implemented

### Authentication
- ✅ Landing page with role selection
- ✅ User registration (Worshiper/Leader)
- ✅ Login
- ✅ Profile setup
- ✅ JWT authentication

### User Roles
- **Worshiper:** Follow leaders, view content
- **Leader:** Create posts/reels, manage followers

### Core Features
- ✅ Posts feed
- ✅ Reels
- ✅ Chat/Messaging
- ✅ Notifications
- ✅ Profile management
- ✅ Follow/Unfollow system

## 🎨 UI Improvements

All authentication screens have been redesigned with:
- Modern gradient backgrounds
- Premium color scheme (Indigo/Purple)
- Smooth animations
- Icon-enhanced inputs
- Professional shadows and elevations
- Consistent design language

## 🐛 Fixes Applied

1. ✅ Fixed NODE_ENV typo in backend .env
2. ✅ Updated CORS to allow React Native connections
3. ✅ Enhanced all auth screen UIs
4. ✅ Added expo-linear-gradient dependency
5. ✅ Improved error messaging
6. ✅ Better form validation feedback

## 📝 Notes

- Backend is currently running on port 5050
- MongoDB connection is active
- Make sure your firewall allows connections on port 5050
- For physical devices, ensure backend and device are on same WiFi network

## 🆘 Troubleshooting

### Backend won't start
- Check MongoDB connection string
- Verify all environment variables are set
- Check if port 5050 is available

### Frontend can't connect to backend
- Verify EXPO_PUBLIC_LOCAL_IP is set correctly
- Check firewall settings
- Ensure backend is running
- Try using your actual local IP instead of localhost

### Build errors
- Clear cache: `npm start -- --clear`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check for missing dependencies

## 📚 Tech Stack

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- Socket.io (real-time chat)
- Cloudinary (media storage)
- JWT (authentication)

**Frontend:**
- React Native + Expo
- React Navigation
- Axios (API calls)
- AsyncStorage (local storage)
- Socket.io-client (real-time)

# Apple Music Tagging App - Demo Mode

This guide will help you run the Apple Music Tagging app in **demo mode** using mock data, so you can test all features without needing a database or Apple Music credentials.

## 🚀 Quick Start (Demo Mode)

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 1. Install Dependencies

```bash
# Install all dependencies for backend, mobile, and web
npm run install-all

# Or install individually:
cd backend && npm install
cd ../mobile && npm install  
cd ../web && npm install
```

### 2. Set Up Mock Environment

```bash
# Copy mock environment file
cp backend/.env.mock backend/.env
```

### 3. Start the Applications

Open **3 terminal windows/tabs**:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
The backend will start on `http://localhost:3001`

**Terminal 2 - Web App:**
```bash
cd web
npm run dev
```
The web app will start on `http://localhost:5173`

**Terminal 3 - Mobile App:**
```bash
cd mobile
npm start
```
Follow the Expo instructions to run on your device/simulator

## 🎵 Demo Features

### Pre-loaded Demo Data
The demo includes:
- **10 popular songs** with working Spotify album artwork
- **5 sample tags**: Pop, Favorites, Workout, Chill, Road Trip
- **Pre-tagged songs** to demonstrate filtering
- **Mock Apple Music library** with 8 additional songs for import
- **YouTube integration** - songs open in YouTube when clicked

### What You Can Test

#### ✅ **Authentication Flow**
- Click "Connect Apple Music" (no real Apple account needed)
- Mock authorization happens instantly

#### ✅ **Library Management**
- View pre-loaded songs with artwork and metadata
- Search songs by title or artist
- Filter songs by tags

#### ✅ **Tag System**
- Create new tags with custom colors
- **Assign tags to songs**: Click the 🏷️ button on any song card
- **Remove tags from songs**: Uncheck tags in the assignment modal
- View tag statistics and song counts per tag

#### ✅ **Apple Music Import**
- Click "Import from Apple Music" 
- Mock library with 8 songs will be imported
- See realistic import flow and feedback

#### ✅ **Music Playback**
- Click on any song to open it in YouTube (web) or show YouTube link (mobile)
- Mock playback simulation with realistic YouTube integration
- No Apple Music subscription required for testing

#### ✅ **Cross-Platform**
- Test identical features on web and mobile
- Responsive design on different screen sizes

## 🔧 Demo Data Details

### Mock Songs (Pre-loaded)
1. **Blinding Lights** - The Weeknd (Pop, Favorites)
2. **Shape of You** - Ed Sheeran (Pop, Workout)  
3. **Watermelon Sugar** - Harry Styles (Pop, Chill)
4. **Good 4 U** - Olivia Rodrigo (Pop, Favorites)
5. **Levitating** - Dua Lipa (Pop, Workout, Road Trip)
6. **drivers license** - Olivia Rodrigo
7. **Stay** - The Kid LAROI & Justin Bieber (Favorites)
8. **Industry Baby** - Lil Nas X & Jack Harlow (Workout)
9. **Heat Waves** - Glass Animals (Chill)
10. **As It Was** - Harry Styles (Favorites, Chill)

### Mock Apple Music Library (For Import)
- Anti-Hero - Taylor Swift
- Flowers - Miley Cyrus
- Unholy - Sam Smith & Kim Petras
- As It Was - Harry Styles
- Bad Habit - Steve Lacy
- About Damn Time - Lizzo
- Running Up That Hill - Kate Bush
- First Class - Jack Harlow

### Mock Tags
- 🔴 **Pop** (#FF6B6B) - 5 songs
- 💙 **Favorites** (#4ECDC4) - 4 songs  
- 💪 **Workout** (#45B7D1) - 3 songs
- 😌 **Chill** (#96CEB4) - 3 songs
- 🚗 **Road Trip** (#FECA57) - 1 song

## 🧪 Testing Scenarios

### Scenario 1: New User Flow
1. Open the web app
2. Click "Connect Apple Music" 
3. Explore pre-loaded library
4. Create a new tag (e.g., "Study Music") in the Tags page
5. Go back to Library and click 🏷️ on songs to assign your new tag
6. Filter by your new tag to see only those songs

### Scenario 2: Import Flow
1. Click "Import from Apple Music"
2. Watch as 8 new songs are imported
3. Notice the success message
4. See new songs appear in library
5. Click 🏷️ on imported songs to tag them with existing tags

### Scenario 3: Search and Filter
1. Search for "Harry" - see Harry Styles songs
2. Clear search, filter by "Favorites" tag
3. Try combining search + tag filters
4. Test pagination (if you have many songs)

### Scenario 4: Tag Management
1. Go to Tags page
2. Create multiple tags with different colors
3. See song counts for each tag
4. Go back to Library and click the 🏷️ button on any song
5. Check/uncheck tags to assign/remove them
6. See tags update immediately on the song card

### Scenario 5: Cross-Platform
1. Test the same features on web and mobile
2. Notice identical functionality
3. Test responsive design by resizing browser

## 🎯 Mock vs Real Mode

### Mock Mode (Current)
- ✅ No database required
- ✅ No Apple Music credentials needed  
- ✅ Instant setup and testing
- ✅ Realistic demo data
- ✅ All features work end-to-end
- ❌ Data doesn't persist between restarts
- ❌ No real Apple Music integration

### Real Mode (Production)
To switch to real mode later:
1. Set up PostgreSQL database
2. Get Apple Music developer credentials
3. Update environment variables
4. Change `useMockData = false` in services

## 🐛 Troubleshooting

### Backend Issues
- **Port 3001 in use**: Change PORT in `.env` file
- **CORS errors**: Check API_BASE_URL in frontend services

### Web App Issues  
- **Blank page**: Check browser console for errors
- **API errors**: Ensure backend is running on port 3001

### Mobile App Issues
- **Expo errors**: Make sure you have Expo CLI installed
- **Network issues**: Ensure mobile device can reach your computer's IP

### Common Solutions
```bash
# Clear all node_modules and reinstall
rm -rf */node_modules
npm run install-all

# Check if ports are available
lsof -i :3001  # Backend
lsof -i :5173  # Web app

# Restart all services
# Kill all terminal processes and restart
```

## 🎉 Next Steps

After testing the demo:
1. **Explore the code** - See how mock services work
2. **Customize mock data** - Add your own songs/tags in `mockDataService.ts`
3. **Set up real services** - Follow main README for production setup
4. **Deploy** - Use the working demo as a foundation

## 📝 Feedback

The demo showcases all major features:
- ✅ User authentication
- ✅ Song library management  
- ✅ Tag creation and assignment
- ✅ Search and filtering
- ✅ Apple Music import simulation
- ✅ Cross-platform compatibility
- ✅ Responsive design

This gives you a complete picture of how the real application will work once connected to actual Apple Music and database services!
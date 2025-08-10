# Apple Music Tagging App

A cross-platform application that allows users to add custom tags to their Apple Music library, filter songs by tags, and play music through Apple Music integration.

## Features

- 🎵 **Apple Music Integration**: Connect with your Apple Music account and import your library
- 🏷️ **Custom Tags**: Create and manage custom tags with colors for organizing your music
- 🔍 **Advanced Filtering**: Filter songs by tags, search by title/artist
- 📱 **Cross-Platform**: Available on both mobile (React Native) and web (React)
- 🎮 **Music Playback**: Play songs directly through Apple Music
- 💾 **Personal Library**: Your tags and organization are saved to your personal database

## Architecture

### Backend (Node.js + Express + TypeScript)
- RESTful API with JWT authentication
- PostgreSQL database for storing users, songs, tags, and relationships
- Apple Music API integration for library import

### Mobile App (React Native + Expo)
- Cross-platform mobile app for iOS and Android
- MusicKit integration for Apple Music access
- Beautiful, native-feeling UI

### Web App (React + Vite + TypeScript)
- Modern web interface with responsive design
- MusicKit JS for web-based Apple Music integration
- Feature parity with mobile app

## Getting Started

### Prerequisites

1. **Apple Developer Account** ($99/year)
   - Create MusicKit identifier
   - Generate developer tokens for Apple Music API

2. **PostgreSQL Database**
   - Local installation or cloud service (like Railway, Heroku Postgres)

3. **Node.js** (v18 or higher)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your database URL, JWT secret, and Apple credentials
   ```

4. Set up the database:
   ```bash
   # Connect to your PostgreSQL database and run:
   psql -d your_database_name -f src/db/schema.sql
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

The backend will be running at `http://localhost:3001`

### Mobile App Setup

1. Navigate to the mobile directory:
   ```bash
   cd mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Update the Apple Music developer token in `src/services/appleMusicService.ts`

4. Start the Expo development server:
   ```bash
   npm start
   ```

5. Use the Expo Go app to scan the QR code and run on your device

### Web App Setup

1. Navigate to the web directory:
   ```bash
   cd web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Update the Apple Music developer token in `src/services/appleMusicService.ts`

4. Start the development server:
   ```bash
   npm run dev
   ```

The web app will be running at `http://localhost:5173`

## Apple Music Developer Setup

### 1. Create MusicKit Identifier

1. Go to [Apple Developer Console](https://developer.apple.com)
2. Navigate to Certificates, Identifiers & Profiles
3. Create a new MusicKit identifier
4. Note your Team ID and Key ID

### 2. Generate Developer Token

You'll need to generate a JWT token server-side using your Apple private key. The token expires every 6 months and needs to be renewed.

Example token generation (add to your backend):

```javascript
const jwt = require('jsonwebtoken');
const fs = require('fs');

function generateAppleMusicToken() {
  const privateKey = fs.readFileSync('path/to/your/AuthKey_KEYID.p8');
  
  const token = jwt.sign({}, privateKey, {
    algorithm: 'ES256',
    expiresIn: '180d',
    issuer: process.env.APPLE_TEAM_ID,
    header: {
      alg: 'ES256',
      kid: process.env.APPLE_KEY_ID
    }
  });
  
  return token;
}
```

## API Endpoints

### Authentication
- `POST /api/auth/apple-music-login` - Login with Apple Music ID

### Songs
- `GET /api/songs` - Get user's songs (with filtering)
- `POST /api/songs/import` - Import songs from Apple Music

### Tags
- `GET /api/tags` - Get user's tags
- `POST /api/tags` - Create new tag
- `POST /api/tags/assign` - Assign tag to song
- `DELETE /api/tags/assign` - Remove tag from song

## Database Schema

The application uses PostgreSQL with the following tables:

- **users**: Store user information and Apple Music IDs
- **songs**: Store imported song metadata
- **tags**: User-created tags with colors
- **song_tags**: Many-to-many relationship between songs and tags

See `backend/src/db/schema.sql` for the complete schema.

## Deployment

### Backend
- Deploy to Railway, Heroku, or similar Node.js hosting
- Set up PostgreSQL database
- Configure environment variables

### Web App
- Deploy to Vercel, Netlify, or similar static hosting
- Update API_BASE_URL to your deployed backend

### Mobile App
- Build with `expo build`
- Submit to App Store and Google Play Store

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Troubleshooting

### Common Issues

1. **Apple Music Authorization Fails**
   - Ensure your developer token is valid and not expired
   - Check that MusicKit is properly configured
   - Verify user has active Apple Music subscription

2. **Database Connection Issues**
   - Check DATABASE_URL in environment variables
   - Ensure PostgreSQL is running
   - Verify database schema is created

3. **Import Not Working**
   - Check Apple Music API rate limits
   - Ensure user has songs in their library
   - Verify backend is receiving the import request

## Support

For issues and questions:
1. Check the troubleshooting section
2. Search existing GitHub issues
3. Create a new issue with detailed information

---

Built with ❤️ for music lovers who want better organization of their Apple Music libraries.
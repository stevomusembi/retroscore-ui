# 📱 RetroScore Mobile App

> A nostalgic EPL score guessing game built with Expo/React Native

Test your memory of historical Premier League matches! Login, get a random match from EPL history, guess the score, and see how well you remember football history.

## 🎮 How It Works

1. **Register/Login** → Create account or sign in
2. **Home Screen** → View your stats and start new games  
3. **Game Screen** → Get random historical match, guess the score
4. **Results** → See if you were right and your updated stats
5. **Leaderboard** → Compare your performance with other players
6. **Settings** → Configure notifications, hints, and time limits

## 🚀 Quick Start

### Prerequisites
- Node.js (16+)
- Expo CLI: `npm install -g @expo/cli`
- RetroScore Backend running on `http://localhost:8080`

### Setup & Run
```bash
# Clone the repository
git clone <your-repo-url>
cd retroscore-mobile

# Install dependencies
npm install

# Configure API endpoint (if different from localhost:8080)
# Edit the API_BASE_URL in your config file

# Start the development server
npx expo start

# Run on device/simulator
# Scan QR code with Expo Go app (iOS/Android)
# Or press 'i' for iOS simulator, 'a' for Android emulator
```

### Backend Configuration
Make sure your Spring Boot backend is running with:
- **Port**: 8080 (default)
- **CORS enabled** for mobile app requests
- **JWT authentication** configured
- **Match data imported** from CSV files

## 🏗️ Architecture

The app follows a clean component-based architecture with separate services for API communication and authentication management.

## 📱 Tech Stack
- **Expo/React Native** - Cross-platform mobile development
- **React Navigation** - Screen navigation
- **Axios** - HTTP client for API calls  
- **JWT** - Authentication tokens
- **AsyncStorage** - Local data persistence

---

*Backend repository: [RetroScore API](https://github.com/stevomusembi/retroscore)*
```mermaid
graph TB
    %% Mobile App Layer
    subgraph "RetroScore Mobile App - Expo/React Native"
        subgraph "Screens"
            Login["🔐 Login Screen"]
            Register["📝 Register Screen"]
            Home["🏠 Home Screen"]
            Game["🎮 Game Screen"]
            Results["📊 Results Screen"]
            Leaderboard["🏆 Leaderboard/Stats Screen"]
            Settings["⚙️ Settings Screen"]
        end
        
        subgraph "Services"
            AuthService["🔑 Authentication Service"]
            APIService["🌐 API Service - HTTP Client"]
        end
        
        subgraph "Components"
            MatchCard["⚽ Match Card Component"]
            ScoreInput["🎯 Score Input Component"]
            StatsDisplay["📈 Statistics Display"]
        end
    end
    
    %% Backend Communication
    Backend["🖥️ Spring Boot Backend API - JWT Auth | Game Logic | Match Data"]
    
    %% Database
    DB[("🗄️ Database")]
    
    %% Mobile App Flow
    Login --> AuthService
    Register --> AuthService
    Home --> APIService
    Game --> APIService
    Results --> APIService
    Leaderboard --> APIService
    Settings --> APIService
    
    Game --> MatchCard
    Game --> ScoreInput
    Results --> StatsDisplay
    Leaderboard --> StatsDisplay
    
    %% API Communications
    AuthService --> Backend
    APIService --> Backend
    
    %% Backend to Database
    Backend --> DB
    
    %% Styling
    classDef mobile fill:#e3f2fd,stroke:#1976d2,stroke-width:3px,color:#000000
    classDef service fill:#f3e5f5,stroke:#7b1fa2,stroke-width:3px,color:#000000
    classDef component fill:#e8f5e8,stroke:#388e3c,stroke-width:3px,color:#000000
    classDef backend fill:#fff3e0,stroke:#f57c00,stroke-width:3px,color:#000000
    classDef database fill:#fce4ec,stroke:#c2185b,stroke-width:3px,color:#000000
    
    class Login,Register,Home,Game,Results,Leaderboard,Settings mobile
    class AuthService,APIService service
    class MatchCard,ScoreInput,StatsDisplay component
    class Backend backend
    class DB database
    ```

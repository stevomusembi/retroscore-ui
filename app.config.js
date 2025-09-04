// app.config.js
export default {
  expo: {
    name: "RetroScoreApp",
    slug: "RetroScoreApp",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "retroscoreapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true
    },
    android: {
      package: "com.retroscore.app",
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff"
        }
      ],
      "expo-web-browser",
      "expo-secure-store",
      [
        "@react-native-google-signin/google-signin",
        {
          // Extract the client ID from the web client ID for iOS URL scheme
          iosUrlScheme: `com.googleusercontent.apps.${process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.split('.')[0] || 'YOUR_CLIENT_ID'}`
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      router: {},
      eas: {
        projectId: "1b5a192b-774e-46ef-82ad-9df605ee34d5"
      },
      // Make environment variables available in your app
      googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      googleAndroidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
      apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL
    }
  }
};
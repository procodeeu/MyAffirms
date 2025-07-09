export default {
  expo: {
    name: "My Affirms",
    slug: "my-affirms-mobile",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#1a1a1a"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.myaffirms.mobile"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#1a1a1a"
      },
      package: "com.myaffirms.mobile"
    },
    web: {
      favicon: "./assets/favicon.png",
      bundler: "metro"
    },
    plugins: [
      "expo-router",
      "@react-native-firebase/app",
      "@react-native-firebase/auth",
      "@react-native-firebase/firestore",
      "@react-native-firebase/storage"
    ],
    scheme: "my-affirms",
    extra: {
      router: {
        origin: false
      },
      eas: {
        projectId: "your-eas-project-id"
      }
    }
  }
}
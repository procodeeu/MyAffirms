export default {
  expo: {
    name: "My Affirms",
    slug: "my-affirms-mobile",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "automatic",
    platforms: ["ios", "android", "web"],
    splash: {
      backgroundColor: "#1a1a1a"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.myaffirms.mobile"
    },
    android: {
      package: "com.myaffirms.mobile"
    },
    web: {
      bundler: "metro"
    },
    plugins: [
      [
        "expo-background-fetch",
        {
          "background-fetch": true
        }
      ],
      [
        "expo-notifications",
        {
          "icon": "./assets/icon.png",
          "color": "#BB86FC"
        }
      ],
      [
        "expo-task-manager"
      ]
    ],
    notification: {
      "icon": "./assets/icon.png",
      "color": "#BB86FC"
    },
    scheme: "my-affirms"
  }
}
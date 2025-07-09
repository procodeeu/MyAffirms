// ESLint configuration for mobile-app extending shared config
const sharedConfig = require('@my-affirms/shared/config/eslint.config.js')

module.exports = {
  ...sharedConfig,
  extends: [
    ...sharedConfig.extends,
    '@react-native-community',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended'
  ],
  plugins: [
    ...sharedConfig.plugins,
    'react',
    'react-hooks',
    'react-native'
  ],
  rules: {
    ...sharedConfig.rules,
    // React Native specific rules
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react-native/no-unused-styles': 'error',
    'react-native/split-platform-components': 'error',
    'react-native/no-inline-styles': 'warn',
    'react-native/no-color-literals': 'warn',
    
    // React hooks
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn'
  },
  settings: {
    react: {
      version: 'detect'
    }
  },
  ignorePatterns: [
    ...sharedConfig.ignorePatterns,
    'android',
    'ios',
    '.expo'
  ]
}
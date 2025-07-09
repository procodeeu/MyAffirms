// ESLint configuration for web-app extending shared config
import sharedConfig from '@my-affirms/shared/config/eslint.config.js'

export default {
  ...sharedConfig,
  extends: [
    ...sharedConfig.extends,
    '@nuxtjs/eslint-config-typescript'
  ],
  rules: {
    ...sharedConfig.rules,
    // Vue/Nuxt specific rules
    'vue/multi-word-component-names': 'off',
    'vue/no-multiple-template-root': 'off',
    'vue/html-self-closing': ['error', {
      html: {
        void: 'always',
        normal: 'always',
        component: 'always'
      }
    }]
  },
  ignorePatterns: [
    ...sharedConfig.ignorePatterns,
    '.nuxt',
    '.output'
  ]
}
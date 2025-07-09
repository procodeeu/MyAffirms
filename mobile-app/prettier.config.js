// Prettier configuration for mobile-app extending shared config
const sharedConfig = require('@my-affirms/shared/config/prettier.config.js')

module.exports = {
  ...sharedConfig,
  // React Native specific overrides
  overrides: [
    ...sharedConfig.overrides,
    {
      files: ['*.tsx', '*.ts'],
      options: {
        parser: 'typescript'
      }
    },
    {
      files: ['*.jsx', '*.js'],
      options: {
        parser: 'babel'
      }
    }
  ]
}
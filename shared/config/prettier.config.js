// Shared Prettier configuration for My Affirms monorepo
export default {
  // Basic formatting
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: false,
  singleQuote: true,
  quoteProps: 'as-needed',
  
  // Trailing commas
  trailingComma: 'none',
  
  // Brackets and spacing
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'avoid',
  
  // Line endings
  endOfLine: 'lf',
  
  // Vue specific
  vueIndentScriptAndStyle: false,
  
  // Override for specific file types
  overrides: [
    {
      files: '*.vue',
      options: {
        parser: 'vue'
      }
    },
    {
      files: ['*.json', '*.jsonc'],
      options: {
        parser: 'json',
        trailingComma: 'none'
      }
    },
    {
      files: '*.md',
      options: {
        parser: 'markdown',
        printWidth: 80,
        proseWrap: 'always'
      }
    }
  ]
}
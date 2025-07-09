module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@shared': '../shared',
            '@my-affirms/shared': '../shared',
            '@': './',
            '@components': './components',
            '@screens': './screens',
            '@utils': './utils',
            '@hooks': './hooks'
          },
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
        }
      ],
      'react-native-paper/babel',
      'react-native-reanimated/plugin'
    ]
  };
};
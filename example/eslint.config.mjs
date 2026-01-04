import config from '../eslint.config.mjs'

export default [
  ...config,
  {
    languageOptions: {
      globals: {
        structuredClone: true,
      },
    },
  },
]

module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    '@typescript-eslint/recommended-requiring-type-checking'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './packages/*/tsconfig.json']
  },
  plugins: ['@typescript-eslint'],
  rules: {
    // TypeScript相关规则
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/no-non-null-assertion': 'error',
    '@typescript-eslint/ban-ts-comment': 'error',

    // 代码质量规则
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-alert': 'error',
    'no-eval': 'error',
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-arrow-callback': 'error',

    // 代码风格规则
    'max-len': ['error', { code: 120, ignoreUrls: true }],
    'max-lines': ['error', { max: 300 }],
    'max-lines-per-function': ['error', { max: 50 }],
    complexity: ['error', 10],
    'max-depth': ['error', 4],

    // 命名规范
    camelcase: ['error', { properties: 'never' }],

    // 其他规则
    eqeqeq: ['error', 'always'],
    curly: 'error',
    'brace-style': ['error', '1tbs'],
    'comma-dangle': ['error', 'never'],
    semi: ['error', 'always']
  },
  overrides: [
    // Vue文件特殊配置
    {
      files: ['*.vue'],
      extends: ['plugin:vue/vue3-essential', 'plugin:vue/vue3-strongly-recommended', 'plugin:vue/vue3-recommended'],
      rules: {
        'vue/multi-word-component-names': 'error',
        'vue/component-definition-name-casing': ['error', 'PascalCase'],
        'vue/require-default-prop': 'error',
        'vue/require-prop-types': 'error',
        'vue/prop-name-casing': ['error', 'camelCase'],
        'vue/component-tags-order': [
          'error',
          {
            order: ['template', 'script', 'style']
          }
        ]
      }
    },
    // 测试文件特殊配置
    {
      files: ['**/*.test.ts', '**/*.spec.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'max-lines-per-function': 'off'
      }
    }
  ]
};

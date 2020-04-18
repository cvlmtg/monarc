module.exports = {
  'root': true,
  'parser': '@typescript-eslint/parser',
  'extends': [
    'eslint:recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  'settings': {
    'react': {
      'version': 'detect'
    }
  },
  'plugins': [
    '@typescript-eslint',
    'react-hooks',
    'import',
    'react'
  ],
  'env': {
    'browser': true,
    'jest': true,
    'node': true,
    'es6': true
  },
  'globals': {
    'SharedArrayBuffer': 'readonly',
    'Atomics': 'readonly',
    'process': 'readonly',
    'expect': 'readonly'
  },
  'parserOptions': {
    'ecmaFeatures': {
      'jsx': true
    },
    'ecmaVersion': 2018,
    'sourceType': 'module'
  },
  'rules': {
    '@typescript-eslint/no-explicit-any': 'off',
    'accessor-pairs': 'error',
    'array-bracket-newline': 'error',
    'array-bracket-spacing': [
      'error',
      'always'
    ],
    'array-callback-return': 'error',
    'array-element-newline': [
      'error',
      'consistent'
    ],
    'arrow-body-style': 'error',
    'arrow-parens': [
      'error',
      'always'
    ],
    'arrow-spacing': [
      'error',
      {
        'after': true,
        'before': true
      }
    ],
    'block-scoped-var': 'error',
    'block-spacing': [
      'error',
      'always'
    ],
    'brace-style': [
      'error',
      '1tbs',
      {
        'allowSingleLine': true
      }
    ],
    'callback-return': 'error',
    'camelcase': 'error',
    'capitalized-comments': [
      'error',
      'never',
      {
        "ignorePattern": "XXX|TODO|NOTE"
      }
    ],
    'class-methods-use-this': 'error',
    'comma-dangle': 'error',
    'comma-spacing': [
      'error',
      {
        'after': true,
        'before': false
      }
    ],
    'comma-style': [
      'error',
      'last'
    ],
    'complexity': 'error',
    'computed-property-spacing': 'error',
    'consistent-return': 'error',
    'consistent-this': 'error',
    'curly': 'error',
    'default-case': 'error',
    'default-param-last': 'error',
    'dot-location': [
      'error',
      'property'
    ],
    'dot-notation': 'error',
    'eol-last': 'error',
    'eqeqeq': 'error',
    'func-call-spacing': 'error',
    'func-name-matching': 'error',
    'func-names': 'error',
    'func-style': [
      'error',
      'declaration',
      {
        'allowArrowFunctions': true
      }
    ],
    'function-paren-newline': [
      'error',
      'consistent'
    ],
    'generator-star-spacing': 'error',
    'global-require': 'error',
    'grouped-accessor-pairs': 'error',
    'guard-for-in': 'error',
    'handle-callback-err': 'error',
    'id-blacklist': 'error',
    'id-length': 'off',
    'id-match': 'error',
    'implicit-arrow-linebreak': [
      'error',
      'beside'
    ],
    'import/extensions': [
      'error',
      'never',
      { json: 'always' }
    ],
    'import/first': 'error',
    'import/order': 0,
    'indent': [
      'error',
      2,
      {
        'SwitchCase': 1,
        'MemberExpression': 1,
        "FunctionDeclaration": {
          "parameters": "first"
        },
        "FunctionExpression": {
          "parameters": "first"
        },
        "ArrayExpression": 1,
        "ObjectExpression": 1
      }
    ],
    'indent-legacy': 'off',
    'init-declarations': 'off',
    'jsx-quotes': 'error',
    'key-spacing': [
      'error',
      {
        beforeColon: false,
        afterColon: true,
        align: 'value'
      }
    ],
    'keyword-spacing': [
      'error',
      {
        'after': true,
        'before': true
      }
    ],
    'line-comment-position': 'off',
    'linebreak-style': [
      'error',
      'unix'
    ],
    'lines-around-comment': 'error',
    'lines-around-directive': 'error',
    'lines-between-class-members': 'error',
    'max-classes-per-file': 'error',
    'max-depth': 'error',
    'max-len': [
      'error',
      {
        'code': 200,
        'tabWidth': 2,
        'ignoreComments': false,
        'ignoreTrailingComments': false
      }
    ],
    'max-lines': 'off',
    'max-lines-per-function': 'off',
    'max-nested-callbacks': 'error',
    'max-params': 'off',
    'max-statements': 'off',
    'max-statements-per-line': 'off',
    'multiline-comment-style': [
      'error',
      'separate-lines'
    ],
    'new-parens': 'error',
    'newline-after-var': [
      'error',
      'always'
    ],
    'newline-before-return': 'off',
    'newline-per-chained-call': [
      'error',
      {
        ignoreChainWithDepth: 4
      }
    ],
    'no-alert': 'error',
    'no-array-constructor': 'error',
    'no-await-in-loop': 'error',
    'no-bitwise': 'error',
    'no-buffer-constructor': 'error',
    'no-caller': 'error',
    'no-catch-shadow': 'error',
    'no-confusing-arrow': 'error',
    'no-console': 'error',
    'no-constructor-return': 'error',
    'no-continue': 'off',
    'no-div-regex': 'error',
    'no-dupe-else-if': 'error',
    'no-duplicate-imports': 'error',
    'no-else-return': 'error',
    'no-empty-function': 'error',
    'no-eq-null': 'error',
    'no-eval': 'error',
    'no-extend-native': 'error',
    'no-extra-bind': 'error',
    'no-extra-label': 'error',
    'no-extra-parens': [
      'error',
      'all',
      {
        'ignoreJSX': 'all'
      }
    ],
    'no-floating-decimal': 'error',
    'no-implicit-coercion': 'error',
    'no-implicit-globals': 'error',
    'no-implied-eval': 'error',
    'no-import-assign': 'error',
    'no-inline-comments': 'off',
    'no-invalid-this': 'error',
    'no-iterator': 'error',
    'no-label-var': 'error',
    'no-labels': 'error',
    'no-lone-blocks': 'error',
    'no-lonely-if': 'error',
    'no-loop-func': 'error',
    'no-magic-numbers': 'off',
    'no-mixed-operators': 'error',
    'no-mixed-requires': 'error',
    'no-multi-assign': 'error',
    'no-multi-spaces': [
      'error',
      {
        'ignoreEOLComments': true,
        'exceptions': {
          'AssignmentExpression': true,
          'VariableDeclarator': true,
          'Property': true
        }
      }
    ],
    'no-multi-str': 'error',
    'no-multiple-empty-lines': [
      'error',
      {
        'maxEOF': 0,
        'maxBOF': 0,
        'max': 1
      }
    ],
    'no-native-reassign': 'error',
    'no-negated-condition': 'off',
    'no-negated-in-lhs': 'error',
    'no-nested-ternary': 'error',
    'no-new': 'error',
    'no-new-func': 'error',
    'no-new-object': 'error',
    'no-new-require': 'error',
    'no-new-wrappers': 'error',
    'no-octal-escape': 'error',
    'no-param-reassign': 'error',
    'no-path-concat': 'error',
    'no-plusplus': 'error',
    'no-process-env': 'off',
    'no-process-exit': 'error',
    'no-proto': 'error',
    'no-restricted-globals': 'error',
    'no-restricted-imports': 'error',
    'no-restricted-modules': 'error',
    'no-restricted-properties': 'error',
    'no-restricted-syntax': 'error',
    'no-return-assign': 'error',
    'no-return-await': 'error',
    'no-script-url': 'error',
    'no-self-compare': 'error',
    'no-sequences': 'error',
    'no-setter-return': 'error',
    'no-shadow': 'error',
    'no-spaced-func': 'error',
    'no-sync': 'error',
    'no-tabs': 'error',
    'no-template-curly-in-string': 'error',
    'no-ternary': 'off',
    'no-throw-literal': 'error',
    'no-trailing-spaces': 'error',
    'no-undef': 'error',
    'no-undef-init': 'error',
    'no-undefined': 'off',
    'no-underscore-dangle': 'off',
    'no-unmodified-loop-condition': 'error',
    'no-unneeded-ternary': 'error',
    'no-unused-expressions': 'error',
    'no-use-before-define': 'error',
    'no-useless-call': 'error',
    'no-useless-computed-key': 'error',
    'no-useless-concat': 'error',
    'no-useless-constructor': 'error',
    'no-useless-rename': 'error',
    'no-useless-return': 'error',
    'no-var': 'error',
    'no-void': 'error',
    'no-warning-comments': [
      'warn',
      {
        'location': 'anywhere',
        'terms': [
          'fixme',
          'todo'
        ]
      }
    ],
    'no-whitespace-before-property': 'error',
    'nonblock-statement-body-position': 'error',
    'object-curly-newline': 'error',
    'object-curly-spacing': [
      'error',
      'always'
    ],
    'object-shorthand': 'error',
    'one-var': [
      'error',
      {
        uninitialized: 'never',
        initialized: 'never'
      }
    ],
    'one-var-declaration-per-line': [
      'error',
      'initializations'
    ],
    'operator-assignment': 'error',
    'operator-linebreak': 'error',
    'padded-blocks': [
      'error',
      'never'
    ],
    'padding-line-between-statements': 'error',
    'prefer-arrow-callback': 'error',
    'prefer-const': 'error',
    'prefer-destructuring': 'off',
    'prefer-exponentiation-operator': 'error',
    'prefer-named-capture-group': 'error',
    'prefer-numeric-literals': 'error',
    'prefer-object-spread': 'error',
    'prefer-promise-reject-errors': 'error',
    'prefer-reflect': 'error',
    'prefer-regex-literals': 'error',
    'prefer-rest-params': 'error',
    'prefer-spread': 'error',
    'prefer-template': 'error',
    'quote-props': [
      'error',
      'as-needed'
    ],
    'quotes': [
      'error',
      'single',
      { 'avoidEscape': true }
    ],
    'radix': 'error',
    'require-atomic-updates': 'error',
    'require-await': 'error',
    'require-jsdoc': 'off',
    'require-unicode-regexp': 'error',
    'rest-spread-spacing': [
      'error',
      'never'
    ],
    'semi': [
      'error',
      'always'
    ],
    'semi-spacing': 'error',
    'semi-style': [
      'error',
      'last'
    ],
    'sort-keys': 'off',
    'sort-vars': 'off',
    'space-before-blocks': 'error',
    'space-before-function-paren': [
      'error',
      'never'
    ],
    'space-in-parens': [
      'error',
      'never'
    ],
    'space-infix-ops': 'error',
    'space-unary-ops': 'error',
    'spaced-comment': [
      'error',
      'always'
    ],
    'strict': 'error',
    'switch-colon-spacing': 'error',
    'symbol-description': 'error',
    'template-curly-spacing': [
      'error',
      'never'
    ],
    'template-tag-spacing': 'error',
    'unicode-bom': [
      'error',
      'never'
    ],
    'valid-jsdoc': 'error',
    'vars-on-top': 'error',
    'wrap-iife': 'error',
    'wrap-regex': 'error',
    'yield-star-spacing': 'error',
    'yoda': [
      'error',
      'never'
    ]
  }
};

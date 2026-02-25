module.exports = {
    root: true,
    env: {
        node: true
    },
    extends: [
        'airbnb',
        'plugin:vue/vue3-essential',
        'eslint:recommended',
    ],
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        allowImportExportEverywhere: true
    },
    rules: {
        'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'vue/no-deprecated-slot-attribute': 'off',
        indent: ['error', 4, { ignoreComments: true }],
        'vue/html-indent': ['error', 4, { baseIndent: 1 }],
        'no-use-before-define': 0,
        'comma-dangle': 0,
        'spaced-comment': 0,
        'no-new': 0,
        'no-multi-spaces': ['error', { ignoreEOLComments: true }],
        'no-plusplus': 0,
        'wrap-iife': 0,
        'no-underscore-dangle': 0,
        'one-var': 0,
        'max-len': ['error', { code: 120 }],
        'space-before-function-paren': ['error', 'never'],
        'no-param-reassign': ['error', { props: false }]
    },
    settings: {
        // workaround for eslint airbnb react warning dependencie
        react: {
            version: '999.999.999'
        }
    }
};

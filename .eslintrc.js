module.exports = {
    env: {
        browser: true,
        es6: true,
        node: true,
        amd: true,
    },
    parser: '@typescript-eslint/parser', // Specifies the ESLint parser
    extends: [
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        'prettier/@typescript-eslint', // Uses eslint-config-prettier to disable ESLint rules from @typescript-eslint/eslint-plugin that would conflict with prettier
        'plugin:prettier/recommended', // Enables eslint-plugin-prettier and eslint-config-prettier. This will display prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
    ],
    parserOptions: {
        ecmaFeatures: {
            ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
            sourceType: 'module', // Allows for the use of imports
        },
        project: 'tsconfig.json'
    },
    plugins: ['simple-import-sort'],
    rules: {
        // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
        // e.g. "@typescript-eslint/explicit-function-return-type": "off",
        '@typescript-eslint/require-await': 0,
        'no-param-reassign': 0,
        '@typescript-eslint/no-floating-promises': 0,
        '@typescript-eslint/no-unsafe-return': 0,
        '@typescript-eslint/no-unsafe-call': 0,
        '@typescript-eslint/no-unsafe-member-access': 0,
        '@typescript-eslint/no-unsafe-assignment': 0,
        '@typescript-eslint/camelcase': 0,
        'consistent-return': 0,
        'class-methods-use-this': 0,
        'max-classes-per-file': 0,
        'import/named': 0,
        '@typescript-eslint/unbound-method': 0,
        'import/prefer-default-export': 0,
        'simple-import-sort/sort': 'error',
        'import/export': 0,
        '@typescript-eslint/no-empty-interface': 0,
    },
    settings: {
    },
};

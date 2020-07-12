module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testRegex: '(/__tests__/.*|\\.(test|spec))\\.ts$',
    moduleFileExtensions: ['ts', 'js'],
    moduleDirectories: ['node_modules'],
    verbose: true,
    collectCoverage: false,
    coverageDirectory: 'test/coverage',
    collectCoverageFrom: [
        'src/*.{ts,tsx}',
        '!**/node_modules/**',
    ],
    globals: {
        'ts-jest': {
            tsConfig: './test/tsconfig.json'
        }
    },
};
const {jsWithTsESM: tsjPreset} = require('ts-jest/presets')
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleFileExtensions: [
        'ts',
        'js'
    ],
    testMatch: [
        '**/test/**/*.test.(ts|js)'
    ],
    collectCoverageFrom: [
        'src/**/*.ts'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: [
        'text',
        'lcov'
    ],
    transform: {
        ...tsjPreset.transform
    },
    transformIgnorePatterns: [
        'node_modules/node-fetch/*'
    ]
};

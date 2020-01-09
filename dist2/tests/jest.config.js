// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html
module.exports = {
    // All imported modules in your tests should be mocked automatically
    // automock: false,
    // Stop running tests after `n` failures
    // bail: 0,
    // Respect "browser" field in package.json when resolving modules
    // browser: false,
    // The directory where Jest should store its cached dependency information
    // cacheDirectory: "/tmp/jest_0",
    // Automatically clear mock calls and instances between every test
    clearMocks: true,
    // Indicates whether the coverage information should be collected while executing the test
    collectCoverage: true,
    // An array of glob patterns indicating a set of files for which coverage information should be collected
    // collectCoverageFrom: null,
    // The directory where Jest should output its coverage files
    coverageDirectory: 'coverage',
    // An array of regexp pattern strings used to skip coverage collection
    // coveragePathIgnorePatterns: [
    //   "/node_modules/"
    // ],
    // A list of reporter names that Jest uses when writing coverage reports
    coverageReporters: [
        'json',
        'json-summary',
        'text',
        'lcov',
        'clover'
    ],
    // An object that configures minimum threshold enforcement for coverage results
    coverageThreshold: {
        'global': {
            'branches': 1,
            'functions': 1,
            'lines': 1,
            'statements': 1
        },
    },
    // A path to a custom dependency extractor
    // dependencyExtractor: null,
    // Make calling deprecated APIs throw helpful error messages
    // errorOnDeprecated: false,
    // Force coverage collection from ignored files using an array of glob patterns
    // forceCoverageMatch: [],
    // A path to a module which exports an async function that is triggered once before all test suites
    // globalSetup: null,
    // A path to a module which exports an async function that is triggered once after all test suites
    // globalTeardown: null,
    // A set of global variables that need to be available in all test environments
    // globals: {},
    // An array of directory names to be searched recursively up from the requiring module's location
    // moduleDirectories: [
    //   "node_modules"
    // ],
    // An array of file extensions your modules use
    // moduleFileExtensions: [
    //   "js",
    //   "json",
    //   "jsx",
    //   "ts",
    //   "tsx",
    //   "node"
    // ],
    // A map from regular expressions to module names that allow to stub out resources with a single module
    // moduleNameMapper: {},
    // An array of regexp pattern strings, matched against all module paths before considered 'visible' to the module loader
    // modulePathIgnorePatterns: [],
    // Activates notifications for test results
    // notify: false,
    // An enum that specifies notification mode. Requires { notify: true }
    // notifyMode: "failure-change",
    // A preset that is used as a base for Jest's configuration
    // preset: null,
    preset: 'ts-jest',
    // Run tests from one or more projects
    // projects: null,
    // Use this configuration option to add custom reporters to Jest
    'reporters': ['default', [
            'jest-ratchet',
            { 'tolerance': 2, 'roundDown': true, 'timeout': 5000 }
        ]],
    // Automatically reset mock state between every test
    // resetMocks: false,
    // Reset the module registry before running each individual test
    // resetModules: false,
    // A path to a custom resolver
    // resolver: null,
    // Automatically restore mock state between every test
    // restoreMocks: false,
    // The root directory that Jest should scan for tests and modules within
    // rootDir: null,
    // A list of paths to directories that Jest should use to search for files in
    // roots: [
    //   "<rootDir>"
    // ],
    // Allows you to use a custom runner instead of Jest's default test runner
    // runner: "jest-runner",
    // The paths to modules that run some code to configure or set up the testing environment before each test
    // setupFiles: [],
    // A list of paths to modules that run some code to configure or set up the testing framework before each test
    // setupFilesAfterEnv: [],
    // A list of paths to snapshot serializer modules Jest should use for snapshot testing
    // snapshotSerializers: [],
    // The test environment that will be used for testing
    testEnvironment: 'node',
};
//# sourceMappingURL=jest.config.js.map
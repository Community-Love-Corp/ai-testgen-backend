module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },

  moduleNameMapper: {
    // Redirect stylesheets to an empty dummy object
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    // Redirect image/vector file imports to a plain string mockup path
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/src/__mocks__/fileMock.js',
  },
  //run this file before running any tests
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'], // Add this line
  
};
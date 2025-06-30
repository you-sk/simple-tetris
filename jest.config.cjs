/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['./setup.js'],
  transform: {},
};

module.exports = config;

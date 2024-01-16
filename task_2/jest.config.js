const tsJest = require("ts-jest/jest-preset");
const dynaLite = require("jest-dynalite/jest-preset");

module.exports = {
  ...tsJest,
  ...dynaLite,
  moduleDirectories: ["node_modules", "src"],
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.js"],
};

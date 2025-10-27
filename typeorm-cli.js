require("ts-node").register({
  transpileOnly: true,
  compilerOptions: {
    module: "commonjs",
  },
});
require("reflect-metadata");
require("dotenv").config();

// Load and export the actual data source
// const { AppDataSource } = require("./src/config/typeorm.config");
const { AppDataSource } = require("./dist/src/config/typeorm.config");
module.exports = AppDataSource;

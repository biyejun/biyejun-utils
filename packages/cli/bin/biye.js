#!/usr/bin/env node
const program = require("commander");
const { sayHi } = require('cli-utils');


program.version(`biyejun-utils ${require("../package.json").version}`);

program.parse(process.argv)

console.log('bin/biye.js start====');
sayHi('biyejun');

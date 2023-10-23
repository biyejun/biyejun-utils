#!/usr/bin/env node
const program = require("commander");
const { sayHi } = require('@biye/biye-test2')

sayHi('biye');

program.version(`biye ${require("../package.json").version}`);

program.parse(process.argv)

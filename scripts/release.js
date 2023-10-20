import minimist from 'minimist';
import chalk from 'chalk';
import semver from 'semver';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const require = createRequire(import.meta.url);

// const currentVersion = require('../package.json').version;
const currentVersion = '0.0.3-beta.0';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const args = minimist(process.argv.slice(2), {
  alias: {
    skipBuild: 'skip-build',
    skipTests: 'skip-tests',
    skipGit: 'skip-git',
    skipPrompts: 'skip-prompts',
  },
});

const preId = args.preid || semver.prerelease(currentVersion)?.[0];

const packages = fs.readdirSync(path.resolve(__dirname, '../packages'));

const versionIncrements = [
  'patch',
  'minor',
  'major',
  ...(preId ? ['prepatch', 'preminor', 'premajor', 'prerelease'] : []),
];

const inc = i => semver.inc(currentVersion, i, preId)

console.log(currentVersion, 'currentVersion');
console.log(inc('patch'), 'patch');
console.log(inc('prepatch'), 'prepatch');
console.log(inc('minor'), 'minor');
console.log(inc('preminor'), 'preminor');
console.log(inc('major'), 'major');
console.log(inc('premajor'), 'premajor');
console.log(inc('prerelease'), 'prerelease');




console.log();

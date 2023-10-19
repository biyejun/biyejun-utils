import minimist from 'minimist';
import chalk from 'chalk';
import semver from 'semver'
import { createRequire } from 'node:module'

const currentVersion = createRequire(import.meta.url)('../package.json').version

console.log(currentVersion, 'currentVersion~');

console.log(minimist, 'minimist~~');

console.log(process.argv);

const args = minimist(process.argv.slice(2), {
  alias: {
    skipBuild: 'skip-build',
    skipTests: 'skip-tests',
    skipGit: 'skip-git',
    skipPrompts: 'skip-prompts',
  },
});

console.log(args, 'args');

console.log(
  chalk.yellow(
    `The following packages are skipped and NOT published:\n- ddddcle }`
  )
);

console.log(chalk.cyan('hhhhhasfdsafsddasf'))

console.log(chalk.blue('hhhhhasfdsafsddasf'))

console.log(import.meta.url, 'url');

console.log(typeof currentVersion, 'currentVersion');


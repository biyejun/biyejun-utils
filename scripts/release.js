import minimist from 'minimist';
import chalk from 'chalk';
import semver from 'semver';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import { execa } from 'execa';
import enquirer from 'enquirer';

const { prompt } = enquirer;
const require = createRequire(import.meta.url);

const currentVersion = require('../package.json').version;

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
const skipPrompts = args.skipPrompts;

const isCanary = args.canary;

const packages = fs.readdirSync(path.resolve(__dirname, '../packages'));

const versionIncrements = [
  'patch',
  'minor',
  'major',
  ...(preId ? ['prepatch', 'preminor', 'premajor', 'prerelease'] : []),
];

const inc = (i) => semver.inc(currentVersion, i, preId);

const run = (bin, args, opts = {}) =>
  execa(bin, args, { stdio: 'inherit', ...opts });

const dryRun = (bin, args, opts = {}) =>
  console.log(chalk.blue(`[dryrun] ${bin} ${args.join(' ')}`), opts);

const getPkgRoot = (pkg) => path.resolve(__dirname, '../packages/' + pkg);

const step = (msg) => console.log(chalk.cyan(msg));

const keepThePackageName = (pkgName) => pkgName;

const isCorePackage = (pkgName) => {
  if (!pkgName) return;

  return packages.includes(pkgName);
};

function updateVersions(version, getNewPackageName = keepThePackageName) {
  // 1. update root package.json
  updatePackage(path.resolve(__dirname, '..'), version, getNewPackageName);
  // 2. update all packages
  packages.forEach((p) =>
    updatePackage(getPkgRoot(p), version, getNewPackageName)
  );
}

function updatePackage(pkgRoot, version, getNewPackageName) {
  const pkgPath = path.resolve(pkgRoot, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  pkg.name = getNewPackageName(pkg.name);
  pkg.version = version;
  updateDeps(pkg, 'dependencies', version, getNewPackageName);
  updateDeps(pkg, 'peerDependencies', version, getNewPackageName);
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
}

function updateDeps(pkg, depType, version, getNewPackageName) {
  const deps = pkg[depType];
  console.log(deps, 'deps~~');
  if (!deps) return;
  Object.keys(deps).forEach((dep) => {
    if (deps[dep] === 'workspace:*') {
      return;
    }

    if (isCorePackage(dep)) {
      const newName = getNewPackageName(dep);
      const newVersion =
        newName === dep ? version : `npm:${newName}@${version}`;

      console.log(
        chalk.yellow(`${pkg.name} -> ${depType} -> ${dep}@${newVersion}`)
      );
      deps[dep] = newVersion;
    }
  });
}

async function main(params) {
  console.log(args, 'args');

  let targetVersion = args._[0];

  if (!targetVersion) {
    const { release } = await prompt({
      type: 'select',
      name: 'release',
      message: 'Select release type',
      choices: versionIncrements
        .map((i) => `${i} (${inc(i)})`)
        .concat(['custom']),
    });

    if (release === 'custom') {
      const result = await prompt({
        type: 'input',
        name: 'version',
        message: 'Input custom version',
        initial: currentVersion,
      });
      targetVersion = result.version;
    } else {
      console.log(release, 'release~~');
      console.log(release.match(/\((.*)\)/), 'match');
      targetVersion = release.match(/\((.*)\)/)[1];
    }

    console.log(targetVersion, 'targetVersion');

    if (!semver.valid(targetVersion)) {
      throw new Error(`invalid target version: ${targetVersion}`);
    }

    if (skipPrompts) {
      step(`Releasing v${targetVersion}...`);
    } else {
      const { yes: confirmRelease } = await prompt({
        type: 'confirm',
        name: 'yes',
        message: `Releasing v${targetVersion}. Confirm?`,
      });

      if (!confirmRelease) {
        return;
      }
    }

    // update all package versions and inter-dependencies
    step('\nUpdating cross dependencies...');

    updateVersions(targetVersion);
  }
}

main().catch((err) => {
  updateVersions(currentVersion);
  console.error(err);
  process.exit(1);
});

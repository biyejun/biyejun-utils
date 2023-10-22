import minimist from 'minimist';
import chalk from 'chalk';
import semver from 'semver';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import { execa } from 'execa';
import enquirer from 'enquirer';
import pico from 'picocolors';

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
const isDryRun = args.dry;
const skipBuild = args.skipBuild;
const skipGit = args.skipGit;

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
  console.log(pico.blue(`[dryrun] ${bin} ${args.join(' ')}`), opts);

const runIfNotDry = isDryRun ? dryRun : run;

const getPkgRoot = (pkg) => path.resolve(__dirname, '../packages/' + pkg);

const step = (msg) => console.log(chalk.cyan(msg));

const isCorePackage = (pkgName) => {
  if (!pkgName) return;

  return packages.includes(pkgName);
};

function updateVersions(version) {
  // 1. update root package.json
  updatePackage(path.resolve(__dirname, '..'), version);
  // 2. update all packages
  packages.forEach((p) => updatePackage(getPkgRoot(p), version));
}

function updatePackage(pkgRoot, version) {
  const pkgPath = path.resolve(pkgRoot, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  pkg.version = version;
  updateDeps(pkg, 'dependencies', version);
  updateDeps(pkg, 'peerDependencies', version);
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
}

function updateDeps(pkg, depType, version) {
  const deps = pkg[depType];
  if (!deps) return;
  Object.keys(deps).forEach((dep) => {
    if (deps[dep] === 'workspace:*') {
      return;
    }

    if (isCorePackage(dep)) {
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
      targetVersion = release.match(/\((.*)\)/)[1];
    }

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
        initial: true,
      });

      if (!confirmRelease) {
        return;
      }
    }

    // update all package versions and inter-dependencies
    step('\nUpdating cross dependencies...');
    // updateVersions(targetVersion);

    // TODO: build all packages with types
    step('\nBuilding all packages...');

    // if (!skipBuild && !isDryRun) {
    //   await run('pnpm', ['run', 'build', '--withTypes'])
    //   step('\nTesting built types...')
    //   await run('pnpm', ['test-dts-only'])
    // } else {
    //   console.log(`(skipped)`)
    // }

    // generate changelog
    step('\nGenerating changelog...');
    await runIfNotDry(`pnpm`, ['run', 'changelog']);

    // update pnpm-lock.yaml
    step('\nUpdating lockfile...');
    await runIfNotDry(`pnpm`, ['install', '--prefer-offline']);

    if (!skipGit) {
      const { stdout } = await run('git', ['diff'], { stdio: 'pipe' });
      if (stdout) {
        step('\nCommitting changes...');
        await runIfNotDry('git', ['add', '-A']);
        await runIfNotDry('git', [
          'commit',
          '-m',
          `release: v${targetVersion}`,
        ]);
      } else {
        console.log('No changes to commit.');
      }
    }
  }
}

main().catch((err) => {
  updateVersions(currentVersion);
  console.error(err);
  process.exit(1);
});

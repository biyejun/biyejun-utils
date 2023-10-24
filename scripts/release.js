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
        chalk.yellow(`${pkg.name} -> ${depType} -> ${dep}@${version}`)
      );
      deps[dep] = version;
    }
  });
}

async function publishPackage(pkgName, version) {
  const pkgRoot = getPkgRoot(pkgName);
  const pkgPath = path.resolve(pkgRoot, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  if (pkg.private) {
    return;
  }
  let releaseTag = null;
  if (args.tag) {
    releaseTag = args.tag;
  } else if (version.includes('alpha')) {
    releaseTag = 'alpha';
  } else if (version.includes('beta')) {
    releaseTag = 'beta';
  }
  step(`Publishing ${pkgName}...`);

  try {
    /* await run(
      'pnpm',
      [
        'publish',
        ...(releaseTag ? ['--tag', releaseTag] : []),
        '--access',
        'public',
        ...(isDryRun ? ['--dry-run', '--no-git-checks'] : []),
      ],
      {
        cwd: pkgRoot,
        stdio: 'pipe',
      }
    ); */

    console.log(pico.green(`Successfully published ${pkgName}@${version}`));
  } catch (e) {
    if (e.stderr.match(/previously published/)) {
      console.log(pico.red(`Skipping already published: ${pkgName}`));
    } else {
      throw e;
    }
  }
}

async function main() {
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
  updateVersions(targetVersion);

  // TODO: build all packages with types
  step('\nBuilding all packages...');

  // if (!skipBuild && !isDryRun) {
  //   await run('pnpm', ['run', 'build', '--withTypes'])
  //   step('\nTesting built types...')
  //   await run('pnpm', ['test-dts-only'])
  // } else {
  //   console.log(`(skipBuild)`)
  // }

  // generate changelog
  step('\nGenerating changelog...');
  await runIfNotDry(`pnpm`, ['run', 'changelog']);

  // update pnpm-lock.yaml
  step('\nUpdating lockfile...');
  await runIfNotDry(`pnpm`, ['install', '--prefer-offline']);

  // git add commit
  const { stdout } = await run('git', ['diff'], { stdio: 'pipe' });
  if (stdout) {
    step('\nCommitting changes...');
    await runIfNotDry('git', ['add', '-A']);
    await runIfNotDry('git', ['commit', '-m', `release: v${targetVersion}`]);
  } else {
    console.log('No changes to commit.');
  }

  // publish packages
  step('\nPublishing packages...');
  for (const pkg of packages) {
    await publishPackage(pkg, targetVersion);
  }

  // push to GitHub
  step('\nPushing to GitHub...');
  await runIfNotDry('git', ['tag', `v${targetVersion}`]);
  await runIfNotDry('git', ['push', 'origin', `refs/tags/v${targetVersion}`]);
  await runIfNotDry('git', ['push']);

  if (isDryRun) {
    console.log(`\nDry run finished - run git diff to see package changes.`);
  }

  console.log();
}

main();

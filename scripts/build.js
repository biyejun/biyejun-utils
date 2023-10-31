import { existsSync } from 'node:fs'
import { targets as allTargets } from './utils.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import pico from 'picocolors';
import { execa, execaSync } from 'execa';
import minimist from 'minimist'

const require = createRequire(import.meta.url);
const commit = execaSync('git', ['rev-parse', '--short=7', 'HEAD']).stdout

const args = minimist(process.argv.slice(2));
const formats = args.formats || args.f
const devOnly = args.devOnly || args.d
const prodOnly = !devOnly && (args.prodOnly || args.p)
const sourceMap = args.sourcemap || args.s

const isDryRun = args.dry;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packagePath = path.resolve(__dirname, '../packages');

const run = (bin, args, opts = {}) =>
  execa(bin, args, { stdio: 'inherit', ...opts });

const dryRun = (bin, args, opts = {}) =>
  console.log(pico.blue(`[dryrun] ${bin} ${args.join(' ')}`), opts);

const runIfNotDry = isDryRun ? dryRun : run;

async function build(target) {
  const pkgDir = path.resolve(packagePath, target);
  const pkg = require(`${pkgDir}/package.json`);

  if (existsSync(`${pkgDir}/dist`)) {
    await fs.rm(`${pkgDir}/dist`, { recursive: true });
  }

  const env = 'development';

  await runIfNotDry(
    'rollup',
    [
      '-c',
      '--environment',
      [
        `COMMIT:${commit}`,
        `NODE_ENV:${env}`,
        `TARGET:${target}`,
        formats ? `FORMATS:${formats}` : ``,
        prodOnly ? `PROD_ONLY:true` : ``,
        sourceMap ? `SOURCE_MAP:true` : ``,
      ]
        .filter(Boolean)
        .join(','),
    ],
    { stdio: 'inherit' }
  );
}

async function buildAll(targets) {
  const ret = [];
  for (const item of targets) {
    ret.push(build(item));
  }
  return Promise.all(ret);
}

async function main() {
  const resolvedTargets = allTargets;
  await buildAll(resolvedTargets);
}
main();

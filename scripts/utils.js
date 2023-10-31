import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packagePath = path.resolve(__dirname, '../packages');

export const targets = fs.readdirSync(packagePath).filter((fileName) => {
  const curFile = path.resolve(packagePath, fileName);
  if (!fs.statSync(curFile).isDirectory()) {
    return false;
  }
  const pkg = require(`../packages/${fileName}/package.json`);
  if (pkg.private) {
    return false;
  }
  return true;
});

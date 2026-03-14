import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const targetDir = path.resolve('.next');
const maxBundleSizeMb = Number(process.env.BUNDLE_SIZE_LIMIT_MB ?? 250);
const ignoredDirectories = new Set(['cache']);
const ignoredFiles = new Set(['trace']);

async function getDirectorySize(dirPath) {
  const entries = await readdir(dirPath, { withFileTypes: true });
  const sizes = await Promise.all(
    entries.map(async (entry) => {
      if (entry.isDirectory() && ignoredDirectories.has(entry.name)) {
        return 0;
      }

      if (entry.isFile() && ignoredFiles.has(entry.name)) {
        return 0;
      }

      const entryPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        return getDirectorySize(entryPath);
      }

      const entryStat = await stat(entryPath);
      return entryStat.size;
    }),
  );

  return sizes.reduce((total, size) => total + size, 0);
}

try {
  const totalBytes = await getDirectorySize(targetDir);
  const totalMb = totalBytes / (1024 * 1024);

  console.log(`.next size: ${totalMb.toFixed(2)} MB`);

  if (totalMb > maxBundleSizeMb) {
    console.error(
      `Bundle size check failed: ${totalMb.toFixed(2)} MB exceeds ${maxBundleSizeMb} MB`,
    );
    process.exit(1);
  }

  console.log(`Bundle size is within the ${maxBundleSizeMb} MB limit.`);
} catch (error) {
  console.error('Unable to evaluate bundle size:', error);
  process.exit(1);
}
